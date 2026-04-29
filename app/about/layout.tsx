import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us | Costa Rica's Trusted Private Shuttle",
  description:
    "Learn the story behind Private Travel CR. Founded in 2021 by Diego Salas Oviedo and Anthony in La Fortuna, Costa Rica. Family-run premium shuttle service with 5.0 ratings and TripAdvisor Travelers' Choice 2025.",
  keywords: [
    "about Private Travel CR",
    "Diego Salas Oviedo",
    "private shuttle company Costa Rica",
    "La Fortuna transportation",
    "family run shuttle Costa Rica",
    "trusted shuttle Costa Rica",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Private Travel CR | Costa Rica's Trusted Shuttle",
    description:
      "The story behind Private Travel CR. Family-run premium shuttle service in La Fortuna, Costa Rica since 2021. ⭐ 5.0 · TripAdvisor Travelers' Choice 2025.",
    url: `${siteConfig.siteUrl}/about`,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "About Private Travel CR - Family-run premium shuttle service in Costa Rica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Private Travel CR",
    description:
      "Family-run premium shuttle service in La Fortuna, Costa Rica. ⭐ 5.0 · TripAdvisor Travelers' Choice 2025.",
    images: [siteConfig.ogImage],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
