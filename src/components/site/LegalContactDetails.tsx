"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Phone } from "lucide-react";
import Script from "next/script";

type LegalContactDetailsProps = {
  labels: {
    title: string;
    form: string;
    email: string;
    revealEmail: string;
    phone: string;
    routing: string;
    revealLoading: string;
    revealVerify: string;
    revealError: string;
  };
  formHref: string;
  routingLabel: string;
  turnstileSiteKey?: string;
};

type RevealedContact = {
  email: string;
  phoneLabel?: string | null;
  phoneHref?: string | null;
};

export function LegalContactDetails({
  labels,
  formHref,
  routingLabel,
  turnstileSiteKey,
}: LegalContactDetailsProps) {
  const [contact, setContact] = useState<RevealedContact | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "verify" | "error">("idle");

  async function revealContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const payload = new FormData(form);

    try {
      const response = await fetch("/api/legal-contact", {
        method: "POST",
        body: payload,
      });

      if (response.status === 403) {
        setStatus("verify");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const data = (await response.json()) as RevealedContact;

      setContact(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-pink-100 bg-white/72 p-5">
      <p className="text-sm font-black text-rose-950">{labels.title}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-pink-50/72 p-3">
          <dt className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            {labels.form}
          </dt>
          <dd className="mt-2">
            <a
              href={formHref}
              className="inline-flex min-h-10 items-center rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {labels.form}
            </a>
          </dd>
        </div>

        <div className="rounded-2xl bg-pink-50/72 p-3">
          <dt className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            {labels.email} / {labels.phone}
          </dt>
          <dd className="mt-2">
            {contact ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {contact.email}
                </a>
                {contact.phoneLabel && contact.phoneHref ? (
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {contact.phoneLabel}
                  </a>
                ) : null}
              </div>
            ) : (
              <form className="space-y-3" onSubmit={revealContact}>
                {turnstileSiteKey ? (
                  <>
                    <Script
                      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                      strategy="lazyOnload"
                    />
                    <div
                      className="cf-turnstile"
                      data-sitekey={turnstileSiteKey}
                      data-theme="light"
                      data-size="compact"
                    />
                  </>
                ) : null}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 disabled:cursor-wait disabled:opacity-70"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {status === "loading" ? labels.revealLoading : labels.revealEmail}
                </button>
                {status === "verify" ? (
                  <p className="text-xs font-bold leading-5 text-rose-950/64">
                    {labels.revealVerify}
                  </p>
                ) : null}
                {status === "error" ? (
                  <p className="text-xs font-bold leading-5 text-rose-950/64">
                    {labels.revealError}
                  </p>
                ) : null}
              </form>
            )}
          </dd>
        </div>

        <div className="rounded-2xl bg-pink-50/72 p-3">
          <dt className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            {labels.routing}
          </dt>
          <dd className="mt-1 font-bold leading-6 text-rose-950/74">
            {routingLabel}
          </dd>
        </div>
      </dl>
    </div>
  );
}
