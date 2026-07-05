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

// Search-engine + social-media crawlers that MUST be able to reach every
// URL, even from the countries we blanket-block below. Google (2026-07-03
// email in GSC) reported "Blocked due to access forbidden (403)" and
// "Redirect error" — root cause was Googlebot occasionally crawls from
// Singapore-region IPs, which our BLOCKED_COUNTRIES list was 403-ing.
// The right fix is UA-first: if the request looks like a legit crawler,
// let it through regardless of country. Bot verification via reverse
// DNS is possible but overkill for the blast radius this list has —
// even if a scraper faked one of these UAs, they still eat the same
// generic 403 the geo block would have served, no downside.
const ALLOWED_CRAWLER_RE =
  /(Googlebot|Google-InspectionTool|AdsBot-Google|APIs-Google|Google-Site-Verification|Bingbot|DuckDuckBot|Slurp|Applebot|Baiduspider|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterestbot|redditbot|GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Google-Extended)/i;

// Geo block. After the UA-based bot block was deployed (2026-06-14)
// Singapore traffic *still* sat at ~48% of total visitors per Vercel
// Analytics. None of Diego's 21 real bookings to date came from
// Singapore — they're stealth scraper bots running out of AWS / GCP
// SG datacenters, masquerading as Chrome / Safari user-agents we
// can't pattern-match.
//
// Pragmatic fix: drop them by country at the edge. ISO 3166-1 alpha-2
// codes are supplied by Vercel in the x-vercel-ip-country header on
// every prod request. List stays narrow (Singapore only for now —
// the "Opción A" conservative cut Diego approved) to minimise the
// risk of dropping the rare legit VPN user. If we see meaningful
// real-customer traffic from a blocked country later, we delist it.
const BLOCKED_COUNTRIES = new Set<string>(["SG"]);

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

  // ---- Geo block. x-vercel-ip-country is only set on production
  // Vercel deployments — dev / preview don't get it and the header is
  // null, so this branch is a no-op locally. Real users from blocked
  // countries get a 403 (we don't ship a friendlier page because the
  // ratio of real-to-bot is ~0:48 for SG; surfacing copy invites them
  // to abuse other paths). EXCEPTION: legit search engine + social
  // crawlers (Googlebot, Bingbot, ChatGPT, WhatsApp preview, etc.)
  // are allowed through regardless of country — see ALLOWED_CRAWLER_RE
  // and the GSC 403 issue that surfaced 2026-07-03.
  const country = req.headers.get("x-vercel-ip-country");
  if (
    country &&
    BLOCKED_COUNTRIES.has(country) &&
    !ALLOWED_CRAWLER_RE.test(ua)
  ) {
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
