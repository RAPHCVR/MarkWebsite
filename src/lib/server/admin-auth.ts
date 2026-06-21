import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

export type AdminAuthStatus = "ok" | "not-configured" | "missing" | "invalid";

export function getAdminAuthStatus(request: NextRequest): AdminAuthStatus {
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

export function getAdminAuthErrorResponse(status: Exclude<AdminAuthStatus, "ok">) {
  if (status === "not-configured") {
    return NextResponse.json(
      { error: "Admin API is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
