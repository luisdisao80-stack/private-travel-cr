import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Private Travel Costa Rica collects, uses, and protects your personal information. Data collected, purpose, security measures, and card-data handling.",
  keywords: [
    "privacy policy",
    "Private Travel CR privacy",
    "data protection shuttle Costa Rica",
    "politica de privacidad Costa Rica",
    "proteccion de datos transporte privado",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Private Travel CR",
    description:
      "How we collect, use, and protect your personal information at Private Travel CR.",
    url: `${siteConfig.siteUrl}/privacy`,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Private Travel CR",
    description: "How we handle your data.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
