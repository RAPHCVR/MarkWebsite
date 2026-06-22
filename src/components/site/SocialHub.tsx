import { ArrowUpRight, Heart } from "lucide-react";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {socials.map((social) => {
          const isSoon = social.status === "soon";

          return (
            <a
              key={social.label}
              href={social.href}
              {...getExternalLinkProps(social.href)}
              className="group relative overflow-hidden rounded-3xl border border-pink-100 bg-white/74 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:bg-white hover:shadow-[0_22px_55px_rgba(236,72,153,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
              aria-label={`${social.label}: ${social.description}`}
            >
              <div className="absolute right-4 top-4 text-pink-200 transition group-hover:scale-110 group-hover:text-pink-400">
                <Heart className="size-5 fill-current" aria-hidden="true" />
              </div>
              <div className="mb-5 flex items-start justify-between gap-4">
                <span
                  className="flex size-12 items-center justify-center rounded-2xl border border-pink-100 bg-white text-[var(--brand-color)] shadow-sm transition group-hover:bg-[var(--brand-color)] group-hover:text-white"
                  style={brandIconStyle(social.icon)}
                >
                  <BrandIcon name={social.icon} className="size-5" />
                </span>
                {isSoon ? (
                  <Badge className="rounded-full bg-fuchsia-50 font-bold text-fuchsia-700">
                    {dictionary.socials.soon}
                  </Badge>
                ) : null}
              </div>
              <h3 className="text-xl font-black text-rose-950">{social.label}</h3>
              <p className="mt-1 text-sm font-bold text-pink-500">{social.handle}</p>
              <p className="mt-3 min-h-14 text-sm leading-6 text-rose-950/65">
                {social.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-pink-700">
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
