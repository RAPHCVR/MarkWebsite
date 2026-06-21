import { legalConfig } from "@/data/legal";

export const siteConfig = {
  brandName: "Marky",
  legalDisplayName: legalConfig.creatorName,
  handle: "@markshnaknaks",
  domain: "markshnaknaks.com",
  publicUrl: "https://markshnaknaks.com",
  title: "Marky - Your Kitten Master",
  description:
    "Marky's public platform for digital access passes, social links, private delivery and collab requests.",
  shortDescription:
    "Digital access, social links, private delivery and collabs.",
  socialImage: "/images/marky-og.png",
  iconImage: "/favicon.png",
  appleTouchIconImage: "/apple-touch-icon.png",
  manifestIconImage: "/images/marky-icon-512.png",
  logoImage: "/images/marky-logo.png",
  portraitImage: "/images/mark-portrait-sketch.png",
  collabEmail: legalConfig.supportEmail,
  instagramUrl: "https://instagram.com/markshnaknaks",
  tiktokUrl: "https://tiktok.com/@markshnaknaks",
  telegramChannelUrl: "https://t.me/markreyvakh",
  telegramChatUrl: "https://t.me/+BTVcC_RjdWJhYWEy",
  xUrl: "https://x.com/MarkyReykvakh",
  onlyFansUrl: "",
} as const;

export const collabMailto =
  `mailto:${siteConfig.collabEmail}?subject=Collab%20request%20for%20${siteConfig.brandName}`;

export const publicSocialUrls = [
  siteConfig.instagramUrl,
  siteConfig.tiktokUrl,
  siteConfig.telegramChannelUrl,
  siteConfig.xUrl,
].filter(Boolean);
