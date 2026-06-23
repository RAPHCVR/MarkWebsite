import type { BrandIconKey } from "@/lib/brand-icons";
import { siteConfig } from "@/data/site";

export type SocialLink = {
  id:
    | "instagram"
    | "tiktok"
    | "telegramChannel"
    | "telegramChat"
    | "x"
    | "collabs";
  label: string;
  handle: string;
  href: string;
  description: string;
  cta: string;
  status?: "live" | "soon";
  icon: BrandIconKey;
};

export const socials: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: siteConfig.handle,
    href: siteConfig.instagramUrl,
    description: "Looks and daily posts.",
    cta: "Open Instagram",
    icon: "instagram",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: siteConfig.handle,
    href: siteConfig.tiktokUrl,
    description: "Short edits.",
    cta: "Watch clips",
    icon: "tiktok",
  },
  {
    id: "telegramChannel",
    label: "Telegram Channel",
    handle: "t.me/markreyvakh",
    href: siteConfig.telegramChannelUrl,
    description: "Drop alerts.",
    cta: "Join channel",
    icon: "telegram",
  },
  {
    id: "telegramChat",
    label: "Telegram Chat",
    handle: "community",
    href: siteConfig.telegramChatUrl,
    description: "Community chat.",
    cta: "Open chat",
    icon: "telegram",
  },
  {
    id: "x",
    label: "X / Twitter",
    handle: "@MarkyReykvakh",
    href: siteConfig.xUrl,
    description: "Updates and reposts.",
    cta: "Follow on X",
    icon: "x",
  },
  {
    id: "collabs",
    label: "Collabs",
    handle: "business",
    href: siteConfig.collabContactUrl,
    description: "Brands, shoots and campaigns.",
    cta: "Open form",
    icon: "mail",
  },
];
