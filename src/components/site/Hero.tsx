import Image from "next/image";
import {
  ArrowRight,
  Cat,
  Heart,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import type { Product } from "@/data/products";
import { siteConfig } from "@/data/site";
import type { SocialLink } from "@/data/socials";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps } from "@/lib/links";

const compactHeroLabel: Record<string, string> = {
  "Telegram Channel": "Telegram",
  "Telegram Chat": "Chat",
  Collabs: "Collabs",
};

type HeroProps = {
  locale: Locale;
  dictionary: Dictionary;
  socials: SocialLink[];
  products: Product[];
};

export function Hero({ locale, dictionary, socials, products }: HeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-5 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-12 lg:pt-8">
      <div className="flex flex-col justify-center">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/78 px-3 py-2 text-sm font-bold text-rose-950 shadow-sm backdrop-blur">
            <span className="relative flex size-8 items-center justify-center rounded-full bg-pink-600 text-white shadow-[0_10px_24px_rgba(219,39,119,0.3)]">
              <Cat className="size-4" aria-hidden="true" />
            </span>
            <span>{siteConfig.handle}</span>
          </div>
          <Badge className="h-9 rounded-full border-pink-200 bg-pink-50 px-4 font-bold text-pink-700">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {dictionary.hero.handleBadge}
          </Badge>
          <Badge className="h-9 rounded-full border-fuchsia-200 bg-fuchsia-50 px-4 font-bold text-fuchsia-700">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {dictionary.hero.channelBadge}
          </Badge>
        </div>

        <div className="relative">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-pink-500">
            {dictionary.hero.eyebrow}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl font-black leading-[0.95] text-rose-950 sm:text-7xl lg:text-8xl">
            {dictionary.hero.titlePrefix}{" "}
            <span className="relative inline-block text-pink-500">
              {dictionary.hero.titleHighlight}
              <span className="absolute -right-8 -top-3 text-4xl text-pink-500 sm:-right-10 sm:text-5xl">
                ♥
              </span>
            </span>
          </h1>
          <div className="mt-4 h-3 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.42),rgba(236,72,153,0)_70%)] sm:w-96" />
        </div>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-rose-950/72 sm:text-2xl">
          {dictionary.hero.subtitle}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#access-passes"
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-pink-600 px-6 text-base font-black text-white shadow-[0_18px_38px_rgba(219,39,119,0.32)] transition hover:-translate-y-0.5 hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {dictionary.hero.viewPasses}
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
          <a
            href={localePath(locale, "/links")}
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-pink-300 bg-white/75 px-6 text-base font-black text-pink-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-pink-400 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
          >
            <Heart className="size-5" aria-hidden="true" />
            <span className="sm:hidden">{dictionary.nav.links}</span>
            <span className="hidden sm:inline">{dictionary.hero.follow}</span>
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-wrap">
          {socials.map((social) => {
            const label = compactHeroLabel[social.label] ?? social.label;

            return (
              <a
                key={social.label}
                href={social.href}
                {...getExternalLinkProps(social.href)}
                aria-label={`${social.label}: ${social.handle}`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-pink-100 bg-white/76 px-3 text-sm font-bold text-rose-950 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-pink-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 sm:px-4"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white text-[var(--brand-color)] shadow-sm transition group-hover:bg-[var(--brand-color)] group-hover:text-white"
                  style={brandIconStyle(social.icon)}
                >
                  <BrandIcon name={social.icon} className="size-4" />
                </span>
                <span className="min-w-0 truncate">{label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
        <div className="absolute -left-4 top-8 hidden rounded-full bg-white/80 px-4 py-3 text-sm font-black text-pink-500 shadow-lg ring-1 ring-pink-100 backdrop-blur sm:block">
          {dictionary.hero.publicPreview}
        </div>
        <div className="absolute -right-2 top-3 z-10 rounded-full border border-pink-200 bg-white/86 px-4 py-2 text-sm font-black text-rose-950 shadow-lg backdrop-blur">
          {dictionary.hero.openingSoon}
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/68 p-3 shadow-[0_28px_80px_rgba(190,24,93,0.18)] backdrop-blur-xl sm:rounded-[2.5rem]">
          <div className="relative min-h-[440px] overflow-hidden rounded-[1.55rem] border border-pink-100 bg-[linear-gradient(135deg,#FFECEE_0%,#FFE0E6_42%,#FFD4DE_100%)] sm:min-h-[540px] sm:rounded-[2rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.95),rgba(255,255,255,0)_25%),radial-gradient(circle_at_82%_24%,rgba(254,177,198,0.24),rgba(254,177,198,0)_28%)]" />
            <div className="absolute left-5 top-5 flex size-16 items-center justify-center rounded-full border border-white/80 bg-white/45 text-pink-400 shadow-inner backdrop-blur">
              <Heart className="size-8" aria-hidden="true" />
            </div>
            <div className="absolute right-6 top-20 flex flex-col gap-1 opacity-50">
              {Array.from({ length: 13 }).map((_, index) => (
                <span
                  key={index}
                  className="h-1 w-12 rounded-full bg-white"
                />
              ))}
            </div>

            <div className="absolute inset-x-8 bottom-0 top-12">
              <Image
                src="/images/mark-portrait-sketch.png"
                alt={`Black and white public portrait sketch of ${siteConfig.brandName}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 520px"
                className="object-cover object-[52%_42%] opacity-90 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,241,247,0)_48%,rgba(255,241,247,0.82)_92%)]" />
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_40px_rgba(190,24,93,0.16)] backdrop-blur-xl sm:left-auto sm:w-72">
              <div className="space-y-3 text-sm font-bold text-rose-950/80">
                {dictionary.hero.profilePoints.map((point, index) => {
                  const Icon = [Heart, Cat, Mail][index] ?? Heart;

                  return (
                    <p key={point} className="flex items-center gap-2">
                      <Icon className="size-4 text-pink-500" aria-hidden="true" />
                      {point}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <a
              key={product.slug}
              href="#access-passes"
              className="group relative min-h-36 overflow-hidden rounded-3xl border border-pink-100 bg-white/72 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-pink-300 hover:bg-white hover:shadow-[0_22px_50px_rgba(236,72,153,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
            >
              <div className="absolute -right-8 -top-10 size-24 rounded-full bg-pink-200/60 blur-2xl transition group-hover:bg-pink-300/70" />
              <Badge className="relative rounded-full bg-pink-50 font-bold text-pink-700">
                {product.badge}
              </Badge>
              <h2 className="relative mt-4 text-lg font-black leading-tight text-rose-950">
                {product.title}
              </h2>
              <p className="relative mt-2 line-clamp-2 text-sm leading-5 text-rose-950/62">
                {product.description}
              </p>
              <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-black text-pink-700">
                {dictionary.hero.productCta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
