import { NextRequest, NextResponse } from "next/server";

import { getDeliveryAsset, isR2DeliveryConfigured } from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";
import { createAssetDownloadUrl } from "@/lib/server/r2";

export const runtime = "nodejs";

type DownloadRouteProps = {
  params: Promise<{ assetId: string }>;
};

export async function GET(request: NextRequest, { params }: DownloadRouteProps) {
  const rateLimited = await enforceRateLimit(request, {
    action: "delivery-download",
    limit: 40,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  if (!isR2DeliveryConfigured()) {
    return NextResponse.json(
      { error: "Private delivery storage is not configured" },
      { status: 503 },
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  const { assetId } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing delivery token" }, { status: 400 });
  }

  const deliveryAsset = await getDeliveryAsset({ token, assetId }).catch(
    () => null,
  );

  if (!deliveryAsset) {
    return NextResponse.json(
      { error: "Asset is unavailable or the delivery link expired" },
      { status: 404 },
    );
  }

  const signedUrl = await createAssetDownloadUrl(deliveryAsset.asset);

  return NextResponse.redirect(signedUrl, 303);
}
