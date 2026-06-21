import type { Metadata } from "next";
import Script from "next/script";

import { TelegramOrdersApp } from "@/components/site/TelegramOrdersApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Telegram delivery",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TelegramOrdersPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFECEE,#FFE0E6_48%,#FFECEE)]">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramOrdersApp />
    </main>
  );
}
