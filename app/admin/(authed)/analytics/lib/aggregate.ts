/**
 * Pure aggregation for the admin analytics dashboard.
 *
 * Given a raw list of approved bookings (last 12 months), compute every
 * number the dashboard needs. Kept as a pure function so the page.tsx
 * server component stays thin and the numbers are unit-testable.
 *
 * Assumptions:
 *   - Callers pass ONLY status='approved' rows. Filtering upstream keeps
 *     "approved" as the single revenue definition across the codebase.
 *   - `total_usd` is the authoritative revenue field on a booking. For
 *     multi-trip bookings, per-trip attribution splits `total_usd`
 *     proportionally by each trip's `totalPrice` (the CartItem shape's
 *     per-trip price — the admin quote form calls the input `tripPrice`
 *     but stores it as `totalPrice` on the CartItem).
 *   - All calendar boundaries (day / week / month / year) resolve in
 *     America/Costa_Rica. CR is UTC-6 year-round (no DST), so we can
 *     compute keys via Intl.DateTimeFormat and trust the shift.
 */
import type { CartItem } from "@/lib/CartContext";

export type BookingRow = {
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  total_usd: number | string | null;
  items: CartItem[] | null;
  status: string | null;
  created_at: string; // ISO UTC timestamp
};

export type Delta = {
  /** Percentage change vs. baseline. null = no comparable baseline. */
  pct: number | null;
  /** Absolute current-period revenue (or count). */
  current: number;
  /** Absolute baseline revenue (or count). */
  baseline: number;
};

export type DailyPoint = {
  /** YYYY-MM-DD in CR local time. */
  date: string;
  /** Short label for the chart X-axis, e.g. "Jul 3". */
  label: string;
  revenue: number;
  bookings: number;
};

export type MonthlyPoint = {
  /** YYYY-MM in CR local time. */
  month: string;
  /** Short label, e.g. "Jul 26". */
  label: string;
  revenue: number;
  bookings: number;
};

export type RouteAggregate = {
  route: string;
  fromName: string;
  toName: string;
  trips: number;
  revenue: number;
};

export type RecentBooking = {
  order_number: string;
  customer_name: string;
  route: string;
  created_at: string;
  total_usd: number;
  status: string;
};

export type AggregatedStats = {
  now: string; // ISO of "now" used, for display / debugging
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    lastWeek: number;
    lastMonth: number;
    sameMonthLastYear: number | null; // null when no data that far back
  };
  bookingsThisMonth: number;
  avgTicketThisMonth: number;
  deltas: {
    weekOverWeek: Delta;
    monthOverMonth: Delta;
    yearOverYear: Delta;
  };
  daily: DailyPoint[]; // last 30 days incl. today
  monthly: MonthlyPoint[]; // last 12 months incl. current
  topRoutes30d: RouteAggregate[];
  topRoutesThisMonth: RouteAggregate[];
  recentBookings: RecentBooking[];
};

// --- Timezone helpers ---------------------------------------------------

const CR_TZ = "America/Costa_Rica";

/** YYYY-MM-DD key of a UTC instant in CR local time. */
function crDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

/** YYYY-MM key of a UTC instant in CR local time. */
function crMonthKey(d: Date): string {
  return crDateKey(d).slice(0, 7);
}

/** YYYY key of a UTC instant in CR local time. */
function crYearKey(d: Date): string {
  return crDateKey(d).slice(0, 4);
}

/** Short human label like "Jul 3" for a YYYY-MM-DD CR date key. */
function shortDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  // Build a UTC noon on the CR date; noon UTC is 06:00 CR so we shift.
  // Easier: construct via Date.UTC and format with CR tz.
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.toLocaleDateString("en-US", {
    timeZone: CR_TZ,
    month: "short",
    day: "numeric",
  });
}

/** Short label like "Jul 26" for a YYYY-MM CR month key. */
function shortMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, 15, 12, 0, 0));
  const monthName = dt.toLocaleDateString("en-US", {
    timeZone: CR_TZ,
    month: "short",
  });
  return `${monthName} ${String(y).slice(2)}`;
}

/**
 * Return the ISO week's Monday 00:00 CR-local (as a UTC Date). Week starts
 * Monday per the spec. We derive weekday from Intl to avoid drift.
 */
function crMondayOfWeek(d: Date): Date {
  // Determine CR weekday (Mon..Sun) as index 0..6.
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CR_TZ,
    weekday: "short",
  }).format(d);
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const idx = order.indexOf(weekday);
  // CR-local Y/M/D for d.
  const key = crDateKey(d);
  const [y, m, day] = key.split("-").map((n) => parseInt(n, 10));
  // 00:00 CR-local == 06:00 UTC.
  const midnightUtc = Date.UTC(y, m - 1, day, 6, 0, 0);
  return new Date(midnightUtc - idx * 24 * 60 * 60 * 1000);
}

/** Add days to a Date. */
function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/** First moment of a CR-local month, as UTC Date. monthKey = "YYYY-MM". */
function crMonthStart(monthKey: string): Date {
  const [y, m] = monthKey.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, 1, 6, 0, 0));
}

/** First moment of a CR-local year, as UTC Date. */
function crYearStart(yearKey: string): Date {
  const y = parseInt(yearKey, 10);
  return new Date(Date.UTC(y, 0, 1, 6, 0, 0));
}

/** First moment of a CR-local day, as UTC Date. */
function crDayStart(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0));
}

// --- Utility ------------------------------------------------------------

function pct(current: number, baseline: number): number | null {
  if (baseline <= 0) return null;
  return ((current - baseline) / baseline) * 100;
}

function toNumber(v: number | string | null | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function safeRouteName(name: string | undefined | null): string {
  return (name || "?").trim();
}

// --- Main aggregation ---------------------------------------------------

export function aggregate(rows: BookingRow[], now: Date = new Date()): AggregatedStats {
  // Precompute CR calendar keys we care about.
  const todayKey = crDateKey(now);
  const thisMonthKey = crMonthKey(now);
  const thisYearKey = crYearKey(now);

  // Last-month key by rolling back one day from the first of this month.
  const [thisY, thisM] = thisMonthKey.split("-").map((n) => parseInt(n, 10));
  const lastMonthDate = new Date(Date.UTC(thisY, thisM - 2, 15, 12, 0, 0));
  const lastMonthKey = crMonthKey(lastMonthDate);
  // Same-month-last-year key.
  const sameMonthLastYearKey = `${thisY - 1}-${String(thisM).padStart(2, "0")}`;

  // Week windows.
  const thisWeekStart = crMondayOfWeek(now);
  const nextWeekStart = addDays(thisWeekStart, 7);
  const lastWeekStart = addDays(thisWeekStart, -7);

  // Day window for daily chart: 30 days ending today (inclusive).
  const daily: DailyPoint[] = [];
  const dailyByKey = new Map<string, DailyPoint>();
  for (let i = 29; i >= 0; i--) {
    const key = crDateKey(addDays(crDayStart(todayKey), -i));
    const point: DailyPoint = { date: key, label: shortDayLabel(key), revenue: 0, bookings: 0 };
    daily.push(point);
    dailyByKey.set(key, point);
  }
  // Cutoff for "last 30 days" filter (00:00 CR of the earliest day).
  const dailyCutoffKey = daily[0].date;
  const dailyCutoffInstant = crDayStart(dailyCutoffKey);

  // Month window for monthly chart: 12 months ending this month (inclusive).
  const monthly: MonthlyPoint[] = [];
  const monthlyByKey = new Map<string, MonthlyPoint>();
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(Date.UTC(thisY, thisM - 1 - i, 15, 12, 0, 0));
    const key = crMonthKey(dt);
    const point: MonthlyPoint = { month: key, label: shortMonthLabel(key), revenue: 0, bookings: 0 };
    monthly.push(point);
    monthlyByKey.set(key, point);
  }

  // Rolling accumulators.
  let revToday = 0;
  let revThisWeek = 0;
  let revThisMonth = 0;
  let revThisYear = 0;
  let revLastWeek = 0;
  let revLastMonth = 0;
  let revSameMonthLastYear = 0;
  let sameMonthLastYearHasData = false;
  let bookingsThisMonth = 0;

  const routes30d = new Map<string, RouteAggregate>();
  const routesThisMonth = new Map<string, RouteAggregate>();

  // Sort rows so "recentBookings" is deterministic.
  const sortedByRecency = [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const row of rows) {
    const total = toNumber(row.total_usd);
    const createdAt = new Date(row.created_at);
    if (Number.isNaN(createdAt.getTime())) continue;

    const dayKey = crDateKey(createdAt);
    const monthKey = crMonthKey(createdAt);
    const yearKey = crYearKey(createdAt);

    // Card totals.
    if (dayKey === todayKey) revToday += total;
    if (createdAt >= thisWeekStart && createdAt < nextWeekStart) revThisWeek += total;
    if (createdAt >= lastWeekStart && createdAt < thisWeekStart) revLastWeek += total;
    if (monthKey === thisMonthKey) {
      revThisMonth += total;
      bookingsThisMonth += 1;
    }
    if (monthKey === lastMonthKey) revLastMonth += total;
    if (monthKey === sameMonthLastYearKey) {
      revSameMonthLastYear += total;
      sameMonthLastYearHasData = true;
    }
    if (yearKey === thisYearKey) revThisYear += total;

    // Charts.
    const dailyPoint = dailyByKey.get(dayKey);
    if (dailyPoint) {
      dailyPoint.revenue += total;
      dailyPoint.bookings += 1;
    }
    const monthlyPoint = monthlyByKey.get(monthKey);
    if (monthlyPoint) {
      monthlyPoint.revenue += total;
      monthlyPoint.bookings += 1;
    }

    // Route aggregation: split total_usd proportionally by each trip's
    // totalPrice. If per-trip prices all sum to 0 (edge case: manual
    // quote with $0 individual lines but a non-zero override), fall back
    // to even split so the trip still shows up in the counts.
    const items = row.items || [];
    if (items.length > 0) {
      const perTripPrices = items.map((it) => toNumber(it.totalPrice));
      const priceSum = perTripPrices.reduce((s, p) => s + p, 0);
      const evenShare = total / items.length;

      const isRecent30d = createdAt.getTime() >= dailyCutoffInstant.getTime();
      const isThisMonth = monthKey === thisMonthKey;

      items.forEach((it, idx) => {
        const share = priceSum > 0 ? (perTripPrices[idx] / priceSum) * total : evenShare;
        const from = safeRouteName(it.fromName);
        const to = safeRouteName(it.toName);
        const routeKey = `${from} → ${to}`;

        if (isRecent30d) {
          const agg = routes30d.get(routeKey) || {
            route: routeKey,
            fromName: from,
            toName: to,
            trips: 0,
            revenue: 0,
          };
          agg.trips += 1;
          agg.revenue += share;
          routes30d.set(routeKey, agg);
        }
        if (isThisMonth) {
          const agg = routesThisMonth.get(routeKey) || {
            route: routeKey,
            fromName: from,
            toName: to,
            trips: 0,
            revenue: 0,
          };
          agg.trips += 1;
          agg.revenue += share;
          routesThisMonth.set(routeKey, agg);
        }
      });
    }
  }

  const topRoutes30d = [...routes30d.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const topRoutesThisMonth = [...routesThisMonth.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const recentBookings: RecentBooking[] = sortedByRecency.slice(0, 10).map((r) => {
    const items = r.items || [];
    const first = items[0];
    const route = first
      ? items.length > 1
        ? `${safeRouteName(first.fromName)} → ${safeRouteName(first.toName)} (+${items.length - 1})`
        : `${safeRouteName(first.fromName)} → ${safeRouteName(first.toName)}`
      : "—";
    return {
      order_number: r.order_number,
      customer_name: r.customer_name || "—",
      route,
      created_at: r.created_at,
      total_usd: toNumber(r.total_usd),
      status: r.status || "approved",
    };
  });

  return {
    now: now.toISOString(),
    revenue: {
      today: revToday,
      thisWeek: revThisWeek,
      thisMonth: revThisMonth,
      thisYear: revThisYear,
      lastWeek: revLastWeek,
      lastMonth: revLastMonth,
      sameMonthLastYear: sameMonthLastYearHasData ? revSameMonthLastYear : null,
    },
    bookingsThisMonth,
    avgTicketThisMonth: bookingsThisMonth > 0 ? revThisMonth / bookingsThisMonth : 0,
    deltas: {
      weekOverWeek: {
        pct: pct(revThisWeek, revLastWeek),
        current: revThisWeek,
        baseline: revLastWeek,
      },
      monthOverMonth: {
        pct: pct(revThisMonth, revLastMonth),
        current: revThisMonth,
        baseline: revLastMonth,
      },
      yearOverYear: {
        pct: sameMonthLastYearHasData ? pct(revThisMonth, revSameMonthLastYear) : null,
        current: revThisMonth,
        baseline: revSameMonthLastYear,
      },
    },
    daily,
    monthly,
    topRoutes30d,
    topRoutesThisMonth,
    recentBookings,
  };
}
