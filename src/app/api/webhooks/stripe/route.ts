import { createHmac, timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { products } from "@/data/products";
import {
  isOrdersDatabaseConfigured,
  recordStripeCheckoutSessionEvent,
} from "@/lib/server/orders";

export const runtime = "nodejs";

type StripeWebhookEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      object?: string;
      amount_total?: number | null;
      currency?: string | null;
      customer_email?: string | null;
      customer_details?: {
        email?: string | null;
      } | null;
      metadata?: Record<string, unknown> | null;
      payment_link?: string | { id?: string } | null;
      payment_status?: string | null;
      status?: string | null;
    };
  };
};

type StripeCheckoutSessionPayload = NonNullable<
  NonNullable<StripeWebhookEvent["data"]>["object"]
>;

function parseStripeSignature(signature: string | null) {
  if (!signature) {
    return null;
  }

  const fields = new Map<string, string[]>();

  for (const part of signature.split(",")) {
    const [key, value] = part.split("=", 2);

    if (!key || !value) {
      continue;
    }

    fields.set(key, [...(fields.get(key) || []), value]);
  }

  const timestamp = fields.get("t")?.[0];
  const signatures = fields.get("v1") || [];

  if (!timestamp || !signatures.length) {
    return null;
  }

  return { timestamp, signatures };
}

function isValidStripeSignature({
  body,
  secret,
  signature,
}: {
  body: string;
  secret: string;
  signature: string | null;
}) {
  const parsed = parseStripeSignature(signature);

  if (!parsed) {
    return false;
  }

  const timestampSeconds = Number(parsed.timestamp);

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > 300
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${body}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);

  return parsed.signatures.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate);

    return (
      candidateBuffer.length === expectedBuffer.length &&
      timingSafeEqual(candidateBuffer, expectedBuffer)
    );
  });
}

function getPaymentLinkId(paymentLink: StripeCheckoutSessionPayload["payment_link"]) {
  if (typeof paymentLink === "string") {
    return paymentLink;
  }

  if (paymentLink && typeof paymentLink === "object") {
    return paymentLink.id || null;
  }

  return null;
}

function findProduct({
  metadata,
  paymentLinkId,
}: {
  metadata?: Record<string, unknown> | null;
  paymentLinkId?: string | null;
}) {
  const metadataSlug =
    typeof metadata?.productSlug === "string"
      ? metadata.productSlug
      : typeof metadata?.product_slug === "string"
        ? metadata.product_slug
        : null;

  return (
    products.find((product) => product.slug === metadataSlug) ||
    products.find((product) => product.stripePaymentLinkId === paymentLinkId)
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  if (!isOrdersDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Order database is not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();

  if (
    !isValidStripeSignature({
      body,
      secret,
      signature: request.headers.get("stripe-signature"),
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: StripeWebhookEvent;

  try {
    event = JSON.parse(body || "{}") as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = event.data?.object;

  if (!event.id || !event.type || !session?.id || session.object !== "checkout.session") {
    return NextResponse.json({ error: "Unsupported event payload" }, { status: 400 });
  }

  const supportedEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);

  if (!supportedEvents.has(event.type)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const paymentLinkId = getPaymentLinkId(session.payment_link);
  const product = findProduct({
    metadata: session.metadata,
    paymentLinkId,
  });

  await recordStripeCheckoutSessionEvent({
    eventId: event.id,
    eventType: event.type,
    sessionId: session.id,
    paymentLinkId,
    productSlug: product?.slug,
    productTitle: product?.title,
    amountTotal: session.amount_total ?? undefined,
    currency: session.currency,
    status: session.payment_status || session.status || event.type,
    customerEmail: session.customer_details?.email || session.customer_email,
    metadata: {
      provider: "stripe",
      paymentLinkId,
      rawStatus: session.status,
      paymentStatus: session.payment_status,
    },
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
