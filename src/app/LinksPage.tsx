import Image from "next/image";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Globe2,
  Heart,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { paymentConfig } from "@/data/payments";
import type { Product } from "@/data/products";
import { siteConfig } from "@/data/site";
import type { SocialLink } from "@/data/socials";
import { localeLabels, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps, isExternalHref } from "@/lib/links";

type LinksPageProps = {
  locale: Locale;
  dictionary: Dictionary;
  products: Product[];
  socials: SocialLink[];
};

type LinksCopy = {
  eyebrow: string;
  profile: string;
  officialLinks: string;
  accessTitle: string;
  accessBody: string;
  accessMeta: string;
  supportTitle: string;
  supportBody: string;
  supportCta: string;
  safetyTitle: string;
  safetyItems: string[];
  fullSite: string;
  productTitles: Record<string, string>;
  actions: {
    passes: string;
    telegram: string;
    support: string;
  };
};

const linksCopy: Record<Locale, LinksCopy> = {
  en: {
    eyebrow: "Marky links",
    profile: "Links, drops, collabs.",
    officialLinks: "Socials",
    accessTitle: "Passes",
    accessBody: "Available now.",
    accessMeta: "private link",
    supportTitle: "Need help?",
    supportBody: "Access or VIP request support.",
    supportCta: "Open support",
    safetyTitle: "Stay safe",
    safetyItems: [
      "Only pay on markshnaknaks.com.",
      "Do not share private links.",
      "Use the bot for VIP requests.",
    ],
    fullSite: "Open full site",
    productTitles: {
      "cosplay-starter-pack": "Starter Access",
      "soft-catboy-drop": "Premium Drop",
      "vip-bundle": "VIP Request Pass",
    },
    actions: {
      passes: "Passes",
      telegram: "Telegram",
      support: "Support",
    },
  },
  fr: {
    eyebrow: "Liens Marky",
    profile: "Liens, drops, collabs.",
    officialLinks: "Réseaux",
    accessTitle: "Accès",
    accessBody: "Disponibles maintenant.",
    accessMeta: "lien privé",
    supportTitle: "Besoin d'aide ?",
    supportBody: "Support accès et demandes VIP.",
    supportCta: "Ouvrir le support",
    safetyTitle: "Sécurité",
    safetyItems: [
      "Paie uniquement sur markshnaknaks.com.",
      "Ne partage pas tes liens privés.",
      "Passe par le bot pour les demandes VIP.",
    ],
    fullSite: "Ouvrir le site",
    productTitles: {
      "cosplay-starter-pack": "Starter Access",
      "soft-catboy-drop": "Premium Drop",
      "vip-bundle": "VIP Request Pass",
    },
    actions: {
      passes: "Accès",
      telegram: "Telegram",
      support: "Support",
    },
  },
  ru: {
    eyebrow: "Ссылки Marky",
    profile: "Ссылки, дропы, коллабы.",
    officialLinks: "Соцсети",
    accessTitle: "Доступы",
    accessBody: "Доступно сейчас.",
    accessMeta: "приватная ссылка",
    supportTitle: "Нужна помощь?",
    supportBody: "Поддержка доступа и VIP-заявок.",
    supportCta: "Открыть поддержку",
    safetyTitle: "Безопасность",
    safetyItems: [
      "Оплачивай только на markshnaknaks.com.",
      "Не передавай приватные ссылки.",
      "VIP-заявки отправляй через бота.",
    ],
    fullSite: "Открыть сайт",
    productTitles: {
      "cosplay-starter-pack": "Starter Access",
      "soft-catboy-drop": "Premium Drop",
      "vip-bundle": "VIP Request Pass",
    },
    actions: {
      passes: "Доступы",
      telegram: "Telegram",
      support: "Поддержка",
    },
  },
};

const primarySocialIds: SocialLink["id"][] = [
  "instagram",
  "tiktok",
  "telegramChannel",
  "telegramChat",
  "x",
  "collabs",
];

function linkProps(href: string) {
  return getExternalLinkProps(href);
}

export function LinksPage({ locale, dictionary, products, socials }: LinksPageProps) {
  const copy = linksCopy[locale];
  const socialMap = new Map(socials.map((social) => [social.id, social]));
  const primarySocials = primarySocialIds
    .map((id) => socialMap.get(id))
    .filter((social): social is SocialLink => Boolean(social));
  const liveProducts = products.filter((product) => product.status !== "coming-soon").slice(0, 3);
  const accessHref = localePath(locale, "/#access-passes");
  const homeHref = localePath(locale, "/");
  const collabHref = localePath(locale, "/#contact");
  const telegramHref = socialMap.get("telegramChannel")?.href || paymentConfig.telegram.channelUrl;
  const supportHref = paymentConfig.telegram.requestBotUrl || telegramHref;

  const quickActions = [
    {
      label: copy.actions.passes,
      href: accessHref,
      icon: ShoppingBag,
      primary: true,
    },
    {
      label: copy.actions.telegram,
      href: telegramHref,
      icon: MessageCircle,
      external: isExternalHref(telegramHref),
    },
    {
      label: copy.actions.support,
      href: supportHref,
      icon: LifeBuoy,
      external: isExternalHref(supportHref),
    },
  ];

  return (
    <main className="min-h-dvh overflow-hidden bg-[var(--background)] text-rose-950">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.54)_0_12%,transparent_12%_24%,rgba(255,255,255,0.36)_24%_36%,transparent_36%_48%),radial-gradient(circle_at_18%_10%,rgba(254,177,198,0.46),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,212,222,0.7),transparent_30%),linear-gradient(180deg,#ffecee,#ffe0e6)]" />

      <div className="mx-auto grid min-h-dvh w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-10 lg:py-10">
        <section className="hidden lg:block">
          <div className="max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-700">
              {copy.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-6xl font-black leading-[0.92] text-rose-950">
              {dictionary.hero.titlePrefix}{" "}
              <span className="text-pink-600">{dictionary.hero.titleHighlight}</span>
            </h1>
            <p className="mt-5 max-w-sm text-base font-semibold leading-7 text-rose-950/68">
              {copy.profile}
            </p>
            <div className="mt-8 rounded-[2rem] border border-pink-100 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-pink-600" aria-hidden="true" />
                <h2 className="text-lg font-black text-rose-950">{copy.safetyTitle}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {copy.safetyItems.map((item) => (
                  <li key={item} className="flex gap-2 text-sm font-semibold leading-6 text-rose-950/66">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-pink-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[430px] lg:max-w-[470px]">
          <div className="rounded-[2rem] border border-white/80 bg-white/64 p-3 shadow-[0_28px_80px_rgba(200,13,91,0.18)] backdrop-blur-xl sm:p-4">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-pink-100 bg-gradient-to-b from-white/92 via-pink-50/86 to-white/78 p-4 shadow-inner sm:p-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_20%_20%,rgba(254,177,198,0.48),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.98),transparent_38%)]" />

              <nav className="relative z-10 mb-5 flex items-center justify-between gap-3">
                <a
                  href={homeHref}
                  className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-full border border-pink-100 bg-white/84 py-1 pl-1.5 pr-3 text-sm font-black text-pink-700 shadow-sm transition hover:border-pink-200 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  <Image
                    src={siteConfig.manifestIconImage}
                    alt=""
                    width={40}
                    height={40}
                    className="size-8 rounded-full object-cover ring-1 ring-pink-100"
                  />
                  <span className="hidden truncate min-[360px]:inline">Marky</span>
                </a>
                <div
                  className="flex shrink-0 items-center gap-1 rounded-full border border-pink-100 bg-white/78 p-1 shadow-sm"
                  aria-label={dictionary.nav.language}
                >
                  <Globe2 className="ml-1 hidden size-3.5 text-pink-500 min-[380px]:block" aria-hidden="true" />
                  {locales.map((targetLocale) => {
                    const isActive = targetLocale === locale;

                    return (
                      <a
                        key={targetLocale}
                        href={localePath(targetLocale, "/links")}
                        hrefLang={targetLocale}
                        lang={targetLocale}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`${dictionary.nav.language}: ${localeLabels[targetLocale].native}`}
                        className={
                          isActive
                            ? "inline-flex min-h-8 min-w-12 items-center justify-center gap-1 rounded-full bg-pink-600 px-2.5 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(219,39,119,0.24)] ring-1 ring-pink-300 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                            : "inline-flex size-8 items-center justify-center rounded-full text-[11px] font-black text-rose-950/54 transition hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                        }
                        title={localeLabels[targetLocale].native}
                      >
                        {isActive ? <Check className="size-3" aria-hidden="true" /> : null}
                        <span>{localeLabels[targetLocale].short}</span>
                      </a>
                    );
                  })}
                </div>
              </nav>

              <header className="relative z-10 text-center">
                <div className="mx-auto grid size-30 place-items-center rounded-[2.15rem] border border-white bg-white/72 p-1.5 shadow-[0_18px_42px_rgba(200,13,91,0.18)] ring-1 ring-pink-100/70">
                  <Image
                    src={siteConfig.manifestIconImage}
                    alt="Marky"
                    width={160}
                    height={160}
                    priority
                    className="size-full rounded-[1.7rem] object-cover"
                  />
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-pink-600">
                  {copy.eyebrow}
                </p>
                <h1 className="mt-2 font-serif text-5xl font-black leading-none text-pink-600">
                  Marky
                </h1>
                <p className="mx-auto mt-2 max-w-[18rem] text-sm font-black leading-5 text-rose-950/68">
                  {dictionary.footer.slogan} · {siteConfig.handle}
                </p>
                <p className="mx-auto mt-3 max-w-[20rem] text-sm font-semibold leading-6 text-rose-950/62">
                  {copy.profile}
                </p>
              </header>

              <section className="relative z-10 mt-5 grid grid-cols-2 gap-2" aria-label="Primary actions">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      {...linkProps(action.href)}
                      className={
                        action.primary
                          ? "col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-3 text-center text-sm font-black text-white shadow-[0_12px_28px_rgba(219,39,119,0.24)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white/82 px-3 text-center text-sm font-black text-pink-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                      }
                    >
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>{action.label}</span>
                    </a>
                  );
                })}
              </section>

              <section className="relative z-10 mt-5" aria-labelledby="official-links-heading">
                <div className="mb-2 flex items-center justify-between gap-3 px-1">
                  <h2 id="official-links-heading" className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">
                    {copy.officialLinks}
                  </h2>
                  <ShieldCheck className="size-4 text-pink-500" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  {primarySocials.map((social) => {
                    const href = social.id === "collabs" ? collabHref : social.href;
                    const isExternal = isExternalHref(href);

                    return (
                      <a
                        key={social.id}
                        href={href}
                        {...linkProps(href)}
                        className="group flex min-h-14 items-center gap-3 rounded-[1.35rem] border border-pink-100 bg-white/84 px-3 py-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-pink-200 hover:bg-white hover:shadow-[0_14px_32px_rgba(200,13,91,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                        aria-label={`${social.label}: ${social.handle}`}
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-2xl bg-pink-50 text-[var(--brand-color)]"
                          style={brandIconStyle(social.icon)}
                        >
                          <BrandIcon name={social.icon} className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black leading-tight text-rose-950">
                            {social.label}
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-bold text-rose-950/52">
                            {social.handle}
                          </span>
                        </span>
                        {isExternal ? (
                          <ExternalLink
                            className="size-4 shrink-0 text-pink-500 transition group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowRight
                            className="size-4 shrink-0 text-pink-500 transition group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>

              <section className="relative z-10 mt-5 rounded-[1.35rem] border border-pink-100 bg-white/78 p-3 shadow-sm" aria-labelledby="access-links-heading">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-600">
                      {dictionary.products.eyebrow}
                    </p>
                    <h2 id="access-links-heading" className="mt-1 text-xl font-black leading-tight text-rose-950">
                      {copy.accessTitle}
                    </h2>
                    <p className="mt-1 text-xs font-bold leading-5 text-rose-950/56">
                      {copy.accessBody}
                    </p>
                  </div>
                  <LockKeyhole className="mt-1 size-5 shrink-0 text-pink-500" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  {liveProducts.map((product) => (
                    <a
                      key={product.slug}
                      href={accessHref}
                      className="flex min-h-14 items-center gap-3 rounded-[1.2rem] bg-pink-50/78 px-3 py-2 transition hover:bg-pink-100/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-pink-600 shadow-sm">
                        <LockKeyhole className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-black leading-tight text-rose-950">
                          {copy.productTitles[product.slug] || product.title}
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-rose-950/52">
                          {product.price} · {copy.accessMeta}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-pink-500" aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <a
                  href={accessHref}
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.24)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  {dictionary.hero.viewPasses}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </section>

              <section className="relative z-10 mt-6 grid gap-3" aria-label="Support and safety">
                <a
                  href={supportHref}
                  {...linkProps(supportHref)}
                  className="rounded-[1.45rem] border border-pink-200/80 bg-white/86 p-4 shadow-[0_14px_32px_rgba(200,13,91,0.08)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_40px_rgba(200,13,91,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pink-50 text-[var(--brand-color)] shadow-inner"
                      style={brandIconStyle("telegram")}
                    >
                      <BrandIcon name="telegram" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-black leading-tight text-rose-950">
                        {copy.supportTitle}
                      </span>
                      <span className="mt-1.5 block text-xs font-bold leading-5 text-rose-950/58">
                        {copy.supportBody}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-pink-700">
                        {copy.supportCta}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  </div>
                </a>

                <div className="rounded-[1.35rem] border border-pink-100 bg-white/62 p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-pink-600" aria-hidden="true" />
                    <h2 className="text-sm font-black text-rose-950">{copy.safetyTitle}</h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {copy.safetyItems.map((item) => (
                      <li key={item} className="flex gap-2 text-xs font-bold leading-5 text-rose-950/58">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-pink-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="relative z-10 mt-4 grid grid-cols-2 gap-2">
                <a
                  href={homeHref}
                  className="rounded-[1.35rem] border border-pink-100 bg-white/74 p-3 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  <Globe2 className="mb-2 size-4 text-pink-500" aria-hidden="true" />
                  <span className="block text-sm font-black text-rose-950">
                    {copy.fullSite}
                  </span>
                </a>
                <a
                  href={collabHref}
                  className="rounded-[1.35rem] border border-pink-100 bg-white/74 p-3 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  <Heart className="mb-2 size-4 text-pink-500" aria-hidden="true" />
                  <span className="block text-sm font-black text-rose-950">
                    {dictionary.nav.collab}
                  </span>
                </a>
              </section>

              <footer className="relative z-10 mt-5 border-t border-pink-100 pt-4 text-center">
                <div className="flex flex-wrap justify-center gap-3 text-xs font-black text-pink-700">
                  <a href={localePath(locale, "/legal")} className="hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
                    {dictionary.legalNav.legal}
                  </a>
                  <a href={localePath(locale, "/terms")} className="hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
                    {dictionary.legalNav.terms}
                  </a>
                  <a href={homeHref} className="hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
                    {dictionary.nav.home}
                  </a>
                </div>
                <p className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-rose-950/45">
                  <Sparkles className="size-3 text-pink-400" aria-hidden="true" />
                  Marky · {dictionary.footer.slogan}
                </p>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
