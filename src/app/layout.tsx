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
  applicationName: siteConfig.brandName,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  keywords: [
    "Marky",
    "markshnaknaks",
    "@markshnaknaks",
    "cosplay creator",
    "photo packs",
    "creator storefront",
    "social links",
  ],
  authors: [{ name: siteConfig.brandName, url: siteConfig.publicUrl }],
  creator: siteConfig.brandName,
  publisher: siteConfig.brandName,
  category: "creator storefront",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    url: siteConfig.publicUrl,
    siteName: siteConfig.brandName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.socialImage,
        alt: `${siteConfig.brandName} ${siteConfig.handle}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    creator: siteConfig.handle,
    images: [
      {
        url: siteConfig.socialImage,
        alt: `${siteConfig.brandName} ${siteConfig.handle}`,
      },
    ],
  },
  alternates: {
    canonical: siteConfig.publicUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: siteConfig.iconImage,
    apple: siteConfig.iconImage,
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
