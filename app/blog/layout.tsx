import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Travel Blog | Costa Rica Tips from Local Drivers",
  description:
    "Travel tips, route guides and local insights for Costa Rica from Private Travel CR — the team driving travelers across the country every day.",
  keywords: [
    "Costa Rica travel blog",
    "Costa Rica travel tips",
    "things to do Costa Rica",
    "La Fortuna travel guide",
    "Manuel Antonio guide",
    "Monteverde tips",
    "Costa Rica local recommendations",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Travel Blog | Costa Rica Tips from Local Drivers",
    description:
      "Travel tips, route guides and local insights for Costa Rica from Private Travel CR.",
    url: `${siteConfig.siteUrl}/blog`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR — Costa Rica Travel Blog",
      },
    ],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
