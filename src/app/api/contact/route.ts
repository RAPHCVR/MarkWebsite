import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/data/site";
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
  organization: 160,
  message: 3_000,
};

function clean(value: FormDataEntryValue | null, limit: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, limit);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const website = clean(form.get("website"), 200);
  const name = clean(form.get("name"), maxLength.name);
  const organization = clean(form.get("organization"), maxLength.organization);
  const message = clean(form.get("message"), maxLength.message);
  const turnstileToken = clean(form.get("cf-turnstile-response"), 4_000);
  const redirectUrl = new URL("/?contact=sent#contact", siteConfig.publicUrl);

  if (website) {
    return NextResponse.redirect(redirectUrl, 303);
  }

  const rateLimited = await enforceRateLimit(request, {
    action: "contact",
    limit: 5,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  const turnstile = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp:
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  if (!turnstile.ok) {
    return NextResponse.json(
      { error: "Contact verification failed" },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.redirect(
      new URL("/?contact=missing#contact", siteConfig.publicUrl),
      303,
    );
  }

  let requestId: string | undefined;

  if (isOrdersDatabaseConfigured()) {
    requestId = await recordContactRequest({
      name,
      organization,
      message,
      userAgent: request.headers.get("user-agent") ?? undefined,
    }).catch(() => undefined);
  }

  await notifyContactRequest({
    requestId,
    name,
    organization,
    message,
  }).catch(() => undefined);

  return NextResponse.redirect(redirectUrl, 303);
}
