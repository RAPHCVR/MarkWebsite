import { NextRequest, NextResponse } from "next/server";

import { enforceAdminAccess } from "@/lib/server/admin-auth";
import { listOrdersForAccountingExport } from "@/lib/server/orders";

export const runtime = "nodejs";

function parseDate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date : undefined;
}

export async function GET(request: NextRequest) {
  const blocked = await enforceAdminAccess(request);

  if (blocked) {
    return blocked;
  }

  const from = parseDate(request.nextUrl.searchParams.get("from"));
  const to = parseDate(request.nextUrl.searchParams.get("to"));
  const limit = Number(request.nextUrl.searchParams.get("limit") || "100");
  const rows = await listOrdersForAccountingExport({ from, to, limit });

  return NextResponse.json({
    ok: true,
    orders: rows.map((row) => ({
      ...row,
      withdrawalWaiverAcceptedAt: row.withdrawalWaiverAcceptedAt?.toISOString() ?? null,
      paidAt: row.paidAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
  });
}
