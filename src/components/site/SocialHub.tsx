import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BrandIcon, brandIconStyle } from "@/components/site/BrandIcon";
import { SectionShell } from "@/components/site/SectionShell";
import type { SocialLink } from "@/data/socials";
import type { Dictionary } from "@/i18n/dictionaries";
import { getExternalLinkProps } from "@/lib/links";

type SocialHubProps = {
  dictionary: Dictionary;
  socials: SocialLink[];
};

export function SocialHub({ dictionary, socials }: SocialHubProps) {
  return (
    <SectionShell
      id="socials"
      eyebrow={dictionary.socials.eyebrow}
      title={dictionary.socials.title}
      description={dictionary.socials.description}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {socials.map((social) => {
          const isSoon = social.status === "soon";

          return (
            <a
              key={social.label}
              href={social.href}
              {...getExternalLinkProps(social.href)}
              className="group relative flex flex-col rounded-2xl border border-rose-950/10 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-mark-cta/30 hover:bg-white hover:shadow-[0_18px_44px_rgba(200,13,91,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
              aria-label={`${social.label}: ${social.description}`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <span
                  className="flex size-12 items-center justify-center rounded-xl border border-rose-950/10 bg-white text-[var(--brand-color)] shadow-sm transition group-hover:bg-[var(--brand-color)] group-hover:text-white"
                  style={brandIconStyle(social.icon)}
                >
                  <BrandIcon name={social.icon} className="size-5" />
                </span>
                {isSoon ? (
                  <Badge className="rounded-full border-rose-950/12 bg-mark-50 font-bold text-mark-cta">
                    {dictionary.socials.soon}
                  </Badge>
                ) : (
                  <ArrowUpRight
                    className="size-5 text-rose-950/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mark-cta"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="text-xl font-black text-rose-950">{social.label}</h3>
              <p className="mt-1 font-mono text-sm font-bold text-mark-cta">{social.handle}</p>
              <p className="mt-3 min-h-14 text-sm leading-6 text-rose-950/68">
                {social.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 border-t border-rose-950/8 pt-4 text-sm font-bold text-mark-cta">
                {social.cta}
                <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </div>
    </SectionShell>
  );
}
