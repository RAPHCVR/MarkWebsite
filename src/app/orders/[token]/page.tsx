import { CalendarDays, Download, Lock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { getDeliveryByToken, isR2DeliveryConfigured } from "@/lib/server/orders";
import { getTelegramDeliveryLinkUrl } from "@/lib/server/telegram";
import { getExternalLinkProps } from "@/lib/links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Private delivery",
  robots: {
    index: false,
    follow: false,
  },
};

type DeliveryPageProps = {
  params: Promise<{ token: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatBytes(sizeBytes: number | null) {
  if (!sizeBytes) {
    return null;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { token } = await params;
  const delivery = await getDeliveryByToken(token).catch(() => null);

  if (!delivery) {
    notFound();
  }

  const r2Ready = isR2DeliveryConfigured();

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFECEE,#FFE0E6_48%,#FFECEE)] px-4 py-8 text-rose-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/78 px-4 py-2 text-sm font-black text-pink-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          <span
            className="flex size-5 items-center justify-center text-[var(--brand-color)]"
            style={brandIconStyle("telegram")}
          >
            <BrandIcon name="telegram" className="size-4" />
          </span>
          Back to Marky
        </Link>

        <section className="rounded-[2rem] border border-pink-100 bg-white/82 p-5 shadow-[0_26px_80px_rgba(236,72,153,0.14)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">
                Private delivery
              </p>
              <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-rose-950 sm:text-5xl">
                {delivery.productTitle || "Your access pass"}
              </h1>
              <p className="mt-4 text-base leading-7 text-rose-950/68">
                This private page is tied to a confirmed order. Keep the link
                for yourself; downloads are generated as short-lived private links.
              </p>
            </div>

            <div className="rounded-3xl border border-pink-100 bg-pink-50/70 p-4 text-sm font-bold text-rose-950/70">
              <div className="flex items-center gap-2 text-pink-700">
                <CalendarDays className="size-4" aria-hidden="true" />
                Link expires
              </div>
              <p className="mt-2 text-lg font-black text-rose-950">
                {formatDate(delivery.expiresAt)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Order", delivery.order.provider.toUpperCase()],
              ["Status", delivery.order.status],
              ["Delivery", r2Ready ? "Private storage" : "Preparing"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-3xl border border-pink-100 bg-white/78 p-4 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
                  {label}
                </p>
                <p className="mt-2 text-base font-black text-rose-950">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-rose-950">Secure assets</h2>

            {delivery.assets.length ? (
              <div className="mt-4 grid gap-3">
                {delivery.assets.map((asset) => (
                  <article
                    key={asset.assetId}
                    className="flex flex-col gap-4 rounded-3xl border border-pink-100 bg-white/78 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-black text-rose-950">
                        {asset.title}
                      </h3>
                      {asset.description ? (
                        <p className="mt-1 text-sm leading-6 text-rose-950/62">
                          {asset.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-pink-500">
                        {formatBytes(asset.sizeBytes) || "Private asset"}
                      </p>
                    </div>

                    {r2Ready ? (
                      <a
                        href={`/api/delivery/assets/${encodeURIComponent(
                          asset.assetId,
                        )}?token=${encodeURIComponent(token)}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.24)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
                      >
                        <Download className="size-4" aria-hidden="true" />
                        Download
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-200 px-5 text-sm font-black text-pink-800 opacity-70"
                      >
                        <Download className="size-4" aria-hidden="true" />
                        Pending
                      </button>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-pink-200 bg-pink-50/70 p-5">
                <div className="flex size-11 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
                  <Lock className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-black text-rose-950">
                  Delivery is being prepared.
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-950/65">
                  The payment and access are recorded. Support can attach the
                  final delivery files to this access pass without changing your
                  private link.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-pink-100 bg-white/72 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-rose-950">Telegram concierge</p>
              <p className="text-sm text-rose-950/62">
                Link this access pass to Telegram for support and private request tickets.
              </p>
            </div>
            <a
              href={getTelegramDeliveryLinkUrl(token)}
              {...getExternalLinkProps(getTelegramDeliveryLinkUrl(token))}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-5 text-sm font-black text-pink-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Link Telegram
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
