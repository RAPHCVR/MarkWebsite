import { Mail, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionShell } from "@/components/site/SectionShell";
import { collabMailto, siteConfig } from "@/data/site";

export function Contact() {
  return (
    <SectionShell
      id="contact"
      eyebrow="Collabs"
      title="Collabs & business"
      description="Campaigns, promos, shoots and paid requests."
      className="pb-20"
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-pink-100 bg-white/76 p-6 shadow-sm backdrop-blur">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-pink-100 text-pink-600">
            <Mail className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-6 text-2xl font-black text-rose-950">
            Send the brief.
          </h3>
          <p className="mt-3 leading-7 text-rose-950/68">
            Include the brand, timeline, deliverables, usage and contact details.
          </p>
          <a
            href={collabMailto}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(219,39,119,0.28)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
          >
            <Mail className="size-4" aria-hidden="true" />
            Email collabs
          </a>
        </div>

        <form
          className="rounded-[2rem] border border-pink-100 bg-white/78 p-5 shadow-[0_24px_60px_rgba(236,72,153,0.12)] backdrop-blur sm:p-6"
          action={`mailto:${siteConfig.collabEmail}`}
          method="post"
          encType="text/plain"
          aria-label="Collaboration contact form"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-pink-500">
                Contact form
              </p>
              <h3 className="mt-1 text-2xl font-black text-rose-950">Let&apos;s work together</h3>
            </div>
            <Sparkles className="size-6 text-pink-400" aria-hidden="true" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-bold text-rose-950">Name</span>
              <Input name="name" autoComplete="name" placeholder="Your name" className="min-h-12 rounded-2xl border-pink-200 bg-white/80" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-rose-950">Brand</span>
              <Input name="organization" autoComplete="organization" placeholder="Brand or agency" className="min-h-12 rounded-2xl border-pink-200 bg-white/80" />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-bold text-rose-950">Message</span>
              <Textarea
                name="message"
                placeholder="Tell me about your campaign, shoot or collab idea..."
                className="min-h-36 rounded-3xl border-pink-200 bg-white/80"
              />
            </label>
          </div>

          <Button
            type="submit"
            aria-describedby="contact-form-note"
            className="mt-5 min-h-12 w-full rounded-full bg-pink-600 text-sm font-black text-white shadow-[0_16px_34px_rgba(219,39,119,0.28)] hover:bg-pink-700"
          >
            <Send className="size-4" aria-hidden="true" />
            Send request
          </Button>
          <p id="contact-form-note" className="mt-3 text-center text-xs font-medium text-rose-950/55">
            Opens your mail app with the request details.
          </p>
        </form>
      </div>
    </SectionShell>
  );
}
