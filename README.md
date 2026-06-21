# Marky Creator Storefront

Public creator platform site for `@markshnaknaks`.

The site is a single long landing page with:

- hero and creator profile card
- social hub
- payment-ready digital access previews, guarded by runtime sales flags
- soft lookbook
- collab contact section
- footer links

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- shadcn/base-ui local primitives
- lucide-react icons
- Simple Icons brand glyphs for official social and crypto logos
- Playwright + axe for browser and accessibility QA
- Docker + Kubernetes manifests for local-first deployment
- PostgreSQL central for orders, entitlements, contacts and rate limits
- Cloudflare R2 private bucket for paid access assets

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run test:ui
npm audit
```

Local URL:

```text
http://127.0.0.1:3000
```

## Editable Data

Update creator links, copy and payment destinations here:

- `src/data/site.ts`
- `src/data/socials.ts`
- `src/data/products.ts`
- `src/data/gallery.ts`
- `src/data/payments.ts`

Current live links:

- Instagram: `https://instagram.com/markshnaknaks`
- TikTok: `https://tiktok.com/@markshnaknaks`
- Telegram channel: `https://t.me/markreyvakh`
- Telegram chat/support: `https://t.me/+BTVcC_RjdWJhYWEy`
- X: `https://x.com/MarkyReykvakh`

Stripe fields can be stored per product:

- `stripePaymentLink`
- `stripeProductId`
- `stripePriceId`
- `stripePaymentLinkId`
- `STRIPE_WEBHOOK_SECRET` for signed `checkout.session.*` reconciliation

Public buying is disabled unless `SALES_ENABLED=true` and `NEXT_PUBLIC_SALES_ENABLED=true`.
Crypto checkout also requires `CRYPTO_CHECKOUT_ENABLED=true`,
`NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=true` and `DATABASE_URL` for order
tracking. BTCPay BTC and LTC are enabled in production after live invoice smoke
tests. USDC on Solana uses the separate Solana Pay path.
BTCPay env vars being present is not enough to show crypto checkout. The site
also requires explicit readiness flags and constrains Greenfield invoices with
`checkout.paymentMethods`, so the UI exposes only rails that passed live smoke
tests.

Private delivery is active in production through Cloudflare R2. The bucket
`marky-private-packs` is private, public `r2.dev` access is disabled, and
downloads are served only after token validation through short-lived signed
URLs. Telegram bot/webhook support is configured for `@markshnaknaksbot`;
admin delivery/contact/private-request notifications are enabled in production
through `TELEGRAM_ADMIN_CHAT_ID`, which must stay only in Kubernetes secrets.

Admin/accounting is token-protected. Configure `ADMIN_API_TOKEN`, then open
`/admin` and enter the token locally in the browser to inspect recent orders,
download accounting CSVs and review VIP Infrastructure Access tickets. The same
token protects `GET /api/admin/orders/export` and
`GET /api/admin/private-requests/export` through
`Authorization: Bearer <token>`. Do not paste this token in Telegram groups or
public issue threads. In production, also protect `https://markshnaknaks.com/admin*`
with Cloudflare Access and set `CLOUDFLARE_ACCESS_AUD` plus either
`CLOUDFLARE_ACCESS_TEAM_DOMAIN` or `CLOUDFLARE_ACCESS_JWKS_URL`; the origin will
then validate the Access JWT before accepting the bearer token. Public admin API
requests are rate-limited through `creator_rate_limits`.

The collab form posts to `POST /api/contact`. When `DATABASE_URL` is configured,
requests are stored in `creator_contact_requests`; when `TELEGRAM_ADMIN_CHAT_ID`
is configured, the same request is also relayed to the private admin chat. The
direct email CTA remains available for urgent briefs.
Turnstile can be enabled with `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`TURNSTILE_SECRET_KEY`, `TURNSTILE_REQUIRED=true` and
`NEXT_PUBLIC_TURNSTILE_REQUIRED=true`. If Turnstile is not required, a missing
token does not block legitimate contact submissions.
Public write endpoints use a small PostgreSQL-backed rate limit in
`creator_rate_limits`, keyed by a hash of the client fingerprint. This keeps
checkout/contact spam out of the production database without adding a separate
Redis dependency.
Production responses set CSP, HSTS, COOP, referrer, permissions, frame and
content-type headers from `next.config.ts`. The CSP allows only the site itself,
QR `data:` images and the Cloudflare Insights beacon injected at the edge.

Optional non-Stripe destinations:

- `cryptoCheckoutUrl`
- `paymentConfig.crypto.checkoutUrl`
- `paymentConfig.crypto.wallets`
- `paymentConfig.crypto.btcpay`
- `paymentConfig.crypto.rails`
- `paymentConfig.crypto.stablecoin`
- `/api/checkout/stablecoin`
- `/api/checkout/stablecoin/verify`
- `/api/webhooks/shkeeper`
- `/api/payments/status`
- `paymentConfig.telegram.vipUrl`
- `paymentConfig.telegram.requestBotUrl`

Do not add fake wallet addresses. Use empty strings until real destinations are confirmed.
BTCPay and stablecoin invoice creation are exposed as POST routes only, so bots and crawlers cannot create invoices by loading a URL.
Use `GET /api/payments/status` to audit runtime readiness without exposing secrets or creating test invoices.

Detailed crypto rail decisions and fee notes live in `docs/crypto-payment-strategy.md`.

## Legal / MoR Direction

The site is operated by `Raphael Tech Solutions` as technical platform operator
and Merchant of Record for Marky digital access services:

- Entrepreneur: Raphael Chauvier
- SIREN: `105765424`
- Legal form: Entrepreneur individuel / Micro-entreprise
- APE: `6201Z`
- TVA: franchise en base, article 293 B CGI

Public wording should stay accurate and aligned with the actual service:
Digital Access Pass, Premium Platform Membership, Content Delivery Token,
VIP Infrastructure Access, private delivery, Telegram concierge/support and
ticketed requests. Do not use misleading wording to hide what is being sold
from Stripe or buyers. If the offer changes, review payment-provider rules
before launch.

Legal pages are part of the app:

- `/legal`
- `/terms`
- `/refund-policy`
- `/privacy`

Checkout buttons require explicit CGV/immediate digital delivery acceptance
before reaching Stripe, BTCPay or Solana Pay. The order table stores the terms
version, waiver timestamp and `fiat_value_eur_at_transaction` for accounting.
Public B2C checkout is also gated by `CONSUMER_MEDIATOR_NAME` and
`CONSUMER_MEDIATOR_WEBSITE`. Without a real referenced consumer mediator,
`SALES_ENABLED=true` is treated as requested but not legally launch-ready, so
the storefront keeps checkout locked instead of pretending compliance is done.

## Payment Direction

Recommended launch path:

- Use Stripe Payment Links first for digital access checkout if you want the cleanest card checkout and micro-enterprise accounting. The code supports per-product links through environment variables.
- Stripe webhook reconciliation is live in production. The endpoint points to `https://markshnaknaks.com/api/webhooks/stripe` with `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`, so paid sessions are recorded in the shared `creator_orders` table.
- Move to Stripe Checkout Sessions later if the site needs a cart, automatic delivery, coupons tied to accounts, or richer order metadata than Payment Links provide.
- Use Solana Pay as the first free/self-hosted stablecoin rail: the site creates a USDC payment request, stores the order in PostgreSQL, displays a QR/link, and verifies the reference on-chain before marking the order paid.
- Use BTCPay Server as the best self-hosted BTC/LTC option if low card fees and custody control matter. The route `src/app/api/checkout/btcpay/route.ts` creates BTCPay Greenfield invoices and limits each invoice to smoke-tested payment method IDs.
- Use Litecoin as the first cheap UTXO crypto rail. It is live in production through BTCPay after node sync, NBXplorer wiring and an LTC invoice smoke test.
- Keep SHKeeper/Bitcart as later processors if you need generated wallet addresses, callbacks or multi-chain rails such as Polygon/Tron. Do not deploy them just to accept USDC on Solana.
- Keep TRON/USDT and TON as later rails. TRON is popular for stablecoins but resource/energy fees can be surprisingly high without a managed energy strategy; TON only makes sense if Telegram becomes the primary paid flow.
- Use Telegram for channel updates, VIP invites, support, VIP Infrastructure Access tickets and delivery follow-up. Telegram Stars can stay inside Telegram flows, but it should not replace the website checkout unless a bot or mini-app is built intentionally.
- Keep Stripe products clearly framed as digital platform access services. If the offer changes, review payment-provider rules before launch.

## Private Delivery

Private access delivery is site-owned and backed by Cloudflare R2:

- Private media objects live in the private R2 bucket `marky-private-packs`.
- R2 public `r2.dev` access stays disabled; do not attach a public custom domain to private pack storage.
- Paid orders grant an entitlement in PostgreSQL, generate a bearer delivery token, and expose a page at `/orders/<token>`.
- File downloads use `/api/delivery/assets/<assetId>?token=...`, which validates the token and redirects to a short-lived signed R2 URL.
- Telegram is support and optional admin notification, not the source of truth for delivery access.
- VIP Infrastructure Access requests are ticketed through `@markshnaknaksbot` with `/request <message>` after Telegram is linked from the delivery page.
- Use `scripts/upsert-r2-delivery-asset.ps1` to upload a real private asset and register it in `creator_assets` without manual SQL. New uploads default to the `access-assets/<product-slug>/...` R2 prefix.
- `scripts/audit-payment-readiness.ps1 -RunDeliverySmoke` creates and cleans up a smoke entitlement against the real bucket and confirms signed URL delivery.
- `scripts/setup-telegram-bot.ps1` configures the bot webhook, commands, description and menu button from Kubernetes secrets without printing the token.

Required BTCPay env vars when enabling crypto checkout:

```text
BTCPAY_SERVER_URL=https://pay.markshnaknaks.com
BTCPAY_STORE_ID=...
BTCPAY_API_KEY=...
BTCPAY_WEBHOOK_SECRET=...
STRIPE_WEBHOOK_SECRET=
BTCPAY_BTC_WALLET_READY=false
NEXT_PUBLIC_BTCPAY_BTC_WALLET_READY=false
BTCPAY_LTC_ENABLED=false
NEXT_PUBLIC_BTCPAY_LTC_ENABLED=false
DATABASE_URL=postgresql://...
STABLECOIN_PROVIDER=none
STABLECOIN_RAIL_READY=false
NEXT_PUBLIC_STABLECOIN_RAIL_READY=false
STABLECOIN_PROCESSOR_URL=
STABLECOIN_CHECKOUT_URL=
STABLECOIN_API_KEY=
SHKEEPER_API_KEY=
STABLECOIN_WEBHOOK_SECRET=
STABLECOIN_FIAT=USD
STABLECOIN_EUR_TO_USD_RATE=
STABLECOIN_EUR_TO_USD_RATE_SOURCE=frankfurter
STABLECOIN_RATE_FETCH_TIMEOUT_MS=3000
STABLECOIN_DEFAULT_RAIL=usdc-solana
STABLECOIN_USDC_SOLANA_ENABLED=false
NEXT_PUBLIC_STABLECOIN_USDC_SOLANA_ENABLED=false
STABLECOIN_USDC_POLYGON_ENABLED=false
STABLECOIN_USDT_TRON_ENABLED=false
SHKEEPER_USDC_SOLANA_CRYPTO_NAME=USDC
SHKEEPER_USDC_POLYGON_CRYPTO_NAME=POLYGON-USDC
SHKEEPER_USDT_TRON_CRYPTO_NAME=USDT
SOLANA_PAY_ENABLED=false
NEXT_PUBLIC_SOLANA_PAY_ENABLED=false
SOLANA_PAY_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAY_RPC_URLS=https://api.mainnet-beta.solana.com,https://solana-rpc.publicnode.com
SOLANA_PAY_INVOICE_TTL_MINUTES=30
SOLANA_PAY_VERIFY_TIMEOUT_MS=8000
SOLANA_PAY_RECIPIENT=
SOLANA_PAY_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
R2_ACCOUNT_ID=
R2_ENDPOINT=
R2_BUCKET_PRIVATE=marky-private-packs
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_SIGNED_URL_TTL_SECONDS=300
DELIVERY_TOKEN_TTL_DAYS=7
ADMIN_API_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=markshnaknaksbot
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_CHAT_ID=
TELEGRAM_VIP_CHAT_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SALES_ENABLED=false
NEXT_PUBLIC_SALES_ENABLED=false
CRYPTO_CHECKOUT_ENABLED=false
NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=false
```

Crypto rail policy:

- Launch default: Stripe for cards and Solana Pay for USDC if crypto is desired immediately.
- Current UTXO rails: LTC and BTC through BTCPay after node/explorer sync and payable invoice smoke tests.
- Provider split: BTCPay for BTC/LTC-style rails; Solana Pay for USDC Solana; SHKeeper/Bitcart only if multi-chain stablecoins become necessary.
- No manual wallets on the public site unless there is a reconciliation backend; otherwise order matching and delivery are too fragile.
- Runtime flags are conservative: `BTCPAY_BTC_WALLET_READY=true` means node sync, wallet setup and invoice smoke test have already passed.

Stablecoin production checklist before enabling public buttons:

- `SOLANA_PAY_RECIPIENT` is the real receiving wallet and is backed up outside Git/chat.
- `SOLANA_PAY_RPC_URLS` has at least two read-only RPC endpoints, so a single public RPC timeout does not block verification.
- `SOLANA_PAY_INVOICE_TTL_MINUTES=30` is set so EUR to USDC quotes do not stay payable indefinitely.
- `SOLANA_PAY_VERIFY_TIMEOUT_MS` is low enough to return a clean pending state before the public edge times out.
- `STABLECOIN_EUR_TO_USD_RATE_SOURCE=frankfurter` is set for free ECB-derived EUR to USD pricing; `STABLECOIN_EUR_TO_USD_RATE` is optional and only acts as a fallback.
- `POST /api/checkout/stablecoin` creates a Solana Pay order in `creator_orders`.
- The created order stores the exact USDC amount, exchange rate and rate source used for that invoice.
- `/checkout/stablecoin` shows a QR/link containing a unique reference and hides the QR once the invoice TTL has elapsed.
- `POST /api/checkout/stablecoin/verify` verifies the transfer and marks the order `PAID`.
- `creator_rate_limits` is present so checkout creation and verification cannot be spammed freely.
- Only then set `STABLECOIN_PROVIDER=solana-pay`, `SOLANA_PAY_ENABLED=true`, `NEXT_PUBLIC_SOLANA_PAY_ENABLED=true`, `STABLECOIN_RAIL_READY=true`, `NEXT_PUBLIC_STABLECOIN_RAIL_READY=true`, and `STABLECOIN_USDC_SOLANA_ENABLED=true`.

Contact spam protection:

- `TURNSTILE_SECRET_KEY` enables server-side Cloudflare Turnstile checks.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` renders the widget on the contact form.
- `TURNSTILE_REQUIRED=true` should be set in production once both keys are
  configured. Until then, the form still has a honeypot and PostgreSQL-backed
  rate limit, but Turnstile is the proper anti-bot layer.

BTCPay BTC production checklist:

- `pay.markshnaknaks.com/api/v1/health` returns 200 and `synchronized:true`.
- Bitcoin Core is out of Initial Block Download.
- NBXplorer reports BTC as connected/synced.
- The Marky store has a BTC on-chain payment method.
- The wallet seed/xpub backup is stored outside the repo.
- A small invoice creation smoke test returns a `BTC-CHAIN` destination, payment link, exchange rate and amount due.

BTCPay BTC and LTC are public-ready. Keep them enabled only while
`scripts/audit-payment-readiness.ps1 -RunBtcpaySmoke` keeps returning an
`LTC-CHAIN` and `BTC-CHAIN` destination, payment link, exchange rate and
amount due.

No Stripe secret key is required in the frontend repo for Payment Links. If Checkout Sessions are added later, the secret key must live only in Kubernetes secrets or a server-side env store. Rotate any live secret key that has been pasted into chat, logs or local notes.

Stripe webhook setup:

```powershell
$env:STRIPE_SECRET_KEY = "<your Stripe live secret key>"
.\scripts\setup-stripe-webhook.ps1
Remove-Item Env:\STRIPE_SECRET_KEY
```

The script creates a Stripe webhook endpoint for `https://markshnaknaks.com/api/webhooks/stripe`, stores only the returned `STRIPE_WEBHOOK_SECRET` in the `marky-payments` Kubernetes Secret, disables stale enabled endpoints for the same URL when `-ForceNew` is used, and rolls the storefront deployment. It does not write the Stripe secret key to Git.

Payment readiness audit:

```powershell
.\scripts\audit-payment-readiness.ps1
.\scripts\audit-payment-readiness.ps1 -RunStablecoinSmoke
.\scripts\audit-payment-readiness.ps1 -RunBtcpaySmoke
```

`-RunStablecoinSmoke` creates a live unpaid USDC Solana Pay invoice, verifies the public QR/link page, confirms unpaid verification returns a pending state, then removes the smoke order from PostgreSQL. `-RunBtcpaySmoke` creates a live unpaid BTCPay invoice and verifies that BTCPay returns an `LTC-CHAIN` payment method with a destination, payment link, exchange rate and amount due.

BTCPay storage policy:

- Bitcoin Core: rebuildable local PV on `talos-h9q-3tl`.
- Litecoin Core: rebuildable local PV on `talos-h9q-3tl`.
- NBXplorer: 1 Longhorn replica, `Retain`; rebuildable explorer/cache state.
- BTCPay app data: 2 Longhorn replicas, `Retain`; small important app state.
- Orders, invoices, users and store data: central PostgreSQL, not local BTCPay Postgres.

## Deployment

Container build:

```powershell
docker build -t ghcr.io/raphcvr/markwebsite:latest .
docker push ghcr.io/raphcvr/markwebsite:latest
```

Kubernetes deploy:

```powershell
kubectl apply -f k8s/marky-storefront.yaml
kubectl rollout status deployment/marky-storefront -n marky
```

The manifest exposes:

- `markshnaknaks.com`
- `www.markshnaknaks.com`

## Public Boundary

This version is a public preview site for platform access services. Future
creator-channel integrations should stay separate from the site checkout unless
a compliant flow is designed intentionally.

## QA

`npm run test:ui` verifies:

- key sections render
- no horizontal overflow on desktop/tablet/mobile/small mobile
- interactive elements have accessible names
- external links use `noopener`
- checkout configuration does not expose fake live purchase CTAs
- payment readiness can be inspected without leaking secret keys
- contact form uses the site endpoint instead of an insecure `mailto:` form action
- links are never rendered with empty `href` values
- axe accessibility violations are zero

Generated QA artifacts are ignored through `.gitignore`.
