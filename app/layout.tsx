import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/CartContext";
import Cart from "@/components/Cart";
import { Analytics } from "@vercel/analytics/react";
import ConsentGatedAnalytics from "@/components/ConsentGatedAnalytics";
import CookieBanner from "@/components/CookieBanner";
import { siteConfig } from "@/lib/site-config";
import SchemaOrg from "@/components/SchemaOrg";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Private Shuttle Costa Rica | Premium Door-to-Door Service ⭐ 5.0",
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
      "en-US": "/",
      "es-CR": "/",
    },
  },
  openGraph: {
    title: "Private Shuttle Costa Rica | Premium Door-to-Door Service",
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
    title: "Private Shuttle Costa Rica | Premium Door-to-Door Service",
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
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <SchemaOrg />
        <LanguageProvider>
          <CartProvider>
            {children}
            <Cart />
          </CartProvider>
        </LanguageProvider>
        <Analytics />
        <CookieBanner />
        <ConsentGatedAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        />
      </body>
    </html>
  );
}
