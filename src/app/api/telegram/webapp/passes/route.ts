import { createHmac, timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { listTelegramAccessPasses } from "@/lib/server/orders";
import { isTelegramBotConfigured } from "@/lib/server/telegram";

export const runtime = "nodejs";

type TelegramWebAppUser = {
  id?: number;
  username?: string;
  first_name?: string;
};

function verifyTelegramWebAppInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date") || "0");
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  if (!botToken || !receivedHash || !authDate) {
    return null;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

  if (ageSeconds < 0 || ageSeconds > 24 * 60 * 60) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  const received = Buffer.from(receivedHash, "hex");
  const calculated = Buffer.from(calculatedHash, "hex");

  if (
    received.length !== calculated.length ||
    !timingSafeEqual(received, calculated)
  ) {
    return null;
  }

  const userRaw = params.get("user");

  if (!userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as TelegramWebAppUser;

    return user.id ? { id: String(user.id), user } : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isTelegramBotConfigured()) {
    return NextResponse.json(
      { error: "Telegram bot is not configured" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    initData?: string;
  };
  const verified = body.initData
    ? verifyTelegramWebAppInitData(body.initData)
    : null;

  if (!verified) {
    return NextResponse.json(
      { error: "Invalid Telegram Web App session" },
      { status: 401 },
    );
  }

  const passes = await listTelegramAccessPasses({
    telegramUserId: verified.id,
    ttlDays: 1,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: verified.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
    },
    passes,
  });
}
