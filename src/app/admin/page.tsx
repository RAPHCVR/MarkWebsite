import type { Metadata } from "next";
import Link from "next/link";

import { AdminDashboard } from "@/components/site/AdminDashboard";
import { siteConfig } from "@/data/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: `Private operations dashboard for ${siteConfig.domain}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFECEE,#FFE0E6_48%,#FFECEE)] px-4 py-8 text-rose-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-10 items-center rounded-full border border-pink-200 bg-white/78 px-4 text-sm font-black text-pink-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
        >
          Back to site
        </Link>
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">
            Operations
          </p>
          <h1 className="mt-3 font-serif text-4xl font-black leading-tight sm:text-5xl">
            Marky back-office
          </h1>
          <p className="mt-4 text-base leading-7 text-rose-950/68">
            Cloudflare Access protected view for accounting exports, recent
            orders and VIP Infrastructure Access tickets. A bearer token can
            still be used for scripts or local maintenance.
          </p>
        </div>
        <AdminDashboard />
      </div>
    </main>
  );
}
