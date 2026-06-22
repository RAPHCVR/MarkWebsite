import { siteConfig } from "@/data/site";

export const locales = ["en", "fr", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const authoritativeLegalLocale: Locale = "fr";
export const localeCookieName = "marky_locale";

export const localeLabels: Record<Locale, { short: string; native: string; english: string }> = {
  en: { short: "EN", native: "English", english: "English" },
  fr: { short: "FR", native: "Français", english: "French" },
  ru: { short: "RU", native: "Русский", english: "Russian" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}

export function assertLocale(value: string): Locale | null {
  const normalized = value.toLowerCase();
  return isLocale(normalized) ? normalized : null;
}

export function stripLocale(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = assertLocale(segments[1] || "");

  if (!maybeLocale) {
    return pathname || "/";
  }

  const stripped = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function localePath(locale: Locale, pathname = "/") {
  const cleanPath = pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${cleanPath}`;
}

export function localeUrl(locale: Locale, pathname = "/") {
  return new URL(localePath(locale, pathname), siteConfig.publicUrl).toString();
}

export function alternateLanguageUrls(pathname = "/") {
  return {
    en: localeUrl("en", pathname),
    fr: localeUrl("fr", pathname),
    ru: localeUrl("ru", pathname),
    "x-default": new URL("/", siteConfig.publicUrl).toString(),
  };
}

export function detectLocaleFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) {
    return null;
  }

  const weighted = header
    .split(",")
    .map((part) => {
      const [rawTag, rawQuality] = part.trim().split(";q=");
      const tag = rawTag.toLowerCase();
      const quality = rawQuality ? Number(rawQuality) : 1;
      return {
        tag,
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of weighted) {
    const primary = tag.split("-")[0];
    const matched = assertLocale(primary);
    if (matched) {
      return matched;
    }
  }

  return null;
}

export function detectLocaleFromCountry(country: string | null | undefined): Locale | null {
  const normalized = country?.toUpperCase();

  if (normalized === "FR" || normalized === "BE" || normalized === "CH" || normalized === "LU") {
    return "fr";
  }

  if (normalized === "RU" || normalized === "BY" || normalized === "KZ") {
    return "ru";
  }

  return null;
}

export function getPathLocale(pathname: string): Locale | null {
  return assertLocale(pathname.split("/")[1] || "");
}

export function shouldSkipLocaleRouting(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}
