import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  handleTelegramUpdate,
  isTelegramBotConfigured,
  type TelegramUpdate,
} from "@/lib/server/telegram";

export const runtime = "nodejs";

function isValidTelegramSecret(received: string | null, expected: string) {
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

export async function GET() {
  return NextResponse.json(
    { error: "Use POST for Telegram webhook updates" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!isTelegramBotConfigured() || !webhookSecret) {
    return NextResponse.json(
      { error: "Telegram webhook is not configured" },
      { status: 503 },
    );
  }

  if (
    !isValidTelegramSecret(
      request.headers.get("x-telegram-bot-api-secret-token"),
      webhookSecret,
    )
  ) {
    return NextResponse.json({ error: "Invalid Telegram secret" }, { status: 401 });
  }

  let update: TelegramUpdate;

  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await handleTelegramUpdate(update);

  return NextResponse.json({ ok: true, result }, { status: 202 });
}
