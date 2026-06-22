"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Phone } from "lucide-react";

import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { cn } from "@/lib/utils";

type RevealedContact = {
  email: string;
  phoneLabel?: string | null;
  phoneHref?: string | null;
};

type LegalContactRevealLabels = {
  revealEmail: string;
  revealLoading: string;
  revealVerify: string;
  revealError: string;
};

type LegalContactRevealProps = {
  labels: LegalContactRevealLabels;
  turnstileSiteKey?: string;
  deferChallenge?: boolean;
  className?: string;
  linkClassName?: string;
  formClassName?: string;
  buttonClassName?: string;
  statusClassName?: string;
  widgetClassName?: string;
};

const legalContactStorageKey = "marky_legal_contact_v1";
const legalContactTtlMs = 30 * 60 * 1000;

type StoredLegalContact = RevealedContact & {
  expiresAt: number;
};

function readStoredContact() {
  try {
    const raw = window.sessionStorage.getItem(legalContactStorageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredLegalContact>;

    if (
      typeof parsed.email !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt < Date.now()
    ) {
      window.sessionStorage.removeItem(legalContactStorageKey);
      return null;
    }

    return {
      email: parsed.email,
      phoneLabel: typeof parsed.phoneLabel === "string" ? parsed.phoneLabel : null,
      phoneHref: typeof parsed.phoneHref === "string" ? parsed.phoneHref : null,
    };
  } catch {
    window.sessionStorage.removeItem(legalContactStorageKey);
    return null;
  }
}

function storeContact(contact: RevealedContact) {
  try {
    window.sessionStorage.setItem(
      legalContactStorageKey,
      JSON.stringify({
        ...contact,
        expiresAt: Date.now() + legalContactTtlMs,
      } satisfies StoredLegalContact),
    );
  } catch {
    // Contact reveal still works even when browser storage is unavailable.
  }
}

export function LegalContactReveal({
  labels,
  turnstileSiteKey,
  deferChallenge = false,
  className,
  linkClassName,
  formClassName,
  buttonClassName,
  statusClassName,
  widgetClassName,
}: LegalContactRevealProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [contact, setContact] = useState<RevealedContact | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "verify" | "error">("idle");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [isVerificationVisible, setIsVerificationVisible] = useState(!deferChallenge);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedContact = readStoredContact();

      setContact(storedContact);
      setIsVerificationVisible(Boolean(storedContact) ? false : !deferChallenge);
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [deferChallenge]);

  const submitReveal = useCallback(async (form: HTMLFormElement, token?: string) => {
    setStatus("loading");

    try {
      const payload = new FormData(form);

      if (token) {
        payload.set("cf-turnstile-response", token);
      }

      const response = await fetch("/api/legal-contact", {
        method: "POST",
        body: payload,
      });

      if (response.status === 403) {
        setStatus("verify");
        setIsVerificationVisible(true);
        setTurnstileResetSignal((signal) => signal + 1);
        return;
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const data = (await response.json()) as RevealedContact;

      setContact(data);
      storeContact(data);
      setStatus("idle");
      setIsVerificationVisible(false);
    } catch {
      setStatus("error");
    }
  }, []);

  async function revealContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (turnstileSiteKey && !isVerificationVisible) {
      setIsVerificationVisible(true);
      setStatus("verify");
      return;
    }

    await submitReveal(event.currentTarget);
  }

  const handleVerify = useCallback(
    (token: string) => {
      if (!formRef.current) {
        return;
      }

      void submitReveal(formRef.current, token);
    },
    [submitReveal],
  );

  if (contact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <a
          href={`mailto:${contact.email}`}
          className={cn(
            "inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200",
            linkClassName,
          )}
        >
          <Mail className="size-4" aria-hidden="true" />
          {contact.email}
        </a>
        {contact.phoneLabel && contact.phoneHref ? (
          <a
            href={`tel:${contact.phoneHref}`}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200",
              linkClassName,
            )}
          >
            <Phone className="size-4" aria-hidden="true" />
            {contact.phoneLabel}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form ref={formRef} className={cn("space-y-3", formClassName)} onSubmit={revealContact}>
      {!isVerificationVisible ? (
        <button
          type="submit"
          disabled={!isHydrated || status === "loading"}
          className={cn(
            "inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 text-xs font-black text-pink-700 transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 disabled:cursor-wait disabled:opacity-70",
            buttonClassName,
          )}
        >
          <Mail className="size-4" aria-hidden="true" />
          {status === "loading" ? labels.revealLoading : labels.revealEmail}
        </button>
      ) : null}
      {turnstileSiteKey && isVerificationVisible ? (
        <div className="mx-auto w-full max-w-[18rem] rounded-[1.25rem] border border-pink-100 bg-white/72 p-2 shadow-[0_12px_28px_rgba(236,72,153,0.12)]">
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            action="legal-contact"
            size="compact"
            onVerify={handleVerify}
            resetSignal={turnstileResetSignal}
            className={cn(
              "mx-auto flex min-h-[140px] w-[150px] max-w-full items-center justify-center",
              widgetClassName,
            )}
          />
        </div>
      ) : null}
      {status === "verify" ? (
        <p className={cn("text-xs font-bold leading-5 text-rose-950/64", statusClassName)}>
          {labels.revealVerify}
        </p>
      ) : null}
      {status === "error" ? (
        <p className={cn("text-xs font-bold leading-5 text-rose-950/64", statusClassName)}>
          {labels.revealError}
        </p>
      ) : null}
    </form>
  );
}
