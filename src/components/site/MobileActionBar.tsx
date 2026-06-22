import { Link2, ShoppingBag } from "lucide-react";
import type { CSSProperties } from "react";

import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type MobileActionBarProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function MobileActionBar({ locale, dictionary }: MobileActionBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-4 pt-3 md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" } as CSSProperties}
    >
      <nav
        aria-label="Mobile quick actions"
        className="mx-auto grid max-w-sm grid-cols-2 gap-2 rounded-full border border-white/80 bg-white/82 p-1.5 shadow-[0_18px_44px_rgba(190,24,93,0.22)] backdrop-blur-xl"
      >
        <a
          href={localePath(locale, "/#access-passes")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-black text-white transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {dictionary.nav.passes}
        </a>
        <a
          href={localePath(locale, "/links")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white px-4 text-sm font-black text-pink-700 transition hover:border-pink-200 hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          <Link2 className="size-4" aria-hidden="true" />
          {dictionary.nav.links}
        </a>
      </nav>
    </div>
  );
}
