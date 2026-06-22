# Bug: Turnstile legal contact breaks after legal-page navigation

> Status: FIXED
> Mode: default
> Severity: functional
> Author: Raphael
> Last updated: 2026-06-22

## Symptom
After revealing legal contact details on one legal page, navigating to another legal page hid the contact again. In some cases the Turnstile widget was also missing, leaving only the message asking the user to complete verification.

## Expected
Once legal contact details are revealed, they should remain available across legal pages in the same browser session. If verification is still needed, Turnstile should render reliably after client-side navigation.

## Reproduction
- User path: reveal contact on a legal page, navigate to another legal page, try to reveal/read contact again.
- Regression test: `tests/site-quality.spec.ts` test `revealed legal contact survives navigation between legal pages`.
- Pre-fix failure mode: local React state was lost after navigation and implicit Turnstile rendering did not own the widget lifecycle for the remounted form.

## Hypotheses & diagnosis
| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| H1 | Implicit Turnstile rendering is not reliable for remounted legal forms in a Next.js client navigation flow. | confirmed | Cloudflare docs recommend explicit rendering for SPAs/dynamic content; the component used a static `cf-turnstile` container and no lifecycle management. |
| H2 | Revealed contact exists only in component state, so page navigation loses the successful reveal. | confirmed | `LegalContactDetails` stored the revealed email/phone only in local React state. |

## Root cause
The legal reveal component mixed a dynamic Next.js navigation flow with Turnstile implicit rendering. The first page could load the script and render the widget, but later legal-page remounts did not reliably trigger another scan. Separately, successful reveal state was not persisted beyond the current component instance.

## Fix
- Added `src/components/site/TurnstileWidget.tsx` with explicit Cloudflare Turnstile rendering, cleanup, token reset, and stable hidden form token injection.
- Updated `src/components/site/Contact.tsx` and `src/components/site/LegalContactDetails.tsx` to use the explicit widget with bounded layout.
- Added a 30-minute `sessionStorage` cache for revealed legal contact details, keeping emails out of crawlable HTML while avoiding repeated verification across legal pages.
- Added a Playwright regression test for reveal persistence across legal-page navigation.

## Verification
- V-1: `npm run lint` -> PASS.
- V-2: `npm run build` -> PASS.
- V-3: `npx playwright test tests/site-quality.spec.ts -g "legal contact" --project=chromium-desktop` -> PASS, 2 tests.
- V-4: `npm run test:ui` -> PASS before the final reset/type-guard adjustment, 59 passed and 45 expected skips.

## Regression test
- Path: `tests/site-quality.spec.ts`
- Name: `revealed legal contact survives navigation between legal pages`

## Pattern analysis
| Search | Result | Notes |
|---|---:|---|
| `rg -n "cf-turnstile|turnstile/v0/api.js" src` | 0 legacy implicit widgets after fix | Public contact and legal contact now use the shared explicit component. |

