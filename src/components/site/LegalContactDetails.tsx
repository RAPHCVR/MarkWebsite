"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";

type LegalContactDetailsProps = {
  emailLocalPart: string;
  emailDomain: string;
  labels: {
    title: string;
    form: string;
    email: string;
    revealEmail: string;
    phone: string;
    routing: string;
  };
  formHref: string;
  phoneLabel: string;
  phoneHref: string;
  routingLabel: string;
};

export function LegalContactDetails({
  emailLocalPart,
  emailDomain,
  labels,
  formHref,
  phoneLabel,
  phoneHref,
  routingLabel,
}: LegalContactDetailsProps) {
  const [revealed, setRevealed] = useState(false);
  const email = useMemo(
    () => `${emailLocalPart}@${emailDomain}`,
    [emailDomain, emailLocalPart],
  );

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
            {labels.email}
          </dt>
          <dd className="mt-2">
            {revealed ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
              >
                <Mail className="size-4" aria-hidden="true" />
                {email}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
              >
                <Mail className="size-4" aria-hidden="true" />
                {labels.revealEmail}
              </button>
            )}
          </dd>
        </div>

        <div className="rounded-2xl bg-pink-50/72 p-3">
          <dt className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            {labels.phone}
          </dt>
          <dd className="mt-2">
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex min-h-10 items-center rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {phoneLabel}
            </a>
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
