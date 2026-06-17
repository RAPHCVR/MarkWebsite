import type { CheckoutProvider } from "@/data/payments";

export type ProductBadge = "New" | "Popular" | "Soon" | "VIP";

export type Product = {
  title: string;
  slug: string;
  description: string;
  price: string;
  amountCents: number;
  currency: "EUR";
  badge: ProductBadge;
  status: "preview" | "coming-soon" | "ready";
  checkoutProvider: CheckoutProvider;
  stripePaymentLink?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  stripePaymentLinkId?: string;
  cryptoCheckoutUrl?: string;
  telegramVipUrl?: string;
  features: string[];
  accent: "lace" | "catboy" | "backstage" | "vip";
};

const stripeEnv = {
  cosplayStarterPack: {
    paymentLink: process.env.STRIPE_PAYMENT_LINK_COSPLAY_STARTER_PACK,
    productId: process.env.STRIPE_PRODUCT_ID_COSPLAY_STARTER_PACK,
    priceId: process.env.STRIPE_PRICE_ID_COSPLAY_STARTER_PACK,
    paymentLinkId: process.env.STRIPE_PAYMENT_LINK_ID_COSPLAY_STARTER_PACK,
  },
  softCatboyDrop: {
    paymentLink: process.env.STRIPE_PAYMENT_LINK_SOFT_CATBOY_DROP,
    productId: process.env.STRIPE_PRODUCT_ID_SOFT_CATBOY_DROP,
    priceId: process.env.STRIPE_PRICE_ID_SOFT_CATBOY_DROP,
    paymentLinkId: process.env.STRIPE_PAYMENT_LINK_ID_SOFT_CATBOY_DROP,
  },
  behindTheScenes: {
    paymentLink: process.env.STRIPE_PAYMENT_LINK_BEHIND_THE_SCENES,
    productId: process.env.STRIPE_PRODUCT_ID_BEHIND_THE_SCENES,
    priceId: process.env.STRIPE_PRICE_ID_BEHIND_THE_SCENES,
    paymentLinkId: process.env.STRIPE_PAYMENT_LINK_ID_BEHIND_THE_SCENES,
  },
  vipBundle: {
    paymentLink: process.env.STRIPE_PAYMENT_LINK_VIP_BUNDLE,
    productId: process.env.STRIPE_PRODUCT_ID_VIP_BUNDLE,
    priceId: process.env.STRIPE_PRICE_ID_VIP_BUNDLE,
    paymentLinkId: process.env.STRIPE_PAYMENT_LINK_ID_VIP_BUNDLE,
  },
};

export const products: Product[] = [
  {
    title: "Cosplay Starter Pack",
    slug: "cosplay-starter-pack",
    description: "Pastel cosplay previews with outfit details.",
    price: "€9",
    amountCents: 900,
    currency: "EUR",
    badge: "New",
    status: "preview",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.cosplayStarterPack.paymentLink,
    stripeProductId: stripeEnv.cosplayStarterPack.productId,
    stripePriceId: stripeEnv.cosplayStarterPack.priceId,
    stripePaymentLinkId: stripeEnv.cosplayStarterPack.paymentLinkId,
    features: ["SFW preview set", "Styled outfit details", "Private delivery"],
    accent: "lace",
  },
  {
    title: "Soft Catboy Drop",
    slug: "soft-catboy-drop",
    description: "Cat ears, blush tones and soft poses.",
    price: "€12",
    amountCents: 1200,
    currency: "EUR",
    badge: "Popular",
    status: "preview",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.softCatboyDrop.paymentLink,
    stripeProductId: stripeEnv.softCatboyDrop.productId,
    stripePriceId: stripeEnv.softCatboyDrop.priceId,
    stripePaymentLinkId: stripeEnv.softCatboyDrop.paymentLinkId,
    features: ["SFW preview set", "Telegram updates", "Early drop alerts"],
    accent: "catboy",
  },
  {
    title: "Behind The Scenes",
    slug: "behind-the-scenes",
    description: "Backstage shots, styling notes and soft outtakes.",
    price: "€15",
    amountCents: 1500,
    currency: "EUR",
    badge: "Soon",
    status: "coming-soon",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.behindTheScenes.paymentLink,
    stripeProductId: stripeEnv.behindTheScenes.productId,
    stripePriceId: stripeEnv.behindTheScenes.priceId,
    stripePaymentLinkId: stripeEnv.behindTheScenes.paymentLinkId,
    features: ["Drop date to confirm", "Backstage notes", "SFW preview only"],
    accent: "backstage",
  },
  {
    title: "VIP Bundle",
    slug: "vip-bundle",
    description: "Priority access, bundle pricing and custom requests.",
    price: "€29",
    amountCents: 2900,
    currency: "EUR",
    badge: "VIP",
    status: "preview",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.vipBundle.paymentLink,
    stripeProductId: stripeEnv.vipBundle.productId,
    stripePriceId: stripeEnv.vipBundle.priceId,
    stripePaymentLinkId: stripeEnv.vipBundle.paymentLinkId,
    features: ["Private delivery", "Bundle pricing", "Custom requests"],
    accent: "vip",
  },
];
