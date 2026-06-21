import { siteConfig } from "@/data/site";

export function getPublicSiteUrl() {
  return (
    process.env.SITE_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    siteConfig.publicUrl
  ).replace(/\/$/, "");
}

export function getPublicUrl(path: string) {
  return new URL(path, `${getPublicSiteUrl()}/`).toString();
}
