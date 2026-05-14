import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BookWizardClient from "@/components/book/BookWizardClient";
import { getAllLocations, getRouteByLocations } from "@/lib/routes-db";

export const metadata = {
  title: "Book Your Private Shuttle | Private Travel Costa Rica",
  description:
    "Get an instant quote and book your private shuttle in Costa Rica. Live pricing, child seats, and door-to-door service from SJO and LIR airports.",
};

export const revalidate = 3600;

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

  const locations = await getAllLocations();
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Suspense fallback={null}>
        <BookWizardClient locations={locations} />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
