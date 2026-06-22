import Image from "next/image";

import { SectionShell } from "@/components/site/SectionShell";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/data/gallery";
import { siteConfig } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries";

const toneClass: Record<GalleryItem["tone"], string> = {
  blush: "from-mark-200 via-mark-100 to-white",
  lilac: "from-mark-100 via-white to-mark-200",
  cream: "from-mark-50 via-white to-mark-100",
  hot: "from-mark-500 via-mark-300 to-white",
};

const sizeClass: Record<GalleryItem["size"], string> = {
  wide: "md:col-span-2",
  tall: "md:row-span-2 min-h-[25rem]",
  square: "min-h-[18rem]",
};

type LookbookProps = {
  dictionary: Dictionary;
  galleryItems: GalleryItem[];
};

export function Lookbook({ dictionary, galleryItems }: LookbookProps) {
  const total = String(galleryItems.length).padStart(2, "0");

  return (
    <SectionShell
      id="lookbook"
      eyebrow={dictionary.lookbook.eyebrow}
      title={dictionary.lookbook.title}
      description={dictionary.lookbook.description}
    >
      <div className="grid auto-rows-[18rem] gap-4 md:grid-cols-4">
        <article className="relative overflow-hidden rounded-2xl border border-rose-950/10 bg-[linear-gradient(150deg,#fff_0%,#FCEAE2_58%,#F8DCE5_100%)] p-5 shadow-sm md:col-span-2 md:row-span-2">
          <Image
            src="/images/mark-chibi-sketch.png"
            alt={`Cute public chibi drawing of ${siteConfig.brandName}`}
            fill
            loading="eager"
            sizes="(max-width: 768px) 92vw, 560px"
            className="object-contain p-8 opacity-95 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_58%,rgba(255,246,240,0.92)_100%)]" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-rose-950/10 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="relative size-5 overflow-hidden rounded-md">
              <Image src={siteConfig.logoImage} alt="" fill sizes="20px" className="object-cover" />
            </span>
            <span className="font-logo text-lg leading-none text-mark-cta">{siteConfig.brandName}</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-rose-950/10 bg-white/85 p-4 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-mark-cta">
              {dictionary.lookbook.mascotEyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-rose-950">{dictionary.lookbook.mascotTitle}</h3>
          </div>
        </article>

        {galleryItems.map((item, index) => (
          <article
            key={item.title}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-rose-950/10 bg-gradient-to-br p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-mark-cta/30 hover:shadow-[0_18px_44px_rgba(200,13,91,0.12)]",
              toneClass[item.tone],
              sizeClass[item.size],
            )}
          >
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-rose-950/10 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-mark-cta backdrop-blur">
                  {item.category}
                </span>
                <span className="font-mono text-xs font-bold text-rose-950/45" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")} / {total}
                </span>
              </div>
              <div>
                <div className="mb-4 h-px w-full bg-rose-950/12" aria-hidden="true" />
                <h3 className="text-2xl font-black leading-tight text-rose-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-rose-950/70">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
