import { NextRequest, NextResponse } from "next/server";

import { legalConfig } from "@/data/legal";
import { enforceRateLimit } from "@/lib/server/request-guard";
import { verifyTurnstileToken } from "@/lib/server/turnstile";

export const runtime = "nodejs";

function getRemoteIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

export async function POST(request: NextRequest) {
  const rateLimited = await enforceRateLimit(request, {
    action: "legal-contact",
    limit: 10,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const turnstileToken = form?.get("cf-turnstile-response");
  const token = typeof turnstileToken === "string" ? turnstileToken : "";
  const turnstile = await verifyTurnstileToken({
    token,
    remoteIp: getRemoteIp(request),
  });

  if (!turnstile.ok) {
    return NextResponse.json({ error: "verification_required" }, { status: 403 });
  }

  return NextResponse.json(
    {
      email: `${legalConfig.supportEmailLocalPart}@${legalConfig.supportEmailDomain}`,
      phoneLabel: legalConfig.contactPhoneLabel || null,
      phoneHref: legalConfig.contactPhoneHref || null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
