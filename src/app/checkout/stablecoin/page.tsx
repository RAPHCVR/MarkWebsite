import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Send, WalletCards } from "lucide-react";
import QRCode from "qrcode";

import { siteConfig } from "@/data/site";
import { localePath } from "@/i18n/config";
import { getRequestDictionary } from "@/i18n/server";
import { getOrderById, isOrdersDatabaseConfigured } from "@/lib/server/orders";
import {
  isSolanaPayInvoiceExpired,
  type SolanaPayInvoice,
} from "@/lib/server/solana-pay";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getRequestDictionary();

  return {
    title: dictionary.checkout.stablecoin.metadataTitle,
  };
}

function getInvoiceMetadata(metadata: Record<string, unknown>) {
  const invoice = metadata.shkeeperInvoice;

  if (!invoice || typeof invoice !== "object") {
    return {};
  }

  return invoice as {
    amount?: string;
    displayName?: string;
    exchangeRate?: string;
    wallet?: string;
  };
}

function getSolanaPayInvoice(metadata: Record<string, unknown>) {
  const invoice = metadata.solanaPayInvoice;

  if (!invoice || typeof invoice !== "object") {
    return null;
  }

  const candidate = invoice as Partial<SolanaPayInvoice>;

  if (
    !candidate.amount ||
    !candidate.recipient ||
    !candidate.reference ||
    !candidate.solanaUrl ||
    !candidate.splToken
  ) {
    return null;
  }

  return candidate as SolanaPayInvoice;
}

export default async function StablecoinCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    expired?: string;
    orderId?: string;
    pending?: string;
    verified?: string;
  }>;
}) {
  const { locale, dictionary } = await getRequestDictionary();
  const labels = dictionary.checkout.stablecoin;
  const { expired, orderId, pending, verified } = await searchParams;
  const order =
    orderId && isOrdersDatabaseConfigured() ? await getOrderById(orderId) : null;
  const invoice = order ? getInvoiceMetadata(order.metadata) : {};
  const solanaPayInvoice = order ? getSolanaPayInvoice(order.metadata) : null;
  const isExpired =
    Boolean(solanaPayInvoice) &&
    order?.status !== "PAID" &&
    isSolanaPayInvoiceExpired(solanaPayInvoice as SolanaPayInvoice);
  const qrCode = solanaPayInvoice && !isExpired
    ? await QRCode.toDataURL(solanaPayInvoice.solanaUrl, {
        margin: 1,
        scale: 8,
        color: {
          dark: "#3f1029",
          light: "#fff7fb",
        },
      })
    : null;
  const railLabel =
    typeof order?.metadata.railLabel === "string"
      ? order.metadata.railLabel
      : "Stablecoin";
  const cryptoName =
    typeof order?.metadata.cryptoName === "string"
      ? order.metadata.cryptoName
      : undefined;
  const fiatAmount =
    typeof order?.metadata.fiatAmount === "string"
      ? order.metadata.fiatAmount
      : undefined;
  const fiat =
    typeof order?.metadata.fiat === "string" ? order.metadata.fiat : undefined;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-rose-950">
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <div className="w-full rounded-[2rem] border border-pink-100 bg-white/82 p-6 shadow-[0_24px_80px_rgba(236,72,153,0.12)] backdrop-blur md:p-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <WalletCards className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-center text-sm font-black uppercase text-pink-600">
            {labels.eyebrow}
          </p>
          <h1 className="mt-2 text-center text-3xl font-black">
            {solanaPayInvoice ? labels.solanaTitle : labels.invoiceTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-rose-950/65">
            {solanaPayInvoice
              ? labels.solanaDescription
              : labels.invoiceDescription}
          </p>

          {verified ? (
            <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-center text-sm font-black text-emerald-700">
              {labels.verified}
            </div>
          ) : null}
          {pending ? (
            <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-center text-sm font-black text-amber-700">
              {labels.pending}
            </div>
          ) : null}
          {expired || isExpired ? (
            <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">
              {labels.expired}
            </div>
          ) : null}

          {order && solanaPayInvoice && !isExpired ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-pink-100 bg-pink-50/70 p-4">
                <p className="text-sm font-black text-pink-700">{railLabel}</p>
                <p className="mt-1 text-xs font-bold text-rose-950/58">
                  USDC on Solana · {solanaPayInvoice.amount} USDC
                </p>
              </div>

              {qrCode ? (
                <div className="rounded-[2rem] border border-pink-100 bg-white p-4 shadow-inner">
                  <Image
                    alt={`${labels.qrAlt} ${order.orderId}`}
                    height={256}
                    src={qrCode}
                    unoptimized
                    width={256}
                    className="mx-auto size-64 max-w-full rounded-3xl"
                  />
                </div>
              ) : null}

              <a
                href={solanaPayInvoice.solanaUrl}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-pink-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
              >
                {labels.openWallet}
              </a>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                  {labels.solanaPayUrl}
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-3xl border border-pink-100 bg-white p-4 text-xs font-bold leading-5 text-rose-950 shadow-inner outline-none"
                  readOnly
                  value={solanaPayInvoice.solanaUrl}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-pink-100 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                    {labels.amount}
                  </p>
                  <p className="mt-1 text-2xl font-black text-rose-950">
                    {solanaPayInvoice.amount} USDC
                  </p>
                </div>
                {solanaPayInvoice.exchangeRate ? (
                  <div className="rounded-3xl border border-pink-100 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                      {labels.rate}
                    </p>
                    <p className="mt-1 text-lg font-black text-rose-950">
                      1 EUR = {solanaPayInvoice.exchangeRate} USD
                    </p>
                    <p className="mt-1 text-xs font-bold text-rose-950/55">
                      {solanaPayInvoice.exchangeRateSource || labels.invoiceRate}
                      {solanaPayInvoice.exchangeRateAsOf
                        ? ` · ${solanaPayInvoice.exchangeRateAsOf}`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-pink-100 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                      {labels.status}
                    </p>
                    <p className="mt-1 text-2xl font-black text-rose-950">
                      {order.status === "PAID" ? labels.paid : labels.waiting}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-pink-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                  {labels.expires}
                </p>
                <p className="mt-1 text-sm font-black text-rose-950">
                  {solanaPayInvoice.expiresAt
                    ? new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Europe/Paris",
                      }).format(new Date(solanaPayInvoice.expiresAt))
                    : labels.expiresFallback}
                </p>
              </div>

              <p className="break-all rounded-2xl border border-pink-100 bg-white px-4 py-3 text-xs font-bold text-rose-950/70">
                {labels.reference}: {solanaPayInvoice.reference}
              </p>
              <p className="rounded-2xl border border-pink-100 bg-white px-4 py-3 text-xs font-bold text-rose-950/70">
                {labels.order}: {order.orderId}
              </p>

              <form method="post" action="/api/checkout/stablecoin/verify">
                <input type="hidden" name="orderId" value={order.orderId} />
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-emerald-200 bg-white px-5 text-sm font-black text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                >
                  {labels.verify}
                </button>
              </form>
            </div>
          ) : order && solanaPayInvoice && isExpired ? (
            <div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50/70 p-5 text-center">
              <p className="text-sm font-black text-rose-950">
                {labels.expiredTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-950/60">
                {labels.expiredBody}
              </p>
            </div>
          ) : order && invoice.wallet ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-pink-100 bg-pink-50/70 p-4">
                <p className="text-sm font-black text-pink-700">{railLabel}</p>
                <p className="mt-1 text-xs font-bold text-rose-950/58">
                  {cryptoName ? `${cryptoName} ${labels.stablecoinRail}` : labels.stablecoinRail}
                  {fiatAmount && fiat ? ` · ${fiatAmount} ${fiat}` : ""}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                  {labels.walletAddress}
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-3xl border border-pink-100 bg-white p-4 text-sm font-bold leading-6 text-rose-950 shadow-inner outline-none"
                  readOnly
                  value={invoice.wallet}
                />
              </label>

              {invoice.amount ? (
                <div className="rounded-3xl border border-pink-100 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                    {labels.amount}
                  </p>
                  <p className="mt-1 text-2xl font-black text-rose-950">
                    {invoice.amount}
                  </p>
                  {invoice.displayName ? (
                    <p className="mt-1 text-sm font-bold text-rose-950/60">
                      {invoice.displayName}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <p className="rounded-2xl border border-pink-100 bg-white px-4 py-3 text-xs font-bold text-rose-950/70">
                {labels.order}: {order.orderId}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50/70 p-5 text-center">
              <p className="text-sm font-black text-rose-950">
                {labels.noInvoiceTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-950/60">
                {labels.noInvoiceBody}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={localePath(locale, "/#access-passes")}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {labels.backToPasses}
            </Link>
            <a
              href={siteConfig.telegramChatUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-sm font-black text-pink-700 transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-100"
            >
              <Send className="size-4" aria-hidden="true" />
              {labels.support}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
