import { createHash, randomBytes, randomUUID } from "node:crypto";

import { Pool } from "pg";

import type { Product } from "@/data/products";
import { notifyDeliveryReady } from "@/lib/server/telegram";

type CheckoutInvoiceRecord = {
  orderId: string;
  provider?: string;
  product: Product;
  providerInvoiceId: string;
  checkoutLink: string;
  providerStatus?: string;
  fiatValueEurAtTransaction?: number | null;
  legalTermsVersion?: string | null;
  withdrawalWaiverAcceptedAt?: string | null;
  metadata?: Record<string, unknown>;
};

type BtcpayWebhookEvent = {
  type?: string;
  invoiceId?: string;
  metadata?: Record<string, unknown>;
  invoice?: {
    metadata?: Record<string, unknown>;
  };
};

type ShkeeperWebhookEvent = {
  external_id?: string;
  crypto?: string;
  addr?: string;
  fiat?: string;
  paid?: boolean;
  status?: string;
  transactions?: Array<Record<string, unknown>>;
};

type StripeCheckoutSessionRecord = {
  eventId: string;
  eventType: string;
  sessionId: string;
  clientReferenceId?: string | null;
  paymentLinkId?: string | null;
  productSlug?: string | null;
  productTitle?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  status: string;
  customerEmail?: string | null;
  metadata?: Record<string, unknown>;
};

type SolanaPayVerificationRecord = {
  orderId: string;
  signature: string;
  slot?: string;
  confirmationStatus?: string | null;
};

type ContactRequestRecord = {
  name: string;
  organization: string;
  message: string;
  source?: string;
  userAgent?: string;
};

type PrivateRequestTicketRecord = {
  chatId: string;
  userId?: string | number;
  username?: string;
  message: string;
};

type PrivateRequestAdminReplyRecord = {
  replyToken: string;
  message: string;
  adminChatId: string;
  adminUserId?: string | number;
  adminUsername?: string;
};

type RateLimitCheck = {
  action: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

type DeliveryTokenRecord = {
  orderId: string;
  ttlDays?: number;
};

type DeliveryLookupOptions = {
  countRedemption?: boolean;
};

type TelegramDeliveryLinkRecord = {
  token: string;
  chatId: string;
  userId?: string | number;
  username?: string;
  firstName?: string;
};

type AccountingExportOptions = {
  from?: Date;
  to?: Date;
  limit?: number;
};

export type CreatorOrderAccountingRow = {
  orderId: string;
  provider: string;
  providerInvoiceId: string | null;
  productSlug: string | null;
  productTitle: string | null;
  amountCents: number | null;
  currency: string | null;
  fiatValueEurAtTransaction: number | null;
  fiatCurrency: string | null;
  status: string;
  lastEventType: string | null;
  legalTermsVersion: string | null;
  withdrawalWaiverAcceptedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatorOrder = {
  orderId: string;
  provider: string;
  providerInvoiceId: string | null;
  productSlug: string | null;
  productTitle: string | null;
  amountCents: number | null;
  currency: string | null;
  fiatValueEurAtTransaction: number | null;
  fiatCurrency: string | null;
  status: string;
  checkoutLink: string | null;
  lastEventType: string | null;
  metadata: Record<string, unknown>;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatorDeliveryAsset = {
  assetId: string;
  productSlug: string;
  title: string;
  description: string | null;
  bucket: string;
  objectKey: string;
  downloadName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  sortOrder: number;
};

export type CreatorDelivery = {
  tokenId: string;
  token: string;
  entitlementId: string;
  order: CreatorOrder;
  productSlug: string;
  productTitle: string | null;
  expiresAt: Date;
  redeemedAt: Date | null;
  assets: CreatorDeliveryAsset[];
};

export type PrivateRequestTicketResult =
  | {
      ok: true;
      requestId: string;
      orderId: string;
      productTitle: string | null;
      quotaUsed: number;
      quotaTotal: number;
      remaining: number;
      message: string;
      replyToken: string;
    }
  | {
      ok: false;
      reason: "not-linked" | "quota-exhausted" | "empty-message";
    };

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

export function isOrdersDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return pool;
}

async function ensureSchema() {
  schemaReady ??= getPool().query(`
    CREATE TABLE IF NOT EXISTS creator_orders (
      order_id text PRIMARY KEY,
      provider text NOT NULL,
      provider_invoice_id text UNIQUE,
      product_slug text,
      product_title text,
      amount_cents integer,
      currency text,
      fiat_value_eur_at_transaction numeric(12,2),
      fiat_currency text NOT NULL DEFAULT 'EUR',
      legal_terms_version text,
      withdrawal_waiver_accepted_at timestamptz,
      status text NOT NULL,
      checkout_link text,
      last_event_type text,
      paid_at timestamptz,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE creator_orders
      ADD COLUMN IF NOT EXISTS fiat_value_eur_at_transaction numeric(12,2),
      ADD COLUMN IF NOT EXISTS fiat_currency text NOT NULL DEFAULT 'EUR',
      ADD COLUMN IF NOT EXISTS legal_terms_version text,
      ADD COLUMN IF NOT EXISTS withdrawal_waiver_accepted_at timestamptz,
      ADD COLUMN IF NOT EXISTS paid_at timestamptz;

    CREATE INDEX IF NOT EXISTS creator_orders_provider_invoice_id_idx
      ON creator_orders(provider_invoice_id);

    CREATE INDEX IF NOT EXISTS creator_orders_status_idx
      ON creator_orders(status);

    CREATE INDEX IF NOT EXISTS creator_orders_paid_at_idx
      ON creator_orders(paid_at DESC);

    CREATE TABLE IF NOT EXISTS creator_contact_requests (
      request_id text PRIMARY KEY,
      name text,
      organization text,
      message text NOT NULL,
      source text,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS creator_contact_requests_created_at_idx
      ON creator_contact_requests(created_at DESC);

    CREATE TABLE IF NOT EXISTS creator_rate_limits (
      rate_key text NOT NULL,
      bucket_start timestamptz NOT NULL,
      hits integer NOT NULL DEFAULT 0,
      PRIMARY KEY (rate_key, bucket_start)
    );

    CREATE TABLE IF NOT EXISTS creator_entitlements (
      entitlement_id text PRIMARY KEY,
      order_id text NOT NULL REFERENCES creator_orders(order_id) ON DELETE CASCADE,
      product_slug text NOT NULL,
      product_title text,
      telegram_chat_id text,
      telegram_user_id text,
      telegram_username text,
      telegram_linked_at timestamptz,
      status text NOT NULL DEFAULT 'active',
      delivery_channel text NOT NULL DEFAULT 'site',
      granted_at timestamptz NOT NULL DEFAULT now(),
      revoked_at timestamptz,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      UNIQUE (order_id, product_slug)
    );

    ALTER TABLE creator_entitlements
      ADD COLUMN IF NOT EXISTS telegram_chat_id text,
      ADD COLUMN IF NOT EXISTS telegram_user_id text,
      ADD COLUMN IF NOT EXISTS telegram_username text,
      ADD COLUMN IF NOT EXISTS telegram_linked_at timestamptz;

    CREATE INDEX IF NOT EXISTS creator_entitlements_product_slug_idx
      ON creator_entitlements(product_slug);

    CREATE TABLE IF NOT EXISTS creator_assets (
      asset_id text PRIMARY KEY,
      product_slug text NOT NULL,
      title text NOT NULL,
      description text,
      bucket text NOT NULL,
      object_key text NOT NULL,
      download_name text,
      content_type text,
      size_bytes bigint,
      sort_order integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (bucket, object_key)
    );

    CREATE INDEX IF NOT EXISTS creator_assets_product_slug_idx
      ON creator_assets(product_slug, sort_order);

    CREATE TABLE IF NOT EXISTS creator_delivery_tokens (
      token_id text PRIMARY KEY,
      token_hash text NOT NULL UNIQUE,
      entitlement_id text NOT NULL REFERENCES creator_entitlements(entitlement_id) ON DELETE CASCADE,
      order_id text NOT NULL REFERENCES creator_orders(order_id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      redeemed_at timestamptz,
      max_redemptions integer NOT NULL DEFAULT 25,
      redemption_count integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_accessed_at timestamptz,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    );

    CREATE INDEX IF NOT EXISTS creator_delivery_tokens_order_id_idx
      ON creator_delivery_tokens(order_id);

    CREATE TABLE IF NOT EXISTS creator_delivery_events (
      event_id text PRIMARY KEY,
      order_id text NOT NULL,
      entitlement_id text,
      token_id text,
      event_type text NOT NULL,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS creator_delivery_events_order_id_idx
      ON creator_delivery_events(order_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS creator_telegram_links (
      link_id text PRIMARY KEY,
      order_id text NOT NULL REFERENCES creator_orders(order_id) ON DELETE CASCADE,
      entitlement_id text REFERENCES creator_entitlements(entitlement_id) ON DELETE SET NULL,
      token_id text REFERENCES creator_delivery_tokens(token_id) ON DELETE SET NULL,
      telegram_chat_id text NOT NULL,
      telegram_user_id text,
      telegram_username text,
      telegram_first_name text,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (order_id, telegram_chat_id)
    );

    CREATE INDEX IF NOT EXISTS creator_telegram_links_chat_idx
      ON creator_telegram_links(telegram_chat_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS creator_private_requests (
      request_id text PRIMARY KEY,
      order_id text NOT NULL REFERENCES creator_orders(order_id) ON DELETE CASCADE,
      entitlement_id text REFERENCES creator_entitlements(entitlement_id) ON DELETE SET NULL,
      telegram_chat_id text,
      telegram_user_id text,
      status text NOT NULL DEFAULT 'available',
      quota_total integer NOT NULL DEFAULT 1,
      quota_used integer NOT NULL DEFAULT 0,
      subject text,
      last_message text,
      last_admin_reply text,
      admin_reply_count integer NOT NULL DEFAULT 0,
      admin_replied_at timestamptz,
      telegram_reply_token text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      closed_at timestamptz
    );

    ALTER TABLE creator_private_requests
      ADD COLUMN IF NOT EXISTS last_admin_reply text,
      ADD COLUMN IF NOT EXISTS admin_reply_count integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_replied_at timestamptz,
      ADD COLUMN IF NOT EXISTS telegram_reply_token text;

    CREATE INDEX IF NOT EXISTS creator_private_requests_order_idx
      ON creator_private_requests(order_id, created_at DESC);

    CREATE UNIQUE INDEX IF NOT EXISTS creator_private_requests_telegram_reply_token_idx
      ON creator_private_requests(telegram_reply_token)
      WHERE telegram_reply_token IS NOT NULL;
  `).then(() => undefined);

  return schemaReady;
}

function hashRateLimitKey(action: string, key: string) {
  return createHash("sha256").update(`${action}:${key}`).digest("hex");
}

function hashDeliveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getPrivateRequestReplyToken(requestId: string) {
  return createHash("sha256")
    .update(`telegram-private-reply:${requestId}`)
    .digest("base64url")
    .slice(0, 32);
}

function getProductFiatValueEur(product: Product) {
  return product.currency === "EUR" ? product.amountCents / 100 : null;
}

function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function isPaidStripeStatus(eventType: string, status: string) {
  return (
    (eventType === "checkout.session.completed" &&
      ["paid", "complete", "no_payment_required"].includes(status)) ||
    eventType === "checkout.session.async_payment_succeeded"
  );
}

function getNormalizedStripeStatus(eventType: string, status: string) {
  if (isPaidStripeStatus(eventType, status)) {
    return "PAID";
  }

  if (eventType === "checkout.session.expired") {
    return "EXPIRED";
  }

  if (eventType === "checkout.session.async_payment_failed") {
    return "FAILED";
  }

  return status || eventType;
}

function isPaidBtcpayEvent(eventType?: string) {
  return Boolean(
    eventType &&
      ["InvoiceSettled", "InvoicePaymentSettled"].includes(eventType),
  );
}

function getNormalizedBtcpayStatus(eventType?: string) {
  if (isPaidBtcpayEvent(eventType)) {
    return "PAID";
  }

  if (!eventType) {
    return "UNKNOWN";
  }

  if (["InvoiceExpired", "InvoiceInvalid"].includes(eventType)) {
    return "EXPIRED";
  }

  if (["InvoiceProcessing", "InvoiceReceivedPayment"].includes(eventType)) {
    return "PENDING";
  }

  return eventType;
}

function isPaidShkeeperEvent(event: ShkeeperWebhookEvent) {
  const status = event.status?.toLowerCase();

  return event.paid === true || status === "paid" || status === "confirmed";
}

function getNormalizedShkeeperStatus(event: ShkeeperWebhookEvent) {
  if (isPaidShkeeperEvent(event)) {
    return "PAID";
  }

  const status = event.status?.toLowerCase();

  if (status === "expired" || status === "cancelled" || status === "failed") {
    return status.toUpperCase();
  }

  return event.status ?? (event.paid ? "PAID" : "UNPAID");
}

export function isR2DeliveryConfigured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_PRIVATE,
  );
}

async function insertDeliveryEvent({
  orderId,
  entitlementId,
  tokenId,
  eventType,
  metadata = {},
}: {
  orderId: string;
  entitlementId?: string | null;
  tokenId?: string | null;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  await getPool().query(
    `
      INSERT INTO creator_delivery_events (
        event_id,
        order_id,
        entitlement_id,
        token_id,
        event_type,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      `delivery-event-${randomUUID()}`,
      orderId,
      entitlementId ?? null,
      tokenId ?? null,
      eventType,
      JSON.stringify(metadata),
    ],
  );
}

function getBucketStart(windowSeconds: number) {
  const safeWindowSeconds = Math.max(1, Math.floor(windowSeconds));
  const bucketMs = safeWindowSeconds * 1000;

  return new Date(Math.floor(Date.now() / bucketMs) * bucketMs);
}

export async function checkRateLimit({
  action,
  key,
  limit,
  windowSeconds,
}: RateLimitCheck) {
  await ensureSchema();

  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindowSeconds = Math.max(1, Math.floor(windowSeconds));
  const rateKey = hashRateLimitKey(action, key || "unknown");
  const bucketStart = getBucketStart(safeWindowSeconds);

  const result = await getPool().query(
    `
      INSERT INTO creator_rate_limits (rate_key, bucket_start, hits)
      VALUES ($1, $2, 1)
      ON CONFLICT (rate_key, bucket_start) DO UPDATE SET
        hits = creator_rate_limits.hits + 1
      RETURNING hits
    `,
    [rateKey, bucketStart],
  );

  const hits = Number(result.rows[0]?.hits ?? 0);

  if (Math.random() < 0.02) {
    await getPool()
      .query(
        `
          DELETE FROM creator_rate_limits
          WHERE bucket_start < now() - interval '24 hours'
        `,
      )
      .catch(() => undefined);
  }

  return {
    allowed: hits <= safeLimit,
    hits,
    limit: safeLimit,
    retryAfterSeconds: safeWindowSeconds,
  };
}

export async function ensureOrdersDatabaseReady() {
  await ensureSchema();
}

export async function recordCheckoutInvoice({
  orderId,
  provider = "btcpay",
  product,
  providerInvoiceId,
  checkoutLink,
  providerStatus = "new",
  fiatValueEurAtTransaction,
  legalTermsVersion,
  withdrawalWaiverAcceptedAt,
  metadata = {},
}: CheckoutInvoiceRecord) {
  await ensureSchema();

  const fiatValue =
    fiatValueEurAtTransaction ?? getProductFiatValueEur(product);

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        product_title,
        amount_cents,
        currency,
        fiat_value_eur_at_transaction,
        fiat_currency,
        legal_terms_version,
        withdrawal_waiver_accepted_at,
        status,
        checkout_link,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'EUR', $9, $10::timestamptz, $11, $12, $13::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = EXCLUDED.provider_invoice_id,
        product_slug = EXCLUDED.product_slug,
        product_title = EXCLUDED.product_title,
        amount_cents = EXCLUDED.amount_cents,
        currency = EXCLUDED.currency,
        fiat_value_eur_at_transaction = COALESCE(EXCLUDED.fiat_value_eur_at_transaction, creator_orders.fiat_value_eur_at_transaction),
        fiat_currency = COALESCE(EXCLUDED.fiat_currency, creator_orders.fiat_currency),
        legal_terms_version = COALESCE(EXCLUDED.legal_terms_version, creator_orders.legal_terms_version),
        withdrawal_waiver_accepted_at = COALESCE(EXCLUDED.withdrawal_waiver_accepted_at, creator_orders.withdrawal_waiver_accepted_at),
        status = EXCLUDED.status,
        checkout_link = EXCLUDED.checkout_link,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      provider,
      providerInvoiceId,
      product.slug,
      product.title,
      product.amountCents,
      product.currency,
      fiatValue,
      legalTermsVersion ?? null,
      withdrawalWaiverAcceptedAt ?? null,
      providerStatus,
      checkoutLink,
      JSON.stringify(metadata),
    ],
  );
}

export async function recordBtcpayCheckoutInvoice(record: CheckoutInvoiceRecord) {
  await recordCheckoutInvoice({
    ...record,
    provider: "btcpay",
  });
}

export async function recordBtcpayWebhookEvent(event: BtcpayWebhookEvent) {
  await ensureSchema();

  const metadata = event.metadata ?? event.invoice?.metadata ?? {};
  const orderId =
    typeof metadata.orderId === "string"
      ? metadata.orderId
      : event.invoiceId
        ? `btcpay-${event.invoiceId}`
        : `btcpay-event-${randomUUID()}`;
  const normalizedStatus = getNormalizedBtcpayStatus(event.type);

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        status,
        last_event_type,
        paid_at,
        metadata
      )
      VALUES ($1, 'btcpay', $2, $3, $4, $5, CASE WHEN $4 = 'PAID' THEN now() ELSE null END, $6::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        product_slug = COALESCE(EXCLUDED.product_slug, creator_orders.product_slug),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
        paid_at = CASE
          WHEN EXCLUDED.status = 'PAID' THEN COALESCE(creator_orders.paid_at, now())
          ELSE creator_orders.paid_at
        END,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      event.invoiceId ?? null,
      typeof metadata.productSlug === "string" ? metadata.productSlug : null,
      normalizedStatus,
      event.type ?? null,
      JSON.stringify({ btcpayEvent: event }),
    ],
  );

  if (isPaidBtcpayEvent(event.type)) {
    await grantEntitlementForOrder(orderId);
  }
}

export async function recordShkeeperWebhookEvent(event: ShkeeperWebhookEvent) {
  await ensureSchema();

  const orderId =
    typeof event.external_id === "string" && event.external_id
      ? event.external_id
      : `shkeeper-event-${randomUUID()}`;
  const normalizedStatus = getNormalizedShkeeperStatus(event);

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        status,
        last_event_type,
        paid_at,
        metadata
      )
      VALUES ($1, 'shkeeper', $2, $3, $4, CASE WHEN $3 = 'PAID' THEN now() ELSE null END, $5::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
        paid_at = CASE
          WHEN EXCLUDED.status = 'PAID' THEN COALESCE(creator_orders.paid_at, now())
          ELSE creator_orders.paid_at
        END,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      null,
      normalizedStatus,
      "shkeeper.webhook",
      JSON.stringify({ shkeeperEvent: event }),
    ],
  );

  if (isPaidShkeeperEvent(event)) {
    await grantEntitlementForOrder(orderId);
  }
}

export async function recordStripeCheckoutSessionEvent({
  eventId,
  eventType,
  sessionId,
  clientReferenceId,
  paymentLinkId,
  productSlug,
  productTitle,
  amountTotal,
  currency,
  status,
  customerEmail,
  metadata = {},
}: StripeCheckoutSessionRecord) {
  await ensureSchema();

  const orderId =
    clientReferenceId?.startsWith("marky-stripe-")
      ? clientReferenceId
      : `stripe-${sessionId}`;
  const fiatValue =
    currency?.toUpperCase() === "EUR" && amountTotal
      ? amountTotal / 100
      : null;
  const normalizedStatus = getNormalizedStripeStatus(eventType, status);

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        product_title,
        amount_cents,
        currency,
        fiat_value_eur_at_transaction,
        fiat_currency,
        status,
        last_event_type,
        paid_at,
        metadata
      )
      VALUES ($1, 'stripe', $2, $3, $4, $5, $6, $7, 'EUR', $8, $9, CASE WHEN $8 = 'PAID' THEN now() ELSE null END, $10::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        product_slug = COALESCE(EXCLUDED.product_slug, creator_orders.product_slug),
        product_title = COALESCE(EXCLUDED.product_title, creator_orders.product_title),
        amount_cents = COALESCE(EXCLUDED.amount_cents, creator_orders.amount_cents),
        currency = COALESCE(EXCLUDED.currency, creator_orders.currency),
        fiat_value_eur_at_transaction = COALESCE(EXCLUDED.fiat_value_eur_at_transaction, creator_orders.fiat_value_eur_at_transaction),
        fiat_currency = COALESCE(EXCLUDED.fiat_currency, creator_orders.fiat_currency),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
        paid_at = CASE
          WHEN EXCLUDED.status = 'PAID' THEN COALESCE(creator_orders.paid_at, now())
          ELSE creator_orders.paid_at
        END,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      sessionId,
      productSlug ?? null,
      productTitle ?? null,
      amountTotal ?? null,
      currency?.toUpperCase() ?? null,
      fiatValue,
      normalizedStatus,
      eventType,
      JSON.stringify({
        stripeEvent: {
          eventId,
          eventType,
          sessionId,
          clientReferenceId,
          paymentLinkId,
          customerEmail,
          receivedAt: new Date().toISOString(),
        },
        ...metadata,
      }),
    ],
  );

  if (isPaidStripeStatus(eventType, status)) {
    await grantEntitlementForOrder(orderId);
  }
}

export async function recordSolanaPayVerification({
  orderId,
  signature,
  slot,
  confirmationStatus,
}: SolanaPayVerificationRecord) {
  await ensureSchema();

  await getPool().query(
    `
      UPDATE creator_orders
      SET
        status = 'PAID',
        provider_invoice_id = COALESCE(provider_invoice_id, $2),
        last_event_type = 'solana-pay.verified',
        paid_at = COALESCE(paid_at, now()),
        metadata = metadata || $3::jsonb,
        updated_at = now()
      WHERE order_id = $1
    `,
    [
      orderId,
      signature,
      JSON.stringify({
        solanaPayVerification: {
          signature,
          slot,
          confirmationStatus,
          verifiedAt: new Date().toISOString(),
        },
      }),
    ],
  );

  return grantEntitlementForOrder(orderId);
}

export async function getOrderById(orderId: string) {
  await ensureSchema();

  const result = await getPool().query(
    `
      SELECT
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        product_title,
        amount_cents,
        currency,
        fiat_value_eur_at_transaction,
        fiat_currency,
        status,
        checkout_link,
        last_event_type,
        paid_at,
        metadata,
        created_at,
        updated_at
      FROM creator_orders
      WHERE order_id = $1
      LIMIT 1
    `,
    [orderId],
  );

  const row = result.rows[0] as
    | {
        order_id: string;
        provider: string;
        provider_invoice_id: string | null;
        product_slug: string | null;
        product_title: string | null;
        amount_cents: number | null;
        currency: string | null;
        fiat_value_eur_at_transaction: string | number | null;
        fiat_currency: string | null;
        status: string;
        checkout_link: string | null;
        last_event_type: string | null;
        paid_at: Date | null;
        metadata: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    orderId: row.order_id,
    provider: row.provider,
    providerInvoiceId: row.provider_invoice_id,
    productSlug: row.product_slug,
    productTitle: row.product_title,
    amountCents: row.amount_cents,
    currency: row.currency,
    fiatValueEurAtTransaction: toNumberOrNull(row.fiat_value_eur_at_transaction),
    fiatCurrency: row.fiat_currency,
    status: row.status,
    checkoutLink: row.checkout_link,
    lastEventType: row.last_event_type,
    metadata: row.metadata ?? {},
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies CreatorOrder;
}

export async function grantEntitlementForOrder(orderId: string) {
  await ensureSchema();

  const order = await getOrderById(orderId);

  if (!order?.productSlug) {
    return null;
  }

  const entitlementId = `entitlement-${order.orderId}-${order.productSlug}`;

  const result = await getPool().query(
    `
      INSERT INTO creator_entitlements (
        entitlement_id,
        order_id,
        product_slug,
        product_title,
        status,
        metadata
      )
      VALUES ($1, $2, $3, $4, 'active', $5::jsonb)
      ON CONFLICT (order_id, product_slug) DO UPDATE SET
        status = 'active',
        revoked_at = null,
        metadata = creator_entitlements.metadata || EXCLUDED.metadata
      RETURNING entitlement_id
    `,
    [
      entitlementId,
      order.orderId,
      order.productSlug,
      order.productTitle,
      JSON.stringify({
        grantedFromStatus: order.status,
        grantedFromProvider: order.provider,
        grantedAt: new Date().toISOString(),
      }),
    ],
  );

  const storedEntitlementId = String(
    result.rows[0]?.entitlement_id ?? entitlementId,
  );
  const deliveryToken = await createDeliveryTokenForOrder({ orderId });

  await insertDeliveryEvent({
    orderId,
    entitlementId: storedEntitlementId,
    tokenId: deliveryToken?.tokenId,
    eventType: "entitlement.granted",
    metadata: {
      productSlug: order.productSlug,
      deliveryUrl: deliveryToken?.url,
    },
  });

  if (deliveryToken?.url) {
    try {
      const notification = await notifyDeliveryReady({
        order,
        deliveryUrl: deliveryToken.url,
      });

      await insertDeliveryEvent({
        orderId,
        entitlementId: storedEntitlementId,
        tokenId: deliveryToken.tokenId,
        eventType: notification.ok
          ? "delivery.notification.sent"
          : "delivery.notification.skipped",
        metadata: {
          channel: "telegram",
          skipped: "skipped" in notification ? notification.skipped : false,
          status: "status" in notification ? notification.status : undefined,
          description:
            "description" in notification ? notification.description : undefined,
        },
      });
    } catch (error) {
      await insertDeliveryEvent({
        orderId,
        entitlementId: storedEntitlementId,
        tokenId: deliveryToken.tokenId,
        eventType: "delivery.notification.failed",
        metadata: {
          channel: "telegram",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  if (order.productSlug === "vip-bundle") {
    await ensurePrivateRequestForOrder({
      orderId,
      entitlementId: storedEntitlementId,
      quotaTotal: 3,
      subject: "VIP Infrastructure Access",
    });
  }

  return {
    entitlementId: storedEntitlementId,
    deliveryToken,
    order,
  };
}

export async function ensurePrivateRequestForOrder({
  orderId,
  entitlementId,
  quotaTotal = 1,
  subject,
}: {
  orderId: string;
  entitlementId?: string | null;
  quotaTotal?: number;
  subject?: string | null;
}) {
  await ensureSchema();

  const requestId = `private-request-${orderId}`;

  await getPool().query(
    `
      INSERT INTO creator_private_requests (
        request_id,
        order_id,
        entitlement_id,
        quota_total,
        subject
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (request_id) DO UPDATE SET
        entitlement_id = COALESCE(EXCLUDED.entitlement_id, creator_private_requests.entitlement_id),
        quota_total = GREATEST(creator_private_requests.quota_total, EXCLUDED.quota_total),
        subject = COALESCE(EXCLUDED.subject, creator_private_requests.subject),
        updated_at = now()
    `,
    [requestId, orderId, entitlementId ?? null, quotaTotal, subject ?? null],
  );

  return requestId;
}

export async function recordPrivateRequestTicketFromTelegram({
  chatId,
  userId,
  username,
  message,
}: PrivateRequestTicketRecord): Promise<PrivateRequestTicketResult> {
  await ensureSchema();

  const cleanMessage = message.trim().slice(0, 2_000);

  if (!cleanMessage) {
    return { ok: false, reason: "empty-message" };
  }

  const userIdText = userId === undefined ? null : String(userId);
  const result = await getPool().query(
    `
      WITH selected_request AS (
        SELECT
          private_requests.request_id
        FROM creator_private_requests private_requests
        LEFT JOIN creator_entitlements entitlements
          ON entitlements.entitlement_id = private_requests.entitlement_id
        WHERE private_requests.status IN ('available', 'open', 'answered')
          AND private_requests.quota_used < private_requests.quota_total
          AND (
            private_requests.telegram_chat_id = $1
            OR private_requests.telegram_user_id = $2
            OR entitlements.telegram_chat_id = $1
            OR entitlements.telegram_user_id = $2
          )
        ORDER BY private_requests.created_at ASC
        LIMIT 1
      )
      UPDATE creator_private_requests private_requests
      SET
        telegram_chat_id = COALESCE(private_requests.telegram_chat_id, $1),
        telegram_user_id = COALESCE(private_requests.telegram_user_id, $2),
        last_message = $3,
        quota_used = private_requests.quota_used + 1,
        status = CASE
          WHEN private_requests.quota_used + 1 >= private_requests.quota_total THEN 'used'
          ELSE 'open'
        END,
        updated_at = now(),
        closed_at = CASE
          WHEN private_requests.quota_used + 1 >= private_requests.quota_total THEN now()
          ELSE private_requests.closed_at
        END
      FROM selected_request
      CROSS JOIN creator_orders orders
      WHERE private_requests.request_id = selected_request.request_id
        AND orders.order_id = private_requests.order_id
      RETURNING
        private_requests.request_id,
        private_requests.order_id,
        private_requests.quota_used,
        private_requests.quota_total,
        orders.product_title
    `,
    [chatId, userIdText, cleanMessage],
  );

  const row = result.rows[0] as
    | {
        request_id: string;
        order_id: string;
        quota_used: number;
        quota_total: number;
        product_title: string | null;
      }
    | undefined;

  if (!row) {
    const linked = await getPool().query(
      `
        SELECT 1
        FROM creator_private_requests private_requests
        LEFT JOIN creator_entitlements entitlements
          ON entitlements.entitlement_id = private_requests.entitlement_id
        WHERE (
          private_requests.telegram_chat_id = $1
          OR private_requests.telegram_user_id = $2
          OR entitlements.telegram_chat_id = $1
          OR entitlements.telegram_user_id = $2
        )
        LIMIT 1
      `,
      [chatId, userIdText],
    );

    return {
      ok: false,
      reason: linked.rowCount ? "quota-exhausted" : "not-linked",
    };
  }

  await insertDeliveryEvent({
    orderId: row.order_id,
    eventType: "private_request.submitted",
    metadata: {
      requestId: row.request_id,
      telegramChatId: chatId,
      telegramUserId: userIdText,
      telegramUsername: username ?? null,
      quotaUsed: Number(row.quota_used),
      quotaTotal: Number(row.quota_total),
    },
  });

  const quotaUsed = Number(row.quota_used);
  const quotaTotal = Number(row.quota_total);
  const replyToken = getPrivateRequestReplyToken(String(row.request_id));

  await getPool().query(
    `
      UPDATE creator_private_requests
      SET
        telegram_reply_token = COALESCE(telegram_reply_token, $2),
        updated_at = now()
      WHERE request_id = $1
    `,
    [row.request_id, replyToken],
  );

  return {
    ok: true,
    requestId: String(row.request_id),
    orderId: String(row.order_id),
    productTitle: row.product_title ? String(row.product_title) : null,
    quotaUsed,
    quotaTotal,
    remaining: Math.max(0, quotaTotal - quotaUsed),
    message: cleanMessage,
    replyToken,
  };
}

export async function getPrivateRequestReplyPrompt(replyToken: string) {
  await ensureSchema();

  const result = await getPool().query(
    `
      SELECT
        private_requests.request_id,
        private_requests.order_id,
        private_requests.subject,
        private_requests.last_message,
        private_requests.telegram_chat_id,
        private_requests.telegram_user_id,
        orders.product_title
      FROM creator_private_requests private_requests
      JOIN creator_orders orders ON orders.order_id = private_requests.order_id
      WHERE private_requests.telegram_reply_token = $1
      LIMIT 1
    `,
    [replyToken],
  );

  const row = result.rows[0] as
    | {
        request_id: string;
        order_id: string;
        subject: string | null;
        last_message: string | null;
        telegram_chat_id: string | null;
        telegram_user_id: string | null;
        product_title: string | null;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    requestId: String(row.request_id),
    orderId: String(row.order_id),
    subject: row.subject ? String(row.subject) : null,
    lastMessage: row.last_message ? String(row.last_message) : null,
    telegramChatId: row.telegram_chat_id ? String(row.telegram_chat_id) : null,
    telegramUserId: row.telegram_user_id ? String(row.telegram_user_id) : null,
    productTitle: row.product_title ? String(row.product_title) : null,
  };
}

export async function recordPrivateRequestAdminReplyFromTelegram({
  replyToken,
  message,
  adminChatId,
  adminUserId,
  adminUsername,
}: PrivateRequestAdminReplyRecord) {
  await ensureSchema();

  const cleanMessage = message.trim().slice(0, 2_000);

  if (!cleanMessage) {
    return { ok: false as const, reason: "empty-message" as const };
  }

  const result = await getPool().query(
    `
      UPDATE creator_private_requests private_requests
      SET
        last_admin_reply = $2,
        admin_reply_count = private_requests.admin_reply_count + 1,
        admin_replied_at = now(),
        status = CASE
          WHEN private_requests.status IN ('available', 'open', 'used', 'answered')
            THEN 'answered'
          ELSE private_requests.status
        END,
        updated_at = now()
      FROM creator_orders orders
      WHERE private_requests.order_id = orders.order_id
        AND private_requests.telegram_reply_token = $1
      RETURNING
        private_requests.request_id,
        private_requests.order_id,
        private_requests.telegram_chat_id,
        private_requests.telegram_user_id,
        private_requests.subject,
        private_requests.admin_reply_count,
        orders.product_title
    `,
    [replyToken, cleanMessage],
  );

  const row = result.rows[0] as
    | {
        request_id: string;
        order_id: string;
        telegram_chat_id: string | null;
        telegram_user_id: string | null;
        subject: string | null;
        admin_reply_count: number;
        product_title: string | null;
      }
    | undefined;

  if (!row) {
    return { ok: false as const, reason: "not-found" as const };
  }

  await insertDeliveryEvent({
    orderId: row.order_id,
    eventType: "private_request.admin_replied",
    metadata: {
      requestId: row.request_id,
      telegramAdminChatId: adminChatId,
      telegramAdminUserId:
        adminUserId === undefined ? null : String(adminUserId),
      telegramAdminUsername: adminUsername ?? null,
      adminReplyCount: Number(row.admin_reply_count),
    },
  });

  return {
    ok: true as const,
    requestId: String(row.request_id),
    orderId: String(row.order_id),
    productTitle: row.product_title ? String(row.product_title) : null,
    subject: row.subject ? String(row.subject) : null,
    customerChatId: row.telegram_user_id
      ? String(row.telegram_user_id)
      : row.telegram_chat_id
        ? String(row.telegram_chat_id)
        : null,
    message: cleanMessage,
    adminReplyCount: Number(row.admin_reply_count),
  };
}

export async function createDeliveryTokenForOrder({
  orderId,
  ttlDays = Number(process.env.DELIVERY_TOKEN_TTL_DAYS || "7"),
  forceNew = false,
}: DeliveryTokenRecord & { forceNew?: boolean }) {
  await ensureSchema();

  const entitlement = await getPool().query(
    `
      SELECT entitlement_id
      FROM creator_entitlements
      WHERE order_id = $1 AND status = 'active'
      ORDER BY granted_at DESC
      LIMIT 1
    `,
    [orderId],
  );

  const entitlementId = entitlement.rows[0]?.entitlement_id as string | undefined;

  if (!entitlementId) {
    return null;
  }

  if (!forceNew) {
    const activeToken = await getPool().query(
      `
        SELECT token_id, expires_at
        FROM creator_delivery_tokens
        WHERE order_id = $1
          AND entitlement_id = $2
          AND expires_at > now()
          AND redemption_count < max_redemptions
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [orderId, entitlementId],
    );

    if (activeToken.rows[0]) {
      return {
        tokenId: String(activeToken.rows[0].token_id),
        token: null,
        url: null,
        expiresAt: activeToken.rows[0].expires_at as Date,
      };
    }
  }

  const token = randomBytes(32).toString("base64url");
  const tokenId = `delivery-${randomUUID()}`;
  const safeTtlDays = Number.isFinite(ttlDays)
    ? Math.min(30, Math.max(1, Math.floor(ttlDays)))
    : 7;

  const result = await getPool().query(
    `
      INSERT INTO creator_delivery_tokens (
        token_id,
        token_hash,
        entitlement_id,
        order_id,
        expires_at,
        metadata
      )
      VALUES ($1, $2, $3, $4, now() + ($5::text || ' days')::interval, $6::jsonb)
      RETURNING expires_at
    `,
    [
      tokenId,
      hashDeliveryToken(token),
      entitlementId,
      orderId,
      safeTtlDays,
      JSON.stringify({ ttlDays: safeTtlDays }),
    ],
  );

  return {
    tokenId,
    token,
    url: `/orders/${token}`,
    expiresAt: result.rows[0].expires_at as Date,
  };
}

export async function listTelegramAccessPasses({
  telegramUserId,
  ttlDays = 1,
}: {
  telegramUserId: string;
  ttlDays?: number;
}) {
  await ensureSchema();

  const result = await getPool().query(
    `
      SELECT DISTINCT ON (orders.order_id)
        orders.order_id,
        orders.product_slug,
        orders.product_title,
        orders.provider,
        orders.status,
        orders.paid_at,
        entitlements.entitlement_id
      FROM creator_entitlements entitlements
      JOIN creator_orders orders ON orders.order_id = entitlements.order_id
      LEFT JOIN creator_telegram_links telegram_links
        ON telegram_links.order_id = orders.order_id
      WHERE entitlements.status = 'active'
        AND orders.status = 'PAID'
        AND (
          entitlements.telegram_user_id = $1
          OR telegram_links.telegram_user_id = $1
        )
      ORDER BY orders.order_id, orders.paid_at DESC NULLS LAST, orders.created_at DESC
      LIMIT 25
    `,
    [telegramUserId],
  );

  const passes = [];

  for (const row of result.rows as Array<{
    order_id: string;
    product_slug: string | null;
    product_title: string | null;
    provider: string;
    status: string;
    paid_at: Date | null;
    entitlement_id: string;
  }>) {
    if (!row.product_slug) {
      continue;
    }

    const deliveryToken = await createDeliveryTokenForOrder({
      orderId: row.order_id,
      ttlDays,
      forceNew: true,
    });

    if (!deliveryToken?.token || !deliveryToken.url) {
      continue;
    }

    const assets = await getAssetsForProduct(row.product_slug);

    passes.push({
      orderId: String(row.order_id),
      entitlementId: String(row.entitlement_id),
      productSlug: String(row.product_slug),
      productTitle: row.product_title ? String(row.product_title) : null,
      provider: String(row.provider),
      status: String(row.status),
      paidAt: row.paid_at,
      expiresAt: deliveryToken.expiresAt,
      deliveryUrl: deliveryToken.url,
      assets: assets.map((asset) => ({
        assetId: asset.assetId,
        title: asset.title,
        description: asset.description,
        sizeBytes: asset.sizeBytes,
        downloadUrl: `/api/delivery/assets/${encodeURIComponent(
          asset.assetId,
        )}?token=${encodeURIComponent(deliveryToken.token)}`,
      })),
    });
  }

  return passes;
}

export async function getAssetsForProduct(productSlug: string) {
  await ensureSchema();

  const result = await getPool().query(
    `
      SELECT
        asset_id,
        product_slug,
        title,
        description,
        bucket,
        object_key,
        download_name,
        content_type,
        size_bytes,
        sort_order
      FROM creator_assets
      WHERE product_slug = $1
        AND status = 'active'
      ORDER BY sort_order ASC, created_at ASC
    `,
    [productSlug],
  );

  return result.rows.map((row) => ({
    assetId: String(row.asset_id),
    productSlug: String(row.product_slug),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    bucket: String(row.bucket),
    objectKey: String(row.object_key),
    downloadName: row.download_name ? String(row.download_name) : null,
    contentType: row.content_type ? String(row.content_type) : null,
    sizeBytes: row.size_bytes === null ? null : Number(row.size_bytes),
    sortOrder: Number(row.sort_order ?? 0),
  })) satisfies CreatorDeliveryAsset[];
}

export async function getDeliveryByToken(
  token: string,
  { countRedemption = false }: DeliveryLookupOptions = {},
) {
  await ensureSchema();

  const tokenHash = hashDeliveryToken(token);
  const redemptionSetSql = countRedemption
    ? "redemption_count = redemption_count + 1,"
    : "";

  const result = await getPool().query(
    `
      WITH delivery AS (
        UPDATE creator_delivery_tokens
        SET
          last_accessed_at = now(),
          ${redemptionSetSql}
          redeemed_at = COALESCE(redeemed_at, now())
        WHERE token_hash = $1
          AND expires_at > now()
          AND redemption_count < max_redemptions
        RETURNING *
      )
      SELECT
        delivery.token_id,
        delivery.entitlement_id,
        delivery.expires_at,
        delivery.redeemed_at,
        orders.order_id,
        orders.provider,
        orders.provider_invoice_id,
        orders.product_slug,
        orders.product_title,
        orders.amount_cents,
        orders.currency,
        orders.fiat_value_eur_at_transaction,
        orders.fiat_currency,
        orders.status,
        orders.checkout_link,
        orders.last_event_type,
        orders.paid_at,
        orders.metadata,
        orders.created_at,
        orders.updated_at
      FROM delivery
      JOIN creator_orders orders ON orders.order_id = delivery.order_id
      JOIN creator_entitlements entitlements
        ON entitlements.entitlement_id = delivery.entitlement_id
       AND entitlements.status = 'active'
      LIMIT 1
    `,
    [tokenHash],
  );

  const row = result.rows[0] as
    | {
        token_id: string;
        entitlement_id: string;
        expires_at: Date;
        redeemed_at: Date | null;
        order_id: string;
        provider: string;
        provider_invoice_id: string | null;
        product_slug: string | null;
        product_title: string | null;
        amount_cents: number | null;
        currency: string | null;
        fiat_value_eur_at_transaction: string | number | null;
        fiat_currency: string | null;
        status: string;
        checkout_link: string | null;
        last_event_type: string | null;
        paid_at: Date | null;
        metadata: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
      }
    | undefined;

  if (!row?.product_slug) {
    return null;
  }

  const assets = await getAssetsForProduct(row.product_slug);

  return {
    tokenId: row.token_id,
    token,
    entitlementId: row.entitlement_id,
    order: {
      orderId: row.order_id,
      provider: row.provider,
      providerInvoiceId: row.provider_invoice_id,
      productSlug: row.product_slug,
      productTitle: row.product_title,
      amountCents: row.amount_cents,
      currency: row.currency,
      fiatValueEurAtTransaction: toNumberOrNull(row.fiat_value_eur_at_transaction),
      fiatCurrency: row.fiat_currency,
      status: row.status,
      checkoutLink: row.checkout_link,
      lastEventType: row.last_event_type,
      metadata: row.metadata ?? {},
      paidAt: row.paid_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    productSlug: row.product_slug,
    productTitle: row.product_title,
    expiresAt: row.expires_at,
    redeemedAt: row.redeemed_at,
    assets,
  } satisfies CreatorDelivery;
}

export async function linkTelegramToDelivery({
  token,
  chatId,
  userId,
  username,
  firstName,
}: TelegramDeliveryLinkRecord) {
  const delivery = await getDeliveryByToken(token);

  if (!delivery) {
    return null;
  }

  await getPool().query(
    `
      UPDATE creator_entitlements
      SET
        telegram_chat_id = $2,
        telegram_user_id = $3,
        telegram_username = $4,
        telegram_linked_at = now()
      WHERE entitlement_id = $1
    `,
    [
      delivery.entitlementId,
      chatId,
      userId === undefined ? null : String(userId),
      username ?? null,
    ],
  );

  await getPool().query(
    `
      INSERT INTO creator_telegram_links (
        link_id,
        order_id,
        entitlement_id,
        token_id,
        telegram_chat_id,
        telegram_user_id,
        telegram_username,
        telegram_first_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (order_id, telegram_chat_id) DO UPDATE SET
        entitlement_id = EXCLUDED.entitlement_id,
        token_id = EXCLUDED.token_id,
        telegram_user_id = EXCLUDED.telegram_user_id,
        telegram_username = EXCLUDED.telegram_username,
        telegram_first_name = EXCLUDED.telegram_first_name
    `,
    [
      `telegram-link-${randomUUID()}`,
      delivery.order.orderId,
      delivery.entitlementId,
      delivery.tokenId,
      chatId,
      userId === undefined ? null : String(userId),
      username ?? null,
      firstName ?? null,
    ],
  );

  if (delivery.productSlug === "vip-bundle") {
    await ensurePrivateRequestForOrder({
      orderId: delivery.order.orderId,
      entitlementId: delivery.entitlementId,
      quotaTotal: 3,
      subject: "VIP Infrastructure Access",
    });

    await getPool().query(
      `
        UPDATE creator_private_requests
        SET
          telegram_chat_id = $2,
          telegram_user_id = $3,
          updated_at = now()
        WHERE order_id = $1
      `,
      [
        delivery.order.orderId,
        chatId,
        userId === undefined ? null : String(userId),
      ],
    );
  }

  await insertDeliveryEvent({
    orderId: delivery.order.orderId,
    entitlementId: delivery.entitlementId,
    tokenId: delivery.tokenId,
    eventType: "telegram.delivery.linked",
    metadata: {
      telegramChatId: chatId,
      telegramUserId: userId === undefined ? null : String(userId),
      telegramUsername: username ?? null,
    },
  });

  return delivery;
}

export async function getDeliveryAsset({
  token,
  assetId,
}: {
  token: string;
  assetId: string;
}) {
  const delivery = await getDeliveryByToken(token);

  if (!delivery) {
    return null;
  }

  const asset = delivery.assets.find((item) => item.assetId === assetId);

  if (!asset) {
    return null;
  }

  const redemption = await getPool().query(
    `
      UPDATE creator_delivery_tokens
      SET
        redemption_count = redemption_count + 1,
        last_accessed_at = now(),
        redeemed_at = COALESCE(redeemed_at, now())
      WHERE token_id = $1
        AND expires_at > now()
        AND redemption_count < max_redemptions
      RETURNING redemption_count
    `,
    [delivery.tokenId],
  );

  if (!redemption.rowCount) {
    return null;
  }

  await insertDeliveryEvent({
    orderId: delivery.order.orderId,
    entitlementId: delivery.entitlementId,
    tokenId: delivery.tokenId,
    eventType: "asset.download.requested",
    metadata: {
      assetId,
      productSlug: delivery.productSlug,
    },
  });

  return { delivery, asset };
}

export async function recordContactRequest({
  name,
  organization,
  message,
  source = "markshnaknaks.com/contact",
  userAgent,
}: ContactRequestRecord) {
  await ensureSchema();

  const result = await getPool().query(
    `
      INSERT INTO creator_contact_requests (
        request_id,
        name,
        organization,
        message,
        source,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING request_id
    `,
    [
      `contact-${randomUUID()}`,
      name || null,
      organization || null,
      message,
      source,
      userAgent || null,
    ],
  );

  return String(result.rows[0]?.request_id);
}

export async function listOrdersForAccountingExport({
  from,
  to,
  limit = 1_000,
}: AccountingExportOptions = {}) {
  await ensureSchema();

  const safeLimit = Math.min(5_000, Math.max(1, Math.floor(limit)));
  const result = await getPool().query(
    `
      SELECT
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        product_title,
        amount_cents,
        currency,
        fiat_value_eur_at_transaction,
        fiat_currency,
        status,
        last_event_type,
        legal_terms_version,
        withdrawal_waiver_accepted_at,
        paid_at,
        created_at,
        updated_at
      FROM creator_orders
      WHERE ($1::timestamptz IS NULL OR created_at >= $1::timestamptz)
        AND ($2::timestamptz IS NULL OR created_at < $2::timestamptz)
      ORDER BY created_at DESC
      LIMIT $3
    `,
    [from ?? null, to ?? null, safeLimit],
  );

  return result.rows.map((row) => ({
    orderId: String(row.order_id),
    provider: String(row.provider),
    providerInvoiceId: row.provider_invoice_id
      ? String(row.provider_invoice_id)
      : null,
    productSlug: row.product_slug ? String(row.product_slug) : null,
    productTitle: row.product_title ? String(row.product_title) : null,
    amountCents: row.amount_cents === null ? null : Number(row.amount_cents),
    currency: row.currency ? String(row.currency) : null,
    fiatValueEurAtTransaction: toNumberOrNull(row.fiat_value_eur_at_transaction),
    fiatCurrency: row.fiat_currency ? String(row.fiat_currency) : null,
    status: String(row.status),
    lastEventType: row.last_event_type ? String(row.last_event_type) : null,
    legalTermsVersion: row.legal_terms_version
      ? String(row.legal_terms_version)
      : null,
    withdrawalWaiverAcceptedAt: row.withdrawal_waiver_accepted_at as Date | null,
    paidAt: row.paid_at as Date | null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  })) satisfies CreatorOrderAccountingRow[];
}

export async function listPrivateRequestsForAdminExport({
  from,
  to,
  limit = 1_000,
}: AccountingExportOptions = {}) {
  await ensureSchema();

  const safeLimit = Math.min(5_000, Math.max(1, Math.floor(limit)));
  const result = await getPool().query(
    `
      SELECT
        private_requests.request_id,
        private_requests.order_id,
        orders.product_slug,
        orders.product_title,
        private_requests.telegram_chat_id,
        private_requests.telegram_user_id,
        private_requests.status,
        private_requests.quota_total,
        private_requests.quota_used,
        private_requests.subject,
        private_requests.last_message,
        private_requests.last_admin_reply,
        private_requests.admin_reply_count,
        private_requests.admin_replied_at,
        private_requests.created_at,
        private_requests.updated_at,
        private_requests.closed_at
      FROM creator_private_requests private_requests
      JOIN creator_orders orders ON orders.order_id = private_requests.order_id
      WHERE ($1::timestamptz IS NULL OR private_requests.created_at >= $1::timestamptz)
        AND ($2::timestamptz IS NULL OR private_requests.created_at < $2::timestamptz)
      ORDER BY private_requests.updated_at DESC
      LIMIT $3
    `,
    [from ?? null, to ?? null, safeLimit],
  );

  return result.rows.map((row) => ({
    requestId: String(row.request_id),
    orderId: String(row.order_id),
    productSlug: row.product_slug ? String(row.product_slug) : null,
    productTitle: row.product_title ? String(row.product_title) : null,
    telegramChatId: row.telegram_chat_id ? String(row.telegram_chat_id) : null,
    telegramUserId: row.telegram_user_id ? String(row.telegram_user_id) : null,
    status: String(row.status),
    quotaTotal: Number(row.quota_total),
    quotaUsed: Number(row.quota_used),
    subject: row.subject ? String(row.subject) : null,
    lastMessage: row.last_message ? String(row.last_message) : null,
    lastAdminReply: row.last_admin_reply ? String(row.last_admin_reply) : null,
    adminReplyCount: Number(row.admin_reply_count ?? 0),
    adminRepliedAt: row.admin_replied_at as Date | null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    closedAt: row.closed_at as Date | null,
  }));
}
