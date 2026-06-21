import Image from "next/image";
import { Crown, ShoppingBag } from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { paymentConfig } from "@/data/payments";
import { siteConfig } from "@/data/site";
import { getExternalLinkProps } from "@/lib/links";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-[1.75rem] border border-white/80 bg-white/78 px-4 shadow-[0_18px_50px_rgba(190,24,93,0.12)] backdrop-blur-xl sm:px-5">
        <a
          href="#top"
          className="flex min-h-11 min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
          aria-label="Mark home"
        >
          <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl border border-pink-200 bg-pink-50 shadow-inner">
            <Image
              src={siteConfig.logoImage}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-logo text-2xl leading-none text-pink-500 sm:text-3xl">
              {siteConfig.brandName}
            </span>
            <span className="hidden truncate text-xs font-bold text-rose-950/58 min-[360px]:block">
              Your Kitten Master
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {[
            ["Home", "#top"],
            ["Passes", "#access-passes"],
            ["Socials", "#socials"],
            ["Lookbook", "#lookbook"],
            ["Collab", "#contact"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-black text-rose-950/70 transition hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.instagramUrl}
            {...getExternalLinkProps(siteConfig.instagramUrl)}
            aria-label="Open Instagram"
            className="hidden size-11 items-center justify-center rounded-full border border-pink-100 bg-white/70 text-[var(--brand-color)] transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 sm:flex"
            style={brandIconStyle("instagram")}
          >
            <BrandIcon name="instagram" className="size-4" />
          </a>
          <a
            href={paymentConfig.telegram.channelUrl}
            {...getExternalLinkProps(paymentConfig.telegram.channelUrl)}
            aria-label="Open Telegram channel"
            className="hidden size-11 items-center justify-center rounded-full border border-pink-100 bg-white/70 text-[var(--brand-color)] transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 sm:flex"
            style={brandIconStyle("telegram")}
          >
            <BrandIcon name="telegram" className="size-4" />
          </a>
          <a
            href={paymentConfig.telegram.vipUrl}
            {...getExternalLinkProps(paymentConfig.telegram.vipUrl)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.28)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <ShoppingBag className="size-4 sm:hidden" aria-hidden="true" />
            <Crown className="hidden size-4 sm:block" aria-hidden="true" />
            <span className="hidden sm:inline">Join VIP</span>
            <span className="sm:hidden">VIP</span>
          </a>
        </div>
      </div>
    </header>
  );
}
