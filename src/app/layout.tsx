import type { Metadata } from "next";
import "./globals.css";
import { Geist, Pacifico, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"],
});

const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.publicUrl),
  title: `${siteConfig.brandName} - Your Kitten Master`,
  description:
    `${siteConfig.brandName}'s SFW creator storefront: cosplay, soft drops, photo packs and collabs.`,
  openGraph: {
    title: `${siteConfig.brandName} - Your Kitten Master`,
    description:
      "SFW cosplay drops, social links, photo pack previews and collab requests.",
    url: siteConfig.publicUrl,
    siteName: siteConfig.brandName,
    type: "website",
  },
  alternates: {
    canonical: siteConfig.publicUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, playfair.variable, pacifico.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
