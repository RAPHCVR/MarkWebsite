import { NextRequest, NextResponse } from "next/server";

import { getOrderById, recordSolanaPayVerification } from "@/lib/server/orders";
import {
  type SolanaPayInvoice,
  verifySolanaPayInvoice,
} from "@/lib/server/solana-pay";
import { getPublicUrl } from "@/lib/site-url";

export const runtime = "nodejs";

async function readOrderId(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json().catch(() => ({}))) as {
      orderId?: unknown;
    };

    return typeof payload.orderId === "string" ? payload.orderId : undefined;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const orderId = form.get("orderId");

    return typeof orderId === "string" ? orderId : undefined;
  }

  return undefined;
}

function getSolanaPayInvoice(metadata: Record<string, unknown>) {
  const invoice = metadata.solanaPayInvoice;

  if (!invoice || typeof invoice !== "object") {
    return null;
  }

  const candidate = invoice as Partial<SolanaPayInvoice>;

  if (
    !candidate.amount ||
    !candidate.memo ||
    !candidate.recipient ||
    !candidate.reference ||
    !candidate.rpcUrl ||
    !candidate.solanaUrl ||
    !candidate.splToken
  ) {
    return null;
  }

  return candidate as SolanaPayInvoice;
}

export async function POST(request: NextRequest) {
  const orderId = await readOrderId(request);

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  const invoice = order ? getSolanaPayInvoice(order.metadata) : null;

  if (!order || !invoice) {
    return NextResponse.json(
      { error: "Solana Pay invoice not found" },
      { status: 404 },
    );
  }

  if (order.status === "PAID") {
    return NextResponse.redirect(
      getPublicUrl(
        `/checkout/stablecoin?orderId=${encodeURIComponent(orderId)}&verified=1`,
      ),
      303,
    );
  }

  try {
    const result = await verifySolanaPayInvoice(invoice);

    await recordSolanaPayVerification({
      orderId,
      signature: result.signature,
      slot: result.slot,
      confirmationStatus: result.confirmationStatus,
    });

    return NextResponse.redirect(
      getPublicUrl(
        `/checkout/stablecoin?orderId=${encodeURIComponent(orderId)}&verified=1`,
      ),
      303,
    );
  } catch {
    return NextResponse.redirect(
      getPublicUrl(
        `/checkout/stablecoin?orderId=${encodeURIComponent(orderId)}&pending=1`,
      ),
      303,
    );
  }
}
