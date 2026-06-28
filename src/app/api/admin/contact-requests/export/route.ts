import { NextRequest, NextResponse } from "next/server";

import { enforceAdminAccess } from "@/lib/server/admin-auth";
import { listContactRequestsForAdminExport } from "@/lib/server/orders";

export const runtime = "nodejs";

const csvHeaders = [
  "request_id",
  "name",
  "email",
  "organization",
  "message",
  "source",
  "user_agent",
  "created_at",
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
  const rows = await listContactRequestsForAdminExport({ from, to, limit });
  const csvRows = rows.map((row) =>
    [
      row.requestId,
      row.name,
      row.email,
      row.organization,
      row.message,
      row.source,
      row.userAgent,
      row.createdAt,
    ]
      .map(csvValue)
      .join(","),
  );

  return new NextResponse([csvHeaders.join(","), ...csvRows].join("\n"), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition":
        'attachment; filename="marky-contact-requests.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
