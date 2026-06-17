import type { BrandIconKey } from "@/lib/brand-icons";
import { collabMailto, siteConfig } from "@/data/site";

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
    description: "Mirror shots, outfits and soft previews.",
    cta: "Open Instagram",
    icon: "instagram",
  },
  {
    label: "TikTok",
    handle: siteConfig.handle,
    href: siteConfig.tiktokUrl,
    description: "Clips, outfit checks and behind-the-scenes moments.",
    cta: "Watch clips",
    icon: "tiktok",
  },
  {
    label: "Telegram Channel",
    handle: "t.me/markreyvakh",
    href: siteConfig.telegramChannelUrl,
    description: "Main channel for drops, updates and announcements.",
    cta: "Join channel",
    icon: "telegram",
  },
  {
    label: "Telegram Chat",
    handle: "private chat group",
    href: siteConfig.telegramChatUrl,
    description: "Chat, support, requests and future delivery follow-up.",
    cta: "Open chat",
    icon: "telegram",
  },
  {
    label: "X / Twitter",
    handle: "@MarkyReyvakh",
    href: siteConfig.xUrl,
    description: "Quick updates, reposts and drop notes.",
    cta: "Follow on X",
    icon: "x",
  },
  {
    label: "Collabs",
    handle: siteConfig.collabEmail,
    href: collabMailto,
    description: "Campaigns, shoots, promos and business requests.",
    cta: "Send email",
    icon: "gmail",
  },
  {
    label: "OnlyFans",
    handle: "planned later",
    href: "#photo-packs",
    description: "Future creator channel. Current site stays SFW.",
    cta: "View packs",
    status: "soon",
    icon: "onlyfans",
  },
];
