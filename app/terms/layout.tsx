import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions for Private Travel CR shuttle service in Costa Rica. Booking, cancellation, payment, liability and refund policies for our private transportation service.",
  keywords: [
    "terms and conditions",
    "Private Travel CR terms",
    "shuttle booking terms",
    "cancellation policy Costa Rica shuttle",
    "private shuttle terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms and Conditions | Private Travel CR",
    description:
      "Booking, cancellation, payment and liability policies for Private Travel CR shuttle service in Costa Rica.",
    url: `${siteConfig.siteUrl}/terms`,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR Terms and Conditions",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
