import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/orders/",
        "/private/",
        "/account/",
        "/auth/",
        "/checkout/",
      ],
    },
    sitemap: `${siteConfig.publicUrl}/sitemap.xml`,
    host: siteConfig.publicUrl,
  };
}
