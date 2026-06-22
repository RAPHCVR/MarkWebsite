import { redirect } from "next/navigation";

import { assertLocale, localePath } from "@/i18n/config";

type LocalizedLinkInBioAliasPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedLinkInBioAliasPage({
  params,
}: LocalizedLinkInBioAliasPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  redirect(localePath(locale || "en", "/links"));
}
