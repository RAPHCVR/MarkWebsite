import { redirect } from "next/navigation";

import { assertLocale, localePath } from "@/i18n/config";

type LocalizedLinkAliasPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedLinkAliasPage({
  params,
}: LocalizedLinkAliasPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  redirect(localePath(locale || "en", "/links"));
}
