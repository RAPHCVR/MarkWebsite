import { NextRequest, NextResponse } from "next/server";

import { getDeliveryByToken } from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";

export const runtime = "nodejs";

async function readToken(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json().catch(() => ({}))) as {
      token?: unknown;
    };

    return typeof payload.token === "string" ? payload.token : undefined;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const token = form.get("token");

    return typeof token === "string" ? token : undefined;
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceRateLimit(request, {
    action: "delivery-redeem",
    limit: 20,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  const token = await readToken(request);

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const delivery = await getDeliveryByToken(token).catch(() => null);

  if (!delivery) {
    return NextResponse.json(
      { error: "Delivery link is invalid or expired" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      product: {
        slug: delivery.productSlug,
        title: delivery.productTitle,
      },
      expiresAt: delivery.expiresAt.toISOString(),
      assets: delivery.assets.map((asset) => ({
        assetId: asset.assetId,
        title: asset.title,
        description: asset.description,
        sizeBytes: asset.sizeBytes,
        downloadUrl: `/api/delivery/assets/${encodeURIComponent(
          asset.assetId,
        )}?token=${encodeURIComponent(token)}`,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
      },
    },
  );
}
