"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, MessageCircle } from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { siteConfig } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries";

type TelegramWebApp = {
  initData?: string;
  expand?: () => void;
  ready?: () => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

type TelegramAsset = {
  assetId: string;
  title: string;
  description: string | null;
  sizeBytes: number | null;
  downloadUrl: string;
};

type TelegramPass = {
  orderId: string;
  productTitle: string | null;
  provider: string;
  status: string;
  expiresAt: string;
  deliveryUrl: string;
  assets: TelegramAsset[];
};

type PassesResponse = {
  ok?: boolean;
  error?: string;
  passes?: TelegramPass[];
};

type TelegramOrdersAppProps = {
  labels: Dictionary["telegramOrders"];
};

function formatBytes(sizeBytes: number | null, fallback: string) {
  if (!sizeBytes) {
    return fallback;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TelegramOrdersApp({ labels }: TelegramOrdersAppProps) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "outside-telegram" }
    | { status: "error"; message: string }
    | { status: "ready"; passes: TelegramPass[] }
  >({ status: "loading" });

  useEffect(() => {
    const webApp = (window as TelegramWindow).Telegram?.WebApp;

    webApp?.ready?.();
    webApp?.expand?.();

    if (!webApp?.initData) {
      window.setTimeout(() => {
        setState({ status: "outside-telegram" });
      }, 0);
      return;
    }

    fetch("/api/telegram/webapp/passes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: webApp.initData }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as PassesResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || labels.loadError);
        }

        setState({ status: "ready", passes: payload.passes || [] });
      })
      .catch((error: unknown) => {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : labels.loadError,
        });
      });
  }, [labels.loadError]);

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 text-rose-950">
      <div className="rounded-[2rem] border border-pink-100 bg-white/82 p-5 shadow-[0_26px_80px_rgba(236,72,153,0.14)] backdrop-blur">
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-2xl bg-white text-[var(--brand-color)] shadow-sm"
            style={brandIconStyle("telegram")}
          >
            <BrandIcon name="telegram" className="size-7" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">
              {labels.eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-black text-rose-950">
              {labels.title}
            </h1>
          </div>
        </div>

        {state.status === "loading" ? (
          <div className="mt-8 flex items-center gap-3 rounded-3xl border border-pink-100 bg-pink-50/70 p-4 text-sm font-bold text-rose-950/70">
            <Loader2 className="size-5 animate-spin text-pink-600" aria-hidden="true" />
            {labels.loading}
          </div>
        ) : null}

        {state.status === "outside-telegram" ? (
          <div className="mt-8 rounded-3xl border border-pink-100 bg-pink-50/70 p-5">
            <h2 className="text-xl font-black text-rose-950">
              {labels.outsideTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-rose-950/65">
              {labels.outsideBody}
            </p>
            <a
              href={`https://t.me/${siteConfig.handle.replace("@", "")}bot`}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {labels.openBot}
            </a>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-5">
            <h2 className="text-xl font-black text-red-800">
              {labels.errorTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-800/75">
              {state.message}
            </p>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <div className="mt-8">
            {state.passes.length ? (
              <div className="grid gap-4">
                {state.passes.map((pass) => (
                  <article
                    key={pass.orderId}
                    className="rounded-3xl border border-pink-100 bg-white/78 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-black text-rose-950">
                          {pass.productTitle || labels.defaultPassTitle}
                        </h2>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-pink-500">
                          {pass.provider.toUpperCase()} · {pass.status}
                        </p>
                      </div>
                      <p className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-700">
                        {labels.expires} {formatDate(pass.expiresAt)}
                      </p>
                    </div>

                    {pass.assets.length ? (
                      <div className="mt-4 grid gap-2">
                        {pass.assets.map((asset) => (
                          <a
                            key={asset.assetId}
                            href={asset.downloadUrl}
                            className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-sm font-black text-pink-700 transition hover:bg-white"
                          >
                            <span>
                              {asset.title}
                              <span className="ml-2 text-xs font-bold text-rose-950/50">
                                {formatBytes(asset.sizeBytes, labels.privateAsset)}
                              </span>
                            </span>
                            <Download className="size-4" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-2xl border border-dashed border-pink-200 bg-pink-50/70 p-3 text-sm font-bold text-rose-950/62">
                        {labels.emptyAssets}
                      </p>
                    )}

                    <a
                      href={pass.deliveryUrl}
                      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-sm font-black text-pink-700"
                    >
                      {labels.openSecurePage}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-pink-100 bg-pink-50/70 p-5">
                <h2 className="text-xl font-black text-rose-950">
                  {labels.noPassTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-rose-950/65">
                  {labels.noPassBody}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
