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
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps } from "@/lib/links";

const compactHeroLabel: Record<string, string> = {
  "Telegram Channel": "Telegram",
  "Telegram Chat": "Chat",
  Collabs: "Collabs",
  "Private Channel": "Channel later",
};

type HeroProps = {
  dictionary: Dictionary;
  socials: SocialLink[];
  products: Product[];
};

export function Hero({ dictionary, socials, products }: HeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-14 lg:pt-10">
      <div className="mark-rise flex flex-col justify-center">
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-950/10 bg-white/80 px-3 py-2 text-sm font-bold text-rose-950 shadow-sm backdrop-blur">
            <span className="relative flex size-7 items-center justify-center rounded-full bg-mark-cta text-white">
              <Cat className="size-4" aria-hidden="true" />
            </span>
            <span>{siteConfig.handle}</span>
          </div>
          <Badge className="h-9 rounded-full border-mark-200 bg-mark-50 px-4 font-bold text-mark-cta">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {dictionary.hero.handleBadge}
          </Badge>
          <Badge
            variant="outline"
            className="h-9 rounded-full border-rose-950/15 bg-transparent px-4 font-bold text-rose-950/70"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {dictionary.hero.channelBadge}
          </Badge>
        </div>

        <div className="relative">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-mark-cta">
            {dictionary.hero.eyebrow}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl font-black leading-[0.92] tracking-tight text-rose-950 text-balance sm:text-7xl lg:text-8xl">
            {dictionary.hero.titlePrefix}{" "}
            <span className="relative inline-block text-mark-cta">
              {dictionary.hero.titleHighlight}
              <span
                className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-mark-cta/30"
                aria-hidden="true"
              />
            </span>
          </h1>
        </div>

        <p className="mt-6 max-w-xl text-lg leading-8 text-rose-950/72 text-pretty sm:text-2xl">
          {dictionary.hero.subtitle}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#access-passes"
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-mark-cta px-6 text-base font-bold text-white shadow-[0_16px_34px_rgba(200,13,91,0.3)] transition hover:-translate-y-0.5 hover:bg-[#a80a4c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/30"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {dictionary.hero.viewPasses}
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
          <a
            href="#socials"
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-rose-950/15 bg-white/70 px-6 text-base font-bold text-rose-950 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-mark-cta/40 hover:bg-mark-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
          >
            <Heart className="size-5 text-mark-cta" aria-hidden="true" />
            {dictionary.hero.follow}
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-wrap">
          {socials.map((social) => {
            const label = compactHeroLabel[social.label] ?? social.label;

            return (
              <a
                key={social.label}
                href={social.href}
                {...getExternalLinkProps(social.href)}
                aria-label={`${social.label}: ${social.handle}`}
                className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-rose-950/10 bg-white/75 px-3 text-sm font-bold text-rose-950 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-mark-cta/30 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25 sm:px-4"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-rose-950/10 bg-white text-[var(--brand-color)] transition group-hover:bg-[var(--brand-color)] group-hover:text-white"
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

      <div className="mark-rise relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-rose-950/10 bg-white/70 p-2.5 shadow-[0_24px_70px_rgba(63,10,30,0.14)] backdrop-blur">
          <div className="relative min-h-[440px] overflow-hidden rounded-[1.25rem] border border-rose-950/5 bg-[linear-gradient(150deg,#FFF6F0_0%,#FCEAE2_55%,#F8DCE5_100%)] sm:min-h-[540px]">
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-mark-cta shadow-sm backdrop-blur">
                <span className="size-1.5 rounded-full bg-mark-cta" aria-hidden="true" />
                {dictionary.hero.publicPreview}
              </span>
              <span className="rounded-full border border-rose-950/10 bg-white/85 px-3 py-1.5 text-xs font-bold text-rose-950/80 shadow-sm backdrop-blur">
                {dictionary.hero.openingSoon}
              </span>
            </div>

            <div className="absolute inset-x-6 bottom-0 top-14">
              <Image
                src="/images/mark-portrait-sketch.png"
                alt={`Black and white public portrait sketch of ${siteConfig.brandName}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 520px"
                className="object-cover object-[52%_38%] opacity-95 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,246,240,0)_46%,rgba(255,246,240,0.9)_94%)]" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-rose-950/10 bg-white/82 p-4 shadow-[0_14px_34px_rgba(63,10,30,0.12)] backdrop-blur-xl sm:left-auto sm:w-72">
              <div className="space-y-2.5 text-sm font-bold text-rose-950/82">
                {dictionary.hero.profilePoints.map((point, index) => {
                  const Icon = [Heart, Cat, Mail][index] ?? Heart;

                  return (
                    <p key={point} className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-mark-cta" aria-hidden="true" />
                      {point}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <a
              key={product.slug}
              href="#access-passes"
              className="group relative flex min-h-40 flex-col overflow-hidden rounded-2xl border border-rose-950/10 bg-white/75 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-mark-cta/30 hover:bg-white hover:shadow-[0_18px_44px_rgba(200,13,91,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge className="rounded-full bg-mark-50 font-bold text-mark-cta">
                  {product.badge}
                </Badge>
                <span className="text-sm font-black text-rose-950">{product.price}</span>
              </div>
              <h2 className="mt-3 text-base font-black leading-tight text-rose-950">
                {product.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-rose-950/62">
                {product.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-bold text-mark-cta">
                {dictionary.hero.productCta}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
