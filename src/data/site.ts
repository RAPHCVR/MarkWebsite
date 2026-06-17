export const siteConfig = {
  brandName: "Marky",
  legalDisplayName: "Marky",
  handle: "@markshnaknaks",
  domain: "markshnaknaks.com",
  publicUrl: "https://markshnaknaks.com",
  title: "Marky - Your Kitten Master",
  description:
    "Marky's SFW creator storefront for cosplay drops, social links, photo pack previews and collab requests.",
  shortDescription:
    "SFW cosplay drops, social links, photo pack previews and collabs.",
  socialImage: "/images/mark-portrait-sketch.png",
  iconImage: "/images/mark-chibi-sketch.png",
  portraitImage: "/images/mark-portrait-sketch.png",
  collabEmail: "collabs@markshnaknaks.com",
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
