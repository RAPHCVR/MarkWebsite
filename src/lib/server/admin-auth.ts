import { timingSafeEqual } from "node:crypto";

import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit } from "@/lib/server/request-guard";

export type AdminAuthStatus =
  | "ok"
  | "not-configured"
  | "missing"
  | "invalid"
  | "access-misconfigured"
  | "access-missing"
  | "access-invalid"
  | "access-forbidden";

let cachedJwksUrl: string | undefined;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getAdminTokenStatus(request: NextRequest): AdminAuthStatus {
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return "not-configured";
  }

  const header = request.headers.get("authorization") || "";
  const received = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!received) {
    return "missing";
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
    ? "ok"
    : "invalid";
}

function getCloudflareAccessConfig() {
  const teamDomain = process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim();
  const jwksUrl = process.env.CLOUDFLARE_ACCESS_JWKS_URL?.trim();
  const audience = process.env.CLOUDFLARE_ACCESS_AUD?.trim();
  const issuer = process.env.CLOUDFLARE_ACCESS_ISSUER?.trim();
  const allowedEmails = (process.env.CLOUDFLARE_ACCESS_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const configured = Boolean(teamDomain || jwksUrl || audience || issuer || allowedEmails.length);

  return {
    configured,
    teamDomain,
    jwksUrl,
    audience,
    issuer,
    allowedEmails,
  };
}

function normalizeAccessUrl(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getAccessJwksUrl() {
  const { jwksUrl, teamDomain } = getCloudflareAccessConfig();

  if (jwksUrl) {
    return jwksUrl;
  }

  if (!teamDomain) {
    return null;
  }

  return `${normalizeAccessUrl(teamDomain)}/cdn-cgi/access/certs`;
}

function getAccessToken(request: NextRequest) {
  return (
    request.headers.get("cf-access-jwt-assertion") ||
    request.cookies.get("CF_Authorization")?.value ||
    ""
  );
}

function getAccessJwks(url: string) {
  if (!cachedJwks || cachedJwksUrl !== url) {
    cachedJwksUrl = url;
    cachedJwks = createRemoteJWKSet(new URL(url));
  }

  return cachedJwks;
}

export function isCloudflareAccessConfigured() {
  return getCloudflareAccessConfig().configured;
}

async function getCloudflareAccessStatus(request: NextRequest): Promise<AdminAuthStatus> {
  const config = getCloudflareAccessConfig();

  if (!config.configured) {
    return "ok";
  }

  const jwksUrl = getAccessJwksUrl();

  if (!config.audience || !jwksUrl) {
    return "access-misconfigured";
  }

  const token = getAccessToken(request);

  if (!token) {
    return "access-missing";
  }

  try {
    const verified = await jwtVerify(token, getAccessJwks(jwksUrl), {
      audience: config.audience,
      issuer: config.issuer || undefined,
    });
    const email =
      typeof verified.payload.email === "string"
        ? verified.payload.email.toLowerCase()
        : "";

    if (config.allowedEmails.length && !config.allowedEmails.includes(email)) {
      return "access-forbidden";
    }

    return "ok";
  } catch {
    return "access-invalid";
  }
}

export async function getAdminAuthStatus(
  request: NextRequest,
): Promise<AdminAuthStatus> {
  const accessStatus = await getCloudflareAccessStatus(request);

  if (accessStatus !== "ok") {
    return accessStatus;
  }

  return getAdminTokenStatus(request);
}

export async function enforceAdminAccess(request: NextRequest) {
  const rateLimited = await enforceRateLimit(request, {
    action: `admin:${request.nextUrl.pathname}`,
    limit: 20,
    windowSeconds: 60,
  });

  if (rateLimited) {
    return rateLimited;
  }

  const auth = await getAdminAuthStatus(request);

  return auth === "ok" ? null : getAdminAuthErrorResponse(auth);
}

export function getAdminAuthErrorResponse(status: Exclude<AdminAuthStatus, "ok">) {
  if (status === "not-configured" || status === "access-misconfigured") {
    return NextResponse.json(
      { error: "Admin API is not configured" },
      { status: 503 },
    );
  }

  if (status === "access-forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
