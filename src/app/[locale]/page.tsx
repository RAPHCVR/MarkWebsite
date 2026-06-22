import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage } from "@/app/HomePage";
import { getLocalizedGallery, getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { assertLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedMetadata } from "@/i18n/metadata";

type LocalizedPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  return localizedMetadata(locale, getDictionary(locale), "/");
}

export default async function LocalizedHome({ params }: LocalizedPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <HomePage
      locale={locale}
      dictionary={dictionary}
      products={getLocalizedProducts(dictionary)}
      socials={getLocalizedSocials(dictionary)}
      galleryItems={getLocalizedGallery(dictionary)}
    />
  );
}
