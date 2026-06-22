import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "@/components/site/LegalDocument";
import { assertLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedMetadata } from "@/i18n/metadata";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const page = dictionary.legal.pages.privacy;

  return {
    ...localizedMetadata(locale, dictionary, "/privacy"),
    title: page.title,
    description: page.description,
  };
}

export default async function LocalizedPrivacyPage({ params }: PrivacyPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const page = dictionary.legal.pages.privacy;

  return (
    <LegalDocument
      locale={locale}
      dictionary={dictionary}
      pathname="/privacy"
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      sections={[...page.sections]}
    />
  );
}
