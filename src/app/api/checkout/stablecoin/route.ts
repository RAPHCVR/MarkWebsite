import { NextRequest, NextResponse } from "next/server";

import { paymentConfig, type StablecoinRailId } from "@/data/payments";
import { products } from "@/data/products";
import {
  ensureOrdersDatabaseReady,
  isOrdersDatabaseConfigured,
  recordCheckoutInvoice,
} from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";
import { createSolanaPayInvoice } from "@/lib/server/solana-pay";
import { getPublicUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type CheckoutPayload = {
  product?: string;
  rail?: StablecoinRailId;
};

type ShkeeperPaymentRequestResponse = {
  amount?: string;
  display_name?: string;
  exchange_rate?: string;
  id?: string | number;
  recalculate_after?: string | number;
  status?: string;
  wallet?: string;
  message?: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

async function readPayload(request: NextRequest): Promise<CheckoutPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return ((await request.json().catch(() => ({}))) ?? {}) as CheckoutPayload;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const product = form.get("product");
    const rail = form.get("rail");

    return {
      product: typeof product === "string" ? product : undefined,
      rail: typeof rail === "string" ? (rail as StablecoinRailId) : undefined,
    };
  }

  return {};
}

function getStablecoinFiatAmount(amountCents: number, productCurrency: string) {
  const fiat = process.env.STABLECOIN_FIAT || "USD";

  if (productCurrency === fiat) {
    return {
      fiat,
      amount: (amountCents / 100).toFixed(2),
    };
  }

  if (productCurrency === "EUR" && fiat === "USD") {
    const rate = Number(process.env.STABLECOIN_EUR_TO_USD_RATE);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("STABLECOIN_EUR_TO_USD_RATE is required for EUR products");
    }

    return {
      fiat,
      amount: ((amountCents / 100) * rate).toFixed(2),
    };
  }

  throw new Error(`Stablecoin fiat ${fiat} cannot price ${productCurrency}`);
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to create a stablecoin invoice" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  if (
    !paymentConfig.salesEnabled ||
    !paymentConfig.crypto.stablecoin.checkoutEnabled
  ) {
    return NextResponse.json(
      { error: "Stablecoin checkout is not enabled yet" },
      { status: 403 },
    );
  }

  if (!isOrdersDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Order database is not configured" },
      { status: 503 },
    );
  }

  const rateLimited = await enforceRateLimit(request, {
    action: "stablecoin-checkout",
    limit: 12,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  if (
    paymentConfig.crypto.stablecoin.preferredProvider !== "shkeeper" &&
    paymentConfig.crypto.stablecoin.preferredProvider !== "solana-pay"
  ) {
    return NextResponse.json(
      { error: "Stablecoin provider is not supported by this route" },
      { status: 503 },
    );
  }

  const payload = await readPayload(request);
  const product = products.find((item) => item.slug === payload.product);

  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  if (product.status === "coming-soon") {
    return NextResponse.json(
      { error: "This product is not available yet" },
      { status: 409 },
    );
  }

  const railId = payload.rail || paymentConfig.crypto.stablecoin.defaultRail;
  const rail = paymentConfig.crypto.stablecoin.rails.find(
    (item) => item.id === railId,
  );

  if (!rail || !rail.enabled) {
    return NextResponse.json(
      { error: "Stablecoin rail is not enabled yet" },
      { status: 403 },
    );
  }

  try {
    if (paymentConfig.crypto.stablecoin.preferredProvider === "solana-pay") {
      const orderId = `marky-solana-pay-${product.slug}-${crypto.randomUUID()}`;
      const invoice = createSolanaPayInvoice({ orderId, product });
      const checkoutLink = getPublicUrl(
        `/checkout/stablecoin?orderId=${encodeURIComponent(orderId)}`,
      );

      await ensureOrdersDatabaseReady();
      await recordCheckoutInvoice({
        orderId,
        provider: "solana-pay",
        product,
        providerInvoiceId: invoice.reference,
        checkoutLink,
        providerStatus: "UNPAID",
        metadata: {
          provider: "solana-pay",
          railId: rail.id,
          railLabel: rail.label,
          cryptoName: "USDC",
          fiat: "USD",
          fiatAmount: invoice.amount,
          solanaPayInvoice: invoice,
        },
      });

      return NextResponse.redirect(checkoutLink, 303);
    }

    const processorUrl =
      paymentConfig.crypto.stablecoin.processorUrl.replace(/\/$/, "") ||
      requiredEnv("STABLECOIN_PROCESSOR_URL").replace(/\/$/, "");
    const apiKey = requiredEnv("SHKEEPER_API_KEY");
    const orderId = `marky-${rail.id}-${product.slug}-${crypto.randomUUID()}`;
    const { fiat, amount } = getStablecoinFiatAmount(
      product.amountCents,
      product.currency,
    );

    await ensureOrdersDatabaseReady();

    const response = await fetch(
      `${processorUrl}/api/v1/${encodeURIComponent(rail.cryptoName)}/payment_request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shkeeper-Api-Key": apiKey,
        },
        body: JSON.stringify({
          external_id: orderId,
          fiat,
          amount,
          callback_url: getPublicUrl("/api/webhooks/shkeeper"),
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Stablecoin invoice creation failed" },
        { status: 502 },
      );
    }

    const invoice = (await response.json()) as ShkeeperPaymentRequestResponse;

    if (invoice.status !== "success" || !invoice.wallet || !invoice.id) {
      return NextResponse.json(
        { error: "Stablecoin invoice did not return a usable wallet" },
        { status: 502 },
      );
    }

    const checkoutLink = getPublicUrl(
      `/checkout/stablecoin?orderId=${encodeURIComponent(orderId)}`,
    );

    await recordCheckoutInvoice({
      orderId,
      provider: "shkeeper",
      product,
      providerInvoiceId: String(invoice.id),
      checkoutLink,
      providerStatus: "UNPAID",
      metadata: {
        provider: "shkeeper",
        railId: rail.id,
        railLabel: rail.label,
        cryptoName: rail.cryptoName,
        fiat,
        fiatAmount: amount,
        shkeeperInvoice: {
          amount: invoice.amount,
          displayName: invoice.display_name,
          exchangeRate: invoice.exchange_rate,
          recalculateAfter: invoice.recalculate_after,
          wallet: invoice.wallet,
        },
      },
    });

    return NextResponse.redirect(checkoutLink, 303);
  } catch {
    return NextResponse.json(
      { error: "Stablecoin checkout is not configured yet" },
      { status: 503 },
    );
  }
}
