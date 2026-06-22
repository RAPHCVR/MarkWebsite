import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export async function getRequestLocale(): Promise<Locale> {
  const requestLocale = (await headers()).get("x-marky-locale");

  return isLocale(requestLocale) ? requestLocale : defaultLocale;
}

export async function getRequestDictionary(): Promise<{
  locale: Locale;
  dictionary: Dictionary;
}> {
  const locale = await getRequestLocale();

  return {
    locale,
    dictionary: getDictionary(locale),
  };
}
