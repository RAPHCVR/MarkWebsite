import type { Metadata } from "next";

import { LinksPage } from "@/app/LinksPage";
import { siteConfig } from "@/data/site";
import { getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { localizedMetadata } from "@/i18n/metadata";
import { getRequestDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dictionary } = await getRequestDictionary();
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
