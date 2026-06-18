import { createHmac, timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  isOrdersDatabaseConfigured,
  recordBtcpayWebhookEvent,
} from "@/lib/server/orders";

export const runtime = "nodejs";

function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const secret = process.env.BTCPAY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "BTCPay webhook is not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("BTCPay-Sig");

  if (!isValidSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!isOrdersDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Order database is not configured" },
      { status: 503 },
    );
  }

  let event: {
    type?: string;
    invoiceId?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    event = JSON.parse(body || "{}") as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await recordBtcpayWebhookEvent(event);

  return NextResponse.json({ ok: true });
}
