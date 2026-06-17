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
      <div className="mb-7 flex max-w-3xl flex-col gap-3 sm:mb-9">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-serif text-3xl font-black leading-tight text-rose-950 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base leading-7 text-rose-950/68 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
