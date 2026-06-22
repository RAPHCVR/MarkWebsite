import type { BrandIconKey } from "@/lib/brand-icons";
import { siteConfig } from "@/data/site";

export type SocialLink = {
  id:
    | "instagram"
    | "tiktok"
    | "telegramChannel"
    | "telegramChat"
    | "x"
    | "collabs"
    | "privateChannel";
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
    description: "Public updates, looks and creator previews.",
    cta: "Open Instagram",
    icon: "instagram",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: siteConfig.handle,
    href: siteConfig.tiktokUrl,
    description: "Short updates, look checks and creator moments.",
    cta: "Watch clips",
    icon: "tiktok",
  },
  {
    id: "telegramChannel",
    label: "Telegram Channel",
    handle: "t.me/markreyvakh",
    href: siteConfig.telegramChannelUrl,
    description: "Main channel for platform updates and announcements.",
    cta: "Join channel",
    icon: "telegram",
  },
  {
    id: "telegramChat",
    label: "Telegram Chat",
    handle: "private chat group",
    href: siteConfig.telegramChatUrl,
    description: "Chat, support, requests and delivery follow-up.",
    cta: "Open chat",
    icon: "telegram",
  },
  {
    id: "x",
    label: "X / Twitter",
    handle: "@MarkyReykvakh",
    href: siteConfig.xUrl,
    description: "Quick updates, reposts and launch notes.",
    cta: "Follow on X",
    icon: "x",
  },
  {
    id: "collabs",
    label: "Collabs",
    handle: "business inbox",
    href: siteConfig.collabContactUrl,
    description: "Campaigns, shoots, promos and business requests.",
    cta: "Open form",
    icon: "gmail",
  },
  {
    id: "privateChannel",
    label: "Private Channel",
    handle: "planned later",
    href: "#access-passes",
    description: "Future private channel access linked to site entitlements.",
    cta: "View passes",
    status: "soon",
    icon: "circle",
  },
];
