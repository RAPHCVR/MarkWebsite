import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-21");

  return [
    ["", 1],
    ["/legal", 0.7],
    ["/terms", 0.7],
    ["/refund-policy", 0.7],
    ["/privacy", 0.7],
  ].map(([path, priority]) => ({
    url: new URL(String(path), siteConfig.publicUrl).toString(),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: Number(priority),
  }));
}
