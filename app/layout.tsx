import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { CartProvider } from "@/lib/CartContext";
import Cart from "@/components/Cart";
import { Analytics } from "@vercel/analytics/react";
import ConsentGatedAnalytics from "@/components/ConsentGatedAnalytics";
import CookieBanner from "@/components/CookieBanner";
import { siteConfig } from "@/lib/site-config";
import SchemaOrg from "@/components/SchemaOrg";
import AttributionCapture from "@/components/AttributionCapture";

// LCP perf: ship only one webfont (Inter). Geist Sans was unused; Geist
// Mono was only referenced by `font-mono` on the booking success/error
// pages — those fall back to the system mono stack (Menlo, Consolas,
// monospace) defined in globals.css, which is fine for an order number.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Costa Rica Private Shuttles from $135 — Door-to-Door | 2026",
    template: "%s | Private Travel CR",
  },
  description: siteConfig.descriptionEN,
  // meta-keywords removed — Google has ignored this since 2009 and other
  // engines do too. Keywords belong in real visible copy and structured data.
  authors: [{ name: siteConfig.business.founder }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      // es-CR intentionally omitted — the site has no real /es/* URLs yet,
      // only a client-side LanguageProvider toggle. Declaring hreflang="es-CR"
      // pointing at the same English URL is inconsistent and Google may
      // downgrade or ignore both hreflang entries. Restore this entry once
      // localized Spanish routes exist.
      "en-US": "/",
    },
  },
  openGraph: {
    title: "Costa Rica Private Shuttles from $135 — Door-to-Door | 2026",
    description: siteConfig.descriptionEN,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR - Premium shuttle service in Costa Rica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Costa Rica Private Shuttles from $135 — Door-to-Door | 2026",
    description: siteConfig.descriptionEN,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable
      )}
    >
      <head>
        {/* LCP perf: warm up TCP + TLS to the two image CDNs before the
            first <img> hits them. images.unsplash.com serves blog hero art;
            privatecr2.imgix.net serves the vehicle + destination photos.
            Without these hints the browser pays a full handshake round-trip
            on the first image request — a measurable LCP hit on cold visits,
            especially on mobile. The dns-prefetch lines are a fallback for
            older browsers that don't honor preconnect. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://privatecr2.imgix.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://privatecr2.imgix.net" />
      </head>
      <body className="min-h-full flex flex-col">
        <SchemaOrg />
        <AttributionCapture />
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <Cart />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
        <Analytics />
        <CookieBanner />
        <ConsentGatedAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          clarityId={process.env.NEXT_PUBLIC_CLARITY_ID}
        />
      </body>
    </html>
  );
}
