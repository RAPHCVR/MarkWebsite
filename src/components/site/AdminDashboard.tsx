"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Download,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminOrder = {
  orderId: string;
  provider: string;
  providerInvoiceId: string | null;
  productSlug: string | null;
  productTitle: string | null;
  amountCents: number | null;
  currency: string | null;
  fiatValueEurAtTransaction: number | null;
  fiatCurrency: string | null;
  status: string;
  lastEventType: string | null;
  legalTermsVersion: string | null;
  withdrawalWaiverAcceptedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PrivateRequest = {
  requestId: string;
  orderId: string;
  productSlug: string | null;
  productTitle: string | null;
  telegramChatId: string | null;
  telegramUserId: string | null;
  status: string;
  quotaTotal: number;
  quotaUsed: number;
  subject: string | null;
  lastMessage: string | null;
  lastAdminReply: string | null;
  adminReplyCount: number;
  adminRepliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

type ContactRequest = {
  requestId: string;
  name: string | null;
  email: string | null;
  organization: string | null;
  telegram: string | null;
  telegramChatId: string | null;
  telegramUserId: string | null;
  telegramUsername: string | null;
  message: string;
  source: string | null;
  status: string;
  lastAdminReply: string | null;
  adminReplyCount: number;
  adminRepliedAt: string | null;
  userAgent: string | null;
  createdAt: string;
};

type DashboardState = {
  status: "idle" | "loading" | "ready" | "error";
  orders: AdminOrder[];
  requests: PrivateRequest[];
  contacts: ContactRequest[];
  error?: string;
};

function formatMoney(cents: number | null, currency: string | null) {
  if (cents === null || !currency) {
    return "n/a";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "PAID" || normalized.includes("SETTLED")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("PENDING") || normalized.includes("UNPAID")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-pink-200 bg-pink-50 text-pink-700";
}

function getAdminHeaders(token: string) {
  return token.trim()
    ? {
        Authorization: `Bearer ${token.trim()}`,
      }
    : undefined;
}

function getTelegramProfileUrl(username: string | null) {
  if (!username) {
    return null;
  }

  const cleanUsername = username.replace(/^@+/, "").trim();

  return /^[A-Za-z0-9_]{5,32}$/.test(cleanUsername)
    ? `https://t.me/${cleanUsername}`
    : null;
}

async function fetchJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    headers: getAdminHeaders(token),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function downloadCsv(path: string, token: string, filename: string) {
  const response = await fetch(path, {
    cache: "no-store",
    headers: getAdminHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`CSV export failed with ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    limit: "100",
  });
  const [state, setState] = useState<DashboardState>({
    status: "idle",
    orders: [],
    requests: [],
    contacts: [],
  });

  const stats = useMemo(() => {
    const paidOrders = state.orders.filter((order) => order.status.toUpperCase() === "PAID");
    const totalEur = state.orders.reduce(
      (sum, order) => sum + (order.fiatValueEurAtTransaction || 0),
      0,
    );
    const openRequests = state.requests.filter((request) =>
      ["available", "open"].includes(request.status),
    );

    return {
      paidCount: paidOrders.length,
      totalEur,
      openRequests: openRequests.length,
      contactCount: state.contacts.length,
    };
  }, [state.contacts.length, state.orders, state.requests]);

  const adminQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.from) {
      params.set("from", filters.from);
    }

    if (filters.to) {
      params.set("to", filters.to);
    }

    if (filters.limit) {
      params.set("limit", filters.limit);
    }

    const query = params.toString();

    return query ? `?${query}` : "";
  }, [filters]);

  async function refresh(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setState((current) => ({ ...current, status: "loading", error: undefined }));

    try {
      const [ordersPayload, requestsPayload, contactsPayload] = await Promise.all([
        fetchJson<{ orders: AdminOrder[] }>(`/api/admin/orders${adminQuery}`, token),
        fetchJson<{ requests: PrivateRequest[] }>(
          `/api/admin/private-requests${adminQuery}`,
          token,
        ),
        fetchJson<{ contacts: ContactRequest[] }>(
          `/api/admin/contact-requests${adminQuery}`,
          token,
        ),
      ]);

      setState({
        status: "ready",
        orders: ordersPayload.orders,
        requests: requestsPayload.requests,
        contacts: contactsPayload.contacts,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: error instanceof Error ? error.message : "Admin load failed.",
      }));
    }
  }

  async function exportCsv(kind: "orders" | "requests" | "contacts") {
    try {
      setState((current) => ({ ...current, error: undefined }));
      await downloadCsv(
        kind === "orders"
          ? `/api/admin/orders/export${adminQuery}`
          : kind === "requests"
            ? `/api/admin/private-requests/export${adminQuery}`
            : `/api/admin/contact-requests/export${adminQuery}`,
        token,
        kind === "orders"
          ? "marky-orders-accounting.csv"
          : kind === "requests"
            ? "marky-private-requests.csv"
            : "marky-contact-requests.csv",
      );
    } catch (error) {
      setState((current) => ({
        ...current,
        status: current.status === "idle" ? "error" : current.status,
        error: error instanceof Error ? error.message : "CSV export failed.",
      }));
    }
  }

  return (
    <section className="rounded-[2rem] border border-pink-100 bg-white/84 p-5 shadow-[0_24px_80px_rgba(236,72,153,0.12)] backdrop-blur sm:p-7">
      <form onSubmit={refresh} className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="space-y-2">
          <span className="text-sm font-black text-rose-950">Admin token optional</span>
          <span className="relative block">
            <KeyRound
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pink-500"
              aria-hidden="true"
            />
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="off"
              placeholder="Only needed outside Cloudflare Access"
              className="min-h-12 rounded-2xl border-pink-200 bg-white/80 pl-10"
            />
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-3">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-500">
              From
            </span>
            <Input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, from: event.target.value }))
              }
              className="min-h-11 rounded-2xl border-pink-200 bg-white/80"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-500">
              To
            </span>
            <Input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({ ...current, to: event.target.value }))
              }
              className="min-h-11 rounded-2xl border-pink-200 bg-white/80"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-pink-500">
              Limit
            </span>
            <Input
              type="number"
              min={1}
              max={5000}
              value={filters.limit}
              onChange={(event) =>
                setFilters((current) => ({ ...current, limit: event.target.value }))
              }
              className="min-h-11 rounded-2xl border-pink-200 bg-white/80"
            />
          </label>
        </div>
        <Button
          type="submit"
          className="self-end rounded-full bg-pink-600 px-6 font-black text-white hover:bg-pink-700"
          disabled={state.status === "loading"}
        >
          {state.status === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          Refresh
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => exportCsv("orders")}
          className="self-end rounded-full border-pink-200 bg-white/80 font-black text-pink-700 hover:bg-pink-50"
        >
          <Download className="size-4" aria-hidden="true" />
          CSV
        </Button>
      </form>

      {state.error ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {state.error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Paid orders", String(stats.paidCount), ShieldCheck],
          ["EUR booked", `${stats.totalEur.toFixed(2)} EUR`, Download],
          ["Open requests", String(stats.openRequests), Ticket],
          ["Contacts", String(stats.contactCount), Mail],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-3xl border border-pink-100 bg-pink-50/70 p-4">
            <Icon className="size-5 text-pink-500" aria-hidden="true" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-pink-500">
              {label as string}
            </p>
            <p className="mt-1 text-2xl font-black text-rose-950">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-rose-950">Latest orders</h2>
            <button
              type="button"
              onClick={() => exportCsv("orders")}
              className="text-sm font-black text-pink-700 underline decoration-pink-300 underline-offset-4 disabled:opacity-40"
            >
              Export accounting CSV
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-pink-100">
            <div className="max-h-[34rem] overflow-auto">
              <table className="w-full min-w-[760px] border-collapse bg-white/72 text-left text-sm">
                <thead className="sticky top-0 bg-pink-50 text-xs font-black uppercase tracking-[0.12em] text-pink-600">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Access</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Fiat EUR</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {state.orders.map((order) => (
                    <tr key={order.orderId} className="border-t border-pink-100 align-top">
                      <td className="max-w-52 p-3 font-mono text-xs text-rose-950/70">
                        {order.orderId}
                      </td>
                      <td className="p-3 font-bold text-rose-950">{order.provider}</td>
                      <td className="p-3 text-rose-950/72">
                        {order.productTitle || order.productSlug || "n/a"}
                      </td>
                      <td className="p-3 font-bold text-rose-950">
                        {formatMoney(order.amountCents, order.currency)}
                      </td>
                      <td className="p-3 font-bold text-rose-950">
                        {order.fiatValueEurAtTransaction === null
                          ? "n/a"
                          : `${order.fiatValueEurAtTransaction.toFixed(2)} EUR`}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-black ${getStatusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-rose-950/62">{formatDate(order.paidAt)}</td>
                      <td className="p-3 text-rose-950/62">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                  {!state.orders.length ? (
                    <tr>
                      <td colSpan={8} className="p-5 text-center font-bold text-rose-950/55">
                        No orders loaded.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-rose-950">Private requests</h2>
            <button
              type="button"
              onClick={() => exportCsv("requests")}
              className="text-sm font-black text-pink-700 underline decoration-pink-300 underline-offset-4 disabled:opacity-40"
            >
              Export tickets
            </button>
          </div>
          <div className="space-y-3">
            {state.requests.map((request) => (
              <article
                key={request.requestId}
                className="rounded-3xl border border-pink-100 bg-white/74 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-rose-950">
                      {request.subject || request.productTitle || "VIP Request Pass"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-rose-950/48">
                      {request.requestId}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${getStatusClass(request.status)}`}>
                    {request.quotaUsed}/{request.quotaTotal}
                  </span>
                </div>
                {request.lastMessage ? (
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-rose-950/68">
                    {request.lastMessage}
                  </p>
                ) : (
                  <p className="mt-3 text-sm font-bold text-rose-950/45">
                    No message submitted yet.
                  </p>
                )}
                {request.lastAdminReply ? (
                  <div className="mt-3 rounded-2xl border border-pink-100 bg-pink-50/72 p-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-pink-500">
                      Last concierge reply
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-rose-950/68">
                      {request.lastAdminReply}
                    </p>
                    <p className="mt-2 text-xs font-bold text-rose-950/45">
                      {request.adminReplyCount} repl{request.adminReplyCount === 1 ? "y" : "ies"}
                      {request.adminRepliedAt
                        ? ` · ${formatDate(request.adminRepliedAt)}`
                        : ""}
                    </p>
                  </div>
                ) : null}
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-pink-500">
                  Updated {formatDate(request.updatedAt)}
                </p>
              </article>
            ))}
            {!state.requests.length ? (
              <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/72 p-5 text-center text-sm font-bold text-rose-950/55">
                No request tickets loaded.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-rose-950">Contact requests</h2>
          <button
            type="button"
            onClick={() => exportCsv("contacts")}
            className="text-sm font-black text-pink-700 underline decoration-pink-300 underline-offset-4 disabled:opacity-40"
          >
            Export contacts
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {state.contacts.map((contact) => (
            <article
              key={contact.requestId}
              className="rounded-3xl border border-pink-100 bg-white/74 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-rose-950">
                    {contact.name || contact.organization || "Contact request"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-rose-950/48">
                    {contact.requestId}
                  </p>
                </div>
                <p className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-700">
                  {formatDate(contact.createdAt)}
                </p>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-rose-950/68 sm:grid-cols-2">
                <p>
                  <span className="font-black text-rose-950">Email:</span>{" "}
                  {contact.email || "n/a"}
                </p>
                <p>
                  <span className="font-black text-rose-950">Brand:</span>{" "}
                  {contact.organization || "n/a"}
                </p>
                <p>
                  <span className="font-black text-rose-950">Telegram:</span>{" "}
                  {(() => {
                    const telegramProfileUrl = getTelegramProfileUrl(
                      contact.telegramUsername || contact.telegram,
                    );

                    return telegramProfileUrl ? (
                      <a
                        href={telegramProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-pink-700 underline decoration-pink-300 underline-offset-4"
                      >
                        @{telegramProfileUrl.split("/").at(-1)}
                      </a>
                    ) : contact.telegramUserId || contact.telegramChatId ? (
                      "Bot linked"
                    ) : (
                      "n/a"
                    );
                  })()}
                </p>
                <p>
                  <span className="font-black text-rose-950">Status:</span>{" "}
                  {contact.status}
                </p>
              </div>
              <p className="mt-3 line-clamp-5 text-sm leading-6 text-rose-950/68">
                {contact.message}
              </p>
              {contact.lastAdminReply ? (
                <div className="mt-3 rounded-2xl border border-pink-100 bg-pink-50/72 p-3">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-pink-500">
                    Last contact reply
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-rose-950/68">
                    {contact.lastAdminReply}
                  </p>
                  <p className="mt-2 text-xs font-bold text-rose-950/45">
                    {contact.adminReplyCount} repl{contact.adminReplyCount === 1 ? "y" : "ies"}
                    {contact.adminRepliedAt
                      ? ` · ${formatDate(contact.adminRepliedAt)}`
                      : ""}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
          {!state.contacts.length ? (
            <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/72 p-5 text-center text-sm font-bold text-rose-950/55 lg:col-span-2">
              No contact requests loaded.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
