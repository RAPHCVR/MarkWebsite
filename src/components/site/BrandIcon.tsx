import type { CSSProperties } from "react";
import { Mail } from "lucide-react";

import { brandIcons, type BrandIconKey } from "@/lib/brand-icons";

type BrandIconProps = {
  name: BrandIconKey;
  className?: string;
  title?: string;
};

export function brandIconStyle(name: BrandIconKey) {
  if (name === "mail") {
    return {
      "--brand-color": "#db2777",
    } as CSSProperties;
  }

  return {
    "--brand-color": `#${brandIcons[name].hex}`,
  } as CSSProperties;
}

export function BrandIcon({ name, className, title }: BrandIconProps) {
  if (name === "mail") {
    return (
      <Mail
        className={className}
        aria-hidden={title ? undefined : "true"}
        aria-label={title ?? undefined}
        role={title ? "img" : undefined}
        focusable="false"
        data-brand-icon={name}
      />
    );
  }

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
