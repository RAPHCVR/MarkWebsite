import Link from "next/link";

import { LegalContactDetails } from "@/components/site/LegalContactDetails";
import { legalConfig } from "@/data/legal";
import { localeLabels, localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  pathname: string;
  locale: Locale;
  dictionary: Dictionary;
  sections: ReadonlyArray<{
    title: string;
    body: readonly string[];
  }>;
};

const localizedLegalValues: Record<
  Locale,
  {
    vatStatus: string;
    hosting: string;
  }
> = {
  en: {
    vatStatus: "VAT not applicable, article 293 B of the French General Tax Code",
    hosting:
      "Hosted by the publisher with Cloudflare security and storage services.",
  },
  fr: {
    vatStatus: legalConfig.vatStatus,
    hosting:
      "Hébergé par l'éditeur avec services de sécurité et stockage Cloudflare.",
  },
  ru: {
    vatStatus: "НДС не применяется, статья 293 B Налогового кодекса Франции",
    hosting:
      "Размещено издателем с сервисами безопасности и хранения Cloudflare.",
  },
};

export function LegalDocument({
  eyebrow,
  title,
  description,
  pathname,
  locale,
  dictionary,
  sections,
}: LegalDocumentProps) {
  const legalValues = localizedLegalValues[locale];
  const legalLinks = [
    { label: dictionary.legalNav.legal, href: localePath(locale, "/legal") },
    { label: dictionary.legalNav.terms, href: localePath(locale, "/terms") },
    { label: dictionary.legalNav.refund, href: localePath(locale, "/refund-policy") },
    { label: dictionary.legalNav.privacy, href: localePath(locale, "/privacy") },
  ];

  return (
    <main lang={locale} className="min-h-screen bg-[var(--background)] px-4 py-8 text-rose-950 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-pink-100 bg-white/84 p-6 shadow-[0_24px_80px_rgba(236,72,153,0.12)] backdrop-blur sm:p-8">
        <Link
          href={localePath(locale, "/")}
          className="inline-flex min-h-10 items-center rounded-full border border-pink-200 bg-pink-50 px-4 text-sm font-black text-pink-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          {dictionary.legal.back}
        </Link>

        <nav
          aria-label={dictionary.nav.language}
          className="mt-4 flex flex-wrap gap-2"
        >
          {(["en", "fr", "ru"] as const).map((targetLocale) => (
            <Link
              key={targetLocale}
              href={localePath(targetLocale, stripLocale(pathname))}
              hrefLang={targetLocale}
              aria-current={targetLocale === locale ? "page" : undefined}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-pink-100 bg-white/70 px-3 text-xs font-black text-rose-950/62 transition hover:border-pink-300 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 aria-[current=page]:border-pink-500 aria-[current=page]:bg-pink-600 aria-[current=page]:text-white"
              title={localeLabels[targetLocale].native}
            >
              {localeLabels[targetLocale].short}
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-pink-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-black leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-rose-950/68">
          {description}
        </p>
        {locale !== "fr" ? (
          <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm font-bold leading-6 text-amber-800">
            {dictionary.legal.authoritative}
          </p>
        ) : null}

        <div className="mt-8 rounded-3xl border border-pink-100 bg-pink-50/72 p-5">
          <p className="text-sm font-black text-rose-950">
            {dictionary.legal.merchantTitle}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {[
              [dictionary.legal.fields.merchant, legalConfig.merchantName],
              [dictionary.legal.fields.entrepreneur, legalConfig.entrepreneurName],
              [dictionary.legal.fields.siren, legalConfig.siren],
              [dictionary.legal.fields.siret, legalConfig.siret],
              [dictionary.legal.fields.ape, legalConfig.apeCode],
              [dictionary.legal.fields.vat, legalValues.vatStatus],
              [dictionary.legal.fields.address, legalConfig.registeredAddress],
              [dictionary.legal.fields.hosting, legalValues.hosting],
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

        <LegalContactDetails
          labels={dictionary.legal.contactCard}
          formHref={localePath(locale, "/#contact")}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />

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
          aria-label={dictionary.footer.legalNav}
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
