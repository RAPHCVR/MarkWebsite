export async function verifyTurnstileToken({
  token,
  remoteIp,
}: {
  token: string | null;
  remoteIp?: string | null;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const required =
    process.env.TURNSTILE_REQUIRED === "true" ||
    process.env.NEXT_PUBLIC_TURNSTILE_REQUIRED === "true";

  if (!secret) {
    return required
      ? { ok: false, skipped: false as const, reason: "missing-secret" as const }
      : { ok: true, skipped: true as const };
  }

  if (!token) {
    return { ok: false, skipped: false as const, reason: "missing-token" as const };
  }

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);

  if (remoteIp) {
    form.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: form,
    },
  );
  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
  };

  return {
    ok: response.ok && payload.success === true,
    skipped: false as const,
    reason: payload.success === true ? undefined : ("invalid-token" as const),
  };
}
