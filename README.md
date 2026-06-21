# Marky Creator Storefront

SFW creator site for `@markshnaknaks`.

The site is a single long landing page with:

- hero and creator profile card
- social hub
- payment-ready photo pack previews, guarded by runtime sales flags
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

Public buying is disabled unless `SALES_ENABLED=true` and `NEXT_PUBLIC_SALES_ENABLED=true`.
Crypto checkout also requires `CRYPTO_CHECKOUT_ENABLED=true`,
`NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=true` and `DATABASE_URL` for order
tracking. BTCPay BTC/LTC also requires a BTCPay store/API key and wallet-ready
flags. USDC on Solana uses the separate Solana Pay path.
BTCPay env vars being present is not enough to show crypto checkout. The site
also requires explicit wallet readiness flags so the UI does not expose a rail
while Bitcoin Core is still syncing or the store has no wallet.

The collab form posts to `POST /api/contact`. When `DATABASE_URL` is configured,
requests are stored in `creator_contact_requests`; otherwise the form redirects
cleanly without storing data. The direct email CTA remains available for urgent briefs.

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

## Payment Direction

Recommended launch path:

- Use Stripe Payment Links first for SFW photo packs if you want the cleanest card checkout and micro-enterprise accounting. The code supports per-product links through environment variables.
- Move to Stripe Checkout Sessions later if the site needs a cart, webhooks, automatic delivery, coupons tied to accounts, or richer order metadata.
- Use Solana Pay as the first free/self-hosted stablecoin rail: the site creates a USDC payment request, stores the order in PostgreSQL, displays a QR/link, and verifies the reference on-chain before marking the order paid.
- Use BTCPay Server as the best self-hosted BTC/LTC option if low card fees and custody control matter. The route `src/app/api/checkout/btcpay/route.ts` is ready for BTCPay Greenfield invoice creation once env vars are set, the node is synced, and the store has an on-chain wallet/payment method configured.
- Use Litecoin as the first cheap UTXO crypto rail once the LTC node, NBXplorer indexing and wallet smoke test are complete.
- Keep SHKeeper/Bitcart as later processors if you need generated wallet addresses, callbacks or multi-chain rails such as Polygon/Tron. Do not deploy them just to accept USDC on Solana.
- Keep TRON/USDT and TON as later rails. TRON is popular for stablecoins but resource/energy fees can be surprisingly high without a managed energy strategy; TON only makes sense if Telegram becomes the primary paid flow.
- Use Telegram for channel updates, VIP invites, support, custom requests and delivery follow-up. Telegram Stars can stay inside Telegram flows, but it should not replace the website checkout unless a bot or mini-app is built intentionally.
- Keep Stripe products clearly non-explicit: cosplay sets, outfit previews, soft creator photos, and clean paid packs. If the offer changes, review payment-provider rules before launch.

Required BTCPay env vars when enabling crypto checkout:

```text
BTCPAY_SERVER_URL=https://pay.markshnaknaks.com
BTCPAY_STORE_ID=...
BTCPAY_API_KEY=...
BTCPAY_WEBHOOK_SECRET=...
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
SOLANA_PAY_VERIFY_TIMEOUT_MS=8000
SOLANA_PAY_RECIPIENT=
SOLANA_PAY_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
SALES_ENABLED=true
NEXT_PUBLIC_SALES_ENABLED=true
CRYPTO_CHECKOUT_ENABLED=false
NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=false
```

Crypto rail policy:

- Launch default: Stripe for cards and Solana Pay for USDC if crypto is desired immediately.
- Next UTXO rail: LTC after node/explorer sync and wallet setup.
- Provider split: BTCPay for BTC/LTC-style rails; Solana Pay for USDC Solana; SHKeeper/Bitcart only if multi-chain stablecoins become necessary.
- No manual wallets on the public site unless there is a reconciliation backend; otherwise order matching and delivery are too fragile.
- Runtime flags are conservative: `BTCPAY_BTC_WALLET_READY=true` means node sync, wallet setup and invoice smoke test have already passed.

Stablecoin production checklist before enabling public buttons:

- `SOLANA_PAY_RECIPIENT` is the real receiving wallet and is backed up outside Git/chat.
- `SOLANA_PAY_RPC_URLS` has at least two read-only RPC endpoints, so a single public RPC timeout does not block verification.
- `SOLANA_PAY_VERIFY_TIMEOUT_MS` is low enough to return a clean pending state before the public edge times out.
- `STABLECOIN_EUR_TO_USD_RATE` is set, reviewed before public sales, or products are priced directly for stablecoin.
- `POST /api/checkout/stablecoin` creates a Solana Pay order in `creator_orders`.
- `/checkout/stablecoin` shows a QR/link containing a unique reference.
- `POST /api/checkout/stablecoin/verify` verifies the transfer and marks the order `PAID`.
- Only then set `STABLECOIN_PROVIDER=solana-pay`, `SOLANA_PAY_ENABLED=true`, `NEXT_PUBLIC_SOLANA_PAY_ENABLED=true`, `STABLECOIN_RAIL_READY=true`, `NEXT_PUBLIC_STABLECOIN_RAIL_READY=true`, and `STABLECOIN_USDC_SOLANA_ENABLED=true`.

BTCPay production checklist before enabling crypto on the public site:

- `pay.markshnaknaks.com/api/v1/health` returns 200 and `synchronized:true`.
- Bitcoin Core is out of Initial Block Download.
- NBXplorer reports BTC as connected/synced.
- The Marky store has a BTC on-chain payment method.
- The wallet seed/xpub backup is stored outside the repo.
- A small invoice creation smoke test succeeds.

No Stripe secret key is required in the frontend repo for Payment Links. If Checkout Sessions are added later, the secret key must live only in Kubernetes secrets or a server-side env store. Rotate any live secret key that has been pasted into chat, logs or local notes.

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

## SFW Boundary

This version is a SFW preview site. OnlyFans is marked as a future creator-channel integration, not as an adult-content section. Keep paid packs non-explicit unless a separate compliant flow is designed later.

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
