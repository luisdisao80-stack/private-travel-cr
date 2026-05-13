import { NextResponse, type NextRequest } from "next/server";
import {
  LEGACY_BLOG_REDIRECTS,
  resolveLegacyRoute,
} from "@/lib/legacy-redirects";

// Catch all the legacy URL shapes the privatetravelcr.com site exposed and
// emit 301 redirects to the equivalent page on the new site. We do this in
// middleware (not next.config.ts redirects()) because the slug rewrite is
// non-trivial — we have to translate two URL segments through a lookup table
// and pick between two new URL prefixes depending on whether the pair is
// "popular". The matcher below scopes middleware to just these legacy paths
// so we don't pay the cost on every request.

export const config = {
  matcher: ["/costa-rica/transportation/:path*", "/book-now.php", "/blog/post/:slug*"],
};

const FALLBACK_URL = "/routes";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
