import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sectionIds = ["top", "socials", "access-passes", "lookbook", "contact"];
const localizedRoutes = ["/en", "/fr", "/ru"];
const localizedLinkRoutes = ["/en/links", "/fr/links", "/ru/links"];
const localizedLegalRoutes = [
  "/en/legal",
  "/en/terms",
  "/en/refund-policy",
  "/en/privacy",
  "/fr/legal",
  "/fr/terms",
  "/fr/refund-policy",
  "/fr/privacy",
  "/ru/legal",
  "/ru/terms",
  "/ru/refund-policy",
  "/ru/privacy",
];
const publicTextRoutes = [...localizedRoutes, ...localizedLinkRoutes, ...localizedLegalRoutes];
const restrictedCommercialWording =
  /\b(photo\s*pack|pack\s+photo|video\s*pack|pack\s+vid[eé]o|adult\s+content|contenu\s+adulte|18\+|onlyfans|vente\s+de\s+photos?)\b/i;

test("homepage renders all key sections without horizontal overflow", async ({ page }) => {
  await page.goto("/en");

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

test("link hub is mobile-first, actionable and overflow-safe", async ({ page }) => {
  await page.goto("/en/links");

  await expect(page.getByRole("heading", { name: "Marky", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Instagram/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /TikTok/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Telegram Channel/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Access/i }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Official accounts only" }).last(),
  ).toBeVisible();
  await expect(page.getByText("Need help?")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });

  expect(hasHorizontalOverflow).toBe(false);
});

test("homepage exposes crawlable SEO discovery metadata", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "SEO metadata only needs one viewport");

  await page.goto("/en");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/en",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/en",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/fr",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/ru",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com",
  );
  await expect(
    page.locator('meta[property="og:image"][content="https://markshnaknaks.com/images/marky-home-og.png"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[property="og:image:width"][content="1200"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image:height"][content="630"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href*="favicon"]')).toHaveAttribute(
    "href",
    /favicon/,
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
  expect(sitemapText).toContain("https://markshnaknaks.com/en");
  expect(sitemapText).toContain("https://markshnaknaks.com/fr/legal");
  expect(sitemapText).toContain("https://markshnaknaks.com/ru/privacy");
  expect(sitemapText).toContain("hreflang=\"x-default\"");

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

test("localized legal pages expose page-matched hreflang metadata", async ({ page }) => {
  await page.goto("/en/legal");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/en/legal",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/en/legal",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/fr/legal",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/ru/legal",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    "href",
    "https://markshnaknaks.com/fr/legal",
  );
  await expect(page.getByText(/French version is the authoritative legal version/i)).toBeVisible();
});

test("interactive elements are named and external links are hardened", async ({ page }) => {
  await page.goto("/en");

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

    const unlabeledControls = [...document.querySelectorAll("input:not([type='hidden']),textarea")]
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

    const mailtoLinks = [...document.querySelectorAll('a[href^="mailto:"]')]
      .map((element) => element.getAttribute("href"));

    return {
      emptyInteractive,
      unlabeledControls,
      unsafeExternalLinks,
      emptyLinks,
      mailtoForms,
      mailtoLinks,
    };
  });

  expect(audit.emptyInteractive).toEqual([]);
  expect(audit.unlabeledControls).toEqual([]);
  expect(audit.unsafeExternalLinks).toEqual([]);
  expect(audit.emptyLinks).toEqual([]);
  expect(audit.mailtoForms).toEqual([]);
  expect(audit.mailtoLinks).toEqual([]);
});

test("public pages do not expose crawlable email addresses", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Public text scan only needs one viewport");
  test.slow();

  const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const rawPhonePattern = /(01\s?23\s?45\s?67\s?89|0123456789|\+33123456789)/;

  for (const route of publicTextRoutes) {
    await page.goto(route);

    const html = await page.content();
    const visibleText = await page.locator("body").innerText();

    expect(html).not.toMatch(emailPattern);
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("tel:");
    expect(html).not.toMatch(rawPhonePattern);
    expect(visibleText).not.toMatch(emailPattern);
    expect(visibleText).not.toMatch(rawPhonePattern);
  }
});

test("legal contact details are available only after an explicit reveal action", async ({ page }) => {
  await page.route("**/api/legal-contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        email: "support@markshnaknaks.com",
        phoneLabel: "01 23 45 67 89",
        phoneHref: "+33123456789",
      }),
    });
  });

  await page.goto("/fr/legal");

  await expect(page.locator("body")).not.toContainText(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  );
  await expect(page.locator("body")).not.toContainText("01 23 45 67 89");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);

  await page.getByRole("button", { name: "Révéler le contact légal" }).click();

  const legalEmail = page.getByRole("link", {
    name: /support@markshnaknaks\.com/i,
  });
  await expect(legalEmail).toBeVisible();
  await expect(legalEmail).toHaveAttribute("href", "mailto:support@markshnaknaks.com");

  const legalPhone = page.getByRole("link", { name: "01 23 45 67 89" });
  await expect(legalPhone).toBeVisible();
  await expect(legalPhone).toHaveAttribute("href", "tel:+33123456789");
});

test("revealed legal contact survives navigation between legal pages", async ({ page }) => {
  await page.route("**/api/legal-contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        email: "support@markshnaknaks.com",
        phoneLabel: "01 23 45 67 89",
        phoneHref: "+33123456789",
      }),
    });
  });

  await page.goto("/fr/legal");
  await page.getByRole("button", { name: "Révéler le contact légal" }).click();
  await expect(page.getByRole("link", { name: /support@markshnaknaks\.com/i })).toBeVisible();

  await page.locator('a[href="/fr/refund-policy"]').last().click();
  await expect(page).toHaveURL(/\/fr\/refund-policy$/);

  await expect(page.getByRole("link", { name: /support@markshnaknaks\.com/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Révéler le contact légal" })).toHaveCount(0);
});

test("homepage direct contact is revealed only after an explicit reveal action", async ({ page }) => {
  await page.route("**/api/legal-contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        email: "support@markshnaknaks.com",
        phoneLabel: "01 23 45 67 89",
        phoneHref: "+33123456789",
      }),
    });
  });

  await page.goto("/fr");

  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  );

  const revealButton = page.getByRole("button", { name: "Révéler le contact légal" });

  await revealButton.click();
  await expect(page.getByRole("link", { name: /support@markshnaknaks\.com/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "01 23 45 67 89" })).toBeVisible();
});

test("public pages avoid payment-risk wording", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Public text scan only needs one viewport");
  test.slow();

  for (const route of publicTextRoutes) {
    await page.goto(route);

    const visibleText = await page.locator("body").innerText();

    expect(visibleText).not.toMatch(restrictedCommercialWording);
  }
});

test("commerce wording stays aligned with access-platform positioning", async ({ page }) => {
  await page.goto("/en");

  for (const label of [
    "Digital Access Pass",
    "Premium Platform Membership",
    "Content Delivery Token",
    "VIP Infrastructure Access",
  ]) {
    await expect(page.getByText(label).filter({ visible: true }).first()).toBeVisible();
  }
});

test("checkout links reflect runtime sales flags", async ({ page, request }) => {
  await page.goto("/en");

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

test("locale routing respects explicit URLs, browser language and legacy legal redirects", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Locale routing only needs one viewport");

  await page.goto("/ru");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByText("Цифровые доступы").first()).toBeVisible();

  await page.goto("/fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("link", { name: "FR", exact: true })).toHaveAttribute("aria-current", "page");

  const frenchRoot = await request.get("/", {
    headers: { "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5" },
    maxRedirects: 0,
  });
  expect(frenchRoot.status()).toBe(307);
  expect(frenchRoot.headers().location).toContain("/fr");
  expect(frenchRoot.headers()["content-language"]).toBe("fr");
  expect(frenchRoot.headers().vary).toContain("Accept-Language");

  const spacedQualityRoot = await request.get("/", {
    headers: { "Accept-Language": "ru-RU; q=0.4, fr-FR; q=0.9, en; q=0.2" },
    maxRedirects: 0,
  });
  expect(spacedQualityRoot.status()).toBe(307);
  expect(spacedQualityRoot.headers().location).toContain("/fr");

  const cookieRoot = await request.get("/", {
    headers: {
      Cookie: "marky_locale=ru",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
    },
    maxRedirects: 0,
  });
  expect(cookieRoot.status()).toBe(307);
  expect(cookieRoot.headers().location).toContain("/ru");

  const countryFallbackRoot = await request.get("/", {
    headers: {
      "Accept-Language": "",
      "Cf-Ipcountry": "FR",
    },
    maxRedirects: 0,
  });
  expect(countryFallbackRoot.status()).toBe(307);
  expect(countryFallbackRoot.headers().location).toContain("/fr");

  const rejectedLanguageRoot = await request.get("/", {
    headers: {
      "Accept-Language": "ru;q=0,fr;q=0",
      "Cf-Ipcountry": "FR",
    },
    maxRedirects: 0,
  });
  expect(rejectedLanguageRoot.status()).toBe(307);
  expect(rejectedLanguageRoot.headers().location).toContain("/fr");

  const russianResponse = await request.get("/ru");
  expect(russianResponse.status()).toBe(200);
  expect(russianResponse.headers()["content-language"]).toBe("ru");

  const legacyLegal = await request.get("/legal", { maxRedirects: 0 });
  expect(legacyLegal.status()).toBe(307);
  expect(legacyLegal.headers().location).toContain("/fr/legal");
});

test("Russian copy avoids accidental English placeholder phrases", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Copy scan only needs one viewport");
  test.slow();

  const accidentalEnglish =
    /\b(creator platform|support ticket|privacy policy|preview site|admin chat|source of truth|short-lived|wallets|rails|checkout|assets|invites|email routing|abusive automation|VAT not applicable|supervisory authority|Payment Links)\b/i;

  for (const route of ["/ru", "/ru/legal", "/ru/terms", "/ru/privacy"]) {
    await page.goto(route);
    const visibleText = await page.locator("body").innerText();

    expect(visibleText).not.toMatch(accidentalEnglish);
  }
});

test("French copy avoids accidental English placeholder phrases", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Copy scan only needs one viewport");
  test.slow();

  const accidentalEnglish =
    /\b(Social hub|Telegram Channel|Telegram Chat|updates|previews|creator platform|preview site|admin chat|inbox|wallets|rails|Checkout|Payment Links|self-hosted|support ticket|source of truth|short-lived|abusive automation)\b/i;

  for (const route of ["/fr", "/fr/legal", "/fr/terms", "/fr/privacy"]) {
    await page.goto(route);
    const visibleText = await page.locator("body").innerText();

    expect(visibleText).not.toMatch(accidentalEnglish);
  }
});

test("operational payment pages use the detected locale", async ({ request }) => {
  const stablecoinResponse = await request.get("/checkout/stablecoin", {
    headers: { "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.4" },
  });
  expect(stablecoinResponse.status()).toBe(200);
  const stablecoinHtml = await stablecoinResponse.text();
  expect(stablecoinHtml).toContain('lang="fr"');
  expect(stablecoinHtml).toContain("Aucune facture stablecoin active.");
  expect(stablecoinHtml).toContain("Retour aux accès");

  const cryptoReturnResponse = await request.get("/checkout/crypto-return", {
    headers: { Cookie: "marky_locale=ru" },
  });
  expect(cryptoReturnResponse.status()).toBe(200);
  const cryptoReturnHtml = await cryptoReturnResponse.text();
  expect(cryptoReturnHtml).toContain('lang="ru"');
  expect(cryptoReturnHtml).toContain("Страница оплаты закрыта");
  expect(cryptoReturnHtml).toContain("Назад к доступам");
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
  expect(typeof status.legal?.b2cSalesAllowed).toBe("boolean");
  expect(status.legal?.salesBlockedByLegalGate).toBe(false);
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
      locale: "fr",
      name: "Test Sender",
      email: "sender@example.invalid",
      organization: "Test Brand",
      message: "Collab request smoke test.",
      website: "https://bot.invalid",
    },
  });

  expect(response.status()).toBe(303);
  expect(new URL(response.headers().location || "").pathname).toBe("/fr");
  expect(new URL(response.headers().location || "").search).toBe("?contact=sent");
  expect(new URL(response.headers().location || "").hash).toBe("#contact");
});

test("social links use recognizable brand icons", async ({ page }) => {
  await page.goto("/en");

  for (const brand of [
    "instagram",
    "tiktok",
    "telegram",
    "x",
    "mail",
    "bitcoin",
    "litecoin",
    "circle",
    "tether",
  ]) {
    await expect(page.locator(`[data-brand-icon="${brand}"]:visible`).first()).toBeVisible();
  }
});

test("page has no automated accessibility violations", async ({ page }) => {
  await page.goto("/en");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
