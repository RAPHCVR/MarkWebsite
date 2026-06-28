import Image from "next/image";
import { Heart } from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { siteConfig } from "@/data/site";
import type { SocialLink } from "@/data/socials";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps } from "@/lib/links";

type FooterProps = {
  locale: Locale;
  dictionary: Dictionary;
  socials: SocialLink[];
};

export function Footer({ locale, dictionary, socials }: FooterProps) {
  const legalLinks = [
    { label: dictionary.legalNav.legal, href: localePath(locale, "/legal") },
    { label: dictionary.legalNav.terms, href: localePath(locale, "/terms") },
    { label: dictionary.legalNav.refund, href: localePath(locale, "/refund-policy") },
    { label: dictionary.legalNav.privacy, href: localePath(locale, "/privacy") },
  ];

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-pink-100 bg-white/74 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative size-12 overflow-hidden rounded-2xl border border-pink-200 bg-pink-50 shadow-inner">
                <Image
                  src={siteConfig.logoImage}
                  alt={`${siteConfig.brandName} logo`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <div>
                <p className="font-logo text-3xl text-pink-500">{siteConfig.brandName}</p>
                <p className="text-sm font-bold text-rose-950/60">{dictionary.footer.slogan}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label={dictionary.footer.socialNav}>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                {...getExternalLinkProps(social.href)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-4 py-2.5 text-sm font-bold text-rose-950/72 transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
              >
                <span className="text-[var(--brand-color)]" style={brandIconStyle(social.icon)}>
                  <BrandIcon name={social.icon} className="size-3.5" />
                </span>
                {social.label}
              </a>
            ))}
          </nav>
        </div>

        <nav
          aria-label={dictionary.footer.legalNav}
          className="mt-6 flex flex-wrap gap-2 border-t border-pink-100 pt-5"
        >
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-10 items-center rounded-full border border-pink-100 bg-white/60 px-4 text-xs font-black uppercase tracking-[0.12em] text-rose-950/62 transition hover:border-pink-300 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-5 flex flex-col gap-3 text-sm font-semibold text-rose-950/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Heart className="size-4 text-pink-500" aria-hidden="true" />
            {dictionary.footer.preview}
          </p>
          <p>{dictionary.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
