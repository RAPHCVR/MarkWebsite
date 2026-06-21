import { siteConfig } from "@/data/site";
import type { CreatorOrder } from "@/lib/server/orders";
import { getPublicUrl } from "@/lib/site-url";

type TelegramInlineButton = {
  text: string;
  url: string;
};

type SendTelegramMessageOptions = {
  chatId: string;
  text: string;
  buttons?: TelegramInlineButton[];
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id?: number | string;
      type?: string;
    };
    from?: {
      id?: number;
      username?: string;
      first_name?: string;
    };
  };
};

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

function getTelegramApiUrl(method: string) {
  const token = getTelegramBotToken();

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  return `https://api.telegram.org/bot${token}/${method}`;
}

export function isTelegramBotConfigured() {
  return Boolean(getTelegramBotToken());
}

export function getTelegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || "markshnaknaksbot";
}

export function getTelegramBotUrl(startPayload?: string) {
  const url = new URL(`https://t.me/${getTelegramBotUsername()}`);

  if (startPayload) {
    url.searchParams.set("start", startPayload);
  }

  return url.toString();
}

export async function sendTelegramMessage({
  chatId,
  text,
  buttons = [],
}: SendTelegramMessageOptions) {
  if (!isTelegramBotConfigured()) {
    return { ok: false, skipped: true as const };
  }

  const response = await fetch(getTelegramApiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      reply_markup: buttons.length
        ? {
            inline_keyboard: buttons.map((button) => [button]),
          }
        : undefined,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as TelegramApiResponse<{
    message_id?: number;
  }>;

  return {
    ok: response.ok && payload.ok,
    status: response.status,
    description: payload.description,
    result: payload.result,
  };
}

export async function notifyDeliveryReady({
  order,
  deliveryUrl,
}: {
  order: CreatorOrder;
  deliveryUrl?: string | null;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId || !deliveryUrl) {
    return { ok: false, skipped: true as const };
  }

  return sendTelegramMessage({
    chatId: adminChatId,
    text: [
      "New paid Marky order",
      `Product: ${order.productTitle || order.productSlug || "unknown"}`,
      `Provider: ${order.provider}`,
      `Order: ${order.orderId}`,
      `Delivery: ${getPublicUrl(deliveryUrl)}`,
    ].join("\n"),
    buttons: [
      {
        text: "Open delivery",
        url: getPublicUrl(deliveryUrl),
      },
      {
        text: "Telegram chat",
        url: siteConfig.telegramChatUrl,
      },
    ],
  });
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() || "";

  if (!chatId) {
    return { ok: true, ignored: true };
  }

  if (text.startsWith("/support")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "For order help and custom requests, use the Marky chat.",
      buttons: [{ text: "Open chat", url: siteConfig.telegramChatUrl }],
    });
  }

  if (text.startsWith("/orders")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Paid site orders are delivered through private markshnaknaks.com links. Open the delivery link from your checkout confirmation or ask support.",
      buttons: [{ text: "Open support", url: siteConfig.telegramChatUrl }],
    });
  }

  return sendTelegramMessage({
    chatId: String(chatId),
    text: "Welcome to Marky. Use the official site for packs, Telegram for updates and support.",
    buttons: [
      { text: "Open shop", url: getPublicUrl("/#photo-packs") },
      { text: "Telegram channel", url: siteConfig.telegramChannelUrl },
      { text: "Support chat", url: siteConfig.telegramChatUrl },
    ],
  });
}
