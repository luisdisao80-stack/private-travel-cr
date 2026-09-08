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

// Was 60s on the theory that the query is cheap — but at Vercel scale the
// constant ISR writes pushed us to 379% of the free-tier ISR Writes
// quota (the single biggest cost in our 2026-06 audit). Now 24h, same
// as every other content page; Diego triggers a Redeploy whenever he
// adds a hotel via SQL and wants it surfaced immediately.
export const revalidate = 86400;

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
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-slate-200 mb-4">
              <Building2 size={14} className="text-orange-600" />
              <span className="text-orange-600 text-sm font-medium tracking-wider">
                HOTEL SHUTTLE SERVICE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Private Shuttles to 140+ Costa Rica Hotels
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Pickup at the hotel entrance, bilingual drivers, fixed all-inclusive
              pricing. Select your hotel below for routes and instant quotes.
            </p>
          </section>

          {hotels.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              No hotels published yet — check back soon.
            </div>
          ) : (
            cities.map((city) => (
              <section key={city} className="mb-10">
                <h2 className="text-xs text-orange-600 font-semibold tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                  <MapPin size={14} />
                  {city}
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {byCity.get(city)!.map((h) => (
                    <Link
                      key={h.id}
                      href={`/hotels/${h.slug}`}
                      className="group flex items-start justify-between gap-4 bg-white border border-slate-200 hover:border-orange-300 rounded-xl p-5 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-900 font-semibold mb-1">
                          {h.name}
                        </div>
                        {h.description ? (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {h.description}
                          </p>
                        ) : null}
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-orange-600 shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}

          {/* CTA */}
          <section className="mt-12 bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-300 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Your hotel isn&apos;t listed?
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
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
