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
- X: `https://x.com/MarkyReyvakh`

Stripe fields can be stored per product:

- `stripePaymentLink`
- `stripeProductId`
- `stripePriceId`
- `stripePaymentLinkId`

Public buying is disabled unless `NEXT_PUBLIC_SALES_ENABLED=true`.

Optional non-Stripe destinations:

- `cryptoCheckoutUrl`
- `paymentConfig.crypto.checkoutUrl`
- `paymentConfig.crypto.wallets`
- `paymentConfig.crypto.btcpay`
- `paymentConfig.telegram.vipUrl`
- `paymentConfig.telegram.requestBotUrl`

Do not add fake wallet addresses. Use empty strings until real destinations are confirmed.
BTCPay invoice creation is exposed as a POST route only, so bots and crawlers cannot create invoices by loading a URL.

## Payment Direction

Recommended launch path:

- Use Stripe Payment Links first for SFW photo packs if you want the cleanest card checkout and micro-enterprise accounting. The code supports per-product links through environment variables, but public buying stays paused until the products and legal pages are final.
- Move to Stripe Checkout Sessions later if the site needs a cart, webhooks, automatic delivery, coupons tied to accounts, or richer order metadata.
- Use BTCPay Server as the best self-hosted crypto option if low fees and custody control matter. The route `src/app/api/checkout/btcpay/route.ts` is ready for BTCPay Greenfield invoice creation once env vars are set.
- Use Telegram for channel updates, VIP invites, support, custom requests and delivery follow-up. Telegram Stars can stay inside Telegram flows, but it should not replace the website checkout unless a bot or mini-app is built intentionally.
- Keep Stripe products clearly non-explicit: cosplay sets, outfit previews, soft creator photos, and clean paid packs. If the offer changes, review payment-provider rules before launch.

Required BTCPay env vars when enabling crypto checkout:

```text
BTCPAY_SERVER_URL=https://pay.markshnaknaks.com
BTCPAY_STORE_ID=...
BTCPAY_API_KEY=...
BTCPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_SALES_ENABLED=true
```

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
- links are never rendered with empty `href` values
- axe accessibility violations are zero

Generated QA artifacts are ignored through `.gitignore`.
