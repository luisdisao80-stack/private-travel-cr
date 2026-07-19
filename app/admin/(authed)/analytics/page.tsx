import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  statusBadgeClass,
  formatCRDateTime,
} from "@/components/admin/booking-helpers";
import { aggregate, type BookingRow } from "./lib/aggregate";
import RevenueChart from "./RevenueChart";
import BookingsChart from "./BookingsChart";
import TopRoutesChart from "./TopRoutesChart";
import MonthlyRevenueChart from "./MonthlyRevenueChart";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics · Admin · Private Travel CR",
  robots: { index: false, follow: false },
};

/**
 * ONE query for the last 12 months of approved bookings. Volume is small
 * enough (~1–2k rows) that aggregating in JS is simpler than SQL and
 * avoids maintaining a separate view.
 */
async function fetchBookings(): Promise<{ rows: BookingRow[]; error: string | null }> {
  // Rolling 12-month cutoff. UTC is fine — we use it purely as a lower
  // bound to keep the query small. The aggregator handles CR calendar
  // math itself.
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  cutoff.setUTCDate(cutoff.getUTCDate() - 7); // small buffer for weekly windows

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, total_usd, items, status, created_at"
    )
    .eq("status", "approved")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });

  if (error) return { rows: [], error: error.message };
  return {
    rows: (data as unknown as BookingRow[]) || [],
    error: null,
  };
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;
}

function formatUsdCents(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DeltaBadge({ label, pct }: { label: string; pct: number | null }) {
  if (pct === null || !Number.isFinite(pct)) {
    return (
      <span className="text-xs text-gray-500">
        {label}: <span className="font-medium">–</span>
      </span>
    );
  }
  const positive = pct >= 0;
  const color = positive ? "text-green-400" : "text-red-400";
  const sign = positive ? "+" : "";
  return (
    <span className="text-xs text-gray-400">
      {label}:{" "}
      <span className={`font-semibold ${color}`}>
        {sign}
        {pct.toFixed(1)}%
      </span>
    </span>
  );
}

function Card({
  emoji,
  label,
  value,
  hint,
}: {
  emoji: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500">
        <span aria-hidden>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-bold text-amber-400 font-mono break-all">
        {value}
      </div>
      {hint && <div className="text-[11px] text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const { rows, error } = await fetchBookings();
  const stats = aggregate(rows);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400 mb-3"
        >
          <ChevronLeft size={14} /> All bookings
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <span aria-hidden>📊</span> Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Revenue and bookings insights · America/Costa_Rica timezone · approved
          bookings only
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2 mb-4">
          Failed to load bookings: {error}
        </div>
      )}

      {/* Header cards — 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <Card
          emoji="💰"
          label="Today"
          value={formatUsd(stats.revenue.today)}
          hint="from midnight CR"
        />
        <Card
          emoji="💰"
          label="This week"
          value={formatUsd(stats.revenue.thisWeek)}
          hint="Mon–Sun CR"
        />
        <Card
          emoji="💰"
          label="This month"
          value={formatUsd(stats.revenue.thisMonth)}
        />
        <Card
          emoji="💰"
          label="This year"
          value={formatUsd(stats.revenue.thisYear)}
        />
        <Card
          emoji="📦"
          label="Bookings (mo)"
          value={stats.bookingsThisMonth.toLocaleString("en-US")}
        />
        <Card
          emoji="🎫"
          label="Avg ticket (mo)"
          value={formatUsdCents(stats.avgTicketThisMonth)}
        />
      </div>

      {/* Comparison deltas */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8 px-1">
        <DeltaBadge label="WoW" pct={stats.deltas.weekOverWeek.pct} />
        <DeltaBadge label="MoM" pct={stats.deltas.monthOverMonth.pct} />
        <DeltaBadge label="YoY" pct={stats.deltas.yearOverYear.pct} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          <div className="text-sm font-semibold mb-2 text-gray-200">
            Revenue per day
            <span className="text-xs text-gray-500 font-normal ml-2">
              last 30 days
            </span>
          </div>
          <RevenueChart data={stats.daily} />
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          <div className="text-sm font-semibold mb-2 text-gray-200">
            Bookings per day
            <span className="text-xs text-gray-500 font-normal ml-2">
              last 30 days
            </span>
          </div>
          <BookingsChart data={stats.daily} />
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          <div className="text-sm font-semibold mb-2 text-gray-200">
            Top 10 routes by revenue
            <span className="text-xs text-gray-500 font-normal ml-2">
              last 30 days · split by trip
            </span>
          </div>
          <TopRoutesChart data={stats.topRoutes30d} />
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          <div className="text-sm font-semibold mb-2 text-gray-200">
            Revenue by month
            <span className="text-xs text-gray-500 font-normal ml-2">
              last 12 months
            </span>
          </div>
          <MonthlyRevenueChart data={stats.monthly} />
        </div>
      </div>

      {/* Top routes this month */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-zinc-900">
          <div className="text-sm font-semibold text-gray-200">
            Top routes this month
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 py-3">Route</th>
                <th className="text-right font-medium px-4 py-3">Trips</th>
                <th className="text-right font-medium px-4 py-3">Revenue</th>
                <th className="text-right font-medium px-4 py-3">Avg / trip</th>
              </tr>
            </thead>
            <tbody>
              {stats.topRoutesThisMonth.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-gray-500 py-8 text-sm"
                  >
                    No approved bookings this month yet.
                  </td>
                </tr>
              )}
              {stats.topRoutesThisMonth.map((r) => (
                <tr
                  key={r.route}
                  className="border-t border-zinc-900 hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-4 py-3">{r.route}</td>
                  <td className="px-4 py-3 text-right font-mono">{r.trips}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">
                    {formatUsdCents(r.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400">
                    {formatUsdCents(r.trips > 0 ? r.revenue / r.trips : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-900">
          <div className="text-sm font-semibold text-gray-200">
            Recent approved bookings
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 py-3">Customer</th>
                <th className="text-left font-medium px-4 py-3">Route</th>
                <th className="text-left font-medium px-4 py-3">Order</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-8 text-sm"
                  >
                    No approved bookings in the last 12 months.
                  </td>
                </tr>
              )}
              {stats.recentBookings.map((b) => (
                <tr
                  key={b.order_number}
                  className="border-t border-zinc-900 hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-4 py-3">{b.customer_name}</td>
                  <td className="px-4 py-3 text-xs">{b.route}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/${encodeURIComponent(b.order_number)}`}
                      className="text-amber-400 hover:text-amber-300 font-mono text-xs"
                    >
                      {b.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatCRDateTime(new Date(b.created_at))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatUsdCents(b.total_usd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${statusBadgeClass(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
