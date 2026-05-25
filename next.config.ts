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
    ];
  },

  images: {
    // Next 15+ restricts the `quality` prop on next/image to values listed
    // here. Default is [75] only, so anything tighter (60 for the hero,
    // 65 for the book wizard banner) is silently ignored without this.
    qualities: [60, 65, 75, 90],
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