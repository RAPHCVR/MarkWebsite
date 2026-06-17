import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.publicUrl,
      lastModified: new Date("2026-06-17"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
