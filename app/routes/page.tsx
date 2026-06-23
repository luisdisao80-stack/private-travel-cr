import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import FAQSection from "@/components/FAQSection";
import RoutesPageClient from "@/components/RoutesPageClient";
import { getAllRoutes } from "@/lib/routes-db";
import { getAllHotels } from "@/lib/hotels-db";

export const metadata: Metadata = {
  // GSC June 2026: this page was ranking for "costa rica private transportation",
  // "private transfers costa rica", "costa rica private transfers" with high
  // impressions but 1-4% CTR. New copy front-loads price + rating + the exact
  // SERP query phrasing to lift CTR closer to the 3-5% industry baseline.
  title: "Costa Rica Private Transfers — 1,200+ Routes from $135",
  description:
    "All private transportation routes in Costa Rica. From $135 — SJO/LIR airport transfers to La Fortuna, Tamarindo, Manuel Antonio, Monteverde. Door-to-door, free child seats, ⭐ 5.0 · 200+ Google reviews.",
  keywords: [
    "Costa Rica private transportation",
    "Costa Rica private transfers",
    "private transfers Costa Rica",
    "Costa Rica shuttle routes",
    "La Fortuna shuttle",
    "Tamarindo transportation",
    "Manuel Antonio shuttle",
    "Monteverde shuttle",
    "SJO airport transfer",
    "LIR airport transfer",
  ],
  openGraph: {
    title: "Costa Rica Private Transfers — 1,200+ Routes from $135",
    description:
      "Door-to-door private transportation across Costa Rica. Instant quote, fixed 2026 prices, free child seats.",
    type: "website",
  },
};

export const revalidate = 86400;

export default async function RoutesPage() {
  const [routes, hotels] = await Promise.all([getAllRoutes(), getAllHotels()]);
  return (
    <>
      <Navbar />
      <RoutesPageClient routes={routes} hotels={hotels} />
      <FAQSection />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
