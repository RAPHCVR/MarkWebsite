import { Mail, Send, Sparkles } from "lucide-react";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionShell } from "@/components/site/SectionShell";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type ContactProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function Contact({ locale, dictionary }: ContactProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <SectionShell
      id="contact"
      eyebrow={dictionary.contact.eyebrow}
      title={dictionary.contact.title}
      description={dictionary.contact.description}
      className="pb-20"
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-pink-100 bg-white/76 p-6 shadow-sm backdrop-blur">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-pink-100 text-pink-600">
            <Mail className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-6 text-2xl font-black text-rose-950">
            {dictionary.contact.cardTitle}
          </h3>
          <p className="mt-3 leading-7 text-rose-950/68">
            {dictionary.contact.cardBody}
          </p>
          <a
            href="#contact-form"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(219,39,119,0.28)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <Mail className="size-4" aria-hidden="true" />
            {dictionary.contact.cardCta}
          </a>
        </div>

        <form
          id="contact-form"
          className="rounded-[2rem] border border-pink-100 bg-white/78 p-5 shadow-[0_24px_60px_rgba(236,72,153,0.12)] backdrop-blur sm:p-6"
          action="/api/contact"
          method="post"
          aria-label={dictionary.contact.aria}
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-pink-500">
                {dictionary.contact.formEyebrow}
              </p>
              <h3 className="mt-1 text-2xl font-black text-rose-950">{dictionary.contact.formTitle}</h3>
            </div>
            <Sparkles className="size-6 text-pink-400" aria-hidden="true" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sr-only">
              Website
              <Input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-rose-950">{dictionary.contact.name}</span>
              <Input name="name" autoComplete="name" placeholder={dictionary.contact.namePlaceholder} className="min-h-12 rounded-2xl border-pink-200 bg-white/80" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-rose-950">{dictionary.contact.email}</span>
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={dictionary.contact.emailPlaceholder}
                className="min-h-12 rounded-2xl border-pink-200 bg-white/80"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-rose-950">{dictionary.contact.brand}</span>
              <Input name="organization" autoComplete="organization" placeholder={dictionary.contact.brandPlaceholder} className="min-h-12 rounded-2xl border-pink-200 bg-white/80" />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-bold text-rose-950">{dictionary.contact.message}</span>
              <Textarea
                name="message"
                required
                placeholder={dictionary.contact.messagePlaceholder}
                className="min-h-36 rounded-3xl border-pink-200 bg-white/80"
              />
            </label>
          </div>

          {turnstileSiteKey ? (
            <div className="mt-4 rounded-2xl border border-pink-100 bg-white/70 p-3">
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
              />
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-theme="light"
              />
            </div>
          ) : null}

          <Button
            type="submit"
            aria-describedby="contact-form-note"
            className="mt-5 min-h-12 w-full rounded-full bg-pink-600 text-sm font-black text-white shadow-[0_16px_34px_rgba(219,39,119,0.28)] hover:bg-pink-700"
          >
            <Send className="size-4" aria-hidden="true" />
            {dictionary.contact.submit}
          </Button>
          <p id="contact-form-note" className="mt-3 text-center text-xs font-medium text-rose-950/55">
            {dictionary.contact.note}
          </p>
        </form>
      </div>
    </SectionShell>
  );
}
