import { legalConfig } from "@/data/legal";
import { publicSocialUrls, siteConfig } from "@/data/site";
import { localeUrl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const absoluteUrl = (path: string) => new URL(path, siteConfig.publicUrl).toString();

export function localizedStructuredData(locale: Locale, dictionary: Dictionary) {
  const personId = `${siteConfig.publicUrl}/#person`;
  const organizationId = `${siteConfig.publicUrl}/#merchant`;
  const url = localeUrl(locale, "/");

  const personStructuredData = {
    "@type": "Person",
    "@id": personId,
    name: siteConfig.legalDisplayName,
    alternateName: [siteConfig.brandName, siteConfig.handle],
    description: dictionary.metadata.shortDescription,
    url,
    image: absoluteUrl(siteConfig.portraitImage),
    sameAs: publicSocialUrls,
  } as const;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: legalConfig.merchantName,
        legalName: legalConfig.entrepreneurName,
        identifier: legalConfig.siren,
        url: siteConfig.publicUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.publicUrl}/#website`,
        name: siteConfig.brandName,
        alternateName: [siteConfig.handle, siteConfig.domain],
        url: siteConfig.publicUrl,
        inLanguage: locale,
        description: dictionary.metadata.description,
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: dictionary.metadata.title,
        description: dictionary.metadata.description,
        inLanguage: locale,
        isPartOf: {
          "@id": `${siteConfig.publicUrl}/#website`,
        },
        about: {
          "@id": personId,
        },
        mainEntity: personStructuredData,
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.socialImage),
          width: 1200,
          height: 630,
        },
      },
      personStructuredData,
    ],
  } as const;
}
