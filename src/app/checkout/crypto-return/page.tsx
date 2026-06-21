import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";

import { siteConfig } from "@/data/site";

export default async function CryptoReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-rose-950">
      <section className="mx-auto flex min-h-[70vh] max-w-xl items-center">
        <div className="w-full rounded-[2rem] border border-pink-100 bg-white/80 p-6 text-center shadow-[0_24px_80px_rgba(236,72,153,0.12)] backdrop-blur md:p-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-black uppercase text-pink-600">
            Crypto checkout
          </p>
          <h1 className="mt-2 text-3xl font-black">Payment page closed</h1>
          <p className="mt-3 text-sm leading-6 text-rose-950/65">
            If the invoice was paid, the order can now be matched from BTCPay.
            Keep the order reference for support.
          </p>
          {orderId ? (
            <p className="mt-4 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-xs font-bold text-rose-950/70">
              {orderId}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/#access-passes"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              Back to passes
            </Link>
            <a
              href={siteConfig.telegramChatUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-sm font-black text-pink-700 transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-100"
            >
              <Send className="size-4" aria-hidden="true" />
              Telegram support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
