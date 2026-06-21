param(
  [string]$WebhookUrl = "https://markshnaknaks.com/api/webhooks/stripe",
  [string]$Namespace = "marky",
  [string]$SecretName = "marky-payments",
  [string]$DeploymentName = "marky-storefront",
  [switch]$ForceNew,
  [switch]$SkipRollout
)

$ErrorActionPreference = "Stop"

if (-not $env:STRIPE_SECRET_KEY) {
  throw "Set STRIPE_SECRET_KEY in this shell before running this script."
}

function ConvertTo-StripeFormBody {
  param([System.Collections.Generic.List[object]]$Pairs)

  ($Pairs | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString($_.Name), [uri]::EscapeDataString($_.Value)
  }) -join "&"
}

function Invoke-StripeApi {
  param(
    [ValidateSet("GET", "POST")]
    [string]$Method,
    [string]$Path,
    [string]$Body = ""
  )

  $headers = @{
    Authorization = "Bearer $env:STRIPE_SECRET_KEY"
  }

  $uri = "https://api.stripe.com$Path"

  if ($Method -eq "GET") {
    return Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
  }

  return Invoke-RestMethod `
    -Method Post `
    -Uri $uri `
    -Headers $headers `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $Body
}

$events = @(
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired"
)

$existing = Invoke-StripeApi -Method GET -Path "/v1/webhook_endpoints?limit=100"
$matchingEndpoint = $existing.data | Where-Object { $_.url -eq $WebhookUrl -and $_.status -eq "enabled" } | Select-Object -First 1

if ($matchingEndpoint -and -not $ForceNew) {
  Write-Host "Existing enabled Stripe webhook endpoint found: $($matchingEndpoint.id)"
  Write-Host "Stripe returns webhook secrets only when creating an endpoint."
  Write-Host "Reveal the endpoint secret in the Stripe Dashboard, then patch Kubernetes with:"
  Write-Host "kubectl -n $Namespace patch secret $SecretName --type merge -p '{""data"":{""STRIPE_WEBHOOK_SECRET"":""<base64-whsec>""}}'"
  exit 2
}

$staleMatchingEndpoints = @()
if ($ForceNew) {
  $staleMatchingEndpoints = @($existing.data | Where-Object {
    $_.url -eq $WebhookUrl -and $_.status -eq "enabled"
  })
}

$pairs = [System.Collections.Generic.List[object]]::new()
$pairs.Add([pscustomobject]@{ Name = "url"; Value = $WebhookUrl })
$pairs.Add([pscustomobject]@{ Name = "description"; Value = "Marky Payment Link reconciliation" })

foreach ($event in $events) {
  $pairs.Add([pscustomobject]@{ Name = "enabled_events[]"; Value = $event })
}

$endpoint = Invoke-StripeApi `
  -Method POST `
  -Path "/v1/webhook_endpoints" `
  -Body (ConvertTo-StripeFormBody -Pairs $pairs)

if (-not $endpoint.secret -or -not $endpoint.secret.StartsWith("whsec_")) {
  throw "Stripe created endpoint $($endpoint.id), but did not return a webhook secret."
}

$secretBytes = [System.Text.Encoding]::UTF8.GetBytes($endpoint.secret)
$secretBase64 = [Convert]::ToBase64String($secretBytes)
$patch = @{
  data = @{
    STRIPE_WEBHOOK_SECRET = $secretBase64
  }
} | ConvertTo-Json -Compress

$patchFile = New-TemporaryFile
try {
  Set-Content -LiteralPath $patchFile -Value $patch -NoNewline -Encoding UTF8
  kubectl -n $Namespace patch secret $SecretName --type merge --patch-file $patchFile | Out-Host

  if ($LASTEXITCODE -ne 0) {
    Invoke-StripeApi `
      -Method POST `
      -Path "/v1/webhook_endpoints/$($endpoint.id)" `
      -Body "disabled=true" | Out-Null
    throw "Failed to patch Kubernetes secret. Disabled newly-created Stripe webhook endpoint $($endpoint.id)."
  }
} finally {
  Remove-Item -LiteralPath $patchFile -Force -ErrorAction SilentlyContinue
}

foreach ($staleEndpoint in $staleMatchingEndpoints) {
  Invoke-StripeApi `
    -Method POST `
    -Path "/v1/webhook_endpoints/$($staleEndpoint.id)" `
    -Body "disabled=true" | Out-Null
  Write-Host "Disabled stale Stripe webhook endpoint: $($staleEndpoint.id)"
}

if (-not $SkipRollout) {
  kubectl -n $Namespace rollout restart "deployment/$DeploymentName" | Out-Host
  kubectl -n $Namespace rollout status "deployment/$DeploymentName" --timeout=180s | Out-Host
}

Write-Host "Configured Stripe webhook endpoint: $($endpoint.id)"
Write-Host "Webhook URL: $WebhookUrl"
Write-Host "Kubernetes secret patched: $Namespace/$SecretName"
