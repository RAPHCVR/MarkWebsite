import { randomBytes } from "node:crypto";

import { encodeURL, validateTransfer } from "@solana/pay";
import { address, createSolanaRpc } from "@solana/kit";
import bs58 from "bs58";

import type { Product } from "@/data/products";

export const SOLANA_MAINNET_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type SolanaPayInvoice = {
  amount: string;
  memo: string;
  recipient: string;
  reference: string;
  rpcUrl: string;
  rpcUrls: string[];
  solanaUrl: string;
  splToken: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function dedupe(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function getSolanaPayRpcUrls() {
  const configuredUrls = dedupe([
    ...(process.env.SOLANA_PAY_RPC_URLS || "").split(","),
    process.env.SOLANA_PAY_RPC_URL || "",
  ]);

  return configuredUrls.length
    ? configuredUrls
    : ["https://api.mainnet-beta.solana.com"];
}

function getRecipient() {
  return requiredEnv("SOLANA_PAY_RECIPIENT");
}

function getUsdcMint() {
  return (
    process.env.SOLANA_PAY_USDC_MINT ||
    process.env.STABLECOIN_USDC_SOLANA_MINT ||
    SOLANA_MAINNET_USDC_MINT
  );
}

function getVerifyTimeoutMs() {
  const timeoutMs = Number(process.env.SOLANA_PAY_VERIFY_TIMEOUT_MS || "8000");

  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
    return 8000;
  }

  return timeoutMs;
}

function generateReference() {
  return bs58.encode(randomBytes(32));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

export function getSolanaPayAmount(product: Product) {
  if (product.currency !== "EUR") {
    throw new Error(`Solana Pay cannot price ${product.currency}`);
  }

  const rate = Number(requiredEnv("STABLECOIN_EUR_TO_USD_RATE"));

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("STABLECOIN_EUR_TO_USD_RATE must be a positive number");
  }

  return ((product.amountCents / 100) * rate).toFixed(2);
}

export function createSolanaPayInvoice({
  orderId,
  product,
}: {
  orderId: string;
  product: Product;
}): SolanaPayInvoice {
  const amount = getSolanaPayAmount(product);
  const recipient = getRecipient();
  const reference = generateReference();
  const splToken = getUsdcMint();
  const memo = orderId;
  const rpcUrls = getSolanaPayRpcUrls();
  const rpcUrl = rpcUrls[0];
  const solanaUrl = encodeURL({
    recipient: address(recipient),
    amount: Number(amount),
    splToken: address(splToken),
    reference: address(reference),
    label: "Marky",
    message: product.title,
    memo,
  }).toString();

  return {
    amount,
    memo,
    recipient,
    reference,
    rpcUrl,
    rpcUrls,
    solanaUrl,
    splToken,
  };
}

export async function verifySolanaPayInvoice(invoice: SolanaPayInvoice) {
  const rpcUrls = dedupe([
    ...(invoice.rpcUrls || []),
    invoice.rpcUrl,
    ...getSolanaPayRpcUrls(),
  ]);
  const timeoutMs = getVerifyTimeoutMs();
  const errors: string[] = [];

  for (const rpcUrl of rpcUrls) {
    try {
      const rpc = createSolanaRpc(rpcUrl);
      const abortSignal = AbortSignal.timeout(timeoutMs);
      const signatures = await rpc
        .getSignaturesForAddress(address(invoice.reference), {
          commitment: "confirmed",
          limit: 20,
        })
        .send({ abortSignal });

      if (!signatures.length) {
        throw new Error("Solana Pay reference not found");
      }

      const found = signatures[signatures.length - 1];

      await withTimeout(
        validateTransfer(
          rpc,
          found.signature,
          {
            recipient: address(invoice.recipient),
            amount: Number(invoice.amount),
            splToken: address(invoice.splToken),
            reference: address(invoice.reference),
          },
          { commitment: "confirmed" },
        ),
        timeoutMs,
        "Solana Pay transfer validation",
      );

      return {
        signature: String(found.signature),
        slot: String(found.slot),
        confirmationStatus: found.confirmationStatus,
        rpcUrl,
      };
    } catch (error) {
      errors.push(
        `${rpcUrl}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  throw new Error(`Solana Pay verification failed: ${errors.join("; ")}`);
}
