import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Lookbook } from "@/components/site/Lookbook";
import { ProductCards } from "@/components/site/ProductCards";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SocialHub } from "@/components/site/SocialHub";
import { SoftShapes } from "@/components/site/SoftShapes";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="top" className="min-h-screen overflow-hidden">
      <SoftShapes />
      <SiteHeader />
      <Hero />
      <SocialHub />
      <ProductCards />
      <Lookbook />
      <Contact />
      <Footer />
    </main>
  );
}
