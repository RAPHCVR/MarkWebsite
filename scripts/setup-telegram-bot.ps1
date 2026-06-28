param(
  [string]$PublicUrl = "https://markshnaknaks.com",
  [string]$Namespace = "marky",
  [string]$SecretName = "marky-payments",
  [switch]$SkipKubeSecretLookup,
  [switch]$DropPendingUpdates
)

$ErrorActionPreference = "Stop"

function Get-KubeSecretValue {
  param([string]$Name)

  if ($SkipKubeSecretLookup) {
    return ""
  }

  $jsonPath = "{.data.$Name}"
  $encoded = kubectl -n $Namespace get secret $SecretName -o jsonpath=$jsonPath 2>$null

  if ($LASTEXITCODE -ne 0 -or -not $encoded) {
    return ""
  }

  [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
}

function Get-ConfigValue {
  param(
    [string]$EnvName,
    [string]$SecretKey
  )

  $value = [Environment]::GetEnvironmentVariable($EnvName)

  if ($value) {
    return $value
  }

  Get-KubeSecretValue $SecretKey
}

function Invoke-TelegramApi {
  param(
    [string]$Method,
    [hashtable]$Body
  )

  $uri = "https://api.telegram.org/bot$BotToken/$Method"

  Invoke-RestMethod `
    -Method Post `
    -Uri $uri `
    -ContentType "application/json" `
    -Body ($Body | ConvertTo-Json -Depth 8 -Compress)
}

function Invoke-TelegramApiOptional {
  param(
    [string]$Method,
    [hashtable]$Body
  )

  try {
    Invoke-TelegramApi -Method $Method -Body $Body
  } catch {
    Write-Warning "Telegram $Method skipped: $($_.Exception.Message)"
    $null
  }
}

$BotToken = Get-ConfigValue -EnvName "TELEGRAM_BOT_TOKEN" -SecretKey "TELEGRAM_BOT_TOKEN"
$WebhookSecret = Get-ConfigValue -EnvName "TELEGRAM_WEBHOOK_SECRET" -SecretKey "TELEGRAM_WEBHOOK_SECRET"
$AdminChatId = Get-ConfigValue -EnvName "TELEGRAM_ADMIN_CHAT_ID" -SecretKey "TELEGRAM_ADMIN_CHAT_ID"

if (-not $BotToken) {
  throw "TELEGRAM_BOT_TOKEN is missing from env or Kubernetes secret $Namespace/$SecretName."
}

if (-not $WebhookSecret) {
  throw "TELEGRAM_WEBHOOK_SECRET is missing from env or Kubernetes secret $Namespace/$SecretName."
}

$webhookUrl = "$PublicUrl/api/webhooks/telegram"

$me = Invoke-TelegramApi -Method "getMe" -Body @{}
Write-Host "Bot: @$($me.result.username)"

Invoke-TelegramApi -Method "setWebhook" -Body @{
  url = $webhookUrl
  secret_token = $WebhookSecret
  allowed_updates = @("message", "callback_query")
  drop_pending_updates = [bool]$DropPendingUpdates
} | Out-Null
Write-Host "Webhook configured: $webhookUrl"

Invoke-TelegramApiOptional -Method "setMyName" -Body @{
  name = "Marky Concierge"
} | Out-Null

Invoke-TelegramApiOptional -Method "setMyShortDescription" -Body @{
  short_description = "Access, support and VIP requests."
} | Out-Null

Invoke-TelegramApiOptional -Method "setMyDescription" -Body @{
  description = "Marky Concierge opens passes, support and VIP requests for markshnaknaks.com."
} | Out-Null

Invoke-TelegramApiOptional -Method "setMyCommands" -Body @{
  commands = @(
    @{ command = "start"; description = "Open Marky or link a pass" },
    @{ command = "help"; description = "Show available commands" },
    @{ command = "passes"; description = "Open your access passes" },
    @{ command = "support"; description = "Open the support chat" },
    @{ command = "contact"; description = "Send a contact request" },
    @{ command = "orders"; description = "Open delivery help" },
    @{ command = "request"; description = "Send a VIP request" },
    @{ command = "whoami"; description = "Show your Telegram id" },
    @{ command = "chatid"; description = "Show this chat id for admin setup" }
  )
} | Out-Null
Write-Host "Commands configured."

if (-not $AdminChatId) {
  Write-Warning "TELEGRAM_ADMIN_CHAT_ID is not configured. Create a private admin chat with the bot, send /chatid, then add the returned chat_id to Kubernetes secret $Namespace/$SecretName."
}

try {
  Invoke-TelegramApi -Method "setChatMenuButton" -Body @{
    menu_button = @{
      type = "web_app"
      text = "Open Marky"
      web_app = @{ url = "$PublicUrl/orders?tg=true" }
    }
  } | Out-Null
  Write-Host "Menu button configured."
} catch {
  Write-Warning "Menu button setup failed: $($_.Exception.Message)"
}

$info = Invoke-TelegramApi -Method "getWebhookInfo" -Body @{}
[pscustomobject]@{
  Url = $info.result.url
  PendingUpdates = $info.result.pending_update_count
  LastError = $info.result.last_error_message
} | Format-List
