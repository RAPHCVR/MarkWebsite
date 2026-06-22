import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { alternateLanguageUrls, localeUrl, locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-22");
  const paths = [
    { path: "/", priority: 1 },
    { path: "/legal", priority: 0.7 },
    { path: "/terms", priority: 0.7 },
    { path: "/refund-policy", priority: 0.7 },
    { path: "/privacy", priority: 0.7 },
  ];

  return [
    {
      url: siteConfig.publicUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: {
        languages: alternateLanguageUrls("/"),
      },
    },
    ...paths.flatMap(({ path, priority }) =>
      locales.map((locale) => ({
        url: localeUrl(locale, path),
        lastModified,
        changeFrequency: "weekly" as const,
        priority,
        alternates: {
          languages: alternateLanguageUrls(path),
        },
      })),
    ),
  ];
}
