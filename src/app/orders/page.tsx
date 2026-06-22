import type { Metadata } from "next";
import Script from "next/script";

import { TelegramOrdersApp } from "@/components/site/TelegramOrdersApp";
import { getRequestDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getRequestDictionary();

  return {
    title: dictionary.telegramOrders.metadataTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TelegramOrdersPage() {
  const { dictionary } = await getRequestDictionary();

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFECEE,#FFE0E6_48%,#FFECEE)]">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramOrdersApp labels={dictionary.telegramOrders} />
    </main>
  );
}
