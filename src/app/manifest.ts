import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brandName} ${siteConfig.handle}`,
    short_name: siteConfig.brandName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff7fb",
    theme_color: "#db2777",
    icons: [
      {
        src: siteConfig.iconImage,
        sizes: "715x715",
        type: "image/png",
      },
    ],
  };
}
