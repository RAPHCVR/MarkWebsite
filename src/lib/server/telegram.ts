import { siteConfig } from "@/data/site";
import {
  getPrivateRequestReplyPrompt,
  linkTelegramToDelivery,
  recordPrivateRequestAdminReplyFromTelegram,
  recordPrivateRequestTicketFromTelegram,
  type CreatorOrder,
  type PrivateRequestTicketResult,
} from "@/lib/server/orders";
import { getPublicUrl } from "@/lib/site-url";

type TelegramInlineButton = {
  text: string;
  url?: string;
  callbackData?: string;
};

type SendTelegramMessageOptions = {
  chatId: string;
  text: string;
  buttons?: TelegramInlineButton[];
  replyToMessageId?: number;
  forceReply?: boolean;
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
    reply_to_message?: {
      message_id?: number;
      text?: string;
    };
  };
  callback_query?: {
    id?: string;
    data?: string;
    message?: {
      message_id?: number;
      chat?: {
        id?: number | string;
        type?: string;
      };
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

function getAllowedAdminUserIds() {
  return (process.env.TELEGRAM_ADMIN_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isTelegramAdminUserAllowed(userId?: number) {
  const allowedAdminUserIds = getAllowedAdminUserIds();

  return (
    !allowedAdminUserIds.length ||
    (userId !== undefined && allowedAdminUserIds.includes(String(userId)))
  );
}

function getDeliveryTokenFromStartPayload(text: string) {
  const match = text.match(/^\/start(?:@\w+)?\s+delivery_([A-Za-z0-9_-]{20,})$/);

  return match?.[1] || null;
}

function getStartPayload(text: string) {
  const match = text.match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]+)$/);

  return match?.[1] || null;
}

function getCommandText(text: string, command: string) {
  return text.replace(new RegExp(`^/${command}(?:@\\w+)?\\s*`, "i"), "").trim();
}

export function getTelegramDeliveryLinkUrl(token: string) {
  return getTelegramBotUrl(`delivery_${token}`);
}

export async function sendTelegramMessage({
  chatId,
  text,
  buttons = [],
  replyToMessageId,
  forceReply = false,
}: SendTelegramMessageOptions) {
  if (!isTelegramBotConfigured()) {
    return { ok: false, skipped: true as const };
  }

  const inlineKeyboard = buttons.map((button) => {
    const payload: { text: string; url?: string; callback_data?: string } = {
      text: button.text,
    };

    if (button.url) {
      payload.url = button.url;
    }

    if (button.callbackData) {
      payload.callback_data = button.callbackData;
    }

    return [payload];
  });

  const response = await fetch(getTelegramApiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      reply_to_message_id: replyToMessageId,
      allow_sending_without_reply: true,
      reply_markup: buttons.length
        ? {
            inline_keyboard: inlineKeyboard,
          }
        : forceReply
          ? {
              force_reply: true,
              input_field_placeholder: "Write the customer reply...",
              selective: true,
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

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!isTelegramBotConfigured()) {
    return { ok: false, skipped: true as const };
  }

  const response = await fetch(getTelegramApiUrl("answerCallbackQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as TelegramApiResponse<boolean>;

  return {
    ok: response.ok && payload.ok,
    status: response.status,
    description: payload.description,
    result: payload.result,
  };
}

function getReplyTokenFromAdminPrompt(text?: string) {
  const match = text?.match(/Reply token:\s*([A-Za-z0-9_-]{16,64})/);

  return match?.[1] || null;
}

async function createTelegramInviteLink(chatId: string) {
  if (!isTelegramBotConfigured()) {
    return null;
  }

  const response = await fetch(getTelegramApiUrl("createChatInviteLink"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      name: "Marky VIP access",
      expire_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      member_limit: 1,
      creates_join_request: false,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as TelegramApiResponse<{
    invite_link?: string;
  }>;

  return response.ok && payload.ok ? payload.result?.invite_link || null : null;
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
      "New Marky access order",
      `Access: ${order.productTitle || order.productSlug || "unknown"}`,
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

async function notifyPrivateRequest(ticket: Extract<PrivateRequestTicketResult, { ok: true }>) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId) {
    return { ok: false, skipped: true as const };
  }

  return sendTelegramMessage({
    chatId: adminChatId,
    text: [
      "New VIP Infrastructure Access ticket",
      `Request: ${ticket.requestId}`,
      `Order: ${ticket.orderId}`,
      `Access: ${ticket.productTitle || "VIP Infrastructure Access"}`,
      `Quota: ${ticket.quotaUsed}/${ticket.quotaTotal}`,
      `Customer reply token: ${ticket.replyToken}`,
      "",
      ticket.message,
    ].join("\n"),
    buttons: [
      {
        text: "Répondre",
        callbackData: `reply_private_request:${ticket.replyToken}`,
      },
      {
        text: "Support chat",
        url: siteConfig.telegramChatUrl,
      },
    ],
  });
}

export async function notifyContactRequest({
  requestId,
  name,
  email,
  organization,
  message,
}: {
  requestId?: string;
  name?: string;
  email?: string;
  organization?: string;
  message: string;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId) {
    return { ok: false, skipped: true as const };
  }

  return sendTelegramMessage({
    chatId: adminChatId,
    text: [
      "New Marky contact request",
      requestId ? `Request: ${requestId}` : null,
      name ? `Name: ${name}` : null,
      email ? `Reply email: ${email}` : null,
      organization ? `Brand: ${organization}` : null,
      "",
      message.slice(0, 1_500),
    ]
      .filter((line): line is string => typeof line === "string")
      .join("\n"),
    buttons: [
      {
        text: "Open site",
        url: siteConfig.publicUrl,
      },
    ],
  });
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const callbackQuery = update.callback_query;

  if (callbackQuery?.data?.startsWith("reply_private_request:")) {
    const callbackQueryId = callbackQuery.id;
    const callbackChatId = callbackQuery.message?.chat?.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const adminUserId = callbackQuery.from?.id;
    const replyToken = callbackQuery.data.replace("reply_private_request:", "");

    if (!callbackQueryId) {
      return { ok: true, ignored: true };
    }

    if (
      !adminChatId ||
      String(callbackChatId) !== adminChatId ||
      !isTelegramAdminUserAllowed(adminUserId)
    ) {
      return answerCallbackQuery(callbackQueryId, "Admin chat only.");
    }

    const ticket = await getPrivateRequestReplyPrompt(replyToken);

    if (!ticket) {
      return answerCallbackQuery(callbackQueryId, "Ticket not found.");
    }

    await answerCallbackQuery(callbackQueryId, "Reply to the bot prompt.");

    return sendTelegramMessage({
      chatId: adminChatId,
      replyToMessageId: callbackQuery.message?.message_id,
      forceReply: true,
      text: [
        "Reply to this message to answer the customer.",
        `Request: ${ticket.requestId}`,
        `Access: ${ticket.productTitle || ticket.subject || "VIP Infrastructure Access"}`,
        `Reply token: ${replyToken}`,
        "",
        "Customer message:",
        ticket.lastMessage || "(empty)",
      ].join("\n"),
    });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() || "";
  const from = update.message?.from;

  if (!chatId) {
    return { ok: true, ignored: true };
  }

  const adminReplyToken = getReplyTokenFromAdminPrompt(
    update.message?.reply_to_message?.text,
  );

  if (
    adminReplyToken &&
    process.env.TELEGRAM_ADMIN_CHAT_ID &&
    String(chatId) === process.env.TELEGRAM_ADMIN_CHAT_ID
  ) {
    if (!isTelegramAdminUserAllowed(from?.id)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "This Telegram account is not allowed to answer customer tickets.",
      });
    }

    const reply = await recordPrivateRequestAdminReplyFromTelegram({
      replyToken: adminReplyToken,
      message: text,
      adminChatId: String(chatId),
      adminUserId: from?.id,
      adminUsername: from?.username,
    });

    if (!reply.ok) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text:
          reply.reason === "empty-message"
            ? "Reply was empty. Send the customer answer as text."
            : "Could not find the private request ticket for this reply.",
      });
    }

    if (!reply.customerChatId) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: `Reply saved for ${reply.requestId}, but no customer Telegram chat is linked.`,
      });
    }

    const delivered = await sendTelegramMessage({
      chatId: reply.customerChatId,
      text: [
        "Marky Concierge reply",
        `Ticket: ${reply.requestId}`,
        "",
        reply.message,
      ].join("\n"),
      buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
    });
    const deliveryError =
      "description" in delivered
        ? delivered.description || delivered.status || "unknown error"
        : "skipped";

    return sendTelegramMessage({
      chatId: String(chatId),
      text: delivered.ok
        ? `Reply sent to customer for ${reply.requestId}.`
        : `Reply saved for ${reply.requestId}, but Telegram delivery failed: ${deliveryError}.`,
    });
  }

  if (text.startsWith("/chatid")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Marky Concierge chat id",
        `chat_id: ${chatId}`,
        "Use this only for a private admin/support chat configured in Kubernetes.",
      ].join("\n"),
    });
  }

  if (text.startsWith("/help")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Marky Concierge commands",
        "/start - link a delivery token or open the site",
        "/support - open support chat",
        "/orders - get order delivery help",
        "/request - submit a paid private request ticket",
        "/chatid - show this chat id for admin setup",
      ].join("\n"),
      buttons: [
        { text: "Open access passes", url: getPublicUrl("/#access-passes") },
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  const deliveryToken = getDeliveryTokenFromStartPayload(text);
  const startPayload = getStartPayload(text);

  if (startPayload === "request") {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "VIP Infrastructure Access",
        "Buy or open a pass on the site, link Telegram from the delivery page, then send:",
        "/request your message",
        "",
        "Requests are ticketed here. They do not go to Marky's personal account.",
      ].join("\n"),
      buttons: [
        { text: "View access passes", url: getPublicUrl("/#access-passes") },
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (deliveryToken) {
    const delivery = await linkTelegramToDelivery({
      token: deliveryToken,
      chatId: String(chatId),
      userId: from?.id,
      username: from?.username,
      firstName: from?.first_name,
    });

    if (!delivery) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "This access token is expired or invalid. Open the delivery page from the site or contact support.",
        buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
      });
    }

    const vipInviteLink =
      delivery.productSlug === "vip-bundle" && process.env.TELEGRAM_VIP_CHAT_ID
        ? await createTelegramInviteLink(process.env.TELEGRAM_VIP_CHAT_ID).catch(
            () => null,
          )
        : null;

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Telegram linked to your Marky access.",
        `Access: ${delivery.productTitle || delivery.productSlug}`,
        "Keep using the site delivery page for secure downloads. Telegram is only the concierge/support channel.",
      ].join("\n"),
      buttons: [
        { text: "Open delivery", url: getPublicUrl(`/orders/${delivery.token}`) },
        ...(vipInviteLink ? [{ text: "Join VIP", url: vipInviteLink }] : []),
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (text.startsWith("/support")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "For order help and private request tickets, use the Marky chat.",
      buttons: [{ text: "Open chat", url: siteConfig.telegramChatUrl }],
    });
  }

  if (text.startsWith("/orders")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Paid site orders are delivered through private markshnaknaks.com access links. Open your delivery link or ask support.",
      buttons: [{ text: "Open support", url: siteConfig.telegramChatUrl }],
    });
  }

  if (text.startsWith("/request")) {
    const requestMessage = getCommandText(text, "request");

    if (!requestMessage) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: [
          "Send your private request in the same message.",
          "Example:",
          "/request I want to discuss a custom creator brief.",
        ].join("\n"),
        buttons: [
          { text: "View access passes", url: getPublicUrl("/#access-passes") },
          { text: "Support chat", url: siteConfig.telegramChatUrl },
        ],
      });
    }

    const ticket = await recordPrivateRequestTicketFromTelegram({
      chatId: String(chatId),
      userId: from?.id,
      username: from?.username,
      message: requestMessage,
    });

    if (!ticket.ok) {
      const reason =
        ticket.reason === "quota-exhausted"
          ? "Your VIP Infrastructure Access quota is already used."
          : "No active VIP Infrastructure Access entitlement is linked to this Telegram chat yet.";

      return sendTelegramMessage({
        chatId: String(chatId),
        text: reason,
        buttons: [
          { text: "View access passes", url: getPublicUrl("/#access-passes") },
          { text: "Support chat", url: siteConfig.telegramChatUrl },
        ],
      });
    }

    await notifyPrivateRequest(ticket).catch(() => undefined);

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Private request recorded.",
        `Ticket: ${ticket.requestId}`,
        `Remaining quota: ${ticket.remaining}`,
        "Support will follow up through the official channels.",
      ].join("\n"),
      buttons: [
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  return sendTelegramMessage({
    chatId: String(chatId),
    text: "Welcome to Marky Concierge. Use the official site for digital access passes, Telegram for updates and support. Send /help for commands.",
    buttons: [
      { text: "Open access passes", url: getPublicUrl("/#access-passes") },
      { text: "Telegram channel", url: siteConfig.telegramChannelUrl },
      { text: "Support chat", url: siteConfig.telegramChatUrl },
    ],
  });
}
