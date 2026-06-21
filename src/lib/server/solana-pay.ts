import { randomBytes } from "node:crypto";

import { createMerchantClient, encodeURL } from "@solana/pay";
import { address } from "@solana/kit";
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

function getRpcUrl() {
  return process.env.SOLANA_PAY_RPC_URL || "https://api.mainnet-beta.solana.com";
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

function generateReference() {
  return bs58.encode(randomBytes(32));
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
  const rpcUrl = getRpcUrl();
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
    solanaUrl,
    splToken,
  };
}

export async function verifySolanaPayInvoice(invoice: SolanaPayInvoice) {
  const merchant = createMerchantClient({ rpcUrl: invoice.rpcUrl });
  const found = await merchant.pay.findReference(address(invoice.reference), {
    commitment: "confirmed",
    limit: 20,
  });

  await merchant.pay.validateTransfer(
    found.signature,
    {
      recipient: address(invoice.recipient),
      amount: Number(invoice.amount),
      splToken: address(invoice.splToken),
      reference: address(invoice.reference),
    },
    { commitment: "confirmed" },
  );

  return {
    signature: String(found.signature),
    slot: String(found.slot),
    confirmationStatus: found.confirmationStatus,
  };
}
