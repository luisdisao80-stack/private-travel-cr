import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getAllTours } from "@/lib/tours-db";
import { siteConfig } from "@/lib/site-config";
import { Clock, Users, MapPin } from "lucide-react";
import Price from "@/components/Price";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "The 10 Best Tours in La Fortuna, Costa Rica (2026) | Private Travel CR",
  description:
    "The 10 best tours in La Fortuna for 2026 — Arenal Volcano hike, La Fortuna Waterfall, Mistico Hanging Bridges, Río Celeste, Caño Negro wildlife, and Sarapiquí rafting. From $77/adult. Free hotel pickup. Bilingual guides. Taxes included.",
  alternates: { canonical: "/tours" },
  openGraph: {
    title: "La Fortuna Tours | Private Travel CR",
    description:
      "All the must-do La Fortuna tours in one place. Arenal Volcano, hanging bridges, Río Celeste waterfall, wildlife floats. Door-to-door, bilingual guides, taxes included.",
    url: `${siteConfig.siteUrl}/tours`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  combo: "Full-day Combos",
  caminata: "Hikes & Trails",
  rio: "Rivers & Adventure",
  wildlife: "Wildlife & Nature",
  nocturno: "Night Tours",
  kayak: "Kayak & Water",
};

export default async function ToursPage() {
  const tours = await getAllTours();

  // Group by category for the listing
  const byCategory = tours.reduce<Record<string, typeof tours>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  const categoryOrder: string[] = [
    "combo",
    "caminata",
    "wildlife",
    "rio",
    "nocturno",
    "kayak",
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="pt-32 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
              <MapPin size={14} className="text-orange-600" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                La Fortuna · Arenal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4 tracking-tight">
              The 10 best tours in <span className="text-orange-600">La Fortuna</span>, Costa Rica (2026)
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Volcano hikes, hanging bridges, waterfall swims, wildlife floats, and
              the legendary Río Celeste — all bookable online in 2 minutes. From
              $77/adult. Free hotel pickup, bilingual guides, taxes included.
            </p>
            <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto">
              Listed prices are for shared small-group departures. Want it
              private for your group?{" "}
              <a
                href="https://wa.me/50688271225"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
              >
                Message us on WhatsApp
              </a>{" "}
              for a custom quote.
            </p>
          </div>
        </section>

        {/* Tours by category */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {categoryOrder.map((cat) => {
              const items = byCategory[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 pb-3 border-b border-slate-200">
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto rounded-2xl bg-orange-50 border border-slate-200 p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
              Need a shuttle too?
            </h3>
            <p className="text-slate-500 mb-5">
              We pick you up from any airport, hotel, or beach town in Costa Rica.
              Book a shuttle + tour together and save time on coordination.
            </p>
            <Link
              href="/routes"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              See Shuttle Routes
            </Link>
          </div>
        </section>
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}

function TourCard({ tour }: { tour: Awaited<ReturnType<typeof getAllTours>>[number] }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group rounded-2xl bg-white/40 border border-slate-200 hover:border-orange-300 overflow-hidden transition-all hover:-translate-y-1"
    >
      <div className="relative w-full h-48 bg-gradient-to-br from-amber-900 to-amber-600 overflow-hidden">
        {tour.hero_image ? (
          <Image
            src={tour.hero_image}
            alt={tour.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
        {tour.is_featured ? (
          <span className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider">
            Most popular
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-blue-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
          {tour.name}
        </h3>
        {tour.short_description ? (
          <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">
            {tour.short_description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-4">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-orange-600" />
            {tour.duration_label}
          </span>
          {tour.min_age ? (
            <span className="inline-flex items-center gap-1">
              <Users size={12} className="text-orange-600" />
              {tour.min_age}+ yrs
            </span>
          ) : null}
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-slate-200">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              From
            </div>
            <div className="text-2xl font-bold text-orange-600 leading-tight">
              <Price usd={Math.floor(Number(tour.adult_price))} />
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">Taxes included</div>
          </div>
          <span className="text-orange-600 text-sm font-semibold">View →</span>
        </div>
      </div>
    </Link>
  );
}
