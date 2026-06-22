import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "@/components/site/LegalDocument";
import { assertLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedMetadata } from "@/i18n/metadata";

type RefundPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: RefundPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  const dictionary = getDictionary(locale);
  const page = dictionary.legal.pages.refund;

  return {
    ...localizedMetadata(locale, dictionary, "/refund-policy"),
    title: page.title,
    description: page.description,
  };
}

export default async function LocalizedRefundPage({ params }: RefundPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const page = dictionary.legal.pages.refund;

  return (
    <LegalDocument
      locale={locale}
      dictionary={dictionary}
      pathname="/refund-policy"
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      sections={[...page.sections]}
    />
  );
}
