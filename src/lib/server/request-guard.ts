import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit, isOrdersDatabaseConfigured } from "@/lib/server/orders";

type RateLimitOptions = {
  action: string;
  limit: number;
  windowSeconds: number;
};

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("cf-connecting-ip") ||
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return `${ip}|${userAgent.slice(0, 160)}`;
}

export async function enforceRateLimit(
  request: NextRequest,
  { action, limit, windowSeconds }: RateLimitOptions,
) {
  if (!isOrdersDatabaseConfigured()) {
    return null;
  }

  try {
    const result = await checkRateLimit({
      action,
      key: getClientKey(request),
      limit,
      windowSeconds,
    });

    if (result.allowed) {
      return null;
    }

    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
        },
      },
    );
  } catch {
    return null;
  }
}
