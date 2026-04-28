import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/CartContext";
import Cart from "@/components/Cart";
import { Analytics } from "@vercel/analytics/react";

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
  title: "Private Travel CR | Shuttle Privado Premium en Costa Rica",
  description:
    "Transporte privado premium en Costa Rica. Cotización instantánea, chofer bilingüe, servicio puerta a puerta, flota nueva. WhatsApp: +506 8633-4133. ⭐ 5.0 en Google con 190+ reseñas.",
  keywords: [
    "shuttle costa rica",
    "transporte privado costa rica",
    "private shuttle costa rica",
    "airport transfer costa rica",
    "san jose airport shuttle",
    "la fortuna shuttle",
    "private travel cr",
  ],
  authors: [{ name: "Private Travel CR" }],
  openGraph: {
    title: "Private Travel CR | Shuttle Privado Premium en Costa Rica",
    description:
      "Transporte privado premium. Cotización instantánea, chofer bilingüe, puerta a puerta. ⭐ 5.0 Google · 190+ reseñas.",
    url: "https://private-travel-cr.vercel.app",
    siteName: "Private Travel CR",
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Travel CR | Shuttle Privado Premium Costa Rica",
    description:
      "Transporte privado premium. Cotización instantánea, WhatsApp: +506 8633-4133",
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
