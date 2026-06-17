import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sectionIds = ["top", "socials", "photo-packs", "lookbook", "contact"];

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

    return {
      emptyInteractive,
      unlabeledControls,
      unsafeExternalLinks,
      emptyLinks,
    };
  });

  expect(audit.emptyInteractive).toEqual([]);
  expect(audit.unlabeledControls).toEqual([]);
  expect(audit.unsafeExternalLinks).toEqual([]);
  expect(audit.emptyLinks).toEqual([]);
});

test("checkout links stay disabled until sales are enabled", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /buy with stripe/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /buy with crypto/i })).toHaveCount(0);
  await expect(page.getByText(/preview lineup/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /preview soon/i })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText(/onlyfans/i).first()).toBeVisible();
  await expect(page.getByText(/planned/i).first()).toBeVisible();
});

test("BTCPay checkout requires POST and disabled sales stay blocked", async ({ request }) => {
  const getResponse = await request.get("/api/checkout/btcpay?product=cosplay-starter-pack");
  expect(getResponse.status()).toBe(405);

  const postResponse = await request.post("/api/checkout/btcpay", {
    data: { product: "cosplay-starter-pack" },
  });
  expect(postResponse.status()).toBe(403);
});

test("social links use recognizable brand icons", async ({ page }) => {
  await page.goto("/");

  for (const brand of ["instagram", "tiktok", "telegram", "x", "gmail", "onlyfans", "bitcoin", "litecoin"]) {
    await expect(page.locator(`[data-brand-icon="${brand}"]:visible`).first()).toBeVisible();
  }
});

test("page has no automated accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
