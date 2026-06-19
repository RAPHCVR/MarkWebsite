import {
  ArrowRight,
  Check,
  CreditCard,
  Gem,
  Lock,
  Send,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  BrandIcon,
  brandIconStyle,
} from "@/components/site/BrandIcon";
import { SectionShell } from "@/components/site/SectionShell";
import { paymentConfig } from "@/data/payments";
import { products, type Product } from "@/data/products";
import type { BrandIconKey } from "@/lib/brand-icons";
import { getExternalLinkProps } from "@/lib/links";

const accentClass: Record<Product["accent"], string> = {
  lace: "from-mark-200 via-mark-100 to-white",
  catboy: "from-mark-300 via-mark-200 to-mark-50",
  backstage: "from-mark-100 via-white to-mark-200",
  vip: "from-mark-500 via-mark-300 to-mark-50",
};

const providerIcon = {
  stripe: CreditCard,
  crypto: WalletCards,
  telegram: Send,
  soon: Lock,
};

const providerLabel = {
  stripe: "photo pack",
  crypto: "crypto option",
  telegram: "VIP channel",
  soon: "preview",
};

const providerBrandIcon: Partial<Record<Product["checkoutProvider"], BrandIconKey>> = {
  stripe: "stripe",
  telegram: "telegram",
};

const cryptoRailStatus = {
  ready: "Ready",
  installed: "Installed",
  planned: "Planned",
  research: "Later",
  disabled: "Off",
};

const cryptoRailClass = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  installed: "border-sky-200 bg-sky-50 text-sky-700",
  planned: "border-pink-200 bg-pink-50 text-pink-700",
  research: "border-amber-200 bg-amber-50 text-amber-700",
  disabled: "border-slate-200 bg-slate-50 text-slate-500",
};

function getCta(product: Product) {
  if (!paymentConfig.salesEnabled) {
    return product.status === "coming-soon" ? "Preview soon" : "Preview pack";
  }

  if (product.status === "coming-soon") {
    return "Preview soon";
  }

  if (product.checkoutProvider === "stripe" && product.stripePaymentLink) {
    return "Buy with Stripe";
  }

  if (product.checkoutProvider === "crypto" && product.cryptoCheckoutUrl) {
    return "Buy with crypto";
  }

  if (product.checkoutProvider === "telegram" && product.telegramVipUrl) {
    return "Join VIP";
  }

  return "Preview pack";
}

function getHref(product: Product) {
  if (!paymentConfig.salesEnabled) {
    return "#contact";
  }

  return (
    product.stripePaymentLink ||
    product.cryptoCheckoutUrl ||
    product.telegramVipUrl ||
    "#contact"
  );
}

function canShowCryptoCheckout(product: Product) {
  return (
    paymentConfig.salesEnabled &&
    paymentConfig.crypto.checkoutEnabled &&
    paymentConfig.crypto.btcpay.configured &&
    paymentConfig.crypto.btcpay.btcWalletReady &&
    paymentConfig.crypto.databaseConfigured &&
    product.status !== "coming-soon"
  );
}

export function ProductCards() {
  return (
    <SectionShell
      id="photo-packs"
      eyebrow="Shop preview"
      title="Photo pack shop"
      description="Cute cosplay drops, soft previews and VIP requests."
      className="pt-8"
    >
      <div className="mb-5 flex flex-wrap gap-3">
        {["Preview lineup", "Private delivery", "SFW packs"].map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="h-9 rounded-full border-pink-200 bg-white/70 px-4 font-bold text-pink-700 shadow-sm"
          >
            <Check className="size-3.5" aria-hidden="true" />
            {item}
          </Badge>
        ))}
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="mb-4 grid gap-3 rounded-3xl border border-pink-100 bg-white/72 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
            {[
              ["4 packs", "First lineup"],
              ["Private", "Site link or Telegram follow-up"],
              ["SFW", "Clean storefront"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl bg-pink-50/70 px-4 py-3">
                <p className="text-sm font-black text-pink-700">{value}</p>
                <p className="mt-1 text-xs font-bold text-rose-950/55">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
        {products.map((product) => {
          const ProviderIcon = providerIcon[product.checkoutProvider];
          const providerLogo = providerBrandIcon[product.checkoutProvider];
          const cta = getCta(product);
          const disabled = product.status === "coming-soon";
          const href = getHref(product);
          const safeHref = disabled ? "#photo-packs" : href;
          const showCryptoCheckout = canShowCryptoCheckout(product);

          return (
            <article
              key={product.slug}
              className="group overflow-hidden rounded-3xl border border-pink-100 bg-white/76 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_24px_60px_rgba(236,72,153,0.16)]"
            >
              <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${accentClass[product.accent]}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.95),rgba(255,255,255,0)_24%),radial-gradient(circle_at_72%_36%,rgba(255,255,255,0.7),rgba(255,255,255,0)_18%)]" />
                <div className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-2xl bg-rose-950/76 text-white shadow-lg backdrop-blur">
                  <Lock className="size-4" aria-hidden="true" />
                </div>
                <Badge className="absolute right-4 top-4 rounded-full bg-white/86 px-3 font-bold text-pink-700 shadow-sm backdrop-blur">
                  {product.badge}
                </Badge>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="mb-3 flex items-center gap-2 text-pink-500">
                    {providerLogo ? (
                      <span
                        className="flex size-7 items-center justify-center rounded-full bg-white text-[var(--brand-color)] shadow-sm"
                        style={brandIconStyle(providerLogo)}
                      >
                        <BrandIcon name={providerLogo} className="size-4" />
                      </span>
                    ) : (
                      <Gem className="size-5" aria-hidden="true" />
                    )}
                    <span className="text-sm font-black uppercase tracking-[0.18em]">
                      {providerLabel[product.checkoutProvider]}
                    </span>
                  </div>
                  <div className="h-16 rounded-3xl border border-white/70 bg-white/42 shadow-inner backdrop-blur-sm" />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black leading-tight text-rose-950">
                    {product.title}
                  </h3>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-black text-pink-700">
                    {product.price}
                  </span>
                </div>
                <p className="min-h-16 text-sm leading-6 text-rose-950/65">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-rose-950/72">
                      <Check className="size-4 text-pink-500" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-2">
                  <a
                    href={safeHref}
                    {...getExternalLinkProps(safeHref)}
                    aria-disabled={disabled}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.28)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 aria-disabled:pointer-events-none aria-disabled:bg-pink-200 aria-disabled:text-pink-800"
                  >
                    {disabled ? <Lock className="size-4" aria-hidden="true" /> : <ProviderIcon className="size-4" aria-hidden="true" />}
                    {cta}
                    {!disabled ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
                  </a>
                  {showCryptoCheckout ? (
                    <form method="post" action={paymentConfig.crypto.btcpay.checkoutRoute}>
                      <input type="hidden" name="product" value={product.slug} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
                      >
                        <span
                          className="flex size-5 items-center justify-center text-[var(--brand-color)]"
                          style={brandIconStyle("bitcoin")}
                        >
                          <BrandIcon name="bitcoin" className="size-4" />
                        </span>
                        Pay with Bitcoin
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white/76 p-5 shadow-sm backdrop-blur">
          <h3 className="flex items-center gap-2 text-xl font-black text-pink-700">
            <CreditCard className="size-5" aria-hidden="true" />
            Access
          </h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            Start with the pack preview, then use Telegram for VIP access,
            requests and delivery follow-up.
          </p>
          <div className="mt-4 space-y-3">
            {[
              ["Delivery", "Private link or Telegram follow-up."],
              ["Support", "Order help and custom requests."],
              ["Checkout", "Stripe first; crypto opens per verified rail."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-pink-100 bg-white/76 p-3">
                <p className="text-sm font-black text-rose-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-rose-950/58">{text}</p>
              </div>
            ))}
          </div>
          <a
            href={paymentConfig.telegram.requestBotUrl || "#contact"}
            {...getExternalLinkProps(paymentConfig.telegram.requestBotUrl || "#contact")}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 text-sm font-black text-pink-700 transition hover:border-pink-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
          >
            <Send className="size-4" aria-hidden="true" />
            Request custom drop
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-pink-100 bg-white/72 p-5 shadow-sm backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[var(--brand-color)] shadow-sm" style={brandIconStyle("stripe")}>
            <BrandIcon name="stripe" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-rose-950">Card checkout</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            Clean card payments for public drops when sales open.
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            Secure payment page
          </p>
        </div>
        <div className="rounded-3xl border border-pink-100 bg-white/72 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {paymentConfig.crypto.rails.slice(0, 4).map((rail) => (
              <span
                key={rail.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${cryptoRailClass[rail.status]}`}
                title={`${rail.asset} on ${rail.network}: ${rail.operations}`}
              >
                {rail.icon ? (
                  <span
                    className="flex size-4 items-center justify-center text-[var(--brand-color)]"
                    style={brandIconStyle(rail.icon)}
                  >
                    <BrandIcon name={rail.icon} className="size-3.5" />
                  </span>
                ) : null}
                {rail.asset}
              </span>
            ))}
          </div>
          <h3 className="mt-4 text-lg font-black text-rose-950">Crypto rails</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            BTCPay is installed for BTC; LTC and stablecoin rails stay separate until wallets are verified.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {paymentConfig.crypto.rails.filter((rail) => rail.recommended).map((rail) => (
              <span
                key={rail.id}
                className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] ${cryptoRailClass[rail.status]}`}
              >
                {rail.label} · {cryptoRailStatus[rail.status]}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-pink-100 bg-white/72 p-5 shadow-sm backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[var(--brand-color)] shadow-sm" style={brandIconStyle("telegram")}>
            <BrandIcon name="telegram" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-rose-950">Telegram VIP</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            Announcements, support, private invites and delivery follow-up.
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-pink-500">
            Updates and private invites
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
