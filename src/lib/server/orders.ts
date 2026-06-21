import { Pool } from "pg";

import type { Product } from "@/data/products";

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
  `).then(() => undefined);

  return schemaReady;
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
