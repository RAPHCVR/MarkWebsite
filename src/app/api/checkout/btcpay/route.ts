import { NextRequest, NextResponse } from "next/server";

import { legalConfig } from "@/data/legal";
import { paymentConfig } from "@/data/payments";
import { products } from "@/data/products";
import {
  ensureOrdersDatabaseReady,
  isOrdersDatabaseConfigured,
  recordBtcpayCheckoutInvoice,
} from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";
import { getPublicUrl } from "@/lib/site-url";

export const runtime = "nodejs";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

async function readCheckoutPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      product?: string;
      termsAccepted?: boolean | string;
    } | null;

    return {
      product: body?.product,
      termsAccepted:
        body?.termsAccepted === true ||
        body?.termsAccepted === "true" ||
        body?.termsAccepted === "on",
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const product = form.get("product");
    const termsAccepted = form.get("termsAccepted");

    return {
      product: typeof product === "string" ? product : undefined,
      termsAccepted:
        termsAccepted === "true" ||
        termsAccepted === "on" ||
        termsAccepted === "1",
    };
  }

  return { product: undefined, termsAccepted: false };
}

function getEnabledBtcpayPaymentMethods() {
  const methods: string[] = [];

  if (paymentConfig.crypto.btcpay.ltcEnabled) {
    methods.push("LTC");
  }

  if (paymentConfig.crypto.btcpay.btcWalletReady) {
    methods.push("BTC");
  }

  return methods;
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to create a BTCPay invoice" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  if (!paymentConfig.salesEnabled || !paymentConfig.crypto.checkoutEnabled) {
    return NextResponse.json(
      { error: "Crypto checkout is not enabled yet" },
      { status: 403 },
    );
  }

  if (!paymentConfig.crypto.btcpay.configured || !isOrdersDatabaseConfigured()) {
    return NextResponse.json(
      { error: "BTCPay checkout is not fully configured yet" },
      { status: 503 },
    );
  }

  const rateLimited = await enforceRateLimit(request, {
    action: "btcpay-checkout",
    limit: 12,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  const payload = await readCheckoutPayload(request);
  const productSlug = payload.product;

  if (!payload.termsAccepted) {
    return NextResponse.json(
      { error: "Terms and immediate delivery consent are required" },
      { status: 400 },
    );
  }
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    return NextResponse.json({ error: "Unknown access pass" }, { status: 404 });
  }

  if (product.status === "coming-soon") {
    return NextResponse.json(
      { error: "This access pass is not available yet" },
      { status: 409 },
    );
  }

  try {
    const serverUrl = requiredEnv("BTCPAY_SERVER_URL").replace(/\/$/, "");
    const storeId = requiredEnv("BTCPAY_STORE_ID");
    const apiKey = requiredEnv("BTCPAY_API_KEY");
    const orderId = `marky-${product.slug}-${crypto.randomUUID()}`;
    const paymentMethods = getEnabledBtcpayPaymentMethods();

    await ensureOrdersDatabaseReady();

    const response = await fetch(`${serverUrl}/api/v1/stores/${storeId}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${apiKey}`,
      },
      body: JSON.stringify({
        amount: (product.amountCents / 100).toFixed(2),
        currency: product.currency,
        metadata: {
          orderId,
          productSlug: product.slug,
          productTitle: product.title,
          source: "markshnaknaks.com",
          legalTermsVersion: legalConfig.termsVersion,
          immediateDigitalDeliveryAccepted: true,
          withdrawalWaiverAccepted: true,
        },
        checkout: {
          redirectURL: getPublicUrl(
            `/checkout/crypto-return?orderId=${encodeURIComponent(orderId)}`,
          ),
          paymentMethods,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "BTCPay invoice creation failed" },
        { status: 502 },
      );
    }

    const invoice = (await response.json()) as {
      checkoutLink?: string;
      id?: string;
      status?: string;
    };

    if (!invoice.checkoutLink || !invoice.id) {
      return NextResponse.json(
        { error: "BTCPay invoice did not return a usable checkout link" },
        { status: 502 },
      );
    }

    await recordBtcpayCheckoutInvoice({
      orderId,
      product,
      providerInvoiceId: invoice.id,
      checkoutLink: invoice.checkoutLink,
      providerStatus: invoice.status,
      legalTermsVersion: legalConfig.termsVersion,
      withdrawalWaiverAcceptedAt: new Date().toISOString(),
      metadata: {
        source: "checkout-route",
        legal: {
          termsVersion: legalConfig.termsVersion,
          immediateDigitalDeliveryAccepted: true,
          withdrawalWaiverAccepted: true,
          acceptedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.redirect(invoice.checkoutLink, 303);
  } catch {
    return NextResponse.json(
      { error: "BTCPay checkout is not configured yet" },
      { status: 503 },
    );
  }
}
