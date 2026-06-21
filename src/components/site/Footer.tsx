import Image from "next/image";
import { Heart } from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { siteConfig } from "@/data/site";
import { socials } from "@/data/socials";
import { getExternalLinkProps } from "@/lib/links";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-pink-100 bg-white/74 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative size-12 overflow-hidden rounded-2xl border border-pink-200 bg-pink-50 shadow-inner">
                <Image
                  src={siteConfig.logoImage}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <div>
                <p className="font-logo text-3xl text-pink-500">{siteConfig.brandName}</p>
                <p className="text-sm font-bold text-rose-950/60">Your Kitten Master</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Footer social links">
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

        <div className="mt-6 flex flex-col gap-3 border-t border-pink-100 pt-5 text-sm font-semibold text-rose-950/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Heart className="size-4 text-pink-500" aria-hidden="true" />
            SFW preview site. Creator channel planned later.
          </p>
          <p>Copyright 2026 {siteConfig.brandName}.</p>
        </div>
      </div>
    </footer>
  );
}
