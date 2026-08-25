import Link from "next/link";
import type { Route } from "@/lib/types";
import { routeHref } from "@/lib/popular-routes";
import { DESTINATIONS } from "@/lib/destinations";
import { displayLocation } from "@/lib/locations";

// Server-rendered index of every indexable route.
//
// Why this exists: /routes used to render its route list only from
// RoutesPageClient, whose `filteredRoutes` returns [] until the visitor
// types into the search box. That is correct for humans and invisible to
// crawlers — Googlebot doesn't type. The result was that the hub page for
// 590 indexable route pages shipped 3.4 MB of HTML containing 44 links,
// none of which pointed at a route.
//
// With no internal links, those pages only had the sitemap to vouch for
// them, and they ranked accordingly: the top-selling route by revenue
// (SJO → La Fortuna) sat at position 22, and La Fortuna → SJO at 43.
//
// This component is deliberately NOT a client component and must stay
// that way — the entire point is that the anchors exist in the server
// HTML. Keep it out of any `use client` boundary.

// Ordered by real revenue, from the bookings table (approved only,
// 2026-05-12 → 2026-08-25). Sales made through payment links live on a
// separate platform and are not represented here, so treat this as the
// web-booking ranking rather than the whole business. Re-check it before
// assuming it still holds; it drives which routes get the most prominent
// internal links on the site.
const TOP_SELLING_SLUGS: readonly string[] = [
  "sjo-to-la-fortuna",
  "la-fortuna-to-manuel-antonio",
  "la-fortuna-to-sjo",
  "manuel-antonio-quepos-to-sjo-juan-santamaria-int-airport",
  "lir-to-la-fortuna",
  "la-fortuna-to-papagayo",
  "sjo-to-puerto-viejo",
  "la-fortuna-to-tamarindo",
  "papagayo-peninsula-guanacaste-to-lir-liberia-int-airport",
  "tamarindo-to-lir-liberia-int-airport",
  "sjo-to-manuel-antonio",
  "lir-liberia-int-airport-to-tamarindo",
];

// Origins that carry the most bookings lead the list; everything else
// follows alphabetically. Names must match routes.origen exactly.
const ORIGIN_ORDER: readonly string[] = [
  "SJO - Juan Santamaria Int. Airport",
  "LIR - Liberia Int. Airport",
  "La Fortuna (Arenal)",
  "Manuel Antonio / Quepos",
  "San Jose Downtown",
  "Tamarindo (Guanacaste)",
  "Monteverde (Cloud Forest)",
  "Papagayo Peninsula, Guanacaste",
];

function priceLabel(route: Route): string | null {
  return route.precio1a6 ? `$${route.precio1a6}` : null;
}

// A route plus its resolved href. `routes.slug` is nullable, so rows without
// one are dropped here rather than rendered as links to "/routes/null".
type LinkedRoute = Route & { href: string };

function withHref(routes: Route[]): LinkedRoute[] {
  const out: LinkedRoute[] = [];
  for (const r of routes) {
    const href = routeHref(r);
    if (href) out.push({ ...r, href });
  }
  return out;
}

export default function RouteIndex({ routes }: { routes: Route[] }) {
  const linked = withHref(routes);

  const bySlug = new Map(linked.map((r) => [r.slug, r]));
  const topSelling = TOP_SELLING_SLUGS.map((s) => bySlug.get(s)).filter(
    (r): r is LinkedRoute => Boolean(r)
  );

  const grouped = new Map<string, LinkedRoute[]>();
  for (const r of linked) {
    const list = grouped.get(r.origen);
    if (list) list.push(r);
    else grouped.set(r.origen, [r]);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => displayLocation(a.destino).localeCompare(displayLocation(b.destino)));
  }

  const origins = [...grouped.keys()].sort((a, b) => {
    const ia = ORIGIN_ORDER.indexOf(a);
    const ib = ORIGIN_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
    }
    return displayLocation(a).localeCompare(displayLocation(b));
  });

  return (
    <section
      id="all-routes"
      className="bg-gray-950 border-t border-white/10 py-16 px-4"
      aria-labelledby="all-routes-heading"
    >
      <div className="max-w-5xl mx-auto">
        <h2 id="all-routes-heading" className="text-3xl md:text-4xl font-bold text-white">
          All Costa Rica shuttle routes
        </h2>
        <p className="mt-3 text-white/60 max-w-2xl">
          Every route we publish, grouped by pickup point. Prices are per vehicle
          for 1–5 passengers and include taxes and tolls.
        </p>

        {topSelling.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
              Most booked
            </h3>
            <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topSelling.map((route) => (
                <li key={route.slug}>
                  <Link
                    href={route.href}
                    className="flex items-baseline justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 hover:border-amber-400/50 hover:text-white transition-colors"
                  >
                    <span>
                      {displayLocation(route.origen)} → {displayLocation(route.destino)}
                    </span>
                    {priceLabel(route) && (
                      <span className="shrink-0 font-semibold text-amber-400">
                        {priceLabel(route)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The /shuttle-to/[slug] hubs are built as internal-linking hubs —
            each one aggregates every route into a destination — and sit in
            the sitemap at priority 0.9. Nothing on the site linked to them,
            so they were orphaned exactly like the route pages they exist to
            support. This block is the missing first hop:
            /routes → destination hub → route page. */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
            By destination
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {DESTINATIONS.map((dest) => (
              <li key={dest.slug}>
                <Link
                  href={`/shuttle-to/${dest.slug}`}
                  className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-amber-400/50 hover:text-white transition-colors"
                >
                  Shuttle to {dest.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 space-y-3">
          {origins.map((origin) => {
            const list = grouped.get(origin)!;
            return (
              // <details> keeps the page scannable while leaving every anchor
              // in the server HTML — collapsed content is still crawled.
              <details
                key={origin}
                className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                {/* list-none + the webkit marker rule hide the native
                    disclosure triangle so only our "+" shows — same pattern
                    as components/DestinationHub.tsx. */}
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-white font-semibold hover:bg-white/5 transition-colors group-open:text-amber-400 [&::-webkit-details-marker]:hidden">
                  <span>From {displayLocation(origin)}</span>
                  <span className="shrink-0 text-sm font-normal text-white/50">
                    {list.length} {list.length === 1 ? "route" : "routes"}
                    <span className="ml-2 text-amber-400 group-open:rotate-45 inline-block transition-transform">
                      +
                    </span>
                  </span>
                </summary>
                <ul className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                  {list.map((route) => (
                    <li key={route.slug}>
                      <Link
                        href={route.href}
                        className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-white/70 hover:text-amber-400 transition-colors"
                      >
                        <span className="truncate">to {displayLocation(route.destino)}</span>
                        {priceLabel(route) && (
                          <span className="shrink-0 text-white/40">{priceLabel(route)}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
