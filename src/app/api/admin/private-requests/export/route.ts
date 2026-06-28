import { NextRequest, NextResponse } from "next/server";

import { listPrivateRequestsForAdminExport } from "@/lib/server/orders";
import { enforceAdminAccess } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

const csvHeaders = [
  "request_id",
  "order_id",
  "product_slug",
  "product_title",
  "telegram_chat_id",
  "telegram_user_id",
  "status",
  "quota_total",
  "quota_used",
  "subject",
  "last_message",
  "last_admin_reply",
  "admin_reply_count",
  "admin_replied_at",
  "created_at",
  "updated_at",
  "closed_at",
] as const;

function parseDate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date : undefined;
}

function csvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseLimit(value: string | null, fallback: number) {
  const limit = Number(value);

  return Number.isFinite(limit) ? limit : fallback;
}

export async function GET(request: NextRequest) {
  const blocked = await enforceAdminAccess(request);

  if (blocked) {
    return blocked;
  }

  const from = parseDate(request.nextUrl.searchParams.get("from"));
  const to = parseDate(request.nextUrl.searchParams.get("to"));
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 1_000);
  const rows = await listPrivateRequestsForAdminExport({ from, to, limit });
  const csvRows = rows.map((row) =>
    [
      row.requestId,
      row.orderId,
      row.productSlug,
      row.productTitle,
      row.telegramChatId,
      row.telegramUserId,
      row.status,
      row.quotaTotal,
      row.quotaUsed,
      row.subject,
      row.lastMessage,
      row.lastAdminReply,
      row.adminReplyCount,
      row.adminRepliedAt,
      row.createdAt,
      row.updatedAt,
      row.closedAt,
    ]
      .map(csvValue)
      .join(","),
  );

  return new NextResponse([csvHeaders.join(","), ...csvRows].join("\n"), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition":
        'attachment; filename="marky-private-requests.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
