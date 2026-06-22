import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinksPage } from "@/app/LinksPage";
import { getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { assertLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedMetadata } from "@/i18n/metadata";

type LocalizedLinksPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalizedLinksPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    ...localizedMetadata(locale, dictionary, "/links"),
    title: {
      absolute: `Marky links - ${dictionary.hero.titlePrefix} ${dictionary.hero.titleHighlight}`,
    },
  };
}

export default async function LocalizedLinksPage({ params }: LocalizedLinksPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <LinksPage
      locale={locale}
      dictionary={dictionary}
      products={getLocalizedProducts(dictionary)}
      socials={getLocalizedSocials(dictionary)}
    />
  );
}
