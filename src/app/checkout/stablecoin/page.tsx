import Link from "next/link";
import { Send, WalletCards } from "lucide-react";

import { siteConfig } from "@/data/site";
import { getOrderById, isOrdersDatabaseConfigured } from "@/lib/server/orders";

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

export default async function StablecoinCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order =
    orderId && isOrdersDatabaseConfigured() ? await getOrderById(orderId) : null;
  const invoice = order ? getInvoiceMetadata(order.metadata) : {};
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
            Stablecoin checkout
          </p>
          <h1 className="mt-2 text-center text-3xl font-black">
            Send exactly the invoice amount
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-rose-950/65">
            This address is generated for one order only. After confirmation,
            support can match the payment using the order reference.
          </p>

          {order && invoice.wallet ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-pink-100 bg-pink-50/70 p-4">
                <p className="text-sm font-black text-pink-700">{railLabel}</p>
                <p className="mt-1 text-xs font-bold text-rose-950/58">
                  {cryptoName ? `${cryptoName} rail` : "Stablecoin rail"}
                  {fiatAmount && fiat ? ` · ${fiatAmount} ${fiat}` : ""}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-600">
                  Wallet address
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
                    Amount
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
                Order: {order.orderId}
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50/70 p-5 text-center">
              <p className="text-sm font-black text-rose-950">
                No active stablecoin invoice found.
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-950/60">
                Stablecoin checkout is hidden until the processor and wallets
                pass the production smoke test.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/#photo-packs"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              Back to packs
            </Link>
            <a
              href={siteConfig.telegramChatUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-sm font-black text-pink-700 transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-100"
            >
              <Send className="size-4" aria-hidden="true" />
              Support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
