# Crypto Payment Strategy

Last verified: 2026-06-21.

## Current Production State

- `markshnaknaks.com` is live behind the `marky` Kubernetes namespace.
- `pay.markshnaknaks.com` reaches BTCPay Server in the `btcpay` namespace.
- BTCPay has one `Marky` store, one API key and one webhook.
- Bitcoin Core runs on `talos-h9q-3tl` with rebuildable local PV storage at `/var/mnt/longhorn/blockchain-local/bitcoin`, `checkblocks=1`, `dbcache=1024`, `par=4`, DNS peer discovery, no forced `connect`/manual `addnode` list, standard internal P2P port `8333`, a `4Gi` memory request, and an `8Gi` memory limit to avoid OOM during IBD.
- Bitcoin Core is in Initial Block Download on a fresh pruned volume. Live checks on 2026-06-21 08:15 Paris time showed the node advancing around block `841831` of `954657`, `verificationprogress=0.738728`, `initialblockdownload=true`, `pruned=true`, and `size_on_disk=18.2 GiB` with a `55 GiB` prune target on a `90 GiB` local PV. During IBD, BTCPay returns `{"synchronized":false}` and BTC checkout must remain disabled.
- Litecoin Core is deployed separately as `btcpay-litecoind` on `talos-h9q-3tl` with rebuildable local PV storage at `/var/mnt/longhorn/blockchain-local/litecoin`, `dbcache=512`, a `1Gi` memory request and a `4Gi` memory limit. Live checks on 2026-06-21 08:15 Paris time showed the node advancing around block `3085772` of `3128806`, `verificationprogress=0.965510`, `initialblockdownload=true`, `pruned=true`, and `size_on_disk=19.7 GiB` with a `20 GiB` prune target on a `40 GiB` local PV. The previous `1536Mi` limit was too tight during IBD and caused OOMKills.
- On 2026-06-20, blockchain data was moved off Longhorn/`valence-worker-02` after repeated kubelet and virtual volume I/O timeouts. BTC/LTC chainstate is intentionally treated as disposable cache and can be rebuilt from the networks.
- A live check on 2026-06-20 showed `valence-worker-02` recovered after Longhorn iSCSI volume errors (`EXT4` remounted read-only, then the volume reattached). Active Longhorn volumes were healthy after the move, and the former 90 GiB blockchain Longhorn volume was no longer active.
- BTCPay Server loads `Supported chains: LTC,BTC`. NBXplorer now runs with cookie authentication, and BTCPay mounts the NBXplorer PVC read-only at `/root/.nbxplorer` so `BTC` and `LTC` both use `/root/.nbxplorer/Main/.cookie`. The previous `--noauth` plus `explorercookiefile=0` setup was removed because BTCPay 2.2.1 still tried cookie auth and produced NBXplorer 500s. Live logs after the fix show BTC and LTC handshakes, RPC connection success, and `CoreSynching`.
- BTCPay currently has no BTC wallet/payment method configured.
- The storefront production secret contains Stripe Payment Links, Solana Pay settings and BTCPay env vars. Public selling is controlled by `SALES_ENABLED`, not by secrets simply existing.
- The storefront has a signed Stripe webhook route at `POST /api/webhooks/stripe` for Payment Link reconciliation into `creator_orders`. It stays inert until `STRIPE_WEBHOOK_SECRET` is configured and the Stripe dashboard endpoint points at `https://markshnaknaks.com/api/webhooks/stripe`.
- The Marky PostgreSQL app password, BTCPay BTC/LTC internal RPC passwords, BTCPay site API key, BTCPay webhook secret and BTCPay admin bootstrap password were rotated on 2026-06-21 after runtime audit checks. The active BTCPay site key has only `cancreateinvoice` and `canviewinvoices` on the Marky store, and there is one active Marky webhook. Current secrets live only in Kubernetes secrets and local ignored env material; do not print full `printenv` output from payment pods.
- The storefront has stablecoin checkout live for USDC on Solana: `POST /api/checkout/stablecoin`, the internal page `/checkout/stablecoin`, `POST /api/checkout/stablecoin/verify`, optional `POST /api/webhooks/shkeeper`, and shared PostgreSQL reconciliation through `creator_orders`. Solana Pay verification supports `SOLANA_PAY_RPC_URLS` as a comma-separated read-only RPC fallback list.
- Public write paths are protected by a small PostgreSQL-backed rate limit table, `creator_rate_limits`, keyed by hashed client fingerprints. This protects checkout creation, stablecoin verification and contact writes without adding a Redis dependency.
- A production smoke test on 2026-06-21 08:15 Paris time created a Solana Pay invoice for `cosplay-starter-pack`, rendered the public QR/link page, persisted the order in central PostgreSQL as `UNPAID`, correctly returned `pending=1` when verification was attempted without an on-chain payment, and then deleted the smoke order row.
- Follow-up production smoke tests on 2026-06-21 05:32, 06:40, 07:04 and post-rollout at 07:23 Paris time verified the stablecoin pending path with two RPC fallbacks: public order creation returned `303`, the checkout page rendered a Solana Pay QR/link, central PostgreSQL stored new `solana-pay` orders as `UNPAID`, and unpaid verification returned `pending=1` without timing out at the public edge. Smoke rows were removed after validation.
- On 2026-06-21 07:10 Paris time, both configured free read-only Solana RPC endpoints answered from the production pod: `api.mainnet-beta.solana.com` and `solana-rpc.publicnode.com`.
- `GET /api/payments/status` exposes payment readiness without leaking secrets. Use it for operational checks before creating real smoke orders.
- BTC/LTC checkout must stay disabled until BTCPay returns `synchronized:true` and the relevant store wallet/payment method exists. The storefront code now supports enabling LTC independently through `BTCPAY_LTC_ENABLED`, so LTC can go public before BTC if it finishes first.

## Kubernetes Storage Policy

The BTCPay deployment uses dedicated storage profiles instead of the cluster
default for payment-related state:

- `bitcoin-data`: local PV on `talos-h9q-3tl`. This is the largest
  rebuildable cache, so it is kept out of Longhorn replication/snapshots during
  IBD.
- `litecoin-data`: local PV on `talos-h9q-3tl`. This is also rebuildable
  from the Litecoin network and is intentionally separate from BTC so LTC can
  sync and be evaluated without blocking on Bitcoin IBD.
- `nbxplorer-data`: existing retained PVC, currently 1 Longhorn replica.
  The PVC still shows its original `longhorn-custom` storage class, but the
  bound PV reclaim policy is `Retain` and the Longhorn volume is healthy.
  NBXplorer state is backed by PostgreSQL and can be rebuilt from Bitcoin Core.
- `btcpay-data`: existing retained PVC with 2 Longhorn replicas and a bound PV
  reclaim policy of `Retain`. The current StatefulSet template uses
  `longhorn-payment-state-retain-2`; the already-created PVC can still display
  its original `longhorn-custom` storage class. This is small application state
  and should survive a single disk/node loss.
- `nbxplorer-cookie`: BTCPay mounts the retained `nbxplorer-data` PVC read-only
  so it can authenticate to NBXplorer through `/root/.nbxplorer/Main/.cookie`.
- BTCPay transaction, user, store, webhook and invoice data live in the central
  PostgreSQL service at `postgresql-ha-rw.database.svc.cluster.local`, not in a
  local BTCPay PostgreSQL PVC.

The current Bitcoin and Litecoin chainstates run outside Longhorn after the old
volumes stalled or were placed on unsuitable storage. NBXplorer still uses its
existing PVC but is backed by PostgreSQL and can be rebuilt. BTCPay app data
runs with 2 replicas, and active PV reclaim policies are `Retain`. For
blockchain data, Longhorn snapshots/replication are intentionally avoided
because they inflate storage and slow heavy append/compact workloads during IBD.

## Recommendation

Use five payment layers, in this order:

1. Stripe Payment Links for card checkout and accounting.
2. USDC on Solana through Solana Pay for the first free/self-hosted stablecoin rail.
3. Litecoin as the first cheap UTXO crypto rail once the LTC node is synced and wired to an explorer/store.
4. BTCPay BTC on-chain after Bitcoin node sync and wallet setup.
5. SHKeeper/Bitcart only for generated-address multi-chain stablecoins such as Polygon/Tron if buyer demand justifies the extra service.

Telegram should stay the VIP/support/delivery layer, not the main checkout system. Telegram Stars can continue inside Telegram-native flows, but website orders should still be reconciled by the site backend.

## Rail Matrix

| Rail | Status | Best Use | Buyer Cost | Operator Cost | Decision |
| --- | --- | --- | --- | --- | --- |
| Stripe | Ready by config | Cards, clean accounting, refunds/disputes | Card fees, no blockchain fee | Stripe fees | Primary public checkout when products/legal are ready |
| BTC on-chain via BTCPay | Installed, not wallet-ready | Self-hosted crypto, non-custodial checkout | Low during calm mempool, slower settlement | Bitcoin node, sync, backups | Keep, but do not block launch on BTC |
| LTC node | Installed, syncing | Cheap UTXO payments for buyers | Very low network fee | Separate Litecoin node and explorer | First self-hosted crypto rail to finish |
| USDC on Solana | Live and smoke-tested | Low-fee stablecoin payments | Usually sub-cent network fee, token account edge cases | Solana wallet backup, read-only RPC fallback monitoring | Best free/self-hosted stablecoin rail for v1 |
| USDC on Polygon | Route modelled, fallback | Low-fee EVM stablecoin | Low, but chain/wallet UX is less universal than Solana for this audience | SHKeeper/Bitcart plus EVM RPC | Later, only if Solana support disappoints buyers |
| USDT on TRON | Modelled, disabled | Buyer familiarity, exchange withdrawals | Can be cheap with Energy, expensive without it | Energy/rental/staking strategy and processor support | Later, only if buyers demand TRON |
| TON | Research | Telegram-native audience | Low network fee | Bot/mini-app and wallet ops | Later, if Telegram becomes paid flow |

## Fee Snapshot

This is a snapshot, not a hardcoded rule.

- BTC: mempool.space returned `1 sat/vB` for economy/hour/half-hour/fastest. With a typical 140 vB receive transaction, that is roughly `140 sats`, about `0.78 EUR` at `55,906 EUR/BTC`; actual cost changes with mempool and BTC/EUR.
- LTC: litecoinspace returned `1 litoshi/vB`. With a typical 140 vB transaction, that is about `140 litoshi`, roughly `0.000054 EUR` at `38.75 EUR/LTC`, effectively negligible for pack-size purchases.
- Solana: Solana base fee is `5,000 lamports` per signature. At about `63.65 EUR/SOL`, base fee is roughly `0.0003 EUR`; token account creation/rent can add more in edge cases, but normal USDC transfers remain far below card fees.
- TRON/TRC20: TRON uses Bandwidth and Energy. Public fee estimates vary, but TRC20 stablecoin transfers are often several TRX without Energy. With about `0.284 EUR/TRX`, `6.5-13 TRX` is roughly `1.85-3.69 EUR`, and fresh-wallet transfers can be higher.

## BTCPay Completion Checklist

Do not set `CRYPTO_CHECKOUT_ENABLED=true` for BTC until all items pass:

- `https://pay.markshnaknaks.com/api/v1/health` returns `{"synchronized":true}`.
- Bitcoin Core is out of Initial Block Download.
- NBXplorer reports BTC as connected and synced.
- The `Marky` store has a BTC on-chain wallet/payment method.
- The wallet seed or xpub backup is stored outside Git and outside chat logs.
- A test invoice can be created from the site route and appears in BTCPay.
- The webhook posts back to `https://markshnaknaks.com/api/webhooks/btcpay`.
- The order record is created in PostgreSQL.

Only then set:

```text
BTCPAY_BTC_WALLET_READY=true
NEXT_PUBLIC_BTCPAY_BTC_WALLET_READY=true
CRYPTO_CHECKOUT_ENABLED=true
NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED=true
```

## Litecoin Completion Checklist

Do not show LTC checkout publicly until all items pass:

- `btcpay-litecoind` is out of Initial Block Download.
- A Litecoin explorer path is deployed and synced. Preferred: NBXplorer if the BTCPay build supports the LTC chain cleanly; otherwise keep Litecoin as a separate processor path.
- The BTCPay store or the dedicated LTC processor has a Litecoin on-chain wallet/payment method.
- A test invoice can be created and reconciled into the same order table.
- Delivery remains gated by order state, not by a public manual address.

Only then set a dedicated feature flag such as:

```text
BTCPAY_LTC_ENABLED=true
NEXT_PUBLIC_BTCPAY_LTC_ENABLED=true
```

## Stablecoin Architecture

Do not bolt USDC/Solana or TRON into the BTC/LTC BTCPay deployment.

Current decision:

1. Use Solana Pay first for USDC because it is free, non-custodial and already fits the site-owned order table: each order gets a unique reference, a QR/link and server-side on-chain verification.
2. Keep the stablecoin route separate from `/api/checkout/btcpay`: `POST /api/checkout/stablecoin`.
3. Use `POST /api/checkout/stablecoin/verify` for Solana Pay reconciliation into the same `creator_orders` table. Verification must use a short RPC timeout (`SOLANA_PAY_VERIFY_TIMEOUT_MS`, default `8000`) and `SOLANA_PAY_RPC_URLS` fallback endpoints so unpaid orders return a clean pending state before Cloudflare or ingress timeouts.
4. Keep `POST /api/webhooks/shkeeper` available for a later generated-address processor.
5. Keep `STABLECOIN_RAIL_READY=true` only while invoice creation, QR rendering, verification and PostgreSQL status updates continue to work against production runtime env.

SHKeeper remains attractive for later multi-chain stablecoins because it is open-source and self-hosted and its API covers invoice creation plus callbacks. Use the instance's own `GET /api/v1/crypto` result as the source of truth before enabling any SHKeeper rail.

Running a real private Solana RPC is heavy; using free public read-only RPC fallbacks is easier but not fully self-hosted. This is acceptable for Marky v1 because the server never holds or spends funds: it only generates Solana Pay requests to the receiving wallet and verifies on-chain references. BTC/LTC remain different: they are light enough to self-host as pruned full nodes and are already isolated on rebuildable local PVs. If strict RPC self-hosting becomes mandatory, revisit Solana versus Polygon before deploying rather than forcing a large Solana RPC node into the current cluster.

Bitcart remains a backup candidate if SHKeeper cannot support the exact rail or if a lighter plugin model is preferred later.

## Architecture Decision Record

Status: Accepted for v1, guarded by feature flags.

Decision: Keep four separate payment contexts instead of one universal crypto stack:

- `Stripe`: public card checkout and accounting.
- `BTCPay`: BTC/LTC UTXO invoices through BTCPay + NBXplorer.
- `Solana Pay`: USDC transfer requests through `/api/checkout/stablecoin` and `/api/checkout/stablecoin/verify`.
- `Stablepay processor`: optional SHKeeper/Bitcart generated-address stablecoins later.

Alternatives rejected:

- Manual wallet addresses on product cards: rejected because order matching and delivery would be fragile.
- Forcing USDC/TRON into BTCPay: rejected because the current BTCPay deployment is cleanly scoped to BTC/LTC and should not absorb unrelated wallet/RPC risk.
- Deploying SHKeeper immediately: rejected for v1 because USDC Solana Pay already covers the free stablecoin need without another service.
- Telegram-only payments: rejected for website orders because reconciliation, refunds, delivery and accounting would be weaker than site-owned order state.

Consequences:

- Positive: each processor has a clear failure boundary; all orders still land in central PostgreSQL.
- Positive: public buttons can stay hidden until a specific rail passes live smoke tests.
- Negative: Solana Pay depends on public read-only RPC availability unless a heavy private Solana RPC is deployed.
- Negative: EUR products need an explicit USD conversion rate or explicit stablecoin pricing.

Reversibility: low-to-medium cost. The site route is isolated, so Solana Pay can be replaced with SHKeeper, Bitcart or a custom processor by changing the `/api/checkout/stablecoin` implementation while keeping the `creator_orders` table and product model.

Owner/check path: `C:\Users\Raphael\Documents\Mark`, with runtime checks through `kubectl -n btcpay`, `kubectl -n marky`, and the processor health/API endpoints.

## Operational Rules

- Never publish manual wallet addresses on the public site unless order reconciliation is implemented.
- Keep Stripe as the first launch rail for sales because it is easiest for refunds, accounting and customer support.
- Keep crypto disabled by explicit feature flags. Env vars present do not mean a rail is safe to show.
- Keep rate limits active on public POST routes; invoice creation should be intentional user action, not crawler-accessible state churn.
- Rotate any Stripe secret key that has been pasted into chat or logs.
- Keep private wallet material out of Git, screenshots, chat and Kubernetes manifests.
- Prefer `SOLANA_PAY_RPC_URLS` with more than one free read-only RPC before enabling serious volume; move to a keyed provider only after real rate-limit evidence.

## Sources

- BTCPay Server General FAQ: https://docs.btcpayserver.org/FAQ/General/
- BTCPay Server Altcoin FAQ: https://docs.btcpayserver.org/FAQ/Altcoin/
- BTCPay Server Altcoin Development: https://docs.btcpayserver.org/Development/Altcoins/
- SHKeeper Solana support note: https://shkeeper.io/news/shkeeper-adds-support-for-solana-network
- Bitcart overview: https://docs.bitcart.ai/
- TRON resource model: https://developers.tron.network/docs/resource-model
- Solana fees: https://solana.com/docs/core/fees
- Solana Pay package/docs: https://www.npmjs.com/package/@solana/pay
