import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/CartContext";
import Cart from "@/components/Cart";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Private Travel CR | Premium Private Shuttle Costa Rica",
    template: "%s | Private Travel CR",
  },
  description: siteConfig.descriptionEN,
  keywords: [
    // English
    "private shuttle Costa Rica",
    "Costa Rica airport transfer",
    "SJO airport shuttle",
    "LIR airport shuttle",
    "La Fortuna shuttle",
    "Manuel Antonio shuttle",
    "Monteverde shuttle",
    "private transportation Costa Rica",
    "Costa Rica private transfer",
    "premium shuttle Costa Rica",
    // Spanish
    "shuttle privado Costa Rica",
    "transporte privado Costa Rica",
    "traslado aeropuerto SJO",
    "traslado aeropuerto LIR",
    "shuttle La Fortuna",
    "shuttle Manuel Antonio",
    "shuttle Monteverde",
    "transporte premium Costa Rica",
    // Brand
    "Private Travel CR",
    "privatetravelcr",
  ],
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
    title: "Private Travel CR | Premium Private Shuttle Costa Rica",
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
    title: "Private Travel CR | Premium Private Shuttle Costa Rica",
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
        <LanguageProvider>
          <CartProvider>
            {children}
            <Cart />
          </CartProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
