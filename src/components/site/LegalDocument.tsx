import Link from "next/link";

import { legalConfig, legalLinks } from "@/data/legal";

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
};

export function LegalDocument({
  eyebrow,
  title,
  description,
  sections,
}: LegalDocumentProps) {
  return (
    <main lang="fr" className="min-h-screen bg-[var(--background)] px-4 py-8 text-rose-950 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-pink-100 bg-white/84 p-6 shadow-[0_24px_80px_rgba(236,72,153,0.12)] backdrop-blur sm:p-8">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-full border border-pink-200 bg-pink-50 px-4 text-sm font-black text-pink-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          Retour au site
        </Link>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-pink-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-black leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-rose-950/68">
          {description}
        </p>

        <div className="mt-8 rounded-3xl border border-pink-100 bg-pink-50/72 p-5">
          <p className="text-sm font-black text-rose-950">
            Merchant of Record
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Merchant", legalConfig.merchantName],
              ["Entrepreneur", legalConfig.entrepreneurName],
              ["SIREN", legalConfig.siren],
              ["SIRET", legalConfig.siret],
              ["APE", legalConfig.apeCode],
              ["TVA", legalConfig.vatStatus],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/72 p-3">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-pink-500">
                  {label}
                </dt>
                <dd className="mt-1 font-bold text-rose-950/74">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-black text-rose-950">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-rose-950/68">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav
          aria-label="Legal navigation"
          className="mt-10 flex flex-wrap gap-2 border-t border-pink-100 pt-6"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-10 items-center rounded-full border border-pink-100 bg-white/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-rose-950/62 transition hover:border-pink-300 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </article>
    </main>
  );
}
