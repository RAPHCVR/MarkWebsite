import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sectionIds = ["top", "socials", "access-passes", "lookbook", "contact"];
const publicTextRoutes = ["/", "/legal", "/terms", "/refund-policy", "/privacy"];
const restrictedCommercialWording =
  /\b(photo\s*pack|pack\s+photo|video\s*pack|pack\s+vid[eé]o|adult\s+content|contenu\s+adulte|18\+|onlyfans|vente\s+de\s+photos?)\b/i;

test("homepage renders all key sections without horizontal overflow", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Marky - Your Kitten Master");

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });

  expect(hasHorizontalOverflow).toBe(false);
});

test("homepage exposes crawlable SEO discovery metadata", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com",
  );
  await expect(
    page.locator('meta[property="og:image"][content="https://markshnaknaks.com/images/marky-og.png"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[property="og:image:width"][content="1200"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image:height"][content="630"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.png",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  const structuredData = JSON.parse(jsonLd || "{}") as {
    "@graph"?: Array<{
      "@type"?: string;
      mainEntity?: { "@id"?: string; "@type"?: string; name?: string; sameAs?: string[] };
      sameAs?: string[];
    }>;
  };
  const profilePage = structuredData["@graph"]?.find((entry) => entry["@type"] === "ProfilePage");
  expect(profilePage?.mainEntity).toMatchObject({
    "@id": "https://markshnaknaks.com/#person",
    "@type": "Person",
    name: "Marky",
  });
  expect(profilePage?.mainEntity?.sameAs).toContain("https://instagram.com/markshnaknaks");
  expect(
    structuredData["@graph"]?.some((entry) =>
      entry.sameAs?.includes("https://instagram.com/markshnaknaks"),
    ),
  ).toBe(true);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://markshnaknaks.com");
  expect(sitemapText).toContain("https://markshnaknaks.com/legal");
  expect(sitemapText).toContain("https://markshnaknaks.com/terms");
  expect(sitemapText).toContain("https://markshnaknaks.com/refund-policy");
  expect(sitemapText).toContain("https://markshnaknaks.com/privacy");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  const manifestJson = await manifest.json() as {
    name?: string;
    icons?: Array<{ src?: string; sizes?: string; type?: string }>;
  };
  expect(manifestJson.name).toBe("Marky @markshnaknaks");
  expect(manifestJson.icons).toContainEqual({
    src: "/images/marky-icon-512.png",
    sizes: "512x512",
    type: "image/png",
  });
});

test("interactive elements are named and external links are hardened", async ({ page }) => {
  await page.goto("/");

  const audit = await page.evaluate(() => {
    const emptyInteractive = [...document.querySelectorAll("a,button")]
      .filter((element) => {
        const accessibleText = (
          element.textContent ||
          element.getAttribute("aria-label") ||
          ""
        ).trim();
        return !accessibleText;
      })
      .map((element) => element.outerHTML.slice(0, 120));

    const unlabeledControls = [...document.querySelectorAll("input,textarea")]
      .filter(
        (element) =>
          !element.closest("label") &&
          !element.getAttribute("aria-label") &&
          !element.getAttribute("aria-labelledby"),
      )
      .map((element) => element.outerHTML.slice(0, 120));

    const unsafeExternalLinks = [...document.querySelectorAll('a[href^="http"]')]
      .filter((element) => !(element.getAttribute("rel") || "").includes("noopener"))
      .map((element) => element.getAttribute("href"));

    const emptyLinks = [...document.querySelectorAll("a")]
      .filter((element) => !element.getAttribute("href"))
      .map((element) => element.textContent?.trim() || element.getAttribute("aria-label"));

    const mailtoForms = [...document.querySelectorAll('form[action^="mailto:"]')]
      .map((element) => element.getAttribute("aria-label") || element.outerHTML.slice(0, 120));

    return {
      emptyInteractive,
      unlabeledControls,
      unsafeExternalLinks,
      emptyLinks,
      mailtoForms,
    };
  });

  expect(audit.emptyInteractive).toEqual([]);
  expect(audit.unlabeledControls).toEqual([]);
  expect(audit.unsafeExternalLinks).toEqual([]);
  expect(audit.emptyLinks).toEqual([]);
  expect(audit.mailtoForms).toEqual([]);
});

test("public pages avoid payment-risk wording", async ({ page }) => {
  for (const route of publicTextRoutes) {
    await page.goto(route);

    const visibleText = await page.locator("body").innerText();

    expect(visibleText).not.toMatch(restrictedCommercialWording);
  }
});

test("commerce wording stays aligned with access-platform positioning", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Digital Access Pass").first()).toBeVisible();
  await expect(page.getByText("Premium Platform Membership").first()).toBeVisible();
  await expect(page.getByText("Content Delivery Token").first()).toBeVisible();
  await expect(page.getByText("VIP Infrastructure Access").first()).toBeVisible();
});

test("checkout links reflect runtime sales flags", async ({ page, request }) => {
  await page.goto("/");

  const response = await request.get("/api/payments/status");
  const status = await response.json() as { salesEnabled?: boolean };

  if (status.salesEnabled) {
    await expect(page.getByRole("button", { name: /get access with stripe/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /pay with usdc/i }).first()).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: /get access with stripe/i })).toHaveCount(0);
  }

  await expect(page.getByRole("link", { name: /buy with crypto/i })).toHaveCount(0);
  await expect(page.getByText(/access lineup/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /preview soon/i })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText(/private channel/i).first()).toBeVisible();
  await expect(page.getByText(/planned/i).first()).toBeVisible();
});

test("Stripe checkout requires POST and terms acceptance", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "API route check only needs one project");

  const getResponse = await request.get("/api/checkout/stripe?product=cosplay-starter-pack");
  expect(getResponse.status()).toBe(405);

  const missingConsent = await request.post("/api/checkout/stripe", {
    form: { product: "cosplay-starter-pack" },
  });
  expect([400, 403]).toContain(missingConsent.status());
});

test("BTCPay checkout requires POST and disabled sales stay blocked", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "API route check only needs one project");

  const getResponse = await request.get("/api/checkout/btcpay?product=cosplay-starter-pack");
  expect(getResponse.status()).toBe(405);

  const postResponse = await request.post("/api/checkout/btcpay", {
    data: { product: "not-a-real-product", termsAccepted: true },
  });
  expect([403, 404]).toContain(postResponse.status());
});

test("stablecoin checkout requires POST and disabled sales stay blocked", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "API route check only needs one project");

  const getResponse = await request.get("/api/checkout/stablecoin?product=cosplay-starter-pack");
  expect(getResponse.status()).toBe(405);

  const postResponse = await request.post("/api/checkout/stablecoin", {
    data: { product: "not-a-real-product", rail: "usdc-solana", termsAccepted: true },
  });
  expect([403, 404]).toContain(postResponse.status());
});

test("payment status endpoint reports readiness without exposing secrets", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "API route check only needs one project");

  const response = await request.get("/api/payments/status");
  expect(response.status()).toBe(200);

  const status = await response.json() as {
    ok?: boolean;
    salesEnabled?: boolean;
    salesRequested?: boolean;
    orderDatabaseConfigured?: boolean;
    stripe?: {
      mode?: string;
      webhookConfigured?: boolean;
      readyProductCount?: number;
      products?: Array<{ slug?: string; stripeReady?: boolean }>;
    };
    stablecoin?: {
      provider?: string;
      checkoutEnabled?: boolean;
      defaultRail?: string;
      rails?: Array<{ id?: string; enabled?: boolean }>;
      solanaPay?: {
        invoiceTtlMinutes?: number;
        recipientConfigured?: boolean;
        rpcUrlEnv?: string;
        rpcUrlsEnv?: string;
        rpcFallbackCount?: number;
      };
    };
    btcpay?: {
      configured?: boolean;
      checkoutEnabled?: boolean;
      btcWalletReady?: boolean;
      ltcEnabled?: boolean;
      supportedMethods?: string[];
      healthUrl?: string;
    };
    admin?: {
      accountingExportConfigured?: boolean;
      cloudflareAccessConfigured?: boolean;
      accountingExportRoute?: string;
      privateRequestsExportRoute?: string;
    };
    legal?: {
      b2cSalesAllowed?: boolean;
      consumerMediatorConfigured?: boolean;
      salesBlockedByLegalGate?: boolean;
      cryptoFiatAccountingField?: string;
      commercialVocabulary?: string[];
    };
    contact?: {
      turnstileRequired?: boolean;
      turnstileSiteKeyConfigured?: boolean;
      turnstileSecretConfigured?: boolean;
    };
  };

  expect(status.ok).toBe(true);
  expect(status.stripe?.mode).toBe("payment-links");
  expect(typeof status.stripe?.webhookConfigured).toBe("boolean");
  expect(status.stripe?.products?.some((product) => product.slug === "cosplay-starter-pack")).toBe(true);
  expect(status.stablecoin?.defaultRail).toBe("usdc-solana");
  expect(status.stablecoin?.rails?.some((rail) => rail.id === "usdc-solana")).toBe(true);
  expect(status.stablecoin?.solanaPay?.rpcUrlEnv).toBe("SOLANA_PAY_RPC_URL");
  expect(status.stablecoin?.solanaPay?.rpcUrlsEnv).toBe("SOLANA_PAY_RPC_URLS");
  expect(status.stablecoin?.solanaPay?.rpcFallbackCount).toBeGreaterThanOrEqual(1);
  expect(status.stablecoin?.solanaPay?.invoiceTtlMinutes).toBeGreaterThanOrEqual(5);
  expect(status.btcpay?.supportedMethods?.length).toBeGreaterThanOrEqual(1);
  expect(status.btcpay?.healthUrl).toBe("https://pay.markshnaknaks.com/api/v1/health");
  expect(status.legal?.cryptoFiatAccountingField).toBe("creator_orders.fiat_value_eur_at_transaction");
  expect(status.legal?.commercialVocabulary).toContain("Digital Access Pass");
  expect(typeof status.legal?.consumerMediatorConfigured).toBe("boolean");
  expect(typeof status.legal?.b2cSalesAllowed).toBe("boolean");
  expect(status.legal?.salesBlockedByLegalGate).toBe(
    Boolean(status.salesRequested && !status.legal?.b2cSalesAllowed),
  );
  expect(status.admin?.accountingExportRoute).toBe("/api/admin/orders/export");
  expect(status.admin?.privateRequestsExportRoute).toBe("/api/admin/private-requests/export");
  expect(typeof status.admin?.cloudflareAccessConfigured).toBe("boolean");
  expect(typeof status.contact?.turnstileRequired).toBe("boolean");
  expect(JSON.stringify(status)).not.toMatch(/sk_live|pk_live|api_key|webhook_secret/i);
});

test("admin accounting export is protected", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Admin route check only needs one project");

  const response = await request.get("/api/admin/orders/export");

  expect([401, 503]).toContain(response.status());
});

test("admin private request export is protected", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Admin route check only needs one project");

  const response = await request.get("/api/admin/private-requests/export");

  expect([401, 503]).toContain(response.status());
});

test("Stripe webhook rejects unsigned requests", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Webhook route check only needs one project");

  const response = await request.post("/api/webhooks/stripe", {
    data: {
      id: "evt_test",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test", object: "checkout.session" } },
    },
  });

  expect([401, 503]).toContain(response.status());
});

test("public responses include production security headers", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Header check only needs one project");

  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);

  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("https://static.cloudflareinsights.com");
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
});

test("contact form posts to the site endpoint", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "API route check only needs one project");

  const response = await request.post("/api/contact", {
    maxRedirects: 0,
    form: {
      name: "Test Sender",
      organization: "Test Brand",
      message: "Collab request smoke test.",
      website: "https://bot.invalid",
    },
  });

  expect(response.status()).toBe(303);
  expect(new URL(response.headers().location || "").pathname).toBe("/");
  expect(new URL(response.headers().location || "").search).toBe("?contact=sent");
  expect(new URL(response.headers().location || "").hash).toBe("#contact");
});

test("social links use recognizable brand icons", async ({ page }) => {
  await page.goto("/");

  for (const brand of [
    "instagram",
    "tiktok",
    "telegram",
    "x",
    "gmail",
    "bitcoin",
    "litecoin",
    "circle",
    "tether",
  ]) {
    await expect(page.locator(`[data-brand-icon="${brand}"]:visible`).first()).toBeVisible();
  }
});

test("page has no automated accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
