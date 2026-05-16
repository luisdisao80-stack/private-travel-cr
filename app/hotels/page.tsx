import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getAllHotels } from "@/lib/hotels-db";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Private Shuttle Service to Costa Rica Hotels | Door-to-Door Pickup",
  description:
    "Private shuttle service to and from Costa Rica's top hotels — Tabacón, Four Seasons Papagayo, JW Marriott Guanacaste, Westin Reserva Conchal, and more. Door-to-door, instant pricing.",
  keywords: [
    "Costa Rica hotel shuttle",
    "private transfer to hotels Costa Rica",
    "Tabacón shuttle",
    "Four Seasons Papagayo transfer",
    "JW Marriott Guanacaste shuttle",
    "Westin Reserva Conchal transfer",
    "door-to-door hotel pickup Costa Rica",
  ],
  alternates: { canonical: "/hotels" },
  openGraph: {
    title: "Private Shuttle to Costa Rica Hotels",
    description:
      "Door-to-door private shuttle service for Costa Rica's top hotels and resorts.",
    url: `${siteConfig.siteUrl}/hotels`,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private shuttle service to Costa Rica hotels",
      },
    ],
  },
};

// 60s instead of the usual 3600 so new hotels added via SQL show up within
// a minute (the page is cheap — single Supabase query — so frequent
// revalidation has negligible cost).
export const revalidate = 60;

export default async function HotelsIndexPage() {
  const hotels = await getAllHotels();

  // Group by city for a scannable layout
  const byCity = new Map<string, typeof hotels>();
  for (const h of hotels) {
    if (!byCity.has(h.city)) byCity.set(h.city, []);
    byCity.get(h.city)!.push(h);
  }
  const cities = Array.from(byCity.keys()).sort();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <Building2 size={14} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-wider">
                HOTEL SHUTTLE SERVICE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Door-to-door shuttles for Costa Rica&apos;s top hotels
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Pickup at the hotel entrance, bilingual drivers, fixed all-inclusive
              pricing. Select your hotel below for routes and instant quotes.
            </p>
          </section>

          {hotels.length === 0 ? (
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
              No hotels published yet — check back soon.
            </div>
          ) : (
            cities.map((city) => (
              <section key={city} className="mb-10">
                <h2 className="text-xs text-amber-400 font-semibold tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                  <MapPin size={14} />
                  {city}
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {byCity.get(city)!.map((h) => (
                    <Link
                      key={h.id}
                      href={`/hotels/${h.slug}`}
                      className="group flex items-start justify-between gap-4 bg-gray-900/50 border border-white/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold mb-1">
                          {h.name}
                        </div>
                        {h.description ? (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {h.description}
                          </p>
                        ) : null}
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-amber-400 shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}

          {/* CTA */}
          <section className="mt-12 bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Your hotel isn&apos;t listed?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We pick up at every hotel in Costa Rica. Send us a WhatsApp with
              your hotel name and we&apos;ll quote your transfer.
            </p>
            <a
              href="https://wa.me/50686334133?text=Hello!%20I%27d%20like%20a%20shuttle%20quote%20for%20my%20hotel%20in%20Costa%20Rica."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition"
            >
              Message us on WhatsApp
            </a>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
