import type { Metadata } from "next";

import { HomePage } from "@/app/HomePage";
import type { ContactStatus } from "@/components/site/Contact";
import { getLocalizedGallery, getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { localizedMetadata } from "@/i18n/metadata";
import { getRequestDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

type RootPageProps = {
  searchParams?: Promise<{
    contact?: string | string[];
    telegramContact?: string | string[];
  }>;
};

function getContactStatus(value: string | string[] | undefined): ContactStatus | null {
  const status = Array.isArray(value) ? value[0] : value;

  return status === "sent" ||
    status === "missing" ||
    status === "verify" ||
    status === "limited"
    ? status
    : null;
}

function getTelegramContactToken(value: string | string[] | undefined) {
  const token = Array.isArray(value) ? value[0] : value;

  return token && /^[A-Za-z0-9_-]{16,64}$/.test(token) ? token : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dictionary } = await getRequestDictionary();

  return localizedMetadata(locale, dictionary, "/");
}

export default async function Home({ searchParams }: RootPageProps) {
  const { locale, dictionary } = await getRequestDictionary();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <HomePage
      locale={locale}
      dictionary={dictionary}
      products={getLocalizedProducts(dictionary)}
      socials={getLocalizedSocials(dictionary)}
      galleryItems={getLocalizedGallery(dictionary)}
      contactStatus={getContactStatus(resolvedSearchParams.contact)}
      contactTelegramLinkToken={getTelegramContactToken(
        resolvedSearchParams.telegramContact,
      )}
    />
  );
}
