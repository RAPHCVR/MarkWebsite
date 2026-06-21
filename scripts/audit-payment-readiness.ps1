param(
  [string]$PublicUrl = "https://markshnaknaks.com",
  [string]$BtcpayUrl = "https://pay.markshnaknaks.com",
  [string]$StorefrontNamespace = "marky",
  [string]$BtcpayNamespace = "btcpay",
  [switch]$RunStablecoinSmoke,
  [switch]$RunBtcpaySmoke,
  [switch]$RunDeliverySmoke
)

$ErrorActionPreference = "Stop"

$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
  param(
    [ValidateSet("PASS", "WARN", "FAIL")]
    [string]$Status,
    [string]$Name,
    [string]$Evidence
  )

  $checks.Add([pscustomobject]@{
    Status = $Status
    Name = $Name
    Evidence = $Evidence
  })
}

function Get-Json {
  param([string]$Uri)

  Invoke-RestMethod -Method Get -Uri $Uri -TimeoutSec 20
}

function Get-NodeBlockchainInfo {
  param(
    [string]$Pod,
    [string]$Cli,
    [string]$UserEnv,
    [string]$PasswordEnv,
    [string]$Port
  )

  $command = '{0} -datadir=/data -rpcuser="${1}" -rpcpassword="${2}" -rpcport={3} getblockchaininfo' -f $Cli, $UserEnv, $PasswordEnv, $Port
  $raw = kubectl -n $BtcpayNamespace exec $Pod -- sh -lc $command 2>&1

  if ($LASTEXITCODE -ne 0) {
    throw "kubectl exec failed for ${Pod}: $($raw -join ' ')"
  }

  if (-not $raw) {
    throw "No blockchain info returned by ${Pod}."
  }

  $raw | ConvertFrom-Json -ErrorAction Stop
}

function Invoke-PostFormNoRedirect {
  param(
    [string]$Uri,
    [hashtable]$Form
  )

  $data = ($Form.GetEnumerator() | ForEach-Object {
      "{0}={1}" -f [uri]::EscapeDataString($_.Key), [uri]::EscapeDataString([string]$_.Value)
    }) -join "&"

  $headers = & curl.exe -sS -D - -o NUL `
    -X POST `
    -H "Content-Type: application/x-www-form-urlencoded" `
    --data $data `
    $Uri

  if ($LASTEXITCODE -ne 0) {
    throw "curl failed while posting to $Uri"
  }

  $statusLine = @($headers | Where-Object { $_ -match '^HTTP/' } | Select-Object -Last 1)[0]
  $locationLine = @($headers | Where-Object { $_ -match '^location:' } | Select-Object -First 1)[0]

  [pscustomobject]@{
    Status = if ($statusLine -match 'HTTP/\S+\s+(\d+)') { [int]$Matches[1] } else { 0 }
    Location = if ($locationLine) { ($locationLine -replace '^location:\s*', '').Trim() } else { $null }
    Headers = $headers
  }
}

function Invoke-GetNoRedirect {
  param([string]$Uri)

  $headers = & curl.exe -sS -D - -o NUL $Uri

  if ($LASTEXITCODE -ne 0) {
    throw "curl failed while requesting $Uri"
  }

  $statusLine = @($headers | Where-Object { $_ -match '^HTTP/' } | Select-Object -Last 1)[0]
  $locationLine = @($headers | Where-Object { $_ -match '^location:' } | Select-Object -First 1)[0]

  [pscustomobject]@{
    Status = if ($statusLine -match 'HTTP/\S+\s+(\d+)') { [int]$Matches[1] } else { 0 }
    Location = if ($locationLine) { ($locationLine -replace '^location:\s*', '').Trim() } else { $null }
    Headers = $headers
  }
}

function Remove-SmokeOrder {
  param([string]$OrderId)

  if (-not $OrderId) {
    return
  }

  $cleanupScript = @'
const { Pool } = require("pg");

const orderId = process.argv[process.argv.length - 1];
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

(async () => {
  try {
    const result = await pool.query("DELETE FROM creator_orders WHERE order_id = $1 RETURNING order_id", [orderId]);
    console.log(JSON.stringify({ deleted: result.rowCount }));
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

  $cleanup = $cleanupScript | kubectl -n $StorefrontNamespace exec -i deploy/marky-storefront -- node - $OrderId 2>&1

  if ($LASTEXITCODE -ne 0) {
    throw "Smoke order cleanup failed for ${OrderId}: $($cleanup -join ' ')"
  }
}

function Remove-SmokeDelivery {
  param(
    [string]$OrderId,
    [string]$AssetId
  )

  if (-not $OrderId -and -not $AssetId) {
    return
  }

  $cleanupScript = @'
const { Pool } = require("pg");

const orderId = process.argv[process.argv.length - 2];
const assetId = process.argv[process.argv.length - 1];
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

(async () => {
  try {
    if (assetId && assetId !== "-") {
      await pool.query("DELETE FROM creator_assets WHERE asset_id = $1", [assetId]);
    }
    if (orderId && orderId !== "-") {
      await pool.query("DELETE FROM creator_orders WHERE order_id = $1", [orderId]);
    }
    console.log(JSON.stringify({ ok: true }));
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

  $safeOrderId = if ($OrderId) { $OrderId } else { "-" }
  $safeAssetId = if ($AssetId) { $AssetId } else { "-" }
  $cleanup = $cleanupScript | kubectl -n $StorefrontNamespace exec -i deploy/marky-storefront -- node - $safeOrderId $safeAssetId 2>&1

  if ($LASTEXITCODE -ne 0) {
    throw "Smoke delivery cleanup failed: $($cleanup -join ' ')"
  }
}

try {
  $status = Get-Json "$PublicUrl/api/payments/status?audit=1"
  Add-Check "PASS" "Storefront payment status" "Endpoint returned ok=$($status.ok), salesEnabled=$($status.salesEnabled)."

  if ($status.stripe.readyProductCount -gt 0) {
    Add-Check "PASS" "Stripe Payment Links" "$($status.stripe.readyProductCount) products have Stripe links."
  } else {
    Add-Check "FAIL" "Stripe Payment Links" "No ready Stripe product links."
  }

  if ($status.stripe.webhookConfigured) {
    Add-Check "PASS" "Stripe webhook secret" "STRIPE_WEBHOOK_SECRET is configured in runtime."
  } else {
    Add-Check "FAIL" "Stripe webhook secret" "Missing STRIPE_WEBHOOK_SECRET; Payment Links can collect, but Stripe sessions are not reconciled into PostgreSQL automatically."
  }

  if ($status.stablecoin.checkoutEnabled -and $status.stablecoin.defaultRail -eq "usdc-solana") {
    Add-Check "PASS" "USDC Solana Pay" "Enabled with $($status.stablecoin.solanaPay.rpcFallbackCount) RPC fallback endpoint(s)."
  } else {
    Add-Check "FAIL" "USDC Solana Pay" "Stablecoin checkout is not enabled for usdc-solana."
  }

  if ($status.btcpay.configured) {
    Add-Check "PASS" "BTCPay config" "BTCPay server/store/API env vars are present."
  } else {
    Add-Check "FAIL" "BTCPay config" "BTCPay env vars are missing."
  }

  if ($status.btcpay.checkoutEnabled) {
    Add-Check "PASS" "BTCPay public checkout flag" "BTCPay checkout is enabled."
  } else {
    Add-Check "WARN" "BTCPay public checkout flag" "Disabled: $($status.btcpay.supportedMethods -join '; ')."
  }

  if ($status.delivery.configured) {
    Add-Check "PASS" "R2 private delivery config" "Private bucket configured; signed URL TTL=$($status.delivery.signedUrlTtlSeconds)s, token TTL=$($status.delivery.tokenTtlDays)d."
  } else {
    Add-Check "FAIL" "R2 private delivery config" "R2 delivery env vars are missing from runtime."
  }

  if ($status.telegram.botConfigured) {
    Add-Check "PASS" "Telegram bot config" "Bot token is configured; webhookConfigured=$($status.telegram.webhookConfigured), adminNotificationsConfigured=$($status.telegram.adminNotificationsConfigured)."
  } else {
    Add-Check "WARN" "Telegram bot config" "Bot token is not configured; Telegram support links still work, but bot commands/notifications are disabled."
  }
} catch {
  Add-Check "FAIL" "Storefront payment status" $_.Exception.Message
}

try {
  $health = Get-Json "$BtcpayUrl/api/v1/health?audit=1"
  if ($health.synchronized) {
    Add-Check "PASS" "BTCPay health" "BTCPay reports synchronized=true."
  } else {
    Add-Check "WARN" "BTCPay health" "BTCPay reports synchronized=false."
  }
} catch {
  Add-Check "FAIL" "BTCPay health" $_.Exception.Message
}

try {
  $ltc = Get-NodeBlockchainInfo `
    -Pod "btcpay-litecoind-0" `
    -Cli "litecoin-cli" `
    -UserEnv "LITECOIN_RPC_USER" `
    -PasswordEnv "LITECOIN_RPC_PASSWORD" `
    -Port "9332"

  if (-not $ltc.initialblockdownload) {
    Add-Check "PASS" "Litecoin node sync" "LTC blocks=$($ltc.blocks), headers=$($ltc.headers), IBD=false."
  } else {
    Add-Check "WARN" "Litecoin node sync" "LTC blocks=$($ltc.blocks), headers=$($ltc.headers), progress=$($ltc.verificationprogress)."
  }
} catch {
  Add-Check "FAIL" "Litecoin node sync" $_.Exception.Message
}

try {
  $btc = Get-NodeBlockchainInfo `
    -Pod "btcpay-bitcoind-0" `
    -Cli "bitcoin-cli" `
    -UserEnv "BITCOIN_RPC_USER" `
    -PasswordEnv "BITCOIN_RPC_PASSWORD" `
    -Port "43782"

  if (-not $btc.initialblockdownload) {
    Add-Check "PASS" "Bitcoin node sync" "BTC blocks=$($btc.blocks), headers=$($btc.headers), IBD=false."
  } else {
    Add-Check "WARN" "Bitcoin node sync" "BTC blocks=$($btc.blocks), headers=$($btc.headers), progress=$($btc.verificationprogress)."
  }
} catch {
  Add-Check "FAIL" "Bitcoin node sync" $_.Exception.Message
}

if ($RunBtcpaySmoke) {
  $smokeScript = @'
const base = process.env.BTCPAY_SERVER_URL.replace(/\/$/, '');
const store = process.env.BTCPAY_STORE_ID;
const key = process.env.BTCPAY_API_KEY;
const res = await fetch(`${base}/api/v1/stores/${store}/invoices`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `token ${key}` },
  body: JSON.stringify({
    amount: '1.00',
    currency: 'EUR',
    metadata: { orderId: `btcpay-smoke-${crypto.randomUUID()}`, source: 'readiness-smoke' },
    checkout: { paymentMethods: ['LTC'] }
  })
});
const text = await res.text();
let body;
try { body = JSON.parse(text); } catch { body = { message: text }; }
let paymentMethod = null;
if (res.ok && body.id) {
  const methodsRes = await fetch(`${base}/api/v1/stores/${store}/invoices/${body.id}/payment-methods`, {
    headers: { Authorization: `token ${key}` }
  });
  const methodsText = await methodsRes.text();
  let methods;
  try { methods = JSON.parse(methodsText); } catch { methods = []; }
  const ltc = Array.isArray(methods) ? methods.find((method) => method.paymentMethodId === 'LTC-CHAIN') : null;
  paymentMethod = {
    status: methodsRes.status,
    amount: ltc?.amount || null,
    currency: ltc?.currency || null,
    destination: Boolean(ltc?.destination),
    paymentLink: Boolean(ltc?.paymentLink),
    rate: ltc?.rate || null
  };
}
console.log(JSON.stringify({
  status: res.status,
  invoiceId: body.id,
  checkoutLink: Boolean(body.checkoutLink),
  message: body.message || body.error || null,
  paymentMethod
}));
'@

  try {
    $smoke = $smokeScript | kubectl -n $StorefrontNamespace exec -i deploy/marky-storefront -- node -
    $result = $smoke | ConvertFrom-Json

    if (
      $result.status -ge 200 -and
      $result.status -lt 300 -and
      $result.checkoutLink -and
      $result.paymentMethod.status -eq 200 -and
      $result.paymentMethod.currency -eq "LTC" -and
      $result.paymentMethod.destination -and
      $result.paymentMethod.paymentLink -and
      $result.paymentMethod.amount
    ) {
      Add-Check "PASS" "BTCPay LTC invoice smoke" "Invoice $($result.invoiceId) returned an LTC payment link for $($result.paymentMethod.amount) LTC at rate $($result.paymentMethod.rate)."
    } else {
      Add-Check "FAIL" "BTCPay LTC invoice smoke" "status=$($result.status), message=$($result.message), paymentMethod=$($result.paymentMethod | ConvertTo-Json -Compress)"
    }
  } catch {
    Add-Check "FAIL" "BTCPay LTC invoice smoke" $_.Exception.Message
  }
} else {
  Add-Check "WARN" "BTCPay LTC invoice smoke" "Skipped. Re-run with -RunBtcpaySmoke after wallet setup."
}

if ($RunStablecoinSmoke) {
  $smokeOrderId = $null

  try {
    $checkout = Invoke-PostFormNoRedirect `
      -Uri "$PublicUrl/api/checkout/stablecoin" `
      -Form @{
        product = "cosplay-starter-pack"
        rail = "usdc-solana"
        termsAccepted = "true"
      }

    if ($checkout.Status -ne 303 -or -not $checkout.Location) {
      throw "Stablecoin invoice creation returned status=$($checkout.Status), location=$($checkout.Location)"
    }

    $orderIdMatch = [regex]::Match($checkout.Location, 'orderId=([^&]+)')

    if (-not $orderIdMatch.Success) {
      throw "Checkout redirect did not include orderId: $($checkout.Location)"
    }

    $smokeOrderId = [uri]::UnescapeDataString($orderIdMatch.Groups[1].Value)
    $checkoutPage = Invoke-WebRequest -UseBasicParsing -Uri $checkout.Location -TimeoutSec 20
    $checkoutHtml = $checkoutPage.Content

    if (
      $checkoutPage.StatusCode -ne 200 -or
      $checkoutHtml -notmatch "Pay with USDC on Solana" -or
      $checkoutHtml -notmatch "solana:" -or
      $checkoutHtml -notmatch "Expires" -or
      $checkoutHtml -notmatch [regex]::Escape($smokeOrderId)
    ) {
      throw "Stablecoin checkout page did not render the expected QR/order content."
    }

    $verify = Invoke-PostFormNoRedirect `
      -Uri "$PublicUrl/api/checkout/stablecoin/verify" `
      -Form @{ orderId = $smokeOrderId }

    if ($verify.Status -ne 303 -or $verify.Location -notmatch "pending=1") {
      throw "Unpaid verification should redirect to pending=1, got status=$($verify.Status), location=$($verify.Location)"
    }

    Add-Check "PASS" "USDC Solana Pay smoke" "Created invoice, rendered QR/link and unpaid verification returned pending for order $smokeOrderId."
  } catch {
    Add-Check "FAIL" "USDC Solana Pay smoke" $_.Exception.Message
  } finally {
    if ($smokeOrderId) {
      try {
        Remove-SmokeOrder -OrderId $smokeOrderId
      } catch {
        Add-Check "WARN" "USDC Solana Pay smoke cleanup" $_.Exception.Message
      }
    }
  }
} else {
  Add-Check "WARN" "USDC Solana Pay smoke" "Skipped. Re-run with -RunStablecoinSmoke to create and clean up a live unpaid invoice."
}

if ($RunDeliverySmoke) {
  $smokeOrderId = $null
  $smokeAssetId = $null

  try {
    $createScript = @'
const { createHash, randomBytes, randomUUID } = require("node:crypto");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

(async () => {
  const token = randomBytes(32).toString("base64url");
  const orderId = `r2-smoke-${randomUUID()}`;
  const productSlug = "r2-delivery-smoke";
  const productTitle = "R2 Delivery Smoke";
  const entitlementId = `entitlement-${orderId}-${productSlug}`;
  const tokenId = `delivery-${randomUUID()}`;
  const assetId = `asset-${randomUUID()}`;
  const bucket = process.env.R2_BUCKET_PRIVATE;

  if (!bucket) {
    throw new Error("R2_BUCKET_PRIVATE is missing");
  }

  await pool.query("BEGIN");
  await pool.query(
    `INSERT INTO creator_orders (
      order_id, provider, provider_invoice_id, product_slug, product_title,
      amount_cents, currency, status, checkout_link, last_event_type, metadata
    )
    VALUES ($1, 'smoke', $2, $3, $4, 100, 'EUR', 'PAID', $5, 'delivery.smoke', $6::jsonb)`,
    [
      orderId,
      `r2-smoke-${randomUUID()}`,
      productSlug,
      productTitle,
      "/",
      JSON.stringify({ source: "audit-delivery-smoke" }),
    ],
  );
  await pool.query(
    `INSERT INTO creator_entitlements (
      entitlement_id, order_id, product_slug, product_title, status, metadata
    )
    VALUES ($1, $2, $3, $4, 'active', $5::jsonb)`,
    [
      entitlementId,
      orderId,
      productSlug,
      productTitle,
      JSON.stringify({ source: "audit-delivery-smoke" }),
    ],
  );
  await pool.query(
    `INSERT INTO creator_assets (
      asset_id, product_slug, title, description, bucket, object_key,
      download_name, content_type, size_bytes, sort_order, status
    )
    VALUES ($1, $2, 'Smoke download', 'Private R2 delivery probe', $3, $4, $5, 'text/plain; charset=utf-8', 70, 0, 'active')`,
    [
      assetId,
      productSlug,
      bucket,
      "system/smoke-delivery.txt",
      "marky-r2-smoke.txt",
    ],
  );
  await pool.query(
    `INSERT INTO creator_delivery_tokens (
      token_id, token_hash, entitlement_id, order_id, expires_at,
      max_redemptions, metadata
    )
    VALUES ($1, $2, $3, $4, now() + interval '1 day', 3, $5::jsonb)`,
    [
      tokenId,
      hashToken(token),
      entitlementId,
      orderId,
      JSON.stringify({ source: "audit-delivery-smoke" }),
    ],
  );
  await pool.query("COMMIT");

  console.log(JSON.stringify({ orderId, assetId, token }));
})().catch(async (error) => {
  try {
    await pool.query("ROLLBACK");
  } catch {}
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});
'@

    $created = $createScript | kubectl -n $StorefrontNamespace exec -i deploy/marky-storefront -- node - 2>&1

    if ($LASTEXITCODE -ne 0) {
      throw "Smoke delivery setup failed: $($created -join ' ')"
    }

    $payload = $created | ConvertFrom-Json
    $smokeOrderId = $payload.orderId
    $smokeAssetId = $payload.assetId
    $token = $payload.token

    $page = Invoke-WebRequest -UseBasicParsing -Uri "$PublicUrl/orders/$token" -TimeoutSec 20

    if ($page.StatusCode -ne 200 -or $page.Content -notmatch "R2 Delivery Smoke") {
      throw "Delivery page did not render the smoke entitlement."
    }

    $download = Invoke-GetNoRedirect "$PublicUrl/api/delivery/assets/$smokeAssetId`?token=$token"

    if (
      $download.Status -ne 303 -or
      -not $download.Location -or
      $download.Location -notmatch "r2\.cloudflarestorage\.com" -or
      $download.Location -notmatch "X-Amz-Signature"
    ) {
      throw "Delivery asset did not redirect to a signed R2 URL. status=$($download.Status), location=$($download.Location)"
    }

    Add-Check "PASS" "R2 private delivery smoke" "Private page rendered and asset redirected to a short-lived signed R2 URL."
  } catch {
    Add-Check "FAIL" "R2 private delivery smoke" $_.Exception.Message
  } finally {
    if ($smokeOrderId -or $smokeAssetId) {
      try {
        Remove-SmokeDelivery -OrderId $smokeOrderId -AssetId $smokeAssetId
      } catch {
        Add-Check "WARN" "R2 private delivery smoke cleanup" $_.Exception.Message
      }
    }
  }
} else {
  Add-Check "WARN" "R2 private delivery smoke" "Skipped. Re-run with -RunDeliverySmoke after R2 secrets are configured."
}

$checks | Format-Table -AutoSize -Wrap

$failCount = @($checks | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = @($checks | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host ""
Write-Host "Summary: $failCount failure(s), $warnCount warning(s)."

if ($failCount -gt 0) {
  exit 1
}
