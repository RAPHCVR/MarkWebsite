import { NextRequest, NextResponse } from "next/server";

import { siteConfig } from "@/data/site";
import {
  isOrdersDatabaseConfigured,
  recordContactRequest,
} from "@/lib/server/orders";

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
  const redirectUrl = new URL("/?contact=sent#contact", siteConfig.publicUrl);

  if (website) {
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (message && isOrdersDatabaseConfigured()) {
    await recordContactRequest({
      name,
      organization,
      message,
      userAgent: request.headers.get("user-agent") ?? undefined,
    }).catch(() => undefined);
  }

  return NextResponse.redirect(redirectUrl, 303);
}
