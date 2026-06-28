import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage } from "@/app/HomePage";
import type { ContactStatus } from "@/components/site/Contact";
import { getLocalizedGallery, getLocalizedProducts, getLocalizedSocials } from "@/i18n/content";
import { assertLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedMetadata } from "@/i18n/metadata";

type LocalizedPageProps = {
  params: Promise<{ locale: string }>;
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  return localizedMetadata(locale, getDictionary(locale), "/");
}

export default async function LocalizedHome({ params, searchParams }: LocalizedPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale);
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
