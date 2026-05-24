import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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