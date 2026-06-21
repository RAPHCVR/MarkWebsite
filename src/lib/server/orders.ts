import { createHash, randomBytes } from "node:crypto";

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

export type CreatorOrder = {
  orderId: string;
  provider: string;
  providerInvoiceId: string | null;
  productSlug: string | null;
  productTitle: string | null;
  amountCents: number | null;
  currency: string | null;
  status: string;
  checkoutLink: string | null;
  lastEventType: string | null;
  metadata: Record<string, unknown>;
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
      status text NOT NULL,
      checkout_link text,
      last_event_type text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS creator_orders_provider_invoice_id_idx
      ON creator_orders(provider_invoice_id);

    CREATE INDEX IF NOT EXISTS creator_orders_status_idx
      ON creator_orders(status);

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
      status text NOT NULL DEFAULT 'active',
      delivery_channel text NOT NULL DEFAULT 'site',
      granted_at timestamptz NOT NULL DEFAULT now(),
      revoked_at timestamptz,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      UNIQUE (order_id, product_slug)
    );

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
  `).then(() => undefined);

  return schemaReady;
}

function hashRateLimitKey(action: string, key: string) {
  return createHash("sha256").update(`${action}:${key}`).digest("hex");
}

function hashDeliveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isPaidStripeStatus(eventType: string, status: string) {
  return (
    (eventType === "checkout.session.completed" &&
      ["paid", "complete", "no_payment_required"].includes(status)) ||
    eventType === "checkout.session.async_payment_succeeded"
  );
}

function isPaidBtcpayEvent(eventType?: string) {
  return Boolean(
    eventType &&
      ["InvoiceSettled", "InvoicePaymentSettled"].includes(eventType),
  );
}

function isPaidShkeeperEvent(event: ShkeeperWebhookEvent) {
  const status = event.status?.toLowerCase();

  return event.paid === true || status === "paid" || status === "confirmed";
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
      `delivery-event-${crypto.randomUUID()}`,
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
  metadata = {},
}: CheckoutInvoiceRecord) {
  await ensureSchema();

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
        status,
        checkout_link,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = EXCLUDED.provider_invoice_id,
        product_slug = EXCLUDED.product_slug,
        product_title = EXCLUDED.product_title,
        amount_cents = EXCLUDED.amount_cents,
        currency = EXCLUDED.currency,
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
        : `btcpay-event-${crypto.randomUUID()}`;

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        product_slug,
        status,
        last_event_type,
        metadata
      )
      VALUES ($1, 'btcpay', $2, $3, $4, $5, $6::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        product_slug = COALESCE(EXCLUDED.product_slug, creator_orders.product_slug),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      event.invoiceId ?? null,
      typeof metadata.productSlug === "string" ? metadata.productSlug : null,
      event.type ?? "btcpay.webhook",
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
      : `shkeeper-event-${crypto.randomUUID()}`;

  await getPool().query(
    `
      INSERT INTO creator_orders (
        order_id,
        provider,
        provider_invoice_id,
        status,
        last_event_type,
        metadata
      )
      VALUES ($1, 'shkeeper', $2, $3, $4, $5::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
        metadata = creator_orders.metadata || EXCLUDED.metadata,
        updated_at = now()
    `,
    [
      orderId,
      null,
      event.status ?? (event.paid ? "PAID" : "UNPAID"),
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

  const orderId = `stripe-${sessionId}`;

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
        status,
        last_event_type,
        metadata
      )
      VALUES ($1, 'stripe', $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      ON CONFLICT (order_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        provider_invoice_id = COALESCE(EXCLUDED.provider_invoice_id, creator_orders.provider_invoice_id),
        product_slug = COALESCE(EXCLUDED.product_slug, creator_orders.product_slug),
        product_title = COALESCE(EXCLUDED.product_title, creator_orders.product_title),
        amount_cents = COALESCE(EXCLUDED.amount_cents, creator_orders.amount_cents),
        currency = COALESCE(EXCLUDED.currency, creator_orders.currency),
        status = EXCLUDED.status,
        last_event_type = EXCLUDED.last_event_type,
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
      status,
      eventType,
      JSON.stringify({
        stripeEvent: {
          eventId,
          eventType,
          sessionId,
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
        status,
        checkout_link,
        last_event_type,
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
        status: string;
        checkout_link: string | null;
        last_event_type: string | null;
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
    status: row.status,
    checkoutLink: row.checkout_link,
    lastEventType: row.last_event_type,
    metadata: row.metadata ?? {},
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

  return {
    entitlementId: storedEntitlementId,
    deliveryToken,
    order,
  };
}

export async function createDeliveryTokenForOrder({
  orderId,
  ttlDays = Number(process.env.DELIVERY_TOKEN_TTL_DAYS || "7"),
}: DeliveryTokenRecord) {
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

  const token = randomBytes(32).toString("base64url");
  const tokenId = `delivery-${crypto.randomUUID()}`;
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
  const redemptionLimitSql = countRedemption
    ? "AND redemption_count < max_redemptions"
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
          ${redemptionLimitSql}
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
        orders.status,
        orders.checkout_link,
        orders.last_event_type,
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
        status: string;
        checkout_link: string | null;
        last_event_type: string | null;
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
      status: row.status,
      checkoutLink: row.checkout_link,
      lastEventType: row.last_event_type,
      metadata: row.metadata ?? {},
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

export async function getDeliveryAsset({
  token,
  assetId,
}: {
  token: string;
  assetId: string;
}) {
  const delivery = await getDeliveryByToken(token, { countRedemption: true });

  if (!delivery) {
    return null;
  }

  const asset = delivery.assets.find((item) => item.assetId === assetId);

  if (!asset) {
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

  await getPool().query(
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
    `,
    [
      `contact-${crypto.randomUUID()}`,
      name || null,
      organization || null,
      message,
      source,
      userAgent || null,
    ],
  );
}
