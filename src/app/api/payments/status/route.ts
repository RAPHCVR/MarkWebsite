import { NextResponse } from "next/server";

import { paymentConfig } from "@/data/payments";
import { products } from "@/data/products";
import { getSolanaPayRpcUrls } from "@/lib/server/solana-pay";

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
    orderDatabaseConfigured: paymentConfig.crypto.databaseConfigured,
    stripe: {
      mode: paymentConfig.stripe.mode,
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      readyProductCount: stripeProducts.filter((product) => product.stripeReady)
        .length,
      products: stripeProducts,
    },
    stablecoin: {
      provider: paymentConfig.crypto.stablecoin.preferredProvider,
      checkoutEnabled: paymentConfig.crypto.stablecoin.checkoutEnabled,
      configured: paymentConfig.crypto.stablecoin.configured,
      defaultRail: paymentConfig.crypto.stablecoin.defaultRail,
      rails: stablecoinRails,
      solanaPay: {
        enabled: paymentConfig.crypto.stablecoin.solanaPay.enabled,
        recipientConfigured:
          paymentConfig.crypto.stablecoin.solanaPay.recipientConfigured,
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
    },
  });
}
