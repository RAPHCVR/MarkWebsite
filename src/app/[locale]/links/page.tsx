import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinksPage } from "@/app/LinksPage";
import { siteConfig } from "@/data/site";
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
  const metadata = localizedMetadata(locale, dictionary, "/links");
  const image = {
    url: siteConfig.linksSocialImage,
    width: 1200,
    height: 630,
    alt: dictionary.metadata.linksTitle,
  };

  return {
    ...metadata,
    title: {
      absolute: dictionary.metadata.linksTitle,
    },
    description: dictionary.metadata.linksDescription,
    openGraph: {
      ...metadata.openGraph,
      title: dictionary.metadata.linksTitle,
      description: dictionary.metadata.linksDescription,
      images: [image],
    },
    twitter: {
      ...metadata.twitter,
      title: dictionary.metadata.linksTitle,
      description: dictionary.metadata.linksDescription,
      images: [image],
    },
    other: {
      ...metadata.other,
      thumbnail: new URL(siteConfig.linksSocialImage, siteConfig.publicUrl).toString(),
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
