import { NextRequest, NextResponse } from "next/server";

import { legalConfig } from "@/data/legal";
import { paymentConfig } from "@/data/payments";
import { products } from "@/data/products";
import { assertLocale } from "@/i18n/config";
import {
  ensureOrdersDatabaseReady,
  isOrdersDatabaseConfigured,
  recordCheckoutInvoice,
} from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";

export const runtime = "nodejs";

const stripeLocaleBySiteLocale = {
  en: "en",
  fr: "fr",
  ru: "ru",
} as const;

async function readForm(request: NextRequest) {
  const form = await request.formData();
  const product = form.get("product");
  const locale = form.get("locale");
  const termsAccepted = form.get("termsAccepted");

  return {
    product: typeof product === "string" ? product : undefined,
    locale: typeof locale === "string" ? assertLocale(locale) : null,
    termsAccepted:
      termsAccepted === "true" ||
      termsAccepted === "on" ||
      termsAccepted === "1",
  };
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to start Stripe checkout" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  if (!paymentConfig.salesEnabled) {
    return NextResponse.json(
      { error: "Checkout is not enabled yet" },
      { status: 403 },
    );
  }

  const rateLimited = await enforceRateLimit(request, {
    action: "stripe-checkout",
    limit: 20,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  const payload = await readForm(request);

  if (!payload.termsAccepted) {
    return NextResponse.json(
      { error: "Terms and immediate delivery consent are required" },
      { status: 400 },
    );
  }

  const product = products.find((item) => item.slug === payload.product);

  if (!product || product.checkoutProvider !== "stripe") {
    return NextResponse.json({ error: "Unknown access pass" }, { status: 404 });
  }

  if (product.status === "coming-soon" || !product.stripePaymentLink) {
    return NextResponse.json(
      { error: "This access pass is not available yet" },
      { status: 409 },
    );
  }

  const orderId = `marky-stripe-${product.slug}-${crypto.randomUUID()}`;
  const checkoutUrl = new URL(product.stripePaymentLink);

  checkoutUrl.searchParams.set("client_reference_id", orderId);
  if (payload.locale) {
    checkoutUrl.searchParams.set(
      "locale",
      stripeLocaleBySiteLocale[payload.locale],
    );
  }

  if (isOrdersDatabaseConfigured()) {
    await ensureOrdersDatabaseReady();
    await recordCheckoutInvoice({
      orderId,
      provider: "stripe",
      product,
      providerInvoiceId: `stripe-pending-${orderId}`,
      checkoutLink: checkoutUrl.toString(),
      providerStatus: "PENDING",
      legalTermsVersion: legalConfig.termsVersion,
      withdrawalWaiverAcceptedAt: new Date().toISOString(),
      metadata: {
        provider: "stripe",
        checkoutMode: "payment-link",
        paymentLinkId: product.stripePaymentLinkId,
        locale: payload.locale,
        legal: {
          termsVersion: legalConfig.termsVersion,
          immediateDigitalDeliveryAccepted: true,
          withdrawalWaiverAccepted: true,
          acceptedAt: new Date().toISOString(),
        },
      },
    });
  }

  return NextResponse.redirect(checkoutUrl.toString(), 303);
}
