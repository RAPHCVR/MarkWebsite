# Marky Creator Storefront

SFW creator site for `@markshnaknaks`.

The site is a single long landing page with:

- hero and creator profile card
- social hub
- payment-ready photo pack previews with sales disabled by default
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
`NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=true`, a BTCPay store/API key and
`DATABASE_URL` for order tracking.
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
- `paymentConfig.telegram.vipUrl`
- `paymentConfig.telegram.requestBotUrl`

Do not add fake wallet addresses. Use empty strings until real destinations are confirmed.
BTCPay invoice creation is exposed as a POST route only, so bots and crawlers cannot create invoices by loading a URL.

Detailed crypto rail decisions and fee notes live in `docs/crypto-payment-strategy.md`.

## Payment Direction

Recommended launch path:

- Use Stripe Payment Links first for SFW photo packs if you want the cleanest card checkout and micro-enterprise accounting. The code supports per-product links through environment variables, but public buying stays paused until the products and legal pages are final.
- Move to Stripe Checkout Sessions later if the site needs a cart, webhooks, automatic delivery, coupons tied to accounts, or richer order metadata.
- Use BTCPay Server as the best self-hosted BTC option if low card fees and custody control matter. The route `src/app/api/checkout/btcpay/route.ts` is ready for BTCPay Greenfield invoice creation once env vars are set, the Bitcoin node is synced, and the store has a BTC wallet/payment method configured.
- Add Litecoin only if buyer demand justifies operating a second UTXO node/explorer. It is cheap for buyers, but it is not free operationally.
- Add USDC on Solana through a separate stablecoin processor if crypto becomes a real sales channel. Do not force USDC/Solana/TRON into the BTCPay BTC stack.
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
STABLECOIN_CHECKOUT_URL=
STABLECOIN_WEBHOOK_SECRET=
SALES_ENABLED=true
NEXT_PUBLIC_SALES_ENABLED=true
CRYPTO_CHECKOUT_ENABLED=false
NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=false
```

Crypto rail policy:

- Launch default: Stripe for cards, BTCPay BTC on-chain only after node sync and wallet setup.
- Next practical crypto rail: LTC if buyers want cheap UTXO payments, or USDC on Solana if they want a stablecoin.
- Provider split: BTCPay for BTC/LTC-style rails; SHKeeper or Bitcart for stablecoins if self-hosting is still required.
- No manual wallets on the public site unless there is a reconciliation backend; otherwise order matching and delivery are too fragile.
- Runtime flags are conservative: `BTCPAY_BTC_WALLET_READY=true` means node sync, wallet setup and invoice smoke test have already passed.

BTCPay production checklist before enabling crypto on the public site:

- `pay.markshnaknaks.com/api/v1/health` returns 200 and `synchronized:true`.
- Bitcoin Core is out of Initial Block Download.
- NBXplorer reports BTC as connected/synced.
- The Marky store has a BTC on-chain payment method.
- The wallet seed/xpub backup is stored outside the repo.
- A small invoice creation smoke test succeeds.

No Stripe secret key is required in the frontend repo for Payment Links. If Checkout Sessions are added later, the secret key must live only in Kubernetes secrets or a server-side env store. Rotate any live secret key that has been pasted into chat, logs or local notes.

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
- contact form uses the site endpoint instead of an insecure `mailto:` form action
- links are never rendered with empty `href` values
- axe accessibility violations are zero

Generated QA artifacts are ignored through `.gitignore`.
