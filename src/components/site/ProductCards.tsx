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
import type { Product } from "@/data/products";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
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

const providerBrandIcon: Partial<Record<Product["checkoutProvider"], BrandIconKey>> = {
  stripe: "stripe",
  telegram: "telegram",
};

const cryptoRailClass = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  installed: "border-sky-200 bg-sky-50 text-sky-700",
  planned: "border-pink-200 bg-pink-50 text-pink-700",
  research: "border-amber-200 bg-amber-50 text-amber-700",
  disabled: "border-slate-200 bg-slate-50 text-slate-500",
};

function getCta(product: Product, dictionary: Dictionary) {
  if (!paymentConfig.salesEnabled) {
    return product.status === "coming-soon"
      ? dictionary.products.cta.previewSoon
      : dictionary.products.cta.previewAccess;
  }

  if (product.status === "coming-soon") {
    return dictionary.products.cta.previewSoon;
  }

  if (product.checkoutProvider === "stripe" && product.stripePaymentLink) {
    return dictionary.products.cta.stripe;
  }

  if (product.checkoutProvider === "crypto" && product.cryptoCheckoutUrl) {
    return dictionary.products.cta.crypto;
  }

  if (product.checkoutProvider === "telegram" && product.telegramVipUrl) {
    return dictionary.products.cta.telegram;
  }

  return dictionary.products.cta.previewAccess;
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
    paymentConfig.crypto.databaseConfigured &&
    product.status !== "coming-soon"
  );
}

function getBtcpayButton(dictionary: Dictionary) {
  const btcReady = paymentConfig.crypto.btcpay.btcWalletReady;
  const ltcReady = paymentConfig.crypto.btcpay.ltcEnabled;

  if (btcReady && ltcReady) {
    return {
      icon: "bitcoin" as const,
      label: dictionary.products.cta.btcLtc,
    };
  }

  if (ltcReady) {
    return {
      icon: "litecoin" as const,
      label: dictionary.products.cta.litecoin,
    };
  }

  return {
    icon: "bitcoin" as const,
    label: dictionary.products.cta.bitcoin,
  };
}

function canShowStablecoinCheckout(product: Product) {
  return (
    paymentConfig.salesEnabled &&
    paymentConfig.crypto.stablecoin.checkoutEnabled &&
    paymentConfig.crypto.databaseConfigured &&
    product.status !== "coming-soon"
  );
}

type ProductCardsProps = {
  locale: Locale;
  dictionary: Dictionary;
  products: Product[];
};

export function ProductCards({ locale, dictionary, products }: ProductCardsProps) {
  return (
    <SectionShell
      id="access-passes"
      eyebrow={dictionary.products.eyebrow}
      title={dictionary.products.title}
      description={dictionary.products.description}
      className="pt-8"
    >
      <div className="mb-5 flex flex-wrap gap-3">
        {dictionary.products.badges.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="h-9 rounded-full border-rose-950/12 bg-white/80 px-4 font-bold text-mark-cta shadow-sm"
          >
            <Check className="size-3.5" aria-hidden="true" />
            {item}
          </Badge>
        ))}
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="mb-4 grid gap-3 rounded-2xl border border-rose-950/10 bg-white/80 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
            {[
              ...dictionary.products.stats,
            ].map(([value, label]) => (
              <div key={value} className="rounded-xl bg-mark-50/80 px-4 py-3">
                <p className="text-sm font-black text-mark-cta">{value}</p>
                <p className="mt-1 text-xs font-bold text-rose-950/65">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
        {products.map((product) => {
          const ProviderIcon = providerIcon[product.checkoutProvider];
          const providerLogo = providerBrandIcon[product.checkoutProvider];
          const cta = getCta(product, dictionary);
          const disabled = product.status === "coming-soon";
          const checkoutDisabled =
            !paymentConfig.salesEnabled || disabled || !product.stripePaymentLink;
          const href = getHref(product);
          const safeHref = checkoutDisabled ? "#contact" : href;
          const showCryptoCheckout = canShowCryptoCheckout(product);
          const showStablecoinCheckout = canShowStablecoinCheckout(product);
          const btcpayButton = getBtcpayButton(dictionary);

          return (
            <article
              key={product.slug}
              className="group overflow-hidden rounded-2xl border border-rose-950/10 bg-white/85 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-mark-cta/30 hover:shadow-[0_22px_50px_rgba(200,13,91,0.14)]"
            >
              <div className={`relative overflow-hidden border-b border-dashed border-rose-950/15 bg-gradient-to-br ${accentClass[product.accent]} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-rose-950/80 text-white shadow-sm">
                    <Lock className="size-4" aria-hidden="true" />
                  </span>
                  <Badge className="rounded-full bg-white/90 px-3 font-bold text-mark-cta shadow-sm backdrop-blur">
                    {product.badge}
                  </Badge>
                </div>
                <div className="mt-5 flex items-center gap-2 text-mark-cta">
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
                  <span className="text-xs font-black uppercase tracking-[0.18em]">
                    {dictionary.products.providerLabels[product.checkoutProvider]}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3 rounded-2xl border border-white/70 bg-white/82 px-4 py-3 backdrop-blur">
                  <span className="min-w-0 truncate font-mono text-sm font-bold tracking-tight text-rose-950">
                    {product.slug.toUpperCase()}
                  </span>
                  <span className="shrink-0 text-2xl font-black leading-none text-rose-950">
                    {product.price}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-black leading-tight text-rose-950">
                  {product.title}
                </h3>
                <p className="mt-3 min-h-16 text-sm leading-6 text-rose-950/68">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2 border-t border-rose-950/8 pt-4">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-rose-950/75">
                      <Check className="size-4 shrink-0 text-mark-cta" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-2">
                  {checkoutDisabled ? (
                    <a
                      href={safeHref}
                      aria-disabled={disabled ? "true" : undefined}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-pink-200 px-4 text-sm font-black text-pink-800 transition hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 aria-disabled:pointer-events-none"
                    >
                      {disabled ? (
                        <Lock className="size-4" aria-hidden="true" />
                      ) : (
                        <ProviderIcon className="size-4" aria-hidden="true" />
                      )}
                      {cta}
                    </a>
                  ) : (
                    <form method="post" className="grid gap-2">
                      <input type="hidden" name="product" value={product.slug} />
                      <label className="flex items-start gap-2 rounded-2xl border border-pink-100 bg-pink-50/65 p-3 text-xs font-bold leading-5 text-rose-950/68">
                        <input
                          required
                          type="checkbox"
                          name="termsAccepted"
                          value="true"
                          className="mt-1 size-4 rounded border-pink-300 text-pink-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                        />
                        <span>
                          {dictionary.products.consent.split(dictionary.products.termsLabel)[0]}
                          <a href={localePath(locale, "/terms")} className="text-pink-700 underline decoration-pink-300 underline-offset-2">
                            {dictionary.products.termsLabel}
                          </a>
                          {dictionary.products.consent.split(dictionary.products.termsLabel).slice(1).join(dictionary.products.termsLabel)}
                        </span>
                      </label>
                      <button
                        type="submit"
                        formAction="/api/checkout/stripe"
                        formMethod="post"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(219,39,119,0.28)] transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
                      >
                        <ProviderIcon className="size-4" aria-hidden="true" />
                        {cta}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                      {showCryptoCheckout ? (
                        <button
                          type="submit"
                          formAction={paymentConfig.crypto.btcpay.checkoutRoute}
                          formMethod="post"
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
                        >
                          <span
                            className="flex size-5 items-center justify-center text-[var(--brand-color)]"
                            style={brandIconStyle(btcpayButton.icon)}
                          >
                            <BrandIcon name={btcpayButton.icon} className="size-4" />
                          </span>
                          {btcpayButton.label}
                        </button>
                      ) : null}
                      {showStablecoinCheckout ? (
                        <>
                          <input
                            type="hidden"
                            name="rail"
                            value={paymentConfig.crypto.stablecoin.defaultRail}
                          />
                          <button
                            type="submit"
                            formAction={paymentConfig.crypto.stablecoin.checkoutRoute}
                            formMethod="post"
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-4 text-sm font-black text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                          >
                            <span
                              className="flex size-5 items-center justify-center text-[var(--brand-color)]"
                              style={brandIconStyle("circle")}
                            >
                              <BrandIcon name="circle" className="size-4" />
                            </span>
                            {dictionary.products.cta.usdc}
                          </button>
                        </>
                      ) : null}
                    </form>
                  )}
                </div>
              </div>
            </article>
          );
        })}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h3 className="flex items-center gap-2 text-xl font-black text-mark-cta">
            <CreditCard className="size-5" aria-hidden="true" />
            {dictionary.products.accessPanel.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/68">
            {dictionary.products.accessPanel.body}
          </p>
          <div className="mt-4 space-y-3">
            {dictionary.products.accessPanel.rows.map(([title, text]) => (
              <div key={title} className="rounded-xl border border-rose-950/10 bg-white/80 p-3">
                <p className="text-sm font-black text-rose-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-rose-950/65">{text}</p>
              </div>
            ))}
          </div>
          <a
            href={paymentConfig.telegram.requestBotUrl || "#contact"}
            {...getExternalLinkProps(paymentConfig.telegram.requestBotUrl || "#contact")}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-mark-cta/25 bg-mark-50 px-4 text-sm font-black text-mark-cta transition hover:border-mark-cta/40 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mark-cta/25"
          >
            <Send className="size-4" aria-hidden="true" />
            {dictionary.products.cta.requestPrivatePass}
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-rose-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[var(--brand-color)] shadow-sm" style={brandIconStyle("stripe")}>
            <BrandIcon name="stripe" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-rose-950">{dictionary.products.cards.stripe.title}</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            {paymentConfig.salesEnabled
              ? dictionary.products.cards.stripe.live
              : dictionary.products.cards.stripe.ready}
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-mark-cta">
            {dictionary.products.cards.stripe.note}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {paymentConfig.crypto.rails.slice(0, 5).map((rail) => (
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
          <h3 className="mt-4 text-lg font-black text-rose-950">{dictionary.products.cards.crypto.title}</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            {dictionary.products.cards.crypto.body}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {paymentConfig.crypto.rails.filter((rail) => rail.recommended).map((rail) => (
              <span
                key={rail.id}
                className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] ${cryptoRailClass[rail.status]}`}
              >
                {rail.label} · {dictionary.products.railStatus[rail.status]}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-[var(--brand-color)] shadow-sm" style={brandIconStyle("telegram")}>
            <BrandIcon name="telegram" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-rose-950">{dictionary.products.cards.telegram.title}</h3>
          <p className="mt-2 text-sm leading-6 text-rose-950/65">
            {dictionary.products.cards.telegram.body}
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-mark-cta">
            {dictionary.products.cards.telegram.note}
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
