import type { Metadata } from "next";
import "./globals.css";
import { Geist, Pacifico, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site";
import { defaultLocale, isLocale } from "@/i18n/config";

const searchImageUrl = new URL(siteConfig.searchImage, siteConfig.publicUrl).toString();

const geist = Geist({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-geist",
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"],
});

const pacifico = Pacifico({
  subsets: ["latin", "latin-ext", "cyrillic"],
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
    "official creator links",
    "official drops",
    "private links",
    "social links",
    "VIP requests",
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
        width: 1200,
        height: 630,
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
  other: {
    thumbnail: searchImageUrl,
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
    icon: [
      {
        url: siteConfig.iconImage,
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: siteConfig.appleTouchIconImage,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestLocale = (await headers()).get("x-marky-locale");
  const locale = isLocale(requestLocale) ? requestLocale : defaultLocale;

  return (
    <html
      lang={locale}
      className={cn("font-sans", geist.variable, playfair.variable, pacifico.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
