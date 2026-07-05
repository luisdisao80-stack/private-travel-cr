import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 301 redirects for legacy paths from the previous site that Google
  // still has links to. Search Console "Not found (404)" report flagged
  // `/home` (May 15, 2026) — the old site used `/home` as the homepage
  // while this Next.js app uses `/`. Catching a few other common
  // pre-migration URLs preemptively while we're at it so Google's
  // crawler stops wasting budget on 404s.
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/home.html", destination: "/", permanent: true },
      { source: "/inicio", destination: "/", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/shuttles", destination: "/routes", permanent: true },
      { source: "/shuttle-service", destination: "/routes", permanent: true },
      { source: "/our-fleet", destination: "/fleet", permanent: true },
      // GSC 2026-07-05 Not-found (404) report — two URLs Google
      // still crawls from somewhere but that returned 404. /booking
      // was the pre-migration checkout entrypoint (this app uses
      // /book instead); /adult is a scraper/garbage query that we
      // send to the home page so the URL stops surfacing in the
      // GSC 404 list. Same permanent 301 as the rest so any inbound
      // link equity is preserved.
      { source: "/booking", destination: "/book", permanent: true },
      { source: "/adult", destination: "/", permanent: true },

      // ---- Legacy blog URLs (the old site used /blog/post/<slug>) ----
      // Search Console (2026-06-05) showed several of these still
      // indexed with hundreds of impressions. Without these specific
      // redirects, Next's default behaviour sent them all to /blog
      // (the listing), which is a poor UX and tanks the SEO equity
      // we'd otherwise inherit from the old URLs. Map each one to
      // its modern counterpart so the link juice transfers.
      {
        source: "/blog/post/best-restaurants-in-la-fortuna",
        destination: "/blog/best-restaurants-la-fortuna",
        permanent: true,
      },
      {
        source: "/blog/post/la-fortuna-travel-guide",
        destination: "/blog/la-fortuna-travel-guide",
        permanent: true,
      },
      {
        source: "/blog/post/monteverde-travel-guide",
        destination: "/blog/monteverde-travel-guide",
        permanent: true,
      },
      {
        source: "/blog/post/top-10-things-la-fortuna",
        destination: "/blog/top-10-things-la-fortuna",
        permanent: true,
      },
      {
        source: "/blog/post/best-time-to-visit-costa-rica",
        destination: "/blog/best-time-to-visit-costa-rica",
        permanent: true,
      },
      {
        source: "/blog/post/manuel-antonio-travel-guide",
        destination: "/blog/manuel-antonio-travel-guide",
        permanent: true,
      },
      {
        source: "/blog/post/tamarindo-travel-guide",
        destination: "/blog/tamarindo-travel-guide",
        permanent: true,
      },
      {
        source:
          "/blog/post/5-best-activities-in-costa-rica-with-private-transportation-services",
        destination: "/blog/costa-rica-7-day-itinerary",
        permanent: true,
      },
      // Catch-all for any other unknown /blog/post/<x> URLs Google
      // might still have. Falls back to the listing rather than 404
      // so crawlers don't see error spikes while we discover them.
      {
        source: "/blog/post/:slug*",
        destination: "/blog",
        permanent: true,
      },
    ];
  },

  images: {
    // Prefer AVIF over WebP. AVIF is ~30-50% smaller than WebP at the
    // same visual quality and is supported by all modern browsers
    // Lighthouse runs against. Big win for mobile LCP (the hero JPG
    // went from ~95 KB WebP to ~30-40 KB AVIF at q=60).
    formats: ["image/avif", "image/webp"],

    // Next 15+ restricts the `quality` prop on next/image to values listed
    // here. Default is [75] only, so anything tighter (60 for the hero,
    // 65 for the book wizard banner) is silently ignored without this.
    qualities: [40, 50, 60, 65, 75, 90],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "privatecr2.imgix.net",
      },
    ],
  },
};

export default nextConfig;