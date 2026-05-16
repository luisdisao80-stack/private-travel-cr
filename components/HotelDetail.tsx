import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { Hotel, Route } from "@/lib/types";
import { isPopularRoute } from "@/lib/popular-routes";
import { displayLocation } from "@/lib/locations";
import { siteConfig } from "@/lib/site-config";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";

type Props = {
  hotel: Hotel;
  routes: Route[];
  related: Hotel[];
};

// Build link to the route detail page — popular pairs live under
// /private-shuttle/, others under /routes/.
function routeHref(route: Route): string {
  return isPopularRoute(route.origen, route.destino)
    ? `/private-shuttle/${route.slug}`
    : `/routes/${route.slug}`;
}

export default function HotelDetail({ hotel, routes, related }: Props) {
  const whatsappUrl =
    "https://wa.me/50686334133?text=" +
    encodeURIComponent(
      `Hello! I'd like a private shuttle quote for ${hotel.name} in ${hotel.city}.`
    );

  // Sort routes so the most-searched destinations show first.
  const popularDestinations = new Set([
    "SJO - Juan Santamaria Int. Airport",
    "LIR - Liberia Int. Airport",
    "La Fortuna (Arenal)",
    "Manuel Antonio / Quepos",
    "Monteverde (Cloud Forest)",
    "Tamarindo (Guanacaste)",
    "Conchal (Guanacaste)",
    "Papagayo Peninsula, Guanacaste",
  ]);
  const sortedRoutes = [...routes].sort((a, b) => {
    const aPopular = popularDestinations.has(a.destino) ? 1 : 0;
    const bPopular = popularDestinations.has(b.destino) ? 1 : 0;
    if (aPopular !== bPopular) return bPopular - aPopular;
    return (a.precio1a6 ?? 0) - (b.precio1a6 ?? 0);
  });

  // Auto-generated FAQs specific to the hotel.
  const faqs = [
    {
      question: `Do you pick up at ${hotel.name}?`,
      answer: `Yes — we offer door-to-door pickup directly at the ${hotel.name} entrance. Your driver waits in the hotel lobby or at the porte-cochère with a sign showing your name. No need to walk anywhere with luggage.`,
    },
    {
      question: `How early should I book a shuttle from ${hotel.name}?`,
      answer: `We recommend booking at least 48 hours in advance to lock in your preferred time. Last-minute bookings (under 24 hours) are usually available too — just message us on WhatsApp and we'll confirm vehicle availability.`,
    },
    {
      question: `Can my shuttle from ${hotel.name} fit my whole group?`,
      answer: `Yes. Our fleet covers 1–6 passengers (Hyundai Staria), 7–9 (Toyota Hiace), 10–12 (Maxus V90), and 13–18 (coach van) — all with luggage space. Tell us your group size at booking and we assign the right vehicle.`,
    },
    {
      question: `Do you coordinate with ${hotel.name} for early/late departures?`,
      answer: `Yes. We confirm pickup with the hotel's concierge so the front desk knows your driver is coming. For very early departures (before 6 AM), the hotel can arrange a packed breakfast — we coordinate the timing.`,
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Hotels", url: "/hotels" },
          { name: hotel.name, url: `/hotels/${hotel.slug}` },
        ]}
      />
      <FAQSchema faqs={faqs} />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-amber-400">
              Home
            </Link>
            {" / "}
            <Link href="/hotels" className="hover:text-amber-400">
              Hotels
            </Link>
            {" / "}
            <span className="text-gray-300">{hotel.name}</span>
          </nav>

          {/* Hero */}
          <section className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <Building2 size={14} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-wider">
                HOTEL SHUTTLE SERVICE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Private shuttle from {hotel.name}
            </h1>
            <p className="text-gray-300 text-lg flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-amber-400" />
              {hotel.city}, Costa Rica
            </p>
            {hotel.description ? (
              <p className="text-gray-300 leading-relaxed max-w-3xl">
                {hotel.description}
              </p>
            ) : null}
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-5">
                {hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs"
                  >
                    <CheckCircle2 size={12} className="text-amber-400" />
                    {a}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          {/* Shuttle pricing grid */}
          <section className="mb-12" aria-labelledby="shuttle-grid-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Sparkles size={20} className="text-amber-400" />
              </div>
              <h2 id="shuttle-grid-heading" className="text-2xl md:text-3xl font-bold text-white">
                Shuttle options from {hotel.name}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Door-to-door private transfers from {hotel.name}. Prices in USD per
              vehicle (1–6 passengers). Larger vehicles available on request.
            </p>

            {sortedRoutes.length === 0 ? (
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                No published routes from this area yet. Message us on WhatsApp
                for a custom quote.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedRoutes.map((route) => (
                  <Link
                    key={route.id}
                    href={routeHref(route)}
                    className="group flex items-center justify-between bg-gray-900/50 border border-white/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="text-white font-semibold mb-1 truncate">
                        To {displayLocation(route.destino)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {route.duracion ? (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-amber-400/60" />
                            {route.duracion}
                          </span>
                        ) : null}
                        <span>Door-to-door</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 leading-none">
                          FROM
                        </div>
                        <div className="text-xl font-bold text-amber-400 leading-tight">
                          ${route.precio1a6}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-amber-400 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/book?from=${encodeURIComponent(hotel.area_origen)}&direct=1`}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl text-center transition"
              >
                Get instant quote
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-center transition"
              >
                WhatsApp
              </a>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12" aria-labelledby="hotel-faq-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <HelpCircle size={20} className="text-amber-400" />
              </div>
              <h2 id="hotel-faq-heading" className="text-2xl font-bold text-white">
                Frequently asked about shuttles from {hotel.name}
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  open={i === 0}
                  className="group bg-gradient-to-br from-gray-900/80 to-black border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-colors open:border-amber-500/40"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 text-white font-semibold group-open:text-amber-400 [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-amber-400 transition-transform duration-300 group-open:rotate-45 text-xl leading-none"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Related hotels */}
          {related.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                Other hotels in {hotel.city}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {related.map((h) => (
                  <Link
                    key={h.id}
                    href={`/hotels/${h.slug}`}
                    className="group flex items-center justify-between bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="text-white font-semibold mb-1 truncate">
                        {h.name}
                      </div>
                      <div className="text-xs text-gray-500">{h.city}</div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Footer CTA */}
          <section className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to book your transfer from {hotel.name}?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Instant pricing, free cancellation up to 48 hours, and a
              bilingual driver waiting in the hotel lobby. Door-to-door
              private service across all of Costa Rica.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/book?from=${encodeURIComponent(hotel.area_origen)}&direct=1`}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl transition"
              >
                Get quote now
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition"
              >
                WhatsApp us
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Need a quote? Email{" "}
              <a
                href={`mailto:${siteConfig.business.email}`}
                className="text-amber-400 hover:underline"
              >
                {siteConfig.business.email}
              </a>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
