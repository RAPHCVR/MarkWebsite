import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Lookbook } from "@/components/site/Lookbook";
import { ProductCards } from "@/components/site/ProductCards";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SocialHub } from "@/components/site/SocialHub";
import { SoftShapes } from "@/components/site/SoftShapes";
import type { ContactStatus } from "@/components/site/Contact";
import type { Product } from "@/data/products";
import type { SocialLink } from "@/data/socials";
import type { GalleryItem } from "@/data/gallery";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localizedStructuredData } from "@/i18n/seo";

type HomePageProps = {
  locale: Locale;
  dictionary: Dictionary;
  products: Product[];
  socials: SocialLink[];
  galleryItems: GalleryItem[];
  contactStatus?: ContactStatus | null;
};

export function HomePage({
  locale,
  dictionary,
  products,
  socials,
  galleryItems,
  contactStatus,
}: HomePageProps) {
  return (
    <main id="top" className="min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localizedStructuredData(locale, dictionary)),
        }}
      />
      <SoftShapes />
      <SiteHeader locale={locale} dictionary={dictionary} />
      <Hero dictionary={dictionary} socials={socials} products={products} />
      <SocialHub dictionary={dictionary} socials={socials} />
      <ProductCards locale={locale} dictionary={dictionary} products={products} />
      <Lookbook dictionary={dictionary} galleryItems={galleryItems} />
      <Contact locale={locale} dictionary={dictionary} status={contactStatus} />
      <Footer locale={locale} dictionary={dictionary} socials={socials} />
    </main>
  );
}
