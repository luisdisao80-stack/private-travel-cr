import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Our Fleet | Hyundai Staria & Toyota Hiace Private Shuttles",
  description:
    "Modern, comfortable vehicles for 1-9 passengers. Hyundai Staria SUV and Toyota Hiace van — both with A/C, WiFi, and professional drivers.",
  keywords: [
    "Hyundai Staria Costa Rica",
    "Toyota Hiace shuttle Costa Rica",
    "private shuttle vehicles",
    "9 passenger van Costa Rica",
    "premium shuttle fleet",
    "Costa Rica private transportation",
    "airport shuttle vehicles",
  ],
  alternates: {
    canonical: "/fleet",
  },
  openGraph: {
    title: "Our Fleet | Private Travel CR",
    description:
      "Modern Hyundai Staria SUV and Toyota Hiace van for premium shuttle transportation in Costa Rica.",
    url: `${siteConfig.siteUrl}/fleet`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR Fleet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Fleet | Private Travel CR",
    description:
      "Modern Hyundai Staria and Toyota Hiace for private shuttles in Costa Rica.",
  },
};

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
