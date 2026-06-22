import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16", className)}>
      <div className="mb-9 flex max-w-3xl flex-col gap-4 sm:mb-12">
        {eyebrow ? (
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-mark-cta">
            <span className="h-px w-8 bg-mark-cta/60" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-serif text-4xl font-black leading-[1.02] tracking-tight text-rose-950 text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-rose-950/72 text-pretty sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
