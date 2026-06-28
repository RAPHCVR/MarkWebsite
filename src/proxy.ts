import { NextRequest, NextResponse } from "next/server";

import {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  detectLocaleFromCountry,
  getPathLocale,
  isLocale,
  localeCookieName,
  localePath,
  shouldSkipLocaleRouting,
  type Locale,
} from "@/i18n/config";

const legacyPublicPaths = new Set(["/legal", "/terms", "/privacy", "/refund-policy"]);
const localeVaryHeader = "Accept-Language, Cookie, CF-IPCountry";

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return (
    detectLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
    detectLocaleFromCountry(request.headers.get("cf-ipcountry")) ||
    defaultLocale
  );
}

function withLocaleHeader(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-marky-locale", locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Language", locale);
  response.headers.append("Vary", localeVaryHeader);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (shouldSkipLocaleRouting(pathname)) {
    return NextResponse.next();
  }

  const pathLocale = getPathLocale(pathname);

  if (pathLocale) {
    return withLocaleHeader(request, pathLocale);
  }

  if (pathname === "/") {
    return withLocaleHeader(request, resolvePreferredLocale(request));
  }

  if (legacyPublicPaths.has(pathname)) {
    const locale = "fr";
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, pathname);
    url.search = search;

    const response = NextResponse.redirect(url);
    response.headers.set("Content-Language", locale);
    response.headers.set("Vary", localeVaryHeader);
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  return withLocaleHeader(request, resolvePreferredLocale(request));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.png|apple-touch-icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
