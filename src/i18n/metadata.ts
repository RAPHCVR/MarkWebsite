import type { Metadata } from "next";

import { siteConfig } from "@/data/site";
import { alternateLanguageUrls, localeUrl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function localizedMetadata(locale: Locale, dictionary: Dictionary, pathname = "/"): Metadata {
  const canonical = localeUrl(locale, pathname);
  const searchImageUrl = new URL(siteConfig.searchImage, siteConfig.publicUrl).toString();

  return {
    title: {
      absolute: dictionary.metadata.title,
    },
    description: dictionary.metadata.description,
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.shortDescription,
      url: canonical,
      siteName: siteConfig.brandName,
      type: "website",
      locale: dictionary.metadata.ogLocale,
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.brandName} ${siteConfig.handle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.metadata.title,
      description: dictionary.metadata.shortDescription,
      creator: siteConfig.handle,
      images: [
        {
          url: siteConfig.socialImage,
          alt: `${siteConfig.brandName} ${siteConfig.handle}`,
        },
      ],
    },
    alternates: {
      canonical,
      languages: alternateLanguageUrls(pathname),
    },
    other: {
      thumbnail: searchImageUrl,
    },
  };
}
