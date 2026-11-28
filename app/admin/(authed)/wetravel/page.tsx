import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  createExternalSaleAction,
  deleteExternalSaleAction,
} from "../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WeTravel sales · Admin · Private Travel CR",
  robots: { index: false, follow: false },
};

type ExternalSale = {
  id: string;
  amount_usd: number | string | null;
  sale_date: string; // "YYYY-MM-DD"
  customer_name: string | null;
  route: string | null;
  notes: string | null;
};

type SearchParams = Promise<{
  saved?: string;
  deleted?: string;
  error?: string;
}>;

const CR_TZ = "America/Costa_Rica";

/** Today's date in CR as YYYY-MM-DD, for the date input default. */
function crToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Human label like "Aug 14, 2026" for a YYYY-MM-DD string, no tz drift. */
function formatSaleDate(key: string): string {
  const [y, m, d] = key.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return key;
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.toLocaleDateString("en-US", {
    timeZone: CR_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toNumber(v: number | string | null): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function fetchSales(): Promise<{ sales: ExternalSale[]; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("external_sales")
    .select("id, amount_usd, sale_date, customer_name, route, notes")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { sales: [], error: error.message };
  return { sales: (data as unknown as ExternalSale[]) || [], error: null };
}

export default async function WeTravelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { saved, deleted, error: formError } = await searchParams;
  const { sales, error } = await fetchSales();

  const thisMonthKey = crToday().slice(0, 7);
  let totalAll = 0;
  let totalThisMonth = 0;
  for (const s of sales) {
    const amt = toNumber(s.amount_usd);
    totalAll += amt;
    if ((s.sale_date || "").slice(0, 7) === thisMonthKey) totalThisMonth += amt;
  }

  const errorMsg =
    formError === "amount"
      ? "Enter a valid amount greater than 0."
      : formError === "date"
        ? "Pick a valid sale date."
        : formError === "save"
          ? "Could not save — check that the external_sales table exists in Supabase."
          : null;

  const tableMissing =
    error && /relation .*external_sales.* does not exist|does not exist/i.test(error);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/analytics"
        className="inline-flex items-center gap-1 text-xs text-adm-muted hover:text-adm-accent-hover mb-4"
      >
        <ChevronLeft size={14} /> Analytics
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <span aria-hidden>🧾</span> WeTravel sales
        </h1>
        <p className="text-xs text-adm-faint mt-1 max-w-2xl">
          Log sales you collected through WeTravel (or any platform outside the
          website). These aren&apos;t in the booking system, so add them here and
          they&apos;ll be added to the Analytics totals — giving you your true
          combined revenue on one screen.
        </p>
      </div>

      {/* Banners */}
      {saved && (
        <div className="bg-adm-ok/10 border border-adm-ok/30 text-adm-ok text-sm rounded-md px-3 py-2 mb-4">
          ✅ Sale saved. It&apos;s now included in your Analytics totals.
        </div>
      )}
      {deleted && (
        <div className="bg-adm-surface-2 border border-adm-border-strong text-adm-text-2 text-sm rounded-md px-3 py-2 mb-4">
          Sale deleted.
        </div>
      )}
      {errorMsg && (
        <div className="bg-adm-danger/10 border border-adm-danger/30 text-adm-danger text-sm rounded-md px-3 py-2 mb-4">
          {errorMsg}
        </div>
      )}
      {tableMissing && (
        <div className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent text-sm rounded-md px-3 py-3 mb-4">
          The <code className="text-adm-accent">external_sales</code> table
          doesn&apos;t exist yet. Run the setup SQL in Supabase first, then this
          page will work.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-adm-surface border border-adm-border rounded-xl px-4 py-3">
          <div className="text-xs text-adm-faint">WeTravel this month</div>
          <div className="text-xl font-bold text-adm-accent">
            {formatUsd(totalThisMonth)}
          </div>
        </div>
        <div className="bg-adm-surface border border-adm-border rounded-xl px-4 py-3">
          <div className="text-xs text-adm-faint">WeTravel all-time logged</div>
          <div className="text-xl font-bold text-adm-text">
            {formatUsd(totalAll)}
          </div>
        </div>
      </div>

      {/* Add form */}
      <form
        action={createExternalSaleAction}
        className="bg-adm-surface border border-adm-border rounded-xl p-4 mb-8 space-y-4"
      >
        <div className="text-sm font-semibold text-adm-text">Add a sale</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-adm-muted">Amount (USD) *</span>
            <input
              type="number"
              name="amountUsd"
              min="1"
              step="0.01"
              required
              placeholder="450"
              className="mt-1 w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-adm-muted">Sale date *</span>
            <input
              type="date"
              name="saleDate"
              required
              defaultValue={crToday()}
              className="mt-1 w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-adm-muted">Customer (optional)</span>
            <input
              type="text"
              name="customerName"
              placeholder="John Smith"
              className="mt-1 w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-adm-muted">Route (optional)</span>
            <input
              type="text"
              name="route"
              placeholder="SJO → La Fortuna"
              className="mt-1 w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-adm-muted">Notes (optional)</span>
          <input
            type="text"
            name="notes"
            placeholder="Round trip, paid in full"
            className="mt-1 w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm text-adm-text focus:border-adm-accent focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-semibold text-sm rounded-md px-4 py-2 transition-colors"
        >
          Save sale
        </button>
      </form>

      {/* List */}
      <div className="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-adm-border text-sm font-semibold text-adm-text">
          Logged sales{" "}
          <span className="text-xs text-adm-faint font-normal">
            ({sales.length})
          </span>
        </div>
        {error && !tableMissing && (
          <div className="px-4 py-3 text-sm text-adm-danger">
            Failed to load: {error}
          </div>
        )}
        {!error && sales.length === 0 && (
          <div className="px-4 py-6 text-sm text-adm-faint text-center">
            No WeTravel sales logged yet.
          </div>
        )}
        {sales.length > 0 && (
          <div className="divide-y divide-zinc-900">
            {sales.map((s) => (
              <div
                key={s.id}
                className="px-4 py-3 flex items-center gap-3 text-sm"
              >
                <div className="w-24 shrink-0 text-adm-muted text-xs">
                  {formatSaleDate(s.sale_date)}
                </div>
                <div className="w-20 shrink-0 font-semibold text-adm-accent">
                  {formatUsd(toNumber(s.amount_usd))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-adm-text truncate">
                    {s.customer_name || "—"}
                    {s.route ? (
                      <span className="text-adm-faint"> · {s.route}</span>
                    ) : null}
                  </div>
                  {s.notes && (
                    <div className="text-xs text-adm-faint truncate">
                      {s.notes}
                    </div>
                  )}
                </div>
                <form action={deleteExternalSaleAction} className="shrink-0">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    aria-label="Delete sale"
                    className="text-adm-faint hover:text-adm-danger p-1 rounded hover:bg-adm-surface-2"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
