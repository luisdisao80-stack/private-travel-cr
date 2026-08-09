import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Car,
  Plane,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle,
  ArrowRight,
  MapPin,
  CreditCard,
  Baby,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { siteConfig } from "@/lib/site-config";
import { getGoogleReviews } from "@/lib/google-reviews";

// SEO target query cluster (GSC May-Aug 2026, stuck on page 2 at pos 14-26
// with thousands of impressions and ~0 clicks — pure buyer intent left on
// the table). Ranked by impressions:
//   - "costa rica ground transportation"  (994 impr, pos 15.7)
//   - "costa rica airport transfers"      (413 impr, pos 17.5)
//   - "costa rica airport shuttle"        (335 impr, pos 26)
//   - "airport transfer costa rica"       (298 impr, pos 18.6)
//   - "costa rica airport transportation" (249 impr, pos 14.1)
//   - "airport transfers costa rica"      (241 impr, pos 16.9)
//   - "costa rica airport transfer"       (215 impr, pos 16.4)
//   - "airport transportation costa rica" (178 impr, pos 18.8)
//
// Combined: ~2,900 impressions with near-zero clicks. No page targeted this
// cluster with exact-match relevance — /private-transportation-costa-rica
// only hits it as a secondary keyword. This page is the exact-match landing:
// H1 "Costa Rica Airport Transfers", content focused on the SJO/LIR arrival
// experience, meet & greet, and flight tracking. Goal: pull the cluster onto
// page 1 and convert the buyer intent into bookings.

export const metadata: Metadata = {
  title: "Costa Rica Airport Transfers from $110 | SJO & LIR Private Transfer",
  description:
    "Private Costa Rica airport transfers from SJO (San José) and LIR (Liberia) from $110 USD. Meet & greet at arrivals, flight tracking, door-to-door to La Fortuna, Tamarindo, Manuel Antonio & more. ⭐ 5.0 · 200+ Google reviews.",
  keywords: [
    "costa rica airport transfers",
    "costa rica airport transfer",
    "airport transfer costa rica",
    "airport transfers costa rica",
    "costa rica airport shuttle",
    "costa rica airport transportation",
    "airport transportation costa rica",
    "costa rica ground transportation",
    "ground transportation costa rica",
    "sjo airport transfer",
    "lir airport transfer",
    "san jose airport transfer costa rica",
    "liberia airport transfer costa rica",
    "private airport transfer costa rica",
    "costa rica airport pickup",
  ],
  alternates: { canonical: "/costa-rica-airport-transfers" },
  openGraph: {
    title: "Costa Rica Airport Transfers from $110 — SJO & LIR Private Transfer",
    description:
      "Private airport transfers from SJO and LIR with meet & greet, flight tracking and door-to-door service. From $110 USD. ⭐ 5.0 · 200+ reviews · ICT licensed.",
    url: `${siteConfig.siteUrl}/costa-rica-airport-transfers`,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Costa Rica airport transfers — Private Travel CR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Costa Rica Airport Transfers from $110 | SJO & LIR",
    description:
      "Private door-to-door airport transfers from SJO and LIR. Meet & greet, flight tracking. From $110 USD. ⭐ 5.0 · 200+ reviews.",
    images: [siteConfig.ogImage],
  },
};

export const revalidate = 86400;

// Real routes + prices from the DB (all indexable, live at /private-shuttle/).
// Mix of both airports and a price range so the table shows the cheapest
// LIR hop through the longest SJO cross-country transfer.
const AIRPORT_ROUTES = [
  { airport: "LIR (Liberia)", to: "Papagayo Peninsula", price: 110, duration: "1.5 h", slug: "lir-to-papagayo" },
  { airport: "LIR (Liberia)", to: "Tamarindo", price: 135, duration: "1.5 h", slug: "lir-liberia-int-airport-to-tamarindo" },
  { airport: "LIR (Liberia)", to: "Conchal", price: 135, duration: "1.5 h", slug: "lir-liberia-int-airport-to-conchal" },
  { airport: "SJO (San José)", to: "La Fortuna (Arenal)", price: 220, duration: "3 h", slug: "sjo-to-la-fortuna" },
  { airport: "SJO (San José)", to: "Manuel Antonio", price: 220, duration: "3 h", slug: "sjo-to-manuel-antonio" },
  { airport: "SJO (San José)", to: "Monteverde", price: 220, duration: "3 h", slug: "sjo-to-monteverde" },
  { airport: "LIR (Liberia)", to: "La Fortuna (Arenal)", price: 225, duration: "3 h", slug: "lir-to-la-fortuna" },
  { airport: "SJO (San José)", to: "Puerto Viejo", price: 320, duration: "4.5 h", slug: "sjo-to-puerto-viejo" },
  { airport: "SJO (San José)", to: "Tamarindo", price: 345, duration: "5 h", slug: "sjo-to-tamarindo" },
];

const INCLUDED_FEATURES = [
  { icon: Plane, label: "Meet & greet at arrivals — your driver waits curbside with a name sign" },
  { icon: Plane, label: "Flight tracking — driver monitors your flight and adjusts pickup automatically" },
  { icon: MapPin, label: "Door-to-door drop-off at any hotel, Airbnb or address in Costa Rica" },
  { icon: Car, label: "Modern 2024+ vehicle (Hyundai Staria, Toyota Hiace, Maxus V90)" },
  { icon: Baby, label: "Free child seats (infant, convertible, booster)" },
  { icon: ShieldCheck, label: "Full insurance through INS (Costa Rica's national insurer)" },
  { icon: CreditCard, label: "All taxes and tolls included — no hidden fees" },
  { icon: Users, label: "One flat price per vehicle — same cost for 1 to 5 passengers" },
];

const VEHICLES = [
  {
    name: "Hyundai Staria",
    model: "PREMIUM SUV",
    pax: "1–5 passengers",
    image: "/staria.webp",
    alt: "Hyundai Staria premium SUV for Costa Rica airport transfers",
    priceFrom: 90,
    badge: "MOST POPULAR",
  },
  {
    name: "Toyota Hiace",
    model: "HIGH ROOF VAN",
    pax: "6–9 passengers",
    image: "/hiace.png",
    alt: "Toyota Hiace high-roof van for group airport transfers in Costa Rica",
    priceFrom: 120,
    badge: "LARGE GROUPS",
  },
  {
    name: "Maxus V90",
    model: "EXECUTIVE VAN",
    pax: "10–12 passengers",
    image: "/maxus-v90.webp",
    alt: "Maxus V90 executive van for large-group airport transfers in Costa Rica",
    priceFrom: 180,
    badge: "XL GROUPS",
  },
];

// Single source of truth for the on-page accordion AND the FAQPage JSON-LD —
// Google requires the structured answer to match the visible text verbatim.
const FAQS = [
  {
    q: "How much does an airport transfer cost in Costa Rica?",
    a: "Costa Rica airport transfers start at $110 USD per vehicle for the shortest routes (e.g. LIR Airport to Papagayo Peninsula) and range up to ~$375 USD for the longest cross-country transfers (e.g. SJO Airport to Santa Teresa). Most popular airport routes are between $135 and $345. The price is per vehicle, not per person, so 1 to 5 passengers pay the same in a standard van.",
  },
  {
    q: "Which airport should I fly into — SJO or LIR?",
    a: "It depends on your destination. SJO (Juan Santamaría, San José) is best for the Central Valley, La Fortuna/Arenal, Monteverde, Manuel Antonio and the Caribbean. LIR (Daniel Oduber, Liberia) is the gateway to the Guanacaste beaches — Tamarindo, Papagayo, Conchal and Flamingo are only 1 to 1.5 hours away. We operate airport transfers from both.",
  },
  {
    q: "Will the driver meet me inside the airport?",
    a: "Your driver waits just outside the arrivals exit with a sign showing your name. Costa Rican airports (SJO and LIR) don't allow drivers past the customs exit, so the meeting point is the covered curbside area right after you walk out — it's a short, clearly-marked walk and your driver will be watching for you.",
  },
  {
    q: "What happens if my flight is delayed or arrives early?",
    a: "Flight tracking is included on every airport transfer at no extra cost. Your driver monitors your flight in real time and adjusts the pickup automatically, so whether you land late or early, your driver will be there waiting. There is no delay fee.",
  },
  {
    q: "How long does customs and immigration take at SJO and LIR?",
    a: "Plan for 30 to 60 minutes from landing to walking out, depending on how many flights arrived at once. Your driver factors this into the pickup and tracks your flight, so you never need to rush — take your time through immigration and baggage claim.",
  },
  {
    q: "Is a private airport transfer better than a shared shuttle or taxi?",
    a: "A shared shuttle (~$55 per person) is cheapest for solo travelers but stops at multiple hotels and can add 1-2 hours. An official airport taxi is private but often costs more than we do for long routes (SJO to La Fortuna by taxi runs $250-300). A private transfer is direct, door-to-door, priced per vehicle, and for groups of 2+ is usually the best value and the fastest.",
  },
  {
    q: "Can you handle the return transfer back to the airport too?",
    a: "Yes — round-trip airport transfers are our most common booking. We'll pick you up at your hotel with enough buffer for check-in (we recommend arriving 2 hours before domestic and 3 hours before international departures) and get you to SJO or LIR on time. Book both legs in a single checkout.",
  },
  {
    q: "Do you cover ground transportation beyond the airport?",
    a: "Yes. Airport transfers are our most-booked service, but we handle every leg of your ground transportation in Costa Rica — hotel-to-hotel transfers, day trips, and multi-stop itineraries — all as private rides priced per vehicle. Many guests book their airport pickup plus every transfer for their whole trip in one go.",
  },
  {
    q: "How far in advance should I book my airport transfer?",
    a: "In high season (December-April) book at least 1 week ahead, especially for holiday weeks. In low season (May-November), 2-3 days is usually enough. Last-minute airport pickups are accepted via WhatsApp when a vehicle is available.",
  },
];

const PRICE_LOW = Math.min(...AIRPORT_ROUTES.map((r) => r.price));
const PRICE_HIGH = Math.max(...AIRPORT_ROUTES.map((r) => r.price));

export default async function CostaRicaAirportTransfersPage() {
  const google = await getGoogleReviews();
  const reviewCount = google.count;
  const rating = google.rating;

  const pageUrl = `${siteConfig.siteUrl}/costa-rica-airport-transfers`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        serviceType: "Airport transfer",
        name: "Costa Rica Airport Transfers",
        description:
          "Private door-to-door airport transfers from SJO (San José) and LIR (Liberia) to La Fortuna, Monteverde, Manuel Antonio, Tamarindo, Papagayo and any destination in Costa Rica. Meet & greet and flight tracking included. Priced per vehicle, not per person.",
        provider: {
          "@type": "LocalBusiness",
          name: siteConfig.name,
          url: siteConfig.siteUrl,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount: reviewCount,
          },
        },
        areaServed: { "@type": "Country", name: "Costa Rica" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: PRICE_LOW,
          highPrice: PRICE_HIGH,
          offerCount: AIRPORT_ROUTES.length,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Costa Rica Airport Transfers",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-amber-500/30 bg-amber-500/5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              ⭐ {rating.toFixed(1)} · {reviewCount}+ Google Reviews
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Costa Rica
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Airport Transfers
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Private door-to-door transfers from{" "}
            <strong className="text-white">SJO</strong> and{" "}
            <strong className="text-white">LIR</strong> airports from{" "}
            <strong className="text-white">$110 USD</strong>. Meet &amp; greet at
            arrivals, flight tracking, and your own bilingual driver. One flat
            price per vehicle — not per person.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-amber-300 transition-colors"
            >
              Get Instant Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={siteConfig.business.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/5 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Diego
            </a>
          </div>
        </div>
      </section>

      {/* WHAT IS AN AIRPORT TRANSFER */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            Private airport transfers in Costa Rica
          </h2>
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg space-y-4">
            <p>
              A Costa Rica airport transfer is a private, pre-booked ride from
              the airport straight to your hotel — no shared vans, no other
              passengers, no waiting for a taxi line. Your driver tracks your
              flight, meets you curbside at arrivals with a name sign, helps with
              your luggage, and takes you door-to-door to your destination. It&apos;s
              the easiest way to start your trip, especially after a long
              international flight.
            </p>
            <p>
              We operate from both of Costa Rica&apos;s international airports:{" "}
              <strong className="text-white">SJO</strong> (Juan Santamaría, San
              José) and <strong className="text-white">LIR</strong> (Daniel
              Oduber, Liberia). From SJO most travelers head to La Fortuna,
              Monteverde, Manuel Antonio, or San José; from LIR it&apos;s a short hop
              to the Guanacaste beaches like Tamarindo, Papagayo and Conchal.
            </p>
            <p>
              Unlike a shared shuttle (about <strong className="text-amber-400">$55 per person</strong>{" "}
              with multiple stops) or an airport taxi, a private transfer is
              priced <strong className="text-amber-400">per vehicle</strong> — the
              same total cost whether you&apos;re 1 traveler or 5. For couples,
              families and groups it&apos;s usually the best value and always the
              fastest, most comfortable option.
            </p>
          </div>
        </div>
      </section>

      {/* PRICES */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              2026 Rates · All Taxes Included
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              Costa Rica airport transfer prices
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Per vehicle, not per person. Same price for 1 or 5 passengers in a
              standard van. Larger vans for groups of 6+ are also available.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-amber-500/20 bg-zinc-950/50">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-amber-500/20 bg-amber-500/5">
                  <th className="text-left p-4 text-amber-400 font-semibold">Airport</th>
                  <th className="text-left p-4 text-amber-400 font-semibold">Destination</th>
                  <th className="text-right p-4 text-amber-400 font-semibold">From (USD)</th>
                  <th className="text-right p-4 text-amber-400 font-semibold hidden md:table-cell">
                    Drive time
                  </th>
                </tr>
              </thead>
              <tbody>
                {AIRPORT_ROUTES.map((r) => (
                  <tr
                    key={`${r.airport}-${r.to}`}
                    className="border-b border-white/5 hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="p-4 text-white/80">{r.airport}</td>
                    <td className="p-4 text-white font-medium">
                      <Link
                        href={`/private-shuttle/${r.slug}`}
                        className="hover:text-amber-400 transition-colors"
                      >
                        {r.to}
                      </Link>
                    </td>
                    <td className="p-4 text-right text-amber-400 font-bold">
                      ${r.price}
                    </td>
                    <td className="p-4 text-right text-white/60 hidden md:table-cell">
                      {r.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            Flying somewhere else?{" "}
            <Link href="/routes" className="text-amber-400 hover:underline font-medium">
              Browse all airport routes →
            </Link>
          </p>
        </div>
      </section>

      {/* SJO vs LIR */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Transfers from both Costa Rica airports
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-zinc-950/50">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white">SJO — San José (Juan Santamaría)</h3>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                Costa Rica&apos;s main international gateway, in the Central Valley
                near Alajuela. Best for La Fortuna/Arenal, Monteverde, Manuel
                Antonio, the Caribbean coast, and San José city. Most transfers
                to the top destinations take 3 to 4.5 hours.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/private-shuttle/sjo-to-la-fortuna" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">SJO → La Fortuna</Link>
                <Link href="/private-shuttle/sjo-to-manuel-antonio" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">SJO → Manuel Antonio</Link>
                <Link href="/private-shuttle/sjo-to-monteverde" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">SJO → Monteverde</Link>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-zinc-950/50">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white">LIR — Liberia (Daniel Oduber)</h3>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                The gateway to Guanacaste&apos;s Pacific beaches. If your trip is
                focused on the northwest coast, flying into LIR saves hours of
                driving — Tamarindo, Papagayo and Conchal are just 1 to 1.5 hours
                away.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/private-shuttle/lir-liberia-int-airport-to-tamarindo" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">LIR → Tamarindo</Link>
                <Link href="/private-shuttle/lir-to-papagayo" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">LIR → Papagayo</Link>
                <Link href="/private-shuttle/lir-to-la-fortuna" className="text-xs px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition">LIR → La Fortuna</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE FLEET */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Modern 2024+ Fleet · Air-Conditioned
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              The vehicles for your airport transfer
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Every transfer runs in a clean, modern, air-conditioned vehicle
              sized to your group — with plenty of luggage space for a full
              flight&apos;s worth of bags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VEHICLES.map((v) => (
              <div
                key={v.name}
                className="rounded-2xl border border-amber-500/20 bg-zinc-950/50 overflow-hidden"
              >
                <div className="relative h-48 bg-white p-4">
                  <img
                    src={v.image}
                    alt={v.alt}
                    width={400}
                    height={240}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold tracking-wider shadow-lg">
                    {v.badge}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white text-sm font-medium">{v.pax}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-amber-400 text-xs tracking-widest font-medium mb-1">
                    {v.model}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{v.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-wider">
                        From
                      </div>
                      <div className="text-2xl font-bold text-white">
                        ${v.priceFrom}
                      </div>
                    </div>
                    <Link
                      href="/fleet"
                      className="text-amber-400 text-sm flex items-center gap-1 hover:gap-2 transition-all font-medium"
                    >
                      View details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-white/60">
            Traveling with more than 12 passengers?{" "}
            <a
              href={siteConfig.business.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-medium"
            >
              Message Diego on WhatsApp for a custom quote →
            </a>
          </p>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            What&apos;s included in every airport transfer
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {INCLUDED_FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-5 rounded-xl border border-amber-500/10 bg-zinc-950/50"
              >
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-white/80 leading-relaxed pt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Airport transfer vs other options
          </h2>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" /> Private airport transfer
              </h3>
              <p className="text-white/80">
                <strong className="text-white">Best for groups of 2+, families, first-time visitors.</strong>{" "}
                Meet &amp; greet, direct door-to-door, flight tracking. From $110.
                Same total price for 1 or 5 passengers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Shared shuttle</h3>
              <p className="text-white/70">
                ~$55 per person. Shared van with multiple hotel stops — can add
                1-2 hours to your trip. Good for solo travelers on a budget.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Airport taxi</h3>
              <p className="text-white/70">
                Official red taxis are fine for short hops, but for long routes
                they often cost more than a private transfer (SJO → La Fortuna
                runs $250-300) with no flight tracking or fixed price.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Rental car</h3>
              <p className="text-white/70">
                $450-700 all-in for a week after mandatory insurance. Best for
                confident drivers, but jet-lagged arrival driving on unfamiliar
                mountain roads is a lot to take on the first day.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            Want a deeper comparison?{" "}
            <Link
              href="/blog/costa-rica-transportation-guide-2026"
              className="text-amber-400 hover:underline font-medium"
            >
              Read our full Costa Rica transportation guide →
            </Link>
          </p>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Why travelers choose Private Travel CR
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50 text-center">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {rating.toFixed(1)}/5
              </div>
              <p className="text-white/60 text-sm">
                {reviewCount}+ Google reviews · TripAdvisor Travelers&apos; Choice 2025
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50 text-center">
              <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">ICT Licensed</div>
              <p className="text-white/60 text-sm">
                License #3205-2022 · Insured through INS, Costa Rica&apos;s
                national insurer
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50 text-center">
              <Phone className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">Diego replies</div>
              <p className="text-white/60 text-sm">
                Founder-led — every WhatsApp answered personally by Diego,
                20+ years in Costa Rica tourism
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Costa Rica airport transfer FAQs
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-amber-500/10 bg-zinc-950/50 overflow-hidden"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-amber-500/5 transition-colors">
                  <h3 className="font-semibold text-white pr-4">{f.q}</h3>
                  <span className="shrink-0 text-amber-400 transition-transform duration-300 group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-white/70 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 p-8 md:p-12 text-center">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to book your airport transfer?
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                Instant quote in under a minute. Confirm with a card payment.
                Driver waiting at arrivals when you land.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-amber-300 transition-colors"
                >
                  Get Quote Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={siteConfig.business.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/5 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp +506 8633-4133
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
