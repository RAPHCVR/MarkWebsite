import { siteConfig } from "@/data/site";
import type { BrandIconKey } from "@/lib/brand-icons";

export type CheckoutProvider = "stripe" | "crypto" | "telegram" | "soon";

export type CryptoWallet = {
  network: string;
  symbol: string;
  address: string;
};

export type CryptoProvider =
  | "btcpay-server"
  | "solana-pay"
  | "shkeeper"
  | "bitcart"
  | "manual-wallet"
  | "hosted-checkout"
  | "none";

export type CryptoRailStatus =
  | "ready"
  | "installed"
  | "planned"
  | "research"
  | "disabled";

export type CryptoRail = {
  id: string;
  label: string;
  asset: string;
  network: string;
  provider: CryptoProvider;
  status: CryptoRailStatus;
  icon?: BrandIconKey;
  recommended: boolean;
  buyerCost: string;
  operations: string;
};

export type StablecoinRailId =
  | "usdc-solana"
  | "usdc-polygon"
  | "usdt-tron";

export type StablecoinRail = {
  id: StablecoinRailId;
  label: string;
  asset: "USDC" | "USDT";
  network: string;
  provider: Extract<CryptoProvider, "solana-pay" | "shkeeper" | "bitcart">;
  cryptoName: string;
  enabled: boolean;
  recommended: boolean;
  buyerCost: string;
  operations: string;
};

const salesEnabled =
  process.env.SALES_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_SALES_ENABLED === "true";

const cryptoCheckoutEnabled =
  salesEnabled &&
  (process.env.CRYPTO_CHECKOUT_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_CRYPTO_CHECKOUT_ENABLED === "true");

const btcpayConfigured = Boolean(
  process.env.BTCPAY_SERVER_URL &&
    process.env.BTCPAY_STORE_ID &&
    process.env.BTCPAY_API_KEY,
);

const databaseConfigured = Boolean(process.env.DATABASE_URL);

const btcpayBtcWalletReady =
  process.env.BTCPAY_BTC_WALLET_READY === "true" &&
  process.env.NEXT_PUBLIC_BTCPAY_BTC_WALLET_READY === "true";

const btcpayLtcEnabled =
  process.env.BTCPAY_LTC_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_BTCPAY_LTC_ENABLED === "true";

const btcpayLtcNodeInstalled = true;

const btcpayPaymentReady = btcpayBtcWalletReady || btcpayLtcEnabled;

const stablecoinProvider =
  process.env.STABLECOIN_PROVIDER === "solana-pay" ||
  process.env.STABLECOIN_PROVIDER === "shkeeper" ||
  process.env.STABLECOIN_PROVIDER === "bitcart"
    ? process.env.STABLECOIN_PROVIDER
    : "none";

const stablecoinRailReady =
  process.env.STABLECOIN_RAIL_READY === "true" &&
  process.env.NEXT_PUBLIC_STABLECOIN_RAIL_READY === "true";

const stablecoinProcessorUrl =
  process.env.STABLECOIN_PROCESSOR_URL ||
  process.env.STABLECOIN_CHECKOUT_URL ||
  "";

const stablecoinRateSource =
  process.env.STABLECOIN_EUR_TO_USD_RATE_SOURCE || "frankfurter";

const stablecoinRateConfigured =
  Boolean(process.env.STABLECOIN_EUR_TO_USD_RATE) ||
  stablecoinRateSource === "frankfurter" ||
  stablecoinRateSource === "auto";

const stablecoinCheckoutConfigured = Boolean(
  stablecoinProvider === "solana-pay"
    ? process.env.SOLANA_PAY_RECIPIENT &&
        stablecoinRateConfigured
    : stablecoinProvider !== "none" &&
        stablecoinProcessorUrl &&
        (process.env.SHKEEPER_API_KEY || process.env.STABLECOIN_API_KEY) &&
        process.env.STABLECOIN_WEBHOOK_SECRET,
);

const plannedStablecoinProvider =
  stablecoinProvider === "none" ? "shkeeper" : stablecoinProvider;

const stablecoinDefaultRail = (process.env.STABLECOIN_DEFAULT_RAIL ||
  "usdc-solana") as StablecoinRailId;

const solanaPayReady =
  stablecoinProvider === "solana-pay" &&
  process.env.SOLANA_PAY_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_SOLANA_PAY_ENABLED === "true" &&
  Boolean(process.env.SOLANA_PAY_RECIPIENT) &&
  stablecoinRateConfigured &&
  stablecoinRailReady;

const configuredSolanaPayTtlMinutes = Number(
  process.env.SOLANA_PAY_INVOICE_TTL_MINUTES || "30",
);
const solanaPayInvoiceTtlMinutes = Number.isFinite(
  configuredSolanaPayTtlMinutes,
)
  ? Math.min(24 * 60, Math.max(5, Math.floor(configuredSolanaPayTtlMinutes)))
  : 30;

export const stablecoinRails = [
  {
    id: "usdc-solana",
    label: "USDC on Solana",
    asset: "USDC",
    network: "Solana",
    provider:
      plannedStablecoinProvider === "bitcart"
        ? "bitcart"
        : plannedStablecoinProvider === "solana-pay"
          ? "solana-pay"
          : "shkeeper",
    cryptoName:
      process.env.SHKEEPER_USDC_SOLANA_CRYPTO_NAME ||
      process.env.SOLANA_PAY_USDC_MINT ||
      "USDC",
    enabled:
      (process.env.STABLECOIN_USDC_SOLANA_ENABLED === "true" ||
        process.env.NEXT_PUBLIC_STABLECOIN_USDC_SOLANA_ENABLED === "true") &&
      (stablecoinProvider === "solana-pay" ? solanaPayReady : stablecoinRailReady),
    recommended: true,
    buyerCost: "Lowest expected stablecoin network cost for small packs.",
    operations:
      stablecoinProvider === "solana-pay"
        ? "Solana Pay transfer request with order reference validation through RPC."
        : "Use SHKeeper with a tested Solana wallet/RPC path; keep disabled until callbacks reconcile orders.",
  },
  {
    id: "usdc-polygon",
    label: "USDC on Polygon",
    asset: "USDC",
    network: "Polygon",
    provider: plannedStablecoinProvider === "bitcart" ? "bitcart" : "shkeeper",
    cryptoName: process.env.SHKEEPER_USDC_POLYGON_CRYPTO_NAME || "POLYGON-USDC",
    enabled:
      process.env.STABLECOIN_USDC_POLYGON_ENABLED === "true" &&
      stablecoinRailReady,
    recommended: false,
    buyerCost: "Low fee EVM fallback if Solana support is awkward for wallets.",
    operations:
      "Good fallback because SHKeeper documents POLYGON-USDC; still needs wallet and RPC checks.",
  },
  {
    id: "usdt-tron",
    label: "USDT on TRON",
    asset: "USDT",
    network: "TRON",
    provider: plannedStablecoinProvider === "bitcart" ? "bitcart" : "shkeeper",
    cryptoName: process.env.SHKEEPER_USDT_TRON_CRYPTO_NAME || "USDT",
    enabled:
      process.env.STABLECOIN_USDT_TRON_ENABLED === "true" &&
      stablecoinRailReady,
    recommended: false,
    buyerCost: "Popular, but Energy/Bandwidth fees can surprise buyers.",
    operations:
      "Enable only after testing fees and refill/energy strategy on the actual wallet.",
  },
] as const satisfies StablecoinRail[];

export const cryptoRails = [
  {
    id: "btc-onchain",
    label: "Bitcoin",
    asset: "BTC",
    network: "Bitcoin mainnet",
    provider: "btcpay-server",
    status: btcpayBtcWalletReady ? "ready" : btcpayConfigured ? "installed" : "planned",
    icon: "bitcoin",
    recommended: true,
    buyerCost: "Low when mempool is calm; slower finality than cards.",
    operations: btcpayBtcWalletReady
      ? "BTCPay BTC wallet is marked ready for invoice creation."
      : "BTCPay is installed, but node sync and a BTC wallet must be verified before public checkout.",
  },
  {
    id: "ltc-onchain",
    label: "Litecoin",
    asset: "LTC",
    network: "Litecoin mainnet",
    provider: "btcpay-server",
    status: btcpayLtcEnabled ? "ready" : btcpayLtcNodeInstalled ? "installed" : "planned",
    icon: "litecoin",
    recommended: true,
    buyerCost: "Very low network fees and familiar wallet support.",
    operations: btcpayLtcEnabled
      ? "Litecoin checkout is enabled by feature flag."
      : "Litecoin node is installed; explorer, wallet setup and invoice smoke test must pass before public checkout.",
  },
  {
    id: "usdc-solana",
    label: "USDC",
    asset: "USDC",
    network: "Solana",
    provider: plannedStablecoinProvider,
    status: stablecoinCheckoutConfigured && stablecoinRails[0].enabled ? "ready" : "planned",
    icon: "circle",
    recommended: true,
    buyerCost: "Usually the cheapest stablecoin rail for small digital packs.",
    operations:
      stablecoinCheckoutConfigured && stablecoinRails[0].enabled
        ? "Solana Pay checkout is live: invoices are recorded in PostgreSQL and verified on-chain by reference."
        : "Stablecoin checkout stays hidden until invoice creation, QR rendering and on-chain verification pass.",
  },
  {
    id: "usdc-polygon",
    label: "USDC",
    asset: "USDC",
    network: "Polygon",
    provider: plannedStablecoinProvider,
    status: stablecoinCheckoutConfigured && stablecoinRails[1].enabled ? "ready" : "planned",
    icon: "polygon",
    recommended: false,
    buyerCost: "Cheap EVM fallback; slightly less universal than Solana for this audience.",
    operations: "Keep as fallback if USDC Solana support is not stable enough.",
  },
  {
    id: "usdt-tron",
    label: "USDT",
    asset: "USDT",
    network: "TRON",
    provider: plannedStablecoinProvider,
    status: "research",
    icon: "tether",
    recommended: false,
    buyerCost: "Popular, but TRC20 energy can become expensive without resources.",
    operations: "Keep as a later buyer-demand option, not launch default.",
  },
  {
    id: "ton-telegram",
    label: "TON",
    asset: "TON",
    network: "TON",
    provider: "manual-wallet",
    status: "research",
    icon: "ton",
    recommended: false,
    buyerCost: "Relevant to Telegram-native buyers, but needs a clean bot flow.",
    operations: "Use only if Telegram delivery becomes the primary paid flow.",
  },
] as const satisfies CryptoRail[];

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
    checkoutEnabled: cryptoCheckoutEnabled && btcpayPaymentReady,
    databaseConfigured,
    checkoutUrl: "",
    rails: cryptoRails,
    stablecoin: {
      preferredProvider: stablecoinProvider satisfies CryptoProvider,
      configured: stablecoinCheckoutConfigured,
      checkoutEnabled:
        cryptoCheckoutEnabled &&
        stablecoinCheckoutConfigured &&
        stablecoinRailReady &&
        stablecoinRails.some((rail) => rail.enabled),
      processorUrl: stablecoinProcessorUrl,
      checkoutRoute: "/api/checkout/stablecoin",
      webhookRoute: "/api/webhooks/shkeeper",
      defaultRail: stablecoinDefaultRail,
      rails: stablecoinRails,
      processorUrlEnv: "STABLECOIN_PROCESSOR_URL",
      apiKeyEnv: "SHKEEPER_API_KEY",
      webhookSecretEnv: "STABLECOIN_WEBHOOK_SECRET",
      fiatEnv: "STABLECOIN_FIAT",
      eurToUsdRateEnv: "STABLECOIN_EUR_TO_USD_RATE",
      eurToUsdRateSourceEnv: "STABLECOIN_EUR_TO_USD_RATE_SOURCE",
      recommendedLaunchRail: "USDC on Solana",
      solanaPay: {
        enabled: solanaPayReady,
        recipientConfigured: Boolean(process.env.SOLANA_PAY_RECIPIENT),
        invoiceTtlMinutes: solanaPayInvoiceTtlMinutes,
        rpcUrlEnv: "SOLANA_PAY_RPC_URL",
        rpcUrlsEnv: "SOLANA_PAY_RPC_URLS",
        recipientEnv: "SOLANA_PAY_RECIPIENT",
        mintEnv: "SOLANA_PAY_USDC_MINT",
        defaultRpcUrl: "https://api.mainnet-beta.solana.com",
        publicProviderCost:
          "Free public RPC fallback for MVP; use SOLANA_PAY_RPC_URLS for multiple read-only RPC endpoints.",
      },
    },
    btcpay: {
      configured: btcpayConfigured,
      btcWalletReady: btcpayBtcWalletReady,
      ltcEnabled: btcpayLtcEnabled,
      ltcNodeInstalled: btcpayLtcNodeInstalled,
      checkoutRoute: "/api/checkout/btcpay",
      webhookRoute: "/api/webhooks/btcpay",
      serverUrlEnv: "BTCPAY_SERVER_URL",
      storeIdEnv: "BTCPAY_STORE_ID",
      apiKeyEnv: "BTCPAY_API_KEY",
      webhookSecretEnv: "BTCPAY_WEBHOOK_SECRET",
      btcWalletReadyEnv: "BTCPAY_BTC_WALLET_READY",
      ltcEnabledEnv: "BTCPAY_LTC_ENABLED",
      publicCheckoutHost: "pay.markshnaknaks.com",
      supportedMethods: [
        btcpayLtcEnabled ? "LTC on-chain" : "LTC after wallet setup and invoice smoke test",
        btcpayBtcWalletReady
          ? "BTC on-chain"
          : "BTC on-chain after node sync and wallet setup",
      ],
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
