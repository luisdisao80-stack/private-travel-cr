import { NextResponse, type NextRequest } from "next/server";
import {
  LEGACY_BLOG_REDIRECTS,
  resolveLegacyRoute,
} from "@/lib/legacy-redirects";

// Two responsibilities:
//   1. Block scraper bots that hammer the site without driving bookings
//      (Ahrefs/Semrush/MJ12/etc.). At Vercel scale these are the bulk
//      of the "Singapore datacenter" traffic eating our ISR/CPU budget.
//   2. Redirect legacy URL shapes from the previous privatetravelcr.com
//      site to the equivalents on this Next.js app.
//
// We do both in middleware (not next.config.ts) because the legacy slug
// rewrite is non-trivial — we translate two URL segments through a lookup
// table and pick between two new URL prefixes depending on whether the
// pair is "popular". Bot blocking has to be in middleware so we cancel
// the request before any ISR cache lookup / page render happens.
//
// Matcher: every path EXCEPT API routes and Next.js / static assets.
// Allowing the legacy routes specifically would mean bot blocking only
// covers a tiny slice; we want it global. The exclusion keeps middleware
// off hot static paths so per-request overhead stays sub-millisecond.

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|llms-full.txt|.*\\..*).*)",
  ],
};

// Scraper/SEO-tool bots we explicitly do NOT want indexing the site.
// They drive zero conversions, cost real CPU + bandwidth, and inflate
// our analytics with "visits" that aren't humans. We DO welcome search
// engines (Google/Bing/DDG) and the AI assistants we opted into in
// robots.ts — those aren't in this list.
const BLOCKED_BOT_RE =
  /(AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|PetalBot|AspiegelBot|SeznamBot|coccocbot|magpie-crawler|YandexBot|Bytespider|ZoominfoBot|serpstatbot|barkrowler|MegaIndex|spbot|linkfluence|TurnitinBot|MauiBot|AwarioBot|Linguee)/i;

const FALLBACK_URL = "/routes";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Bot block (cheap UA regex, runs first so blocked requests
  // never reach the ISR cache or hit Supabase). 403 + no body so the
  // bot stops retrying.
  const ua = req.headers.get("user-agent") || "";
  if (BLOCKED_BOT_RE.test(ua)) {
    return new NextResponse(null, { status: 403 });
  }

  // /costa-rica/transportation/<from>/<to>  → /routes/<slug> or /private-shuttle/<slug>
  const fromTo = pathname.match(
    /^\/costa-rica\/transportation\/([^/]+)\/([^/]+)\/?$/
  );
  if (fromTo) {
    const resolved = resolveLegacyRoute(fromTo[1], fromTo[2]);
    const target = resolved?.url ?? FALLBACK_URL;
    return NextResponse.redirect(new URL(target, req.url), 301);
  }

  // /costa-rica/transportation/<from>/ → /routes (origin listing)
  // /costa-rica/transportation/ → /routes
  if (pathname.startsWith("/costa-rica/transportation/") || pathname === "/costa-rica/transportation") {
    return NextResponse.redirect(new URL(FALLBACK_URL, req.url), 301);
  }

  // /book-now.php?id=X → /book (legacy booking system)
  if (pathname === "/book-now.php") {
    return NextResponse.redirect(new URL("/book", req.url), 301);
  }

  // /blog/post/<slug> → mapped post or /blog
  const blogMatch = pathname.match(/^\/blog\/post\/([^/]+)\/?$/);
  if (blogMatch) {
    const target = LEGACY_BLOG_REDIRECTS[blogMatch[1]] ?? "/blog";
    return NextResponse.redirect(new URL(target, req.url), 301);
  }

  return NextResponse.next();
}
