import { NextRequest, NextResponse } from "next/server";

import { paymentConfig } from "@/data/payments";
import { products } from "@/data/products";

export const runtime = "nodejs";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

async function readProductSlug(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      product?: string;
    } | null;

    return body?.product;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const product = form.get("product");

    return typeof product === "string" ? product : undefined;
  }

  return undefined;
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to create a BTCPay invoice" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  if (!paymentConfig.salesEnabled) {
    return NextResponse.json(
      { error: "Sales are not enabled yet" },
      { status: 403 },
    );
  }

  const productSlug = await readProductSlug(request);
  const product = products.find((item) => item.slug === productSlug);

  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  if (product.status === "coming-soon") {
    return NextResponse.json(
      { error: "This product is not available yet" },
      { status: 409 },
    );
  }

  try {
    const serverUrl = requiredEnv("BTCPAY_SERVER_URL").replace(/\/$/, "");
    const storeId = requiredEnv("BTCPAY_STORE_ID");
    const apiKey = requiredEnv("BTCPAY_API_KEY");
    const orderId = `marky-${product.slug}-${crypto.randomUUID()}`;

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
        },
        checkout: {
          redirectURL: `${request.nextUrl.origin}/checkout/crypto-return?orderId=${encodeURIComponent(orderId)}`,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "BTCPay invoice creation failed" },
        { status: 502 },
      );
    }

    const invoice = (await response.json()) as { checkoutLink?: string };

    if (!invoice.checkoutLink) {
      return NextResponse.json(
        { error: "BTCPay invoice did not return a checkout link" },
        { status: 502 },
      );
    }

    return NextResponse.redirect(invoice.checkoutLink, 303);
  } catch {
    return NextResponse.json(
      { error: "BTCPay checkout is not configured yet" },
      { status: 503 },
    );
  }
}
