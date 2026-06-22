import Image from "next/image";
import { Crown, Menu, ShoppingBag } from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { paymentConfig } from "@/data/payments";
import { siteConfig } from "@/data/site";
import { localeLabels, localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps } from "@/lib/links";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const currentPath = "/";

  const navItems: [string, string][] = [
    [dictionary.nav.home, "#top"],
    [dictionary.nav.passes, "#access-passes"],
    [dictionary.nav.socials, "#socials"],
    [dictionary.nav.lookbook, "#lookbook"],
    [dictionary.nav.collab, "#contact"],
  ];

  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-rose-950/10 bg-[#FCF7F1]/85 px-3 shadow-[0_14px_40px_rgba(63,10,30,0.08)] backdrop-blur-xl sm:px-5">
        <a
          href="#top"
          className="flex min-h-11 min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/30"
          aria-label="Mark home"
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-rose-950/10 bg-mark-50 shadow-inner">
            <Image
              src={siteConfig.logoImage}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </span>
          <span className="min-w-0 max-[359px]:hidden">
            <span className="block truncate font-logo text-2xl leading-none text-mark-cta sm:text-3xl">
              {siteConfig.brandName}
            </span>
            <span className="hidden truncate text-[11px] font-bold uppercase tracking-[0.18em] text-rose-950/55 min-[360px]:block">
              {siteConfig.handle}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm font-bold text-rose-950/75 transition hover:bg-mark-50 hover:text-mark-cta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-rose-950/10 bg-white/70 p-1" aria-label={dictionary.nav.language}>
            {(["en", "fr", "ru"] as const).map((targetLocale) => (
              <a
                key={targetLocale}
                href={localePath(targetLocale, stripLocale(currentPath))}
                hrefLang={targetLocale}
                aria-current={targetLocale === locale ? "page" : undefined}
                className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-bold text-rose-950/65 transition hover:bg-mark-50 hover:text-mark-cta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25 aria-[current=page]:bg-mark-cta aria-[current=page]:text-white sm:min-h-9 sm:min-w-9 sm:text-xs"
                title={localeLabels[targetLocale].native}
              >
                {localeLabels[targetLocale].short}
              </a>
            ))}
          </div>
          <a
            href={siteConfig.instagramUrl}
            {...getExternalLinkProps(siteConfig.instagramUrl)}
            aria-label="Open Instagram"
            className="hidden size-11 items-center justify-center rounded-full border border-rose-950/10 bg-white/70 text-[var(--brand-color)] transition hover:border-mark-cta/40 hover:bg-mark-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25 lg:flex"
            style={brandIconStyle("instagram")}
          >
            <BrandIcon name="instagram" className="size-4" />
          </a>
          <a
            href={paymentConfig.telegram.channelUrl}
            {...getExternalLinkProps(paymentConfig.telegram.channelUrl)}
            aria-label="Open Telegram channel"
            className="hidden size-11 items-center justify-center rounded-full border border-rose-950/10 bg-white/70 text-[var(--brand-color)] transition hover:border-mark-cta/40 hover:bg-mark-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25 lg:flex"
            style={brandIconStyle("telegram")}
          >
            <BrandIcon name="telegram" className="size-4" />
          </a>
          <a
            href={paymentConfig.telegram.vipUrl}
            {...getExternalLinkProps(paymentConfig.telegram.vipUrl)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-mark-cta px-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(200,13,91,0.28)] transition hover:bg-[#a80a4c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/30"
          >
            <ShoppingBag className="size-4 sm:hidden" aria-hidden="true" />
            <Crown className="hidden size-4 sm:block" aria-hidden="true" />
            <span className="hidden sm:inline">{dictionary.nav.joinVip}</span>
            <span className="sm:hidden">{dictionary.nav.vipShort}</span>
          </a>

          <details className="group relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-rose-950/10 bg-white/70 text-rose-950/75 transition hover:border-mark-cta/40 hover:bg-mark-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25 [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
              <span className="sr-only">Menu</span>
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-[calc(100%+0.6rem)] w-56 rounded-2xl border border-rose-950/10 bg-[#FCF7F1] p-2 shadow-[0_20px_50px_rgba(63,10,30,0.16)]"
            >
              {navItems.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-rose-950/80 transition hover:bg-mark-50 hover:text-mark-cta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
                >
                  {label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
