import { siteConfig } from "@/data/site";

export type CheckoutProvider = "stripe" | "crypto" | "telegram" | "soon";

export type CryptoWallet = {
  network: string;
  symbol: string;
  address: string;
};

export type CryptoProvider = "btcpay-server" | "manual-wallet" | "hosted-checkout" | "none";

const salesEnabled =
  process.env.SALES_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_SALES_ENABLED === "true";

const btcpayConfigured = Boolean(
  process.env.BTCPAY_SERVER_URL &&
    process.env.BTCPAY_STORE_ID &&
    process.env.BTCPAY_API_KEY,
);

export const paymentConfig = {
  salesEnabled,
  publicDomain: siteConfig.domain,
  stripe: {
    mode: "payment-links",
    salesEnabled,
    note:
      "Stripe Payment Links are loaded from server-side environment variables and rendered only when sales are enabled.",
  },
  crypto: {
    preferredProvider: "btcpay-server" satisfies CryptoProvider,
    checkoutUrl: "",
    btcpay: {
      configured: btcpayConfigured,
      checkoutRoute: "/api/checkout/btcpay",
      webhookRoute: "/api/webhooks/btcpay",
      serverUrlEnv: "BTCPAY_SERVER_URL",
      storeIdEnv: "BTCPAY_STORE_ID",
      apiKeyEnv: "BTCPAY_API_KEY",
      webhookSecretEnv: "BTCPAY_WEBHOOK_SECRET",
      publicCheckoutHost: "pay.markshnaknaks.com",
      supportedMethods: ["BTC on-chain after sync", "Lightning later", "LTC later"],
    },
    wallets: [] satisfies CryptoWallet[],
  },
  telegram: {
    channelUrl: siteConfig.telegramChannelUrl,
    chatUrl: siteConfig.telegramChatUrl,
    vipUrl: siteConfig.telegramChatUrl,
    requestBotUrl: siteConfig.telegramChatUrl,
    deliveryRole: "VIP, support and delivery follow-up",
  },
};
