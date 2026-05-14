import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us | Private Travel Costa Rica",
  description:
    "Get a quote for your private shuttle in Costa Rica. Contact us via WhatsApp or email — bilingual drivers, door-to-door, available 24/7.",
  keywords: [
    "contact Private Travel CR",
    "Costa Rica shuttle quote",
    "WhatsApp shuttle Costa Rica",
    "private shuttle contact",
    "book Costa Rica transportation",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Private Travel CR | Costa Rica Private Shuttle",
    description:
      "Get a quote for your private shuttle in Costa Rica. Bilingual drivers, door-to-door, available 24/7.",
    url: `${siteConfig.siteUrl}/contact`,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: "es_CR",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Contact Private Travel CR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Private Travel CR",
    description:
      "Quote your private shuttle in Costa Rica. WhatsApp · Email · 24/7.",
    images: [siteConfig.ogImage],
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24">
        <ContactForm />
      </div>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
