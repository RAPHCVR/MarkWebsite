import { randomBytes } from "node:crypto";

import { encodeURL, validateTransfer } from "@solana/pay";
import { address, createSolanaRpc } from "@solana/kit";
import bs58 from "bs58";

import type { Product } from "@/data/products";

export const SOLANA_MAINNET_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type SolanaPayInvoice = {
  amount: string;
  createdAt: string;
  expiresAt: string;
  exchangeRate?: string;
  exchangeRateAsOf?: string;
  exchangeRateSource?: string;
  memo: string;
  recipient: string;
  reference: string;
  rpcUrl: string;
  rpcUrls: string[];
  solanaUrl: string;
  splToken: string;
};

type EurToUsdRate = {
  asOf?: string;
  rate: number;
  source: string;
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

function getInvoiceTtlMinutes() {
  const ttlMinutes = Number(process.env.SOLANA_PAY_INVOICE_TTL_MINUTES || "30");

  if (!Number.isFinite(ttlMinutes)) {
    return 30;
  }

  return Math.min(24 * 60, Math.max(5, Math.floor(ttlMinutes)));
}

function generateReference() {
  return bs58.encode(randomBytes(32));
}

function getConfiguredEurToUsdRate(): EurToUsdRate | null {
  const rate = Number(process.env.STABLECOIN_EUR_TO_USD_RATE);

  if (!Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  return {
    rate,
    source: "env:STABLECOIN_EUR_TO_USD_RATE",
  };
}

async function getFrankfurterEurToUsdRate(): Promise<EurToUsdRate> {
  const timeoutMs = Number(
    process.env.STABLECOIN_RATE_FETCH_TIMEOUT_MS || "3000",
  );
  const response = await fetch(
    "https://api.frankfurter.app/latest?from=EUR&to=USD",
    {
      cache: "no-store",
      signal: AbortSignal.timeout(
        Number.isFinite(timeoutMs) && timeoutMs >= 1000 ? timeoutMs : 3000,
      ),
    },
  );

  if (!response.ok) {
    throw new Error(`Frankfurter returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    date?: string;
    rates?: {
      USD?: unknown;
    };
  };
  const rate = Number(payload.rates?.USD);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Frankfurter did not return a usable EUR/USD rate");
  }

  return {
    rate,
    source: "frankfurter-ecb",
    asOf: payload.date,
  };
}

async function getEurToUsdRate(): Promise<EurToUsdRate> {
  const configuredRate = getConfiguredEurToUsdRate();
  const source = process.env.STABLECOIN_EUR_TO_USD_RATE_SOURCE;

  if (source === "frankfurter" || source === "auto") {
    try {
      return await getFrankfurterEurToUsdRate();
    } catch {
      if (configuredRate) {
        return {
          ...configuredRate,
          source: `${configuredRate.source}:fallback`,
        };
      }

      throw new Error("EUR/USD rate source is unavailable");
    }
  }

  if (configuredRate) {
    return configuredRate;
  }

  return getFrankfurterEurToUsdRate();
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

export async function getSolanaPayAmount(product: Product) {
  if (product.currency !== "EUR") {
    throw new Error(`Solana Pay cannot price ${product.currency}`);
  }

  const rate = await getEurToUsdRate();

  return {
    amount: ((product.amountCents / 100) * rate.rate).toFixed(2),
    rate,
  };
}

export async function createSolanaPayInvoice({
  orderId,
  product,
}: {
  orderId: string;
  product: Product;
}): Promise<SolanaPayInvoice> {
  const { amount, rate } = await getSolanaPayAmount(product);
  const recipient = getRecipient();
  const reference = generateReference();
  const splToken = getUsdcMint();
  const memo = orderId;
  const rpcUrls = getSolanaPayRpcUrls();
  const rpcUrl = rpcUrls[0];
  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + getInvoiceTtlMinutes() * 60_000,
  );
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
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    exchangeRate: rate.rate.toString(),
    exchangeRateAsOf: rate.asOf,
    exchangeRateSource: rate.source,
    memo,
    recipient,
    reference,
    rpcUrl,
    rpcUrls,
    solanaUrl,
    splToken,
  };
}

export function isSolanaPayInvoiceExpired(invoice: SolanaPayInvoice) {
  const expiresAt = Date.parse(invoice.expiresAt);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  return Date.now() > expiresAt;
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

      const transferErrors: string[] = [];

      for (const candidate of signatures) {
        try {
          await withTimeout(
            validateTransfer(
              rpc,
              candidate.signature,
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
            signature: String(candidate.signature),
            slot: String(candidate.slot),
            confirmationStatus: candidate.confirmationStatus,
            rpcUrl,
          };
        } catch (error) {
          transferErrors.push(
            `${String(candidate.signature)}: ${
              error instanceof Error ? error.message : "unknown error"
            }`,
          );
        }
      }

      throw new Error(
        `No valid transfer found for reference: ${transferErrors.join("; ")}`,
      );
    } catch (error) {
      errors.push(
        `${rpcUrl}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  throw new Error(`Solana Pay verification failed: ${errors.join("; ")}`);
}
