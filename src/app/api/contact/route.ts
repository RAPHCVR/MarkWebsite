import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/data/site";
import { assertLocale, defaultLocale, localePath } from "@/i18n/config";
import {
  isOrdersDatabaseConfigured,
  recordContactRequest,
} from "@/lib/server/orders";
import { enforceRateLimit } from "@/lib/server/request-guard";
import { notifyContactRequest } from "@/lib/server/telegram";
import { verifyTurnstileToken } from "@/lib/server/turnstile";

export const runtime = "nodejs";

const maxLength = {
  name: 120,
  email: 254,
  organization: 160,
  message: 3_000,
};

function clean(value: FormDataEntryValue | null, limit: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, limit);
}

type ContactRedirectStatus = "sent" | "missing" | "verify" | "limited";

function contactRedirect(localeValue: string, status: ContactRedirectStatus) {
  const locale = assertLocale(localeValue) || defaultLocale;
  const url = new URL(localePath(locale, "/"), siteConfig.publicUrl);
  url.searchParams.set("contact", status);
  url.hash = "contact";
  return url;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const locale = clean(form.get("locale"), 8);
  const website = clean(form.get("website"), 200);
  const name = clean(form.get("name"), maxLength.name);
  const email = clean(form.get("email"), maxLength.email).toLowerCase();
  const organization = clean(form.get("organization"), maxLength.organization);
  const message = clean(form.get("message"), maxLength.message);
  const turnstileToken = clean(form.get("cf-turnstile-response"), 4_000);
  const redirectUrl = contactRedirect(locale, "sent");

  if (website) {
    return NextResponse.redirect(redirectUrl, 303);
  }

  const rateLimited = await enforceRateLimit(request, {
    action: "contact",
    limit: 5,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return NextResponse.redirect(contactRedirect(locale, "limited"), 303);
  }

  const turnstile = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp:
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  if (!turnstile.ok) {
    return NextResponse.redirect(contactRedirect(locale, "verify"), 303);
  }

  if (!message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(contactRedirect(locale, "missing"), 303);
  }

  let requestId: string | undefined;

  if (isOrdersDatabaseConfigured()) {
    requestId = await recordContactRequest({
      name,
      email,
      organization,
      message,
      userAgent: request.headers.get("user-agent") ?? undefined,
    }).catch(() => undefined);
  }

  await notifyContactRequest({
    requestId,
    name,
    email,
    organization,
    message,
  }).catch(() => undefined);

  return NextResponse.redirect(redirectUrl, 303);
}
