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
    title: "Digital Access Pass",
    slug: "cosplay-starter-pack",
    description: "Personal creator platform access with private site delivery.",
    price: "€9",
    amountCents: 900,
    currency: "EUR",
    badge: "New",
    status: "ready",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.cosplayStarterPack.paymentLink,
    stripeProductId: stripeEnv.cosplayStarterPack.productId,
    stripePriceId: stripeEnv.cosplayStarterPack.priceId,
    stripePaymentLinkId: stripeEnv.cosplayStarterPack.paymentLinkId,
    features: ["Personal access right", "Private delivery token", "Support follow-up"],
    accent: "lace",
  },
  {
    title: "Premium Platform Membership",
    slug: "soft-catboy-drop",
    description: "Membership-style access, updates and Telegram follow-up.",
    price: "€12",
    amountCents: 1200,
    currency: "EUR",
    badge: "Popular",
    status: "ready",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.softCatboyDrop.paymentLink,
    stripeProductId: stripeEnv.softCatboyDrop.productId,
    stripePriceId: stripeEnv.softCatboyDrop.priceId,
    stripePaymentLinkId: stripeEnv.softCatboyDrop.paymentLinkId,
    features: ["Premium access", "Telegram concierge", "Platform updates"],
    accent: "catboy",
  },
  {
    title: "Content Delivery Token",
    slug: "behind-the-scenes",
    description: "Time-limited delivery token for the next private release.",
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
    features: ["Launch date to confirm", "Private delivery", "Site access"],
    accent: "backstage",
  },
  {
    title: "VIP Infrastructure Access",
    slug: "vip-bundle",
    description: "Ticketed private requests handled through Marky Concierge.",
    price: "€29",
    amountCents: 2900,
    currency: "EUR",
    badge: "VIP",
    status: "ready",
    checkoutProvider: "stripe",
    stripePaymentLink: stripeEnv.vipBundle.paymentLink,
    stripeProductId: stripeEnv.vipBundle.productId,
    stripePriceId: stripeEnv.vipBundle.priceId,
    stripePaymentLinkId: stripeEnv.vipBundle.paymentLinkId,
    features: ["VIP access", "Ticketed requests", "Concierge support"],
    accent: "vip",
  },
];
