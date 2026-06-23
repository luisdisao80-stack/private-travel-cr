import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BookWizardClient from "@/components/book/BookWizardClient";
import { getAllLocations, getRouteByLocations } from "@/lib/routes-db";
import { getAllHotels } from "@/lib/hotels-db";

export const metadata = {
  title: "Book Private Shuttle Costa Rica — Instant Quote from $135",
  description:
    "Book your private shuttle in Costa Rica in under 5 minutes. Door-to-door SJO/LIR transfers from $135, free child seats, instant confirmation. ⭐ 5.0 · 200+ Google reviews.",
};

export const revalidate = 86400;

type SearchParams = Promise<{ from?: string; to?: string; direct?: string }>;

export default async function BookPage({ searchParams }: { searchParams: SearchParams }) {
  const { from, to, direct } = await searchParams;

  // Smart redirect: if the user came here with a from/to pair that has a
  // dedicated route landing page in the DB, send them there first (richer
  // content, better SEO surface) — but only when they didn't explicitly
  // come from a "Book Now" CTA, which sets ?direct=1 to skip this.
  if (from && to && direct !== "1") {
    const route = await getRouteByLocations(from, to);
    if (route?.slug) {
      redirect(`/routes/${route.slug}`);
    }
  }

  const [locations, hotels] = await Promise.all([
    getAllLocations(),
    getAllHotels(),
  ]);
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Suspense fallback={null}>
        <BookWizardClient locations={locations} hotels={hotels} />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
