import Image from "next/image";
import { Sparkles } from "lucide-react";

import { SectionShell } from "@/components/site/SectionShell";
import { cn } from "@/lib/utils";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import { siteConfig } from "@/data/site";

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

export function Lookbook() {
  return (
    <SectionShell
      id="lookbook"
      eyebrow="Lookbook"
      title="Soft cosplay universe, public preview."
      description="Pastel cosplay, catboy details and backstage previews."
    >
      <div className="grid auto-rows-[18rem] gap-4 md:grid-cols-4">
        <article className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-[linear-gradient(135deg,#fff_0%,#FFECEE_58%,#FFD4DE_100%)] p-5 shadow-sm md:col-span-2 md:row-span-2">
          <Image
            src="/images/mark-chibi-sketch.png"
            alt={`Cute public chibi drawing of ${siteConfig.brandName}`}
            fill
            loading="eager"
            sizes="(max-width: 768px) 92vw, 560px"
            className="object-contain p-8 opacity-95 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_58%,rgba(255,244,249,0.9)_100%)]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/80 bg-white/72 p-4 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">
              Signature mascot
            </p>
            <h3 className="mt-2 text-2xl font-black text-rose-950">Official chibi sketch for {siteConfig.brandName}&apos;s soft mascot.</h3>
          </div>
        </article>

        {galleryItems.map((item) => (
          <article
            key={item.title}
            className={cn(
              "group relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_22px_55px_rgba(236,72,153,0.14)]",
              toneClass[item.tone],
              sizeClass[item.size],
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.9),rgba(255,255,255,0)_23%),radial-gradient(circle_at_74%_72%,rgba(236,72,153,0.2),rgba(236,72,153,0)_26%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/80 bg-white/58 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-pink-500 backdrop-blur">
                  {item.category}
                </span>
                <Sparkles className="size-5 text-pink-400 transition group-hover:rotate-12" aria-hidden="true" />
              </div>
              <div>
                <div className="mb-5 h-16 rounded-3xl border border-white/70 bg-white/36 shadow-inner backdrop-blur" />
                <h3 className="text-2xl font-black text-rose-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-rose-950/68">
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
