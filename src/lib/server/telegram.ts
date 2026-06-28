import { siteConfig } from "@/data/site";
import {
  getContactRequestReplyPrompt,
  getPrivateRequestReplyPrompt,
  linkTelegramToContactRequest,
  linkTelegramToDelivery,
  recordContactAdminReplyFromTelegram,
  recordContactRequest,
  recordPrivateRequestAdminReplyFromTelegram,
  recordPrivateRequestTicketFromTelegram,
  type ContactRequestRecordResult,
  type CreatorOrder,
  type PrivateRequestTicketResult,
} from "@/lib/server/orders";
import { getPublicUrl } from "@/lib/site-url";

type TelegramInlineButton = {
  text: string;
  url?: string;
  callbackData?: string;
  webAppUrl?: string;
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

function getContactLinkTokenFromStartPayload(payload: string | null) {
  const match = payload?.match(/^contact_([A-Za-z0-9_-]{16,64})$/);

  return match?.[1] || null;
}

function getCommandText(text: string, command: string) {
  return text.replace(new RegExp(`^/${command}(?:@\\w+)?\\s*`, "i"), "").trim();
}

function isPrivateChat(chatType?: string) {
  return !chatType || chatType === "private";
}

function getManualReplyPayload(text: string) {
  const match = text.match(
    /^\/reply(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})(?:\s+([\s\S]+))?$/i,
  );

  if (!match) {
    return null;
  }

  return {
    replyToken: match[1],
    message: (match[2] || "").trim(),
  };
}

function getManualContactReplyPayload(text: string) {
  const match = text.match(
    /^\/contactreply(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})(?:\s+([\s\S]+))?$/i,
  );

  if (!match) {
    return null;
  }

  return {
    replyToken: match[1],
    message: (match[2] || "").trim(),
  };
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
    const payload: {
      text: string;
      url?: string;
      callback_data?: string;
      web_app?: { url: string };
    } = {
      text: button.text,
    };

    if (button.url) {
      payload.url = button.url;
    }

    if (button.callbackData) {
      payload.callback_data = button.callbackData;
    }

    if (button.webAppUrl) {
      payload.web_app = { url: button.webAppUrl };
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
              input_field_placeholder: "Write your reply...",
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

function getContactReplyTokenFromAdminPrompt(text?: string) {
  const match = text?.match(/Contact reply token:\s*([A-Za-z0-9_-]{16,64})/);

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
      "New Marky order",
      `Access: ${order.productTitle || order.productSlug || "unknown"}`,
      `Provider: ${order.provider}`,
      `Order: ${order.orderId}`,
      `Access page: ${getPublicUrl(deliveryUrl)}`,
    ].join("\n"),
    buttons: [
      {
        text: "Open access",
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
      "New VIP request",
      `Request: ${ticket.requestId}`,
      `Order: ${ticket.orderId}`,
      `Pass: ${ticket.productTitle || "VIP Request Pass"}`,
      `Quota: ${ticket.quotaUsed}/${ticket.quotaTotal}`,
      `Reply token: ${ticket.replyToken}`,
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
  replyToken,
  name,
  email,
  organization,
  telegram,
  telegramChatId,
  telegramUserId,
  telegramUsername,
  message,
}: {
  requestId?: string;
  replyToken?: string;
  name?: string;
  email?: string;
  organization?: string;
  telegram?: string;
  telegramChatId?: string | null;
  telegramUserId?: string | null;
  telegramUsername?: string | null;
  message: string;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId) {
    return { ok: false, skipped: true as const };
  }

  return sendTelegramMessage({
    chatId: adminChatId,
    text: [
      "New contact request",
      requestId ? `Request: ${requestId}` : null,
      name ? `Name: ${name}` : null,
      email ? `Reply email: ${email}` : null,
      organization ? `Brand: ${organization}` : null,
      telegram ? `Telegram: ${telegram}` : null,
      telegramUsername ? `Telegram username: @${telegramUsername}` : null,
      telegramUserId ? `Telegram user_id: ${telegramUserId}` : null,
      telegramChatId ? `Telegram chat_id: ${telegramChatId}` : null,
      "",
      message.slice(0, 1_500),
    ]
      .filter((line): line is string => typeof line === "string")
      .join("\n"),
    buttons: [
      ...(replyToken
        ? [
            {
              text: "Répondre",
              callbackData: `reply_contact_request:${replyToken}`,
            },
          ]
        : []),
      ...(telegramUsername
        ? [
            {
              text: "Open Telegram profile",
              url: `https://t.me/${telegramUsername}`,
            },
          ]
        : []),
      { text: "Open site", url: siteConfig.publicUrl },
    ],
  });
}

async function notifyContactTelegramLinked(ticket: {
  requestId: string;
  replyToken: string;
  name: string | null;
  email: string | null;
  organization: string | null;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId) {
    return { ok: false, skipped: "TELEGRAM_ADMIN_CHAT_ID missing" };
  }

  return sendTelegramMessage({
    chatId: adminChatId,
    text: [
      "Telegram linked to contact",
      `Contact: ${ticket.requestId}`,
      ticket.name ? `Name: ${ticket.name}` : null,
      ticket.email ? `Reply email: ${ticket.email}` : null,
      ticket.organization ? `Brand: ${ticket.organization}` : null,
    ]
      .filter((line): line is string => typeof line === "string")
      .join("\n"),
    buttons: [
      {
        text: "Répondre",
        callbackData: `reply_contact_request:${ticket.replyToken}`,
      },
      { text: "Open site", url: siteConfig.publicUrl },
    ],
  });
}

async function notifyTelegramContactRequest(
  ticket: ContactRequestRecordResult & {
    name?: string;
    email?: string;
    organization?: string;
    telegram?: string;
    message: string;
  },
) {
  return notifyContactRequest({
    requestId: ticket.requestId,
    replyToken: ticket.replyToken,
    name: ticket.name,
    email: ticket.email,
    organization: ticket.organization,
    telegram: ticket.telegram,
    telegramChatId: ticket.telegramChatId,
    telegramUserId: ticket.telegramUserId,
    telegramUsername: ticket.telegramUsername,
    message: ticket.message,
  });
}

async function handleAdminPrivateRequestReply({
  chatId,
  replyToken,
  message,
  from,
}: {
  chatId: string;
  replyToken: string;
  message: string;
  from?: { id?: number; username?: string };
}) {
  if (!isTelegramAdminUserAllowed(from?.id)) {
    return sendTelegramMessage({
      chatId,
      text: "This Telegram account cannot reply to tickets.",
    });
  }

  const reply = await recordPrivateRequestAdminReplyFromTelegram({
    replyToken,
    message,
    adminChatId: chatId,
    adminUserId: from?.id,
    adminUsername: from?.username,
  });

  if (!reply.ok) {
    return sendTelegramMessage({
      chatId,
      text:
        reply.reason === "empty-message"
          ? "Send the reply as text."
          : "Ticket not found.",
    });
  }

  if (!reply.customerChatId) {
    return sendTelegramMessage({
      chatId,
      text: `Reply saved for ${reply.requestId}. No customer chat is linked yet.`,
    });
  }

  const delivered = await sendTelegramMessage({
    chatId: reply.customerChatId,
    text: [
      "Marky Concierge",
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
    chatId,
    text: delivered.ok
      ? `Reply sent for ${reply.requestId}.`
      : `Reply saved for ${reply.requestId}. Delivery failed: ${deliveryError}.`,
  });
}

async function handleAdminContactReply({
  chatId,
  replyToken,
  message,
  from,
}: {
  chatId: string;
  replyToken: string;
  message: string;
  from?: { id?: number; username?: string };
}) {
  if (!isTelegramAdminUserAllowed(from?.id)) {
    return sendTelegramMessage({
      chatId,
      text: "This Telegram account cannot reply to contact requests.",
    });
  }

  const reply = await recordContactAdminReplyFromTelegram({
    replyToken,
    message,
    adminChatId: chatId,
    adminUserId: from?.id,
    adminUsername: from?.username,
  });

  if (!reply.ok) {
    return sendTelegramMessage({
      chatId,
      text:
        reply.reason === "empty-message"
          ? "Send the reply as text."
          : "Contact request not found.",
    });
  }

  if (!reply.customerChatId) {
    return sendTelegramMessage({
      chatId,
      text: [
        `Reply saved for ${reply.requestId}.`,
        "No Telegram chat is linked yet.",
        reply.telegramUsername ? `Fallback: @${reply.telegramUsername}` : null,
        reply.email ? `Email: ${reply.email}` : null,
      ]
        .filter((line): line is string => typeof line === "string")
        .join("\n"),
    });
  }

  const delivered = await sendTelegramMessage({
    chatId: reply.customerChatId,
    text: ["Marky Concierge", `Contact: ${reply.requestId}`, "", reply.message].join(
      "\n",
    ),
    buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
  });
  const deliveryError =
    "description" in delivered
      ? delivered.description || delivered.status || "unknown error"
      : "skipped";

  return sendTelegramMessage({
    chatId,
    text: delivered.ok
      ? `Contact reply sent for ${reply.requestId}.`
      : `Reply saved for ${reply.requestId}. Delivery failed: ${deliveryError}.`,
  });
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const callbackQuery = update.callback_query;

  if (callbackQuery?.data?.startsWith("reply_contact_request:")) {
    const callbackQueryId = callbackQuery.id;
    const callbackChatId = callbackQuery.message?.chat?.id;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const adminUserId = callbackQuery.from?.id;
    const replyToken = callbackQuery.data.replace("reply_contact_request:", "");

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

    const contact = await getContactRequestReplyPrompt(replyToken);

    if (!contact) {
      return answerCallbackQuery(callbackQueryId, "Contact not found.");
    }

    await answerCallbackQuery(callbackQueryId, "Reply to the next message.");

    return sendTelegramMessage({
      chatId: adminChatId,
      replyToMessageId: callbackQuery.message?.message_id,
      forceReply: true,
      text: [
        "Reply here to answer this contact.",
        `Contact: ${contact.requestId}`,
        contact.name ? `Name: ${contact.name}` : null,
        contact.organization ? `Brand: ${contact.organization}` : null,
        contact.email ? `Email: ${contact.email}` : null,
        contact.telegramUsername ? `Telegram: @${contact.telegramUsername}` : null,
        `Contact reply token: ${replyToken}`,
        "",
        "Customer message:",
        contact.message || "(empty)",
      ]
        .filter((line): line is string => typeof line === "string")
        .join("\n"),
    });
  }

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

    await answerCallbackQuery(callbackQueryId, "Reply to the next message.");

    return sendTelegramMessage({
      chatId: adminChatId,
      replyToMessageId: callbackQuery.message?.message_id,
      forceReply: true,
      text: [
        "Reply here to answer.",
        `Request: ${ticket.requestId}`,
        `Pass: ${ticket.productTitle || ticket.subject || "VIP Request Pass"}`,
        `Reply token: ${replyToken}`,
        "",
        "Customer message:",
        ticket.lastMessage || "(empty)",
      ].join("\n"),
    });
  }

  const chatId = update.message?.chat?.id;
  const chatType = update.message?.chat?.type;
  const text = update.message?.text?.trim() || "";
  const from = update.message?.from;

  if (!chatId) {
    return { ok: true, ignored: true };
  }

  const manualReply = getManualReplyPayload(text);
  const manualContactReply = getManualContactReplyPayload(text);
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (manualContactReply && adminChatId && String(chatId) === adminChatId) {
    return handleAdminContactReply({
      chatId: String(chatId),
      replyToken: manualContactReply.replyToken,
      message: manualContactReply.message,
      from,
    });
  }

  if (manualReply && adminChatId && String(chatId) === adminChatId) {
    return handleAdminPrivateRequestReply({
      chatId: String(chatId),
      replyToken: manualReply.replyToken,
      message: manualReply.message,
      from,
    });
  }

  if (text.startsWith("/contactreply")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Admin command. Use it inside the private admin chat.",
    });
  }

  if (text.startsWith("/reply")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Admin command. Use it inside the private admin chat.",
    });
  }

  const adminContactReplyToken = getContactReplyTokenFromAdminPrompt(
    update.message?.reply_to_message?.text,
  );

  if (
    adminContactReplyToken &&
    process.env.TELEGRAM_ADMIN_CHAT_ID &&
    String(chatId) === process.env.TELEGRAM_ADMIN_CHAT_ID
  ) {
    return handleAdminContactReply({
      chatId: String(chatId),
      replyToken: adminContactReplyToken,
      message: text,
      from,
    });
  }

  const adminReplyToken = getReplyTokenFromAdminPrompt(
    update.message?.reply_to_message?.text,
  );

  if (
    adminReplyToken &&
    process.env.TELEGRAM_ADMIN_CHAT_ID &&
    String(chatId) === process.env.TELEGRAM_ADMIN_CHAT_ID
  ) {
    return handleAdminPrivateRequestReply({
      chatId: String(chatId),
      replyToken: adminReplyToken,
      message: text,
      from,
    });
  }

  if (text.startsWith("/chatid")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Marky Concierge chat id",
        `chat_id: ${chatId}`,
        "Use only for the private admin/support chat.",
      ].join("\n"),
    });
  }

  if (text.startsWith("/whoami") || text.startsWith("/id")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Telegram identity",
        `chat_id: ${chatId}`,
        from?.id ? `user_id: ${from.id}` : null,
        from?.username ? `username: @${from.username}` : null,
      ]
        .filter((line): line is string => typeof line === "string")
        .join("\n"),
    });
  }

  if (text.startsWith("/help")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Marky Concierge commands",
        "/start - open the site or link a pass",
        "/passes - open your access passes",
        "/support - open support chat",
        "/contact - send a contact request",
        "/orders - open delivery help",
        "/request - send a VIP request",
        "/whoami - show your Telegram id",
        "/chatid - show this chat id",
      ].join("\n"),
      buttons: [
        { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  const deliveryToken = getDeliveryTokenFromStartPayload(text);
  const startPayload = getStartPayload(text);
  const contactLinkToken = getContactLinkTokenFromStartPayload(startPayload);

  if (contactLinkToken) {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Open this contact link in a private chat with Marky Concierge.",
        buttons: [
          { text: "Open bot", url: getTelegramBotUrl(`contact_${contactLinkToken}`) },
        ],
      });
    }

    const contact = await linkTelegramToContactRequest({
      linkToken: contactLinkToken,
      chatId: String(chatId),
      userId: from?.id,
      username: from?.username,
      firstName: from?.first_name,
    });

    if (!contact) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "This contact link is invalid. Send /contact your message or use the site form again.",
        buttons: [{ text: "Open site", url: getPublicUrl("/#contact") }],
      });
    }

    await notifyContactTelegramLinked(contact).catch(() => undefined);

    if (contact.lastAdminReply) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: [
          "Telegram linked.",
          `Contact: ${contact.requestId}`,
          "",
          "Latest reply:",
          contact.lastAdminReply,
        ].join("\n"),
        buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
      });
    }

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Telegram linked.",
        `Contact: ${contact.requestId}`,
        "Replies can arrive here.",
      ].join("\n"),
      buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
    });
  }

  if (startPayload === "request") {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Send VIP requests in a private chat with Marky Concierge.",
        buttons: [{ text: "Open bot", url: getTelegramBotUrl("request") }],
      });
    }

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "VIP Request Pass",
        "Link a pass first, then send:",
        "/request your message",
        "",
        "Requests stay in Marky Concierge.",
      ].join("\n"),
      buttons: [
        { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (startPayload === "contact") {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Send contact requests in a private chat with Marky Concierge.",
        buttons: [{ text: "Open bot", url: getTelegramBotUrl("contact") }],
      });
    }

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Contact Marky",
        "Send your message with:",
        "/contact your message",
        "",
        "Replies can arrive here when needed.",
      ].join("\n"),
      buttons: [{ text: "Open site", url: getPublicUrl("/#contact") }],
    });
  }

  if (deliveryToken) {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Open this access link in a private chat with Marky Concierge.",
        buttons: [{ text: "Open bot", url: getTelegramBotUrl(`delivery_${deliveryToken}`) }],
      });
    }

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
        text: "This access link expired or is invalid. Open the access page again or contact support.",
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
        "Telegram linked.",
        `Pass: ${delivery.productTitle || delivery.productSlug}`,
        "Use the access page for downloads.",
      ].join("\n"),
      buttons: [
        { text: "Open access", url: getPublicUrl(`/orders/${delivery.token}`) },
        ...(vipInviteLink ? [{ text: "Join VIP", url: vipInviteLink }] : []),
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (text.startsWith("/support")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "For help or VIP requests, use the Marky chat.",
      buttons: [{ text: "Open chat", url: siteConfig.telegramChatUrl }],
    });
  }

  if (text.startsWith("/contact")) {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Send contact requests in a private chat with Marky Concierge.",
        buttons: [{ text: "Open bot", url: getTelegramBotUrl("contact") }],
      });
    }

    const contactMessage = getCommandText(text, "contact");

    if (!contactMessage) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: [
          "Send your contact message after the command.",
          "/contact your message",
        ].join("\n"),
        buttons: [{ text: "Open site", url: getPublicUrl("/#contact") }],
      });
    }

    const ticket = await recordContactRequest({
      name: from?.first_name || "",
      email: "",
      organization: "",
      telegram: from?.username ? `@${from.username}` : "",
      telegramChatId: String(chatId),
      telegramUserId: from?.id,
      telegramUsername: from?.username,
      message: contactMessage,
      source: "telegram-bot/contact",
    });

    await notifyTelegramContactRequest({
      ...ticket,
      name: from?.first_name || undefined,
      telegram: from?.username ? `@${from.username}` : undefined,
      message: contactMessage,
    }).catch(() => undefined);

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "Contact request sent.",
        `Ticket: ${ticket.requestId}`,
        "Reply will arrive here if needed.",
      ].join("\n"),
      buttons: [{ text: "Support chat", url: siteConfig.telegramChatUrl }],
    });
  }

  if (text.startsWith("/passes")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Open your Digital Access Passes.",
      buttons: [
        { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (text.startsWith("/orders")) {
    return sendTelegramMessage({
      chatId: String(chatId),
      text: "Access links stay on markshnaknaks.com.",
      buttons: [
        { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
        { text: "Open support", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  if (text.startsWith("/request")) {
    if (!isPrivateChat(chatType)) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: "Send VIP requests in a private chat with Marky Concierge.",
        buttons: [{ text: "Open bot", url: getTelegramBotUrl("request") }],
      });
    }

    const requestMessage = getCommandText(text, "request");

    if (!requestMessage) {
      return sendTelegramMessage({
        chatId: String(chatId),
        text: [
          "Send your request after the command.",
          "/request your message",
        ].join("\n"),
        buttons: [
          { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
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
          ? "This VIP Request Pass has no remaining requests."
          : "No active VIP Request Pass is linked here.";

      return sendTelegramMessage({
        chatId: String(chatId),
        text: reason,
        buttons: [
          { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
          { text: "Support chat", url: siteConfig.telegramChatUrl },
        ],
      });
    }

    await notifyPrivateRequest(ticket).catch(() => undefined);

    return sendTelegramMessage({
      chatId: String(chatId),
      text: [
        "VIP request sent.",
        `Ticket: ${ticket.requestId}`,
        `Remaining: ${ticket.remaining}`,
        "Reply will arrive here.",
      ].join("\n"),
      buttons: [
        { text: "Support chat", url: siteConfig.telegramChatUrl },
      ],
    });
  }

  return sendTelegramMessage({
    chatId: String(chatId),
    text: "Welcome to Marky Concierge. Open passes or send /help.",
    buttons: [
      { text: "Open passes", webAppUrl: getPublicUrl("/orders?tg=true") },
      { text: "Telegram channel", url: siteConfig.telegramChannelUrl },
      { text: "Support chat", url: siteConfig.telegramChatUrl },
    ],
  });
}
