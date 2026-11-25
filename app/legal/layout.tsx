import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions and Privacy Policy",
  description:
    "Private Travel CR's Terms & Conditions and Privacy Policy in a single document: booking, cancellation and refund policies, the data we collect and how we protect it.",
  keywords: [
    "terms and conditions",
    "privacy policy",
    "cancellation policy Costa Rica shuttle",
    "refund policy",
    "terminos y condiciones",
    "politica de privacidad",
  ],
  alternates: {
    canonical: "/legal",
  },
  openGraph: {
    title: "Terms & Conditions and Privacy Policy | Private Travel CR",
    description:
      "Booking, cancellation and refund policies, and how we handle your data.",
    url: `${siteConfig.siteUrl}/legal`,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR legal information",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
