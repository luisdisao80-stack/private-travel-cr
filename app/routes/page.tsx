import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import RoutesPageClient from "@/components/RoutesPageClient";
import { getAllRoutes } from "@/lib/routes-db";

export const metadata: Metadata = {
  title: "Private Shuttle Routes in Costa Rica | Private Travel CR",
  description:
    "Browse our 1,200+ private shuttle routes across Costa Rica. From La Fortuna to Tamarindo, Manuel Antonio to Monteverde — door-to-door service with bilingual drivers.",
  keywords: [
    "Costa Rica shuttle routes",
    "private transportation Costa Rica",
    "La Fortuna shuttle",
    "Tamarindo transportation",
    "Manuel Antonio shuttle",
    "Monteverde shuttle",
    "SJO airport transfer",
    "LIR airport transfer",
  ],
  openGraph: {
    title: "Private Shuttle Routes Across Costa Rica",
    description:
      "1,200+ door-to-door private shuttle routes. Browse, get instant quotes, and book your ride.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function RoutesPage() {
  const routes = await getAllRoutes();
  return (
    <>
      <Navbar />
      <RoutesPageClient routes={routes} />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
