import { legalConfig } from "@/data/legal";
import { publicSocialUrls, siteConfig } from "@/data/site";

const absoluteUrl = (path: string) => new URL(path, siteConfig.publicUrl).toString();
const personId = `${siteConfig.publicUrl}/#person`;
const organizationId = `${siteConfig.publicUrl}/#merchant`;

const personStructuredData = {
  "@type": "Person",
  "@id": personId,
  name: siteConfig.legalDisplayName,
  alternateName: [siteConfig.brandName, siteConfig.handle],
  description: siteConfig.shortDescription,
  url: siteConfig.publicUrl,
  image: absoluteUrl(siteConfig.portraitImage),
  sameAs: publicSocialUrls,
} as const;

export const seoStructuredData = {
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
      inLanguage: "en",
      description: siteConfig.description,
      publisher: {
        "@id": organizationId,
      },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteConfig.publicUrl}/#profile`,
      url: siteConfig.publicUrl,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
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
