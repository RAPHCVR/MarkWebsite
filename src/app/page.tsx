import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  detectLocaleFromCountry,
  isLocale,
  localeCookieName,
  localePath,
} from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : detectLocaleFromAcceptLanguage(headerStore.get("accept-language")) ||
      detectLocaleFromCountry(headerStore.get("cf-ipcountry")) ||
      defaultLocale;

  redirect(localePath(locale, "/"));
}
