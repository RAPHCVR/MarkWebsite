# Bug: BTCPay BTC node stalled during IBD

> Status: FIXED
> Mode: --deep
> Severity: functional
> Author: Codex
> Last updated: 2026-06-19

## Symptom

BTCPay BTC did not work while Litecoin did: NBXplorer reported BTC `NotStarted` or handshake failures, BTCPay stayed unsynchronized, and Bitcoin Core had almost no network traffic.

## Expected

Bitcoin Core should keep outbound peers, download headers/blocks, answer RPC, and let NBXplorer report BTC as `CoreSynching` during IBD.

## Reproduction

- `kubectl -n btcpay logs btcpay-nbxplorer-0` showed `The node is not in a connected state`.
- `kubectl -n btcpay exec btcpay-bitcoind-0 -- ... getblockchaininfo` timed out on the old volume.
- `/proc/net/dev` in the old BTC pod showed only tens of KB received, while LTC had multiple GB received.

## Hypotheses & Diagnosis

| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| H1 | Cluster/Proxmox blocks BTC port `8333` | Eliminated | A throwaway pod could `nc` public BTC peers on `8333`. |
| H2 | `valence-worker-02` cannot run BTC networking | Eliminated | A clean Bitcoin pod pinned to `valence-worker-02` received about 70 MB and established outbound peers in about 2 minutes. |
| H3 | NBXplorer blocks or saturates Bitcoin Core | Eliminated | With NBXplorer scaled to 0, the old BTC volume still had no useful outbound peers and RPC chain calls timed out. |
| H4 | Old Bitcoin Core chainstate/volume was stalled or pathological | Confirmed | Fresh PVC with the same image/config/node immediately restored peers, RPC, and header sync. |

## Root Cause

The original BTC PVC/chainstate was unhealthy for IBD behavior: it loaded, but Bitcoin Core barely connected to peers, moved blocks extremely slowly, and chain RPC calls timed out. The issue was not Proxmox, Kubernetes egress, the Bitcoin image, or the worker node, because clean pods on the same node worked normally.

## Fix

- Simplified BTC peer configuration in `k8s/btcpay-server.yaml`: removed forced `connect`/manual `addnode` behavior and kept normal DNS peer discovery.
- Reset only peer cache files once: `peers.dat`, `anchors.dat`, `banlist.json`.
- Replaced the old BTC PVC with a fresh `longhorn-blockchain-single` PVC.
- Retained the old PV `pvc-b1e1dd7b-bcdc-492d-9ff4-4ee495881d92` with labels/annotations for rollback.

## Verification

- V-1: Clean BTC pod on `valence-worker-02` established outbound peers and received about 70 MB in about 2 minutes.
- V-2: New production BTC PVC `pvc-9f761ccf-c761-4bfa-831f-4441f1ed578e` is Longhorn healthy with 1 replica.
- V-3: Production BTC pod reached 10+ connections and RPC `getblockchaininfo` returned normally.
- V-4: NBXplorer changed BTC state from `NotStarted` to `CoreSynching`.
- V-5: NBXplorer health returned `Healthy`; BTCPay health returned `{"synchronized":false}`, expected until IBD completes.

## Follow-ups

- Keep BTC checkout disabled until Bitcoin Core finishes IBD and a BTCPay BTC wallet is configured.
- Delete the retained old BTC PV/Longhorn volume only after the fresh node is synced and stable long enough.
