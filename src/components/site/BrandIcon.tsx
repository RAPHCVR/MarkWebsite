import type { CSSProperties } from "react";

import { brandIcons, type BrandIconKey } from "@/lib/brand-icons";

type BrandIconProps = {
  name: BrandIconKey;
  className?: string;
  title?: string;
};

export function brandIconStyle(name: BrandIconKey) {
  return {
    "--brand-color": `#${brandIcons[name].hex}`,
  } as CSSProperties;
}

export function BrandIcon({ name, className, title }: BrandIconProps) {
  const icon = brandIcons[name];

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={title ? undefined : "true"}
      aria-label={title ?? undefined}
      role={title ? "img" : undefined}
      focusable="false"
      data-brand-icon={name}
    >
      {title ? <title>{title}</title> : null}
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}
