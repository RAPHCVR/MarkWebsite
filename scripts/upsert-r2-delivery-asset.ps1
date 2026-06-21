param(
  [Parameter(Mandatory = $true)]
  [string]$ProductSlug,

  [Parameter(Mandatory = $true)]
  [string]$FilePath,

  [Parameter(Mandatory = $true)]
  [string]$Title,

  [string]$Description = "",
  [string]$ObjectKey = "",
  [string]$DownloadName = "",
  [string]$Bucket = "",
  [string]$Namespace = "marky",
  [string]$SecretName = "marky-payments"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $FilePath -PathType Leaf)) {
  throw "File not found: $FilePath"
}

function Get-KubeSecretValue {
  param([string]$Name)

  $jsonPath = "{.data.$Name}"
  $encoded = kubectl -n $Namespace get secret $SecretName -o jsonpath=$jsonPath 2>$null

  if ($LASTEXITCODE -ne 0 -or -not $encoded) {
    return ""
  }

  [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
}

function Get-ContentType {
  param([string]$Path)

  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".png" { "image/png"; break }
    ".webp" { "image/webp"; break }
    ".gif" { "image/gif"; break }
    ".zip" { "application/zip"; break }
    ".pdf" { "application/pdf"; break }
    ".txt" { "text/plain; charset=utf-8"; break }
    default { "application/octet-stream" }
  }
}

$resolvedPath = (Resolve-Path -LiteralPath $FilePath).Path
$fileName = [IO.Path]::GetFileName($resolvedPath)
$safeFileName = $fileName -replace '[^a-zA-Z0-9._-]', '-'
$safeProductSlug = $ProductSlug -replace '[^a-zA-Z0-9._-]', '-'
$targetBucket = if ($Bucket) { $Bucket } else { Get-KubeSecretValue "R2_BUCKET_PRIVATE" }
$targetObjectKey = if ($ObjectKey) { $ObjectKey } else { "access-assets/$safeProductSlug/$safeFileName" }
$targetDownloadName = if ($DownloadName) { $DownloadName } else { $fileName }
$contentType = Get-ContentType $resolvedPath
$sizeBytes = (Get-Item -LiteralPath $resolvedPath).Length

if (-not $targetBucket) {
  throw "R2_BUCKET_PRIVATE is missing from secret $SecretName."
}

$env:R2_ACCOUNT_ID = Get-KubeSecretValue "R2_ACCOUNT_ID"
$env:R2_ENDPOINT = Get-KubeSecretValue "R2_ENDPOINT"
$env:R2_ACCESS_KEY_ID = Get-KubeSecretValue "R2_ACCESS_KEY_ID"
$env:R2_SECRET_ACCESS_KEY = Get-KubeSecretValue "R2_SECRET_ACCESS_KEY"
$env:R2_BUCKET_PRIVATE = $targetBucket

if (-not $env:R2_ACCOUNT_ID -or -not $env:R2_ACCESS_KEY_ID -or -not $env:R2_SECRET_ACCESS_KEY) {
  throw "R2 credentials are missing from secret $SecretName."
}

$uploadScript = @'
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { readFile } = require("node:fs/promises");

const [filePath, key, contentType] = process.argv.slice(2);
const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const client = new S3Client({
  endpoint,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

(async () => {
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_PRIVATE,
    Key: key,
    Body: await readFile(filePath),
    ContentType: contentType,
  }));
  console.log(JSON.stringify({ ok: true, bucket: process.env.R2_BUCKET_PRIVATE, key }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

$upload = $uploadScript | node - $resolvedPath $targetObjectKey $contentType 2>&1

if ($LASTEXITCODE -ne 0) {
  throw "R2 upload failed: $($upload -join ' ')"
}

$assetId = "asset-$([guid]::NewGuid().ToString())"
$dbScript = @'
const { Pool } = require("pg");

const [
  assetId,
  productSlug,
  title,
  description,
  bucket,
  objectKey,
  downloadName,
  contentType,
  sizeBytes,
] = process.argv.slice(2);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

(async () => {
  try {
    const result = await pool.query(
      `INSERT INTO creator_assets (
        asset_id, product_slug, title, description, bucket, object_key,
        download_name, content_type, size_bytes, sort_order, status
      )
      VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6, $7, $8, $9::bigint, 0, 'active')
      ON CONFLICT (bucket, object_key) DO UPDATE SET
        product_slug = EXCLUDED.product_slug,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        download_name = EXCLUDED.download_name,
        content_type = EXCLUDED.content_type,
        size_bytes = EXCLUDED.size_bytes,
        status = 'active',
        updated_at = now()
      RETURNING asset_id, product_slug, title, bucket, object_key`,
      [
        assetId,
        productSlug,
        title,
        description,
        bucket,
        objectKey,
        downloadName,
        contentType,
        Number(sizeBytes),
      ],
    );
    console.log(JSON.stringify(result.rows[0]));
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

$dbResult = $dbScript | kubectl -n $Namespace exec -i deploy/marky-storefront -- node - `
  $assetId `
  $ProductSlug `
  $Title `
  $Description `
  $targetBucket `
  $targetObjectKey `
  $targetDownloadName `
  $contentType `
  $sizeBytes 2>&1

if ($LASTEXITCODE -ne 0) {
  throw "Asset database upsert failed: $($dbResult -join ' ')"
}

Write-Host "Uploaded and registered delivery asset:"
Write-Host $dbResult
