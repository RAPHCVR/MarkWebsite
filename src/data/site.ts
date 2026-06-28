export const siteConfig = {
  brandName: "Marky",
  legalDisplayName: "Marky",
  handle: "@markshnaknaks",
  domain: "markshnaknaks.com",
  publicUrl: "https://markshnaknaks.com",
  title: "Marky - Your Kitten Master",
  description:
    "Official Marky links, drops and collabs.",
  shortDescription:
    "Official links and drops.",
  socialImage: "/images/marky-og.png",
  linksSocialImage: "/images/marky-links-og.png",
  searchImage: "/images/mark-portrait-sketch.png",
  searchImageWidth: 894,
  searchImageHeight: 1280,
  iconImage: "/favicon.png",
  appleTouchIconImage: "/apple-touch-icon.png",
  manifestIconImage: "/images/marky-icon-512.png",
  logoImage: "/images/marky-logo.png",
  portraitImage: "/images/mark-portrait-sketch.png",
  collabContactUrl: "/#contact",
  instagramUrl: "https://instagram.com/markshnaknaks",
  tiktokUrl: "https://tiktok.com/@markshnaknaks",
  telegramChannelUrl: "https://t.me/markreyvakh",
  telegramChatUrl: "https://t.me/+BTVcC_RjdWJhYWEy",
  xUrl: "https://x.com/MarkyReykvakh",
  onlyFansUrl: "",
} as const;

export const publicSocialUrls = [
  siteConfig.instagramUrl,
  siteConfig.tiktokUrl,
  siteConfig.telegramChannelUrl,
  siteConfig.xUrl,
].filter(Boolean);
