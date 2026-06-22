param(
  [string]$EnvFile = ".env.local",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

$catalog = @(
  @{
    Slug = "cosplay-starter-pack"
    ProductEnv = "STRIPE_PRODUCT_ID_COSPLAY_STARTER_PACK"
    PriceEnv = "STRIPE_PRICE_ID_COSPLAY_STARTER_PACK"
    Name = "Digital Access Pass"
    Description = "Personal creator platform access with private site delivery."
  },
  @{
    Slug = "soft-catboy-drop"
    ProductEnv = "STRIPE_PRODUCT_ID_SOFT_CATBOY_DROP"
    PriceEnv = "STRIPE_PRICE_ID_SOFT_CATBOY_DROP"
    Name = "Premium Platform Membership"
    Description = "Membership-style access, updates and Telegram follow-up."
  },
  @{
    Slug = "behind-the-scenes"
    ProductEnv = "STRIPE_PRODUCT_ID_BEHIND_THE_SCENES"
    PriceEnv = "STRIPE_PRICE_ID_BEHIND_THE_SCENES"
    Name = "Content Delivery Token"
    Description = "Time-limited delivery token for the next private release."
  },
  @{
    Slug = "vip-bundle"
    ProductEnv = "STRIPE_PRODUCT_ID_VIP_BUNDLE"
    PriceEnv = "STRIPE_PRICE_ID_VIP_BUNDLE"
    Name = "VIP Infrastructure Access"
    Description = "Ticketed private requests handled through Marky Concierge."
  }
)

function Read-EnvFile {
  param([string]$Path)

  $values = @{}

  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $index = $line.IndexOf("=")
    $name = $line.Substring(0, $index).Trim()
    $value = $line.Substring($index + 1).Trim().Trim('"').Trim("'")
    $values[$name] = $value
  }

  return $values
}

function ConvertTo-StripeFormBody {
  param([System.Collections.Generic.List[object]]$Pairs)

  ($Pairs | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString($_.Name), [uri]::EscapeDataString($_.Value)
  }) -join "&"
}

function Invoke-StripePost {
  param(
    [string]$Path,
    [System.Collections.Generic.List[object]]$Pairs
  )

  if (-not $env:STRIPE_SECRET_KEY) {
    throw "Set STRIPE_SECRET_KEY in this shell before running with -Apply."
  }

  Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.stripe.com$Path" `
    -Headers @{ Authorization = "Bearer $env:STRIPE_SECRET_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body (ConvertTo-StripeFormBody -Pairs $Pairs)
}

$envValues = Read-EnvFile -Path $EnvFile
$updates = @()

foreach ($item in $catalog) {
  $productId = $envValues[$item.ProductEnv]
  $priceId = $envValues[$item.PriceEnv]

  if (-not $productId) {
    $productId = [Environment]::GetEnvironmentVariable($item.ProductEnv)
  }

  if (-not $priceId) {
    $priceId = [Environment]::GetEnvironmentVariable($item.PriceEnv)
  }

  $updates += [pscustomobject]@{
    Slug = $item.Slug
    ProductEnv = $item.ProductEnv
    ProductIdPresent = [bool]$productId
    PriceEnv = $item.PriceEnv
    PriceIdPresent = [bool]$priceId
    Name = $item.Name
    Description = $item.Description
  }

  if (-not $Apply) {
    continue
  }

  if (-not $productId) {
    throw "Missing $($item.ProductEnv)."
  }

  $productPairs = [System.Collections.Generic.List[object]]::new()
  $productPairs.Add([pscustomobject]@{ Name = "name"; Value = $item.Name })
  $productPairs.Add([pscustomobject]@{ Name = "description"; Value = $item.Description })
  $productPairs.Add([pscustomobject]@{ Name = "metadata[marky_slug]"; Value = $item.Slug })
  $productPairs.Add([pscustomobject]@{ Name = "metadata[commercial_positioning]"; Value = "digital_access_platform" })
  Invoke-StripePost -Path "/v1/products/$productId" -Pairs $productPairs | Out-Null

  if ($priceId) {
    $pricePairs = [System.Collections.Generic.List[object]]::new()
    $pricePairs.Add([pscustomobject]@{ Name = "nickname"; Value = $item.Name })
    $pricePairs.Add([pscustomobject]@{ Name = "metadata[marky_slug]"; Value = $item.Slug })
    $pricePairs.Add([pscustomobject]@{ Name = "metadata[commercial_positioning]"; Value = "digital_access_platform" })
    Invoke-StripePost -Path "/v1/prices/$priceId" -Pairs $pricePairs | Out-Null
  }
}

if ($Apply) {
  Write-Host "Stripe product copy synchronized."
} else {
  Write-Host "Dry run only. Re-run with -Apply after setting STRIPE_SECRET_KEY."
}

$updates | Format-Table -AutoSize
