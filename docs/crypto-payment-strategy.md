# Crypto Payment Strategy

Last verified: 2026-06-19.

## Current Production State

- `markshnaknaks.com` is live behind the `marky` Kubernetes namespace.
- `pay.markshnaknaks.com` reaches BTCPay Server in the `btcpay` namespace.
- BTCPay has one `Marky` store, one API key and one webhook.
- Bitcoin Core was repaired on 2026-06-19 by replacing a stalled/slow old chainstate volume with a fresh `longhorn-blockchain-single` PVC. The old PV `pvc-b1e1dd7b-bcdc-492d-9ff4-4ee495881d92` is retained and labelled as a rollback artifact.
- Bitcoin Core is in Initial Block Download on the fresh volume. At verification it had healthy outbound peers, NBXplorer was `Healthy` with BTC `CoreSynching`, and BTCPay returned `{"synchronized":false}` as expected until IBD completes.
- Bitcoin Core now runs with one Longhorn replica, `checkblocks=1`, `dbcache=2048`, DNS peer discovery, no forced `connect`/manual `addnode` list, and standard internal P2P port `8333`. `dbcache=4096` was too aggressive for this pod and caused an OOM kill during IBD.
- Litecoin Core is deployed separately as `btcpay-litecoind` with a 40Gi pruned single-replica Longhorn volume on `talos-h9q-3tl`. It started IBD successfully with outbound peers and fast header sync.
- BTCPay currently has no BTC wallet/payment method configured.
- The storefront production secret contains Stripe Payment Links and BTCPay env vars, but `SALES_ENABLED=false`.
- Crypto checkout must stay disabled until BTCPay returns `synchronized:true` and a BTC wallet/payment method exists.

## Kubernetes Storage Policy

The BTCPay deployment uses separate Longhorn profiles instead of the cluster
default for new PVCs:

- `bitcoin-data`: `longhorn-blockchain-single`, 1 replica, `Retain`. This is the
  largest volume and is rebuildable from the Bitcoin network, so duplicating it
  would waste a lot of storage during IBD. It must not be part of the default
  Longhorn snapshot group while the chain is syncing.
- `litecoin-data`: `longhorn-blockchain-single-any`, 1 replica, `Retain`. This
  is also rebuildable from the Litecoin network and is intentionally separate
  from BTC so LTC can sync and be evaluated without blocking on Bitcoin IBD.
- `nbxplorer-data`: `longhorn-blockchain-single`, 1 replica, `Retain`.
  NBXplorer state is backed by PostgreSQL and can be rebuilt from Bitcoin Core.
- `btcpay-data`: `longhorn-payment-state-retain-2`, 2 replicas, `Retain`. This
  is small application state and should survive a single disk/node loss.
- BTCPay transaction, user, store, webhook and invoice data live in the central
  PostgreSQL service at `postgresql-ha-rw.database.svc.cluster.local`, not in a
  local BTCPay PostgreSQL PVC.

The current Bitcoin PVC was recreated from `longhorn-blockchain-single` after
the old `longhorn-custom` volume stalled during IBD. NBXplorer still uses its
existing PVC but is backed by PostgreSQL and can be rebuilt. BTCPay app data
runs with 2 replicas, and active PV reclaim policies are `Retain`. For Bitcoin
Core, recurring Longhorn snapshots are intentionally disabled except for the
explicit `blockchain-reclaim` cleanup group, because snapshots inflate storage
and slow heavy append/compact workloads during IBD.

## Recommendation

Use four payment layers, in this order:

1. Stripe Payment Links for card checkout and accounting.
2. Litecoin as the first self-hosted crypto rail once the LTC node is synced and wired to an explorer/store.
3. BTCPay BTC on-chain after Bitcoin node sync and wallet setup.
4. A separate stablecoin processor only if buyers ask for crypto dollars.

Telegram should stay the VIP/support/delivery layer, not the main checkout system. Telegram Stars can continue inside Telegram-native flows, but website orders should still be reconciled by the site backend.

## Rail Matrix

| Rail | Status | Best Use | Buyer Cost | Operator Cost | Decision |
| --- | --- | --- | --- | --- | --- |
| Stripe | Ready but disabled | Cards, clean accounting, refunds/disputes | Card fees, no blockchain fee | Stripe fees | Primary public checkout when products/legal are ready |
| BTC on-chain via BTCPay | Installed, not wallet-ready | Self-hosted crypto, non-custodial checkout | Low during calm mempool, slower settlement | Bitcoin node, sync, backups | Keep, but do not block launch on BTC |
| LTC node | Installed, syncing | Cheap UTXO payments for buyers | Very low network fee | Separate Litecoin node and explorer | First self-hosted crypto rail to finish |
| USDC on Solana | Planned | Low-fee stablecoin payments | Usually sub-cent network fee, token account edge cases | SHKeeper/Bitcart plus Solana RPC strategy | Best stablecoin rail if self-hosting remains required |
| USDT on TRON | Research | Buyer familiarity, exchange withdrawals | Can be cheap with Energy, expensive without it | Energy/rental/staking strategy and processor support | Later, only if buyers demand TRON |
| TON | Research | Telegram-native audience | Low network fee | Bot/mini-app and wallet ops | Later, if Telegram becomes paid flow |

## Fee Snapshot

This is a snapshot, not a hardcoded rule.

- BTC: mempool.space returned `1 sat/vB` hour/economy and `3 sat/vB` fastest. With a typical 140 vB receive transaction, that is roughly `140-420 sats`, about `0.08-0.23 EUR` at `54,477 EUR/BTC`.
- LTC: litecoinspace returned `1 litoshi/vB`. In practice the network fee is normally far below one euro cent, but running LTC still adds node/explorer operations.
- Solana: Solana base fee is `5,000 lamports` per signature. At `59.49 EUR/SOL`, base fee is roughly `0.0003 EUR`; token account creation/rent can add more in edge cases.
- TRON/TRC20: TRON uses Bandwidth and Energy. Public fee estimates vary, but TRC20 stablecoin transfers are often several TRX without Energy. With `0.28062 EUR/TRX`, `6.5-13 TRX` is roughly `1.82-3.65 EUR`, and fresh-wallet transfers can be higher.

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

Do not bolt USDC/Solana or TRON into the BTC-only BTCPay deployment.

Preferred stablecoin path:

1. Deploy SHKeeper or Bitcart as a separate processor.
2. Use a dedicated subdomain such as `stablepay.markshnaknaks.com`.
3. Store processor API keys and webhook secrets in Kubernetes secrets.
4. Add a site route separate from `/api/checkout/btcpay`.
5. Reconcile incoming invoices in the same orders table.
6. Enable `STABLECOIN_RAIL_READY=true` only after webhook and delivery tests pass.

SHKeeper is attractive for Solana because it supports SOL, USDT, USDC and PYUSD on Solana, but its own documentation notes that it does not automate a Solana full node because of hardware and Docker constraints. Running a real private Solana RPC is heavy; using a public/paid RPC is easier but not fully self-hosted.

Bitcart is lighter and supports stablecoin plugins, including ETH/TRX/BNB/MATIC style rails. It is a better candidate if we want broad coin support without extending the BTC BTCPay stack.

## Operational Rules

- Never publish manual wallet addresses on the public site unless order reconciliation is implemented.
- Keep Stripe as the first launch rail for sales because it is easiest for refunds, accounting and customer support.
- Keep crypto disabled by explicit feature flags. Env vars present do not mean a rail is safe to show.
- Rotate any Stripe secret key that has been pasted into chat or logs.
- Keep private wallet material out of Git, screenshots, chat and Kubernetes manifests.

## Sources

- BTCPay Server General FAQ: https://docs.btcpayserver.org/FAQ/General/
- BTCPay Server Altcoin FAQ: https://docs.btcpayserver.org/FAQ/Altcoin/
- BTCPay Server Altcoin Development: https://docs.btcpayserver.org/Development/Altcoins/
- SHKeeper Solana support note: https://shkeeper.io/news/shkeeper-adds-support-for-solana-network
- Bitcart overview: https://docs.bitcart.ai/
- TRON resource model: https://developers.tron.network/docs/resource-model
- Solana fees: https://solana.com/docs/core/fees
