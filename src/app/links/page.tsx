import type { Metadata } from "next";

import { LinksPage } from "@/app/LinksPage";
import { getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { getRequestDictionary } from "@/i18n/server";
import { localizedMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dictionary } = await getRequestDictionary();

  return {
    ...localizedMetadata(locale, dictionary, "/links"),
    title: {
      absolute: `Marky links - ${dictionary.hero.titlePrefix} ${dictionary.hero.titleHighlight}`,
    },
  };
}

export default async function PublicLinksPage() {
  const { locale, dictionary } = await getRequestDictionary();

  return (
    <LinksPage
      locale={locale}
      dictionary={dictionary}
      products={getLocalizedProducts(dictionary)}
      socials={getLocalizedSocials(dictionary)}
    />
  );
}
