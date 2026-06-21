import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { CreatorDeliveryAsset } from "@/lib/server/orders";

let client: S3Client | undefined;

function getR2Endpoint() {
  const accountId = process.env.R2_ACCOUNT_ID;

  if (!accountId) {
    throw new Error("R2_ACCOUNT_ID is not configured");
  }

  return (
    process.env.R2_ENDPOINT ||
    `https://${accountId}.r2.cloudflarestorage.com`
  );
}

function getR2Client() {
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY
  ) {
    throw new Error("R2 credentials are not configured");
  }

  client ??= new S3Client({
    endpoint: getR2Endpoint(),
    region: "auto",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  return client;
}

export function getPrivateBucketName() {
  const bucket = process.env.R2_BUCKET_PRIVATE;

  if (!bucket) {
    throw new Error("R2_BUCKET_PRIVATE is not configured");
  }

  return bucket;
}

export async function createAssetDownloadUrl(asset: CreatorDeliveryAsset) {
  const expiresIn = Math.min(
    600,
    Math.max(60, Number(process.env.R2_SIGNED_URL_TTL_SECONDS || "300")),
  );
  const bucket = asset.bucket || getPrivateBucketName();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: asset.objectKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
      asset.downloadName || asset.title,
    )}"`,
    ResponseContentType: asset.contentType || undefined,
  });

  return getSignedUrl(getR2Client(), command, { expiresIn });
}
