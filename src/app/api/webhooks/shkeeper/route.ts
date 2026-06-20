import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  isOrdersDatabaseConfigured,
  recordShkeeperWebhookEvent,
} from "@/lib/server/orders";

export const runtime = "nodejs";

function isValidApiKey(received: string | null, expected: string) {
  if (!received) {
    return false;
  }

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const expectedApiKey =
    process.env.STABLECOIN_WEBHOOK_SECRET || process.env.SHKEEPER_API_KEY;

  if (!expectedApiKey) {
    return NextResponse.json(
      { error: "SHKeeper webhook is not configured" },
      { status: 503 },
    );
  }

  if (!isValidApiKey(request.headers.get("X-Shkeeper-Api-Key"), expectedApiKey)) {
    return NextResponse.json({ error: "Invalid webhook key" }, { status: 401 });
  }

  if (!isOrdersDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Order database is not configured" },
      { status: 503 },
    );
  }

  let event: Parameters<typeof recordShkeeperWebhookEvent>[0];

  try {
    event = (await request.json()) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await recordShkeeperWebhookEvent(event);

  return NextResponse.json({ ok: true }, { status: 202 });
}
