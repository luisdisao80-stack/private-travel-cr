import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem } from "@/lib/CartContext";
import {
  STATUSES,
  statusBadgeClass,
  formatCRDateTime,
  earliestPickupAt,
} from "@/components/admin/booking-helpers";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
}>;

type BookingRow = {
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total_usd: number | string | null;
  items: CartItem[] | null;
  status: string | null;
  created_at: string;
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = sp.status && STATUSES.includes(sp.status as never) ? sp.status : "";
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, customer_phone, total_usd, items, status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);
  if (q) {
    // Search across order_number, email, and name. Supabase's `.or()` takes a
    // comma-separated filter string; escape commas in the input just in case.
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(
      `order_number.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_name.ilike.%${safe}%`
    );
  }

  const { data, count, error } = await query;
  const rows: BookingRow[] = (data as BookingRow[]) || [];
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bookings</h1>
          <p className="text-xs text-gray-500 mt-1">
            {count ?? 0} total · page {page} of {totalPages}
          </p>
        </div>
      </div>

      <form
        method="GET"
        className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 mb-6 flex items-center gap-2 flex-wrap"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search order #, email, or name"
            className="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md pl-8 pr-3 py-2 text-sm"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <select
            name="status"
            defaultValue={status}
            className="bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md pl-8 pr-8 py-2 text-sm appearance-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-md transition-colors"
        >
          Apply
        </button>
        {(status || q) && (
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-white px-2 py-2"
          >
            Clear
          </Link>
        )}
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2 mb-4">
          Failed to load bookings: {error.message}
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 py-3">Order</th>
                <th className="text-left font-medium px-4 py-3">Customer</th>
                <th className="text-left font-medium px-4 py-3">Pickup</th>
                <th className="text-left font-medium px-4 py-3">Route</th>
                <th className="text-right font-medium px-4 py-3">Total</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-500 py-12 text-sm"
                  >
                    No bookings match these filters.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const items = row.items || [];
                const first = items[0];
                const pickup = earliestPickupAt(items);
                const routeLabel = first
                  ? items.length > 1
                    ? `${first.fromName} → ${first.toName} (+${items.length - 1} more)`
                    : `${first.fromName} → ${first.toName}`
                  : "—";
                return (
                  <tr
                    key={row.order_number}
                    className="border-t border-zinc-900 hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${encodeURIComponent(row.order_number)}`}
                        className="text-amber-400 hover:text-amber-300 font-mono text-xs"
                      >
                        {row.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {row.customer_name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.customer_email || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {pickup ? formatCRDateTime(pickup) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{routeLabel}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      ${Number(row.total_usd || 0).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${statusBadgeClass(row.status)}`}
                      >
                        {row.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatCRDateTime(new Date(row.created_at))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 text-xs">
          {page > 1 && (
            <Link
              href={buildPageHref(sp, page - 1)}
              className="px-3 py-1.5 border border-zinc-800 rounded-md hover:border-amber-500/60"
            >
              ← Previous
            </Link>
          )}
          <span className="text-gray-500 px-2">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(sp, page + 1)}
              className="px-3 py-1.5 border border-zinc-800 rounded-md hover:border-amber-500/60"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildPageHref(
  sp: { status?: string; q?: string; page?: string },
  nextPage: number
): string {
  const params = new URLSearchParams();
  if (sp.status) params.set("status", sp.status);
  if (sp.q) params.set("q", sp.q);
  params.set("page", String(nextPage));
  return `/admin?${params.toString()}`;
}
