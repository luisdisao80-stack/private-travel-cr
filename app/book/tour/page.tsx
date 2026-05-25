import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TourCheckoutClient from "@/components/book/TourCheckoutClient";
import { getTourBySlug, quoteTour } from "@/lib/tours-db";

export const metadata = {
  title: "Complete Your Tour Booking",
  description:
    "Secure your spot for your La Fortuna tour. Pay online with Tilopay — taxes included, free cancellation 24h before.",
  robots: { index: false, follow: false }, // checkout pages don't belong in search
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  tour?: string;
  date?: string;
  time?: string;
  adults?: string;
  children?: string;
}>;

export default async function BookTourPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { tour: slug, date, time, adults: adultsStr, children: childrenStr } =
    await searchParams;

  // Without a tour slug there's nothing to check out — send the visitor
  // back to the catalog instead of showing an empty checkout.
  if (!slug) {
    redirect("/tours");
  }

  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  // Re-validate adults/children against the tour's policy on the server
  // so a client-side query-string tweak can't drop the price.
  const adults = Math.max(1, Math.min(20, parseInt(adultsStr || "2", 10) || 2));
  const childrenRaw = parseInt(childrenStr || "0", 10) || 0;
  const childrenAllowed = tour.child_price != null;
  const children = childrenAllowed ? Math.max(0, Math.min(15, childrenRaw)) : 0;

  // Price the booking server-side (single source of truth). The client form
  // still does its own quote for live feedback, but only this number wins.
  const quote = quoteTour(tour, { adults, children });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <Navbar />
      <div className="pt-24">
        <TourCheckoutClient
          tour={{
            id: tour.id,
            slug: tour.slug,
            name: tour.name,
            hero_image: tour.hero_image || null,
            duration_label: tour.duration_label,
            adult_price: Number(tour.adult_price),
            child_price: tour.child_price != null ? Number(tour.child_price) : null,
          }}
          booking={{
            date: date || "",
            time: time || "",
            adults,
            children,
            adultSubtotal: quote.adultSubtotal,
            childSubtotal: quote.childSubtotal,
            total: quote.total,
          }}
        />
      </div>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
