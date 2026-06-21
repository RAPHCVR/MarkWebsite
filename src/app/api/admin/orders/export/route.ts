import { NextRequest, NextResponse } from "next/server";

import { listOrdersForAccountingExport } from "@/lib/server/orders";
import {
  getAdminAuthErrorResponse,
  getAdminAuthStatus,
} from "@/lib/server/admin-auth";

export const runtime = "nodejs";

const csvHeaders = [
  "order_id",
  "provider",
  "provider_invoice_id",
  "product_slug",
  "product_title",
  "amount_cents",
  "currency",
  "fiat_value_eur_at_transaction",
  "fiat_currency",
  "status",
  "last_event_type",
  "legal_terms_version",
  "withdrawal_waiver_accepted_at",
  "paid_at",
  "created_at",
  "updated_at",
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

export async function GET(request: NextRequest) {
  const auth = getAdminAuthStatus(request);

  if (auth !== "ok") {
    return getAdminAuthErrorResponse(auth);
  }

  const from = parseDate(request.nextUrl.searchParams.get("from"));
  const to = parseDate(request.nextUrl.searchParams.get("to"));
  const limit = Number(request.nextUrl.searchParams.get("limit") || "1000");
  const rows = await listOrdersForAccountingExport({ from, to, limit });
  const csvRows = rows.map((row) =>
    [
      row.orderId,
      row.provider,
      row.providerInvoiceId,
      row.productSlug,
      row.productTitle,
      row.amountCents,
      row.currency,
      row.fiatValueEurAtTransaction,
      row.fiatCurrency,
      row.status,
      row.lastEventType,
      row.legalTermsVersion,
      row.withdrawalWaiverAcceptedAt,
      row.paidAt,
      row.createdAt,
      row.updatedAt,
    ]
      .map(csvValue)
      .join(","),
  );

  return new NextResponse([csvHeaders.join(","), ...csvRows].join("\n"), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition":
        'attachment; filename="marky-orders-accounting.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
