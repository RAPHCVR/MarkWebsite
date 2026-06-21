import type { BrandIconKey } from "@/lib/brand-icons";
import { siteConfig } from "@/data/site";

export type SocialLink = {
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
    label: "Instagram",
    handle: siteConfig.handle,
    href: siteConfig.instagramUrl,
    description: "Public updates, looks and creator previews.",
    cta: "Open Instagram",
    icon: "instagram",
  },
  {
    label: "TikTok",
    handle: siteConfig.handle,
    href: siteConfig.tiktokUrl,
    description: "Short updates, look checks and creator moments.",
    cta: "Watch clips",
    icon: "tiktok",
  },
  {
    label: "Telegram Channel",
    handle: "t.me/markreyvakh",
    href: siteConfig.telegramChannelUrl,
    description: "Main channel for platform updates and announcements.",
    cta: "Join channel",
    icon: "telegram",
  },
  {
    label: "Telegram Chat",
    handle: "private chat group",
    href: siteConfig.telegramChatUrl,
    description: "Chat, support, requests and delivery follow-up.",
    cta: "Open chat",
    icon: "telegram",
  },
  {
    label: "X / Twitter",
    handle: "@MarkyReykvakh",
    href: siteConfig.xUrl,
    description: "Quick updates, reposts and launch notes.",
    cta: "Follow on X",
    icon: "x",
  },
  {
    label: "Collabs",
    handle: "business inbox",
    href: siteConfig.collabContactUrl,
    description: "Campaigns, shoots, promos and business requests.",
    cta: "Open form",
    icon: "gmail",
  },
  {
    label: "Private Channel",
    handle: "planned later",
    href: "#access-passes",
    description: "Future private channel access linked to site entitlements.",
    cta: "View passes",
    status: "soon",
    icon: "circle",
  },
];
