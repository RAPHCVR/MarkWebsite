import { NextResponse } from "next/server";

import { legalConfig } from "@/data/legal";
import { paymentConfig } from "@/data/payments";
import { products } from "@/data/products";
import { isCloudflareAccessConfigured } from "@/lib/server/admin-auth";
import { isR2DeliveryConfigured } from "@/lib/server/orders";
import { getSolanaPayRpcUrls } from "@/lib/server/solana-pay";
import { isTelegramBotConfigured } from "@/lib/server/telegram";
import { isTurnstileRequired } from "@/lib/server/turnstile";

export const runtime = "nodejs";

export function GET() {
  const stripeProducts = products.map((product) => ({
    slug: product.slug,
    status: product.status,
    checkoutProvider: product.checkoutProvider,
    stripeReady: Boolean(product.stripePaymentLink),
    stripePaymentLinkIdReady: Boolean(product.stripePaymentLinkId),
  }));

  const stablecoinRails = paymentConfig.crypto.stablecoin.rails.map((rail) => ({
    id: rail.id,
    label: rail.label,
    asset: rail.asset,
    network: rail.network,
    provider: rail.provider,
    enabled: rail.enabled,
    recommended: rail.recommended,
  }));
  const solanaPayRpcUrls = getSolanaPayRpcUrls();

  return NextResponse.json({
    ok: true,
    service: "marky-payments",
    salesEnabled: paymentConfig.salesEnabled,
    salesRequested: paymentConfig.requestedSalesEnabled,
    orderDatabaseConfigured: paymentConfig.crypto.databaseConfigured,
    stripe: {
      mode: paymentConfig.stripe.mode,
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      readyProductCount: stripeProducts.filter((product) => product.stripeReady)
        .length,
      products: stripeProducts,
    },
    legal: {
      merchantName: legalConfig.merchantName,
      termsVersion: legalConfig.termsVersion,
      refundPolicyRoute: "/refund-policy",
      privacyPolicyRoute: "/privacy",
      legalNoticeRoute: "/legal",
      commercialVocabulary: legalConfig.commercialVocabulary,
      b2cSalesAllowed: paymentConfig.legal.b2cSalesAllowed,
      salesBlockedByLegalGate: paymentConfig.legal.salesBlockedByLegalGate,
      checkoutConsentCaptured: true,
      cryptoFiatAccountingField: "creator_orders.fiat_value_eur_at_transaction",
    },
    stablecoin: {
      provider: paymentConfig.crypto.stablecoin.preferredProvider,
      checkoutEnabled: paymentConfig.crypto.stablecoin.checkoutEnabled,
      configured: paymentConfig.crypto.stablecoin.configured,
      defaultRail: paymentConfig.crypto.stablecoin.defaultRail,
      rails: stablecoinRails,
      eurToUsdRateSourceEnv:
        paymentConfig.crypto.stablecoin.eurToUsdRateSourceEnv,
      solanaPay: {
        enabled: paymentConfig.crypto.stablecoin.solanaPay.enabled,
        recipientConfigured:
          paymentConfig.crypto.stablecoin.solanaPay.recipientConfigured,
        invoiceTtlMinutes:
          paymentConfig.crypto.stablecoin.solanaPay.invoiceTtlMinutes,
        rpcUrlEnv: paymentConfig.crypto.stablecoin.solanaPay.rpcUrlEnv,
        rpcUrlsEnv: paymentConfig.crypto.stablecoin.solanaPay.rpcUrlsEnv,
        rpcFallbackCount: solanaPayRpcUrls.length,
      },
    },
    btcpay: {
      configured: paymentConfig.crypto.btcpay.configured,
      checkoutEnabled: paymentConfig.crypto.checkoutEnabled,
      btcWalletReady: paymentConfig.crypto.btcpay.btcWalletReady,
      ltcEnabled: paymentConfig.crypto.btcpay.ltcEnabled,
      supportedMethods: paymentConfig.crypto.btcpay.supportedMethods,
      publicCheckoutHost: paymentConfig.crypto.btcpay.publicCheckoutHost,
      healthUrl: `https://${paymentConfig.crypto.btcpay.publicCheckoutHost}/api/v1/health`,
    },
    telegram: {
      deliveryRole: paymentConfig.telegram.deliveryRole,
      channelConfigured: Boolean(paymentConfig.telegram.channelUrl),
      chatConfigured: Boolean(paymentConfig.telegram.chatUrl),
      botConfigured: isTelegramBotConfigured(),
      webhookConfigured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
      adminNotificationsConfigured: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
      adminUserAllowListConfigured: Boolean(process.env.TELEGRAM_ADMIN_USER_IDS),
      vipInviteConfigured: Boolean(process.env.TELEGRAM_VIP_CHAT_ID),
    },
    delivery: {
      configured: isR2DeliveryConfigured(),
      privateBucketConfigured: Boolean(process.env.R2_BUCKET_PRIVATE),
      signedUrlTtlSeconds: Number(process.env.R2_SIGNED_URL_TTL_SECONDS || "300"),
      tokenTtlDays: Number(process.env.DELIVERY_TOKEN_TTL_DAYS || "7"),
      route: "/orders/[token]",
    },
    admin: {
      accountingExportConfigured: Boolean(process.env.ADMIN_API_TOKEN),
      cloudflareAccessConfigured: isCloudflareAccessConfigured(),
      dashboardRoute: "/admin",
      accountingExportRoute: "/api/admin/orders/export",
      privateRequestsExportRoute: "/api/admin/private-requests/export",
      contactRequestsExportRoute: "/api/admin/contact-requests/export",
    },
    contact: {
      turnstileSiteKeyConfigured: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
      turnstileSecretConfigured: Boolean(process.env.TURNSTILE_SECRET_KEY),
      turnstileRequired: isTurnstileRequired(),
    },
  });
}
