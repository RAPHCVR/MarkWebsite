import { redirect } from "next/navigation";

import { assertLocale, localePath } from "@/i18n/config";

type LocalizedBioAliasPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedBioAliasPage({
  params,
}: LocalizedBioAliasPageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  redirect(localePath(locale || "en", "/links"));
}
