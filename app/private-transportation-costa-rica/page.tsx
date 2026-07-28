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

// SEO target query cluster (GSC June 2026, ranked by impressions):
//   - "private transportation costa rica" (200 impr, 2.5% CTR)
//   - "private shuttle costa rica"        (196 impr, 3.1% CTR)
//   - "costa rica private transfers"      (185 impr, 3.8% CTR)
//   - "private transfers costa rica"      (135 impr, 4.4% CTR)
//   - "private transportation in costa rica" (95 impr, 14% CTR)
//
// Combined: 811 impressions/month with ~4.5% CTR. This page is built as
// an exact-match landing for all five — H1 says "Private Transportation
// in Costa Rica", H2s/copy hit every variant. Goal: rank top 5 in 60 days
// and lift the cluster CTR to 8-12%, adding ~50-100 clicks/month.

export const metadata: Metadata = {
  title: "Private Transportation in Costa Rica from $135 | Private Driver & Transfers",
  description:
    "Private transportation and private drivers in Costa Rica from $135 USD. Your own bilingual private driver, door-to-door transfers from SJO/LIR airports to La Fortuna, Manuel Antonio, Monteverde, Tamarindo. ⭐ 5.0 · 200+ Google reviews.",
  keywords: [
    "private transportation costa rica",
    "private transportation in costa rica",
    "private driver costa rica",
    "private driver in costa rica",
    "hire a private driver costa rica",
    "english speaking driver costa rica",
    "private shuttle costa rica",
    "costa rica private transfers",
    "private transfers costa rica",
    "costa rica private transportation",
    "door-to-door costa rica shuttle",
    "private transfer SJO airport",
    "private transfer LIR airport",
    "costa rica ground transportation",
    "ground transportation costa rica",
    "costa rica airport transfers",
    "costa rica airport transfer",
    "costa rica airport transportation",
    "private shuttle service costa rica",
  ],
  alternates: { canonical: "/private-transportation-costa-rica" },
  openGraph: {
    title: "Private Transportation & Private Drivers in Costa Rica from $135",
    description:
      "Private transportation with your own bilingual private driver across Costa Rica. From $135 USD. ⭐ 5.0 · 200+ reviews · ICT licensed · free child seats · instant booking.",
    url: `${siteConfig.siteUrl}/private-transportation-costa-rica`,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private transportation in Costa Rica — Private Travel CR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Transportation in Costa Rica from $135",
    description:
      "Door-to-door private transportation across Costa Rica. From $135 USD. ⭐ 5.0 · 200+ reviews.",
    images: [siteConfig.ogImage],
  },
};

export const revalidate = 86400;

const POPULAR_ROUTES = [
  { from: "SJO Airport", to: "La Fortuna (Arenal)", price: 220, duration: "3 h", slug: "sjo-to-la-fortuna" },
  { from: "SJO Airport", to: "Manuel Antonio", price: 220, duration: "3 h", slug: "sjo-to-manuel-antonio" },
  { from: "SJO Airport", to: "Monteverde", price: 220, duration: "4 h", slug: "sjo-to-monteverde" },
  { from: "SJO Airport", to: "Tamarindo", price: 345, duration: "5 h", slug: "sjo-juan-santamaria-int-airport-to-tamarindo" },
  { from: "LIR Airport", to: "Tamarindo", price: 135, duration: "1 h 15 min", slug: "lir-liberia-int-airport-to-tamarindo" },
  { from: "LIR Airport", to: "La Fortuna", price: 225, duration: "3 h", slug: "lir-to-la-fortuna" },
  { from: "LIR Airport", to: "Papagayo", price: 95, duration: "30 min", slug: "lir-liberia-int-airport-to-papagayo-peninsula-guanacaste" },
  { from: "La Fortuna", to: "Monteverde", price: 255, duration: "3 h", slug: "la-fortuna-to-monteverde" },
];

const INCLUDED_FEATURES = [
  { icon: Car, label: "Modern 2024+ vehicle (Hyundai Staria, Toyota Hiace, Maxus V90)" },
  { icon: MapPin, label: "Door-to-door pickup and drop-off (any hotel, Airbnb, address)" },
  { icon: Plane, label: "Flight tracking on airport pickups — driver waits if delayed" },
  { icon: Baby, label: "Free child seats (infant, convertible, booster)" },
  { icon: ShieldCheck, label: "Full insurance through INS (Costa Rica's national insurer)" },
  { icon: CreditCard, label: "All taxes and tolls included — no hidden fees" },
];

// On-page vehicle photos. The landing had zero images — a page that ranks
// for a high-intent commercial query needs to show the actual product.
// Real photos build trust (lower bounce, higher conversion) and each <img>
// alt is another keyword-relevant crawl signal. Prices are the per-vehicle
// starting rates, kept in sync with /fleet and the homepage FleetPreview.
// "View details" links to /fleet — an extra internal link to a deeper page.
const VEHICLES = [
  {
    name: "Hyundai Staria",
    model: "PREMIUM SUV",
    pax: "1–5 passengers",
    image: "/staria.webp",
    alt: "Hyundai Staria premium SUV for private transportation in Costa Rica",
    priceFrom: 90,
    badge: "MOST POPULAR",
  },
  {
    name: "Toyota Hiace",
    model: "HIGH ROOF VAN",
    pax: "6–9 passengers",
    image: "/hiace.png",
    alt: "Toyota Hiace high-roof van for group private transfers in Costa Rica",
    priceFrom: 120,
    badge: "LARGE GROUPS",
  },
  {
    name: "Maxus V90",
    model: "EXECUTIVE VAN",
    pax: "10–12 passengers",
    image: "/maxus-v90.webp",
    alt: "Maxus V90 executive van for large-group private transportation in Costa Rica",
    priceFrom: 180,
    badge: "XL GROUPS",
  },
];

// FAQ content lives in one place so the on-page <details> accordion AND the
// FAQPage JSON-LD below are always in sync. Google requires the structured
// FAQ text to match the visible answer verbatim, so both render from FAQS.
const FAQS = [
  {
    q: "How much does private transportation cost in Costa Rica?",
    a: "Private transportation in Costa Rica starts at $135 USD per vehicle for short routes (e.g. LIR Airport to Tamarindo) and goes up to ~$420 USD for the longest popular routes (SJO Airport to Papagayo Peninsula). Most popular routes are between $220-$260. The price is per vehicle, not per person, so the cost stays the same for groups of 1 to 5 in a standard van.",
  },
  {
    q: "Is private transportation worth it vs. a shared shuttle?",
    a: "For solo travelers on a budget, shared shuttles ($55 per person) win on price. For couples, the math is closer. For groups of 3+, private transportation is usually the same total cost as a shared shuttle but gets you there 1-2 hours faster and door-to-door without other passengers.",
  },
  {
    q: "What's included in a private transfer?",
    a: "Every private transfer includes door-to-door pickup, a professional bilingual driver, a modern vehicle (2024 or newer), flight tracking on airport pickups, free child seats (infant, convertible, booster), bottled water, on-board WiFi, all tolls and taxes. No hidden fees.",
  },
  {
    q: "Do I get a private driver in Costa Rica?",
    a: "Yes. Every private transfer includes your own professional private driver — a vetted, fully licensed, bilingual (English–Spanish) local who knows Costa Rica's roads and drives you door to door. It's not a rideshare app or a shared pool: the same driver is dedicated to your group for the trip, tracks your flight, waits if you're delayed, helps with luggage, and can stay with you for multi-day trips or full-day tours.",
  },
  {
    q: "How far in advance should I book private transportation?",
    a: "In high season (December-April) we recommend booking at least 1 week ahead, especially for holiday weeks. In low season (May-November), 2-3 days is usually enough. Last-minute bookings are accepted via WhatsApp if a vehicle is available.",
  },
  {
    q: "Can I book multiple legs (e.g. SJO → La Fortuna → Monteverde → SJO)?",
    a: "Yes. Add each leg to your cart on our booking page. Each trip is priced and confirmed separately, all paid in a single checkout. Cancellation policy applies per trip.",
  },
  {
    // Answer mirrors the official Terms & Conditions (section 3,
    // /terms) verbatim in substance — 48h full refund, inside 48h /
    // no-show non-refundable, provider-side cancellation = full refund
    // or free reschedule. Keep in sync with app/terms/page.tsx.
    q: "What is your cancellation policy?",
    a: "Cancellations made 48 hours or more before your scheduled pickup receive a full refund of the amount paid. Cancellations within 48 hours, no-shows, and last-minute changes are non-refundable. If we ever have to cancel from our side — severe weather, road closures, or safety concerns — you get a full refund or a free reschedule. To cancel or reschedule, message Diego on WhatsApp at +506 8633-4133.",
  },
  {
    q: "What if my flight is delayed?",
    a: "Flight tracking is included on every airport pickup. The driver monitors your flight in real-time and adjusts pickup automatically. There's no extra charge for delays.",
  },
  {
    q: "Do you provide service from Liberia Airport (LIR) too?",
    a: "Yes — we operate from both major Costa Rica airports: SJO (Juan Santamaría International, San José) and LIR (Daniel Oduber International, Liberia). LIR is the gateway to the Guanacaste beach resorts (Tamarindo, Papagayo, Conchal, Flamingo).",
  },
  {
    q: "Do you handle airport transfers and ground transportation across Costa Rica?",
    a: "Yes — airport transfers are our most-booked service, and we cover ground transportation for your whole trip. We pick you up curbside at SJO or LIR arrivals with a name sign, track your flight so we're there even if you land late, and drive you door-to-door to any hotel, beach town, or destination. Beyond the airport, we handle every leg of your ground transportation in Costa Rica — hotel-to-hotel transfers, day trips, and multi-stop itineraries — all as private rides priced per vehicle, not per person.",
  },
];

// Lowest / highest advertised route price on this page — used for the
// Service offer's priceRange so Google has structured price data.
const PRICE_LOW = Math.min(...POPULAR_ROUTES.map((r) => r.price));
const PRICE_HIGH = Math.max(...POPULAR_ROUTES.map((r) => r.price));

export default async function PrivateTransportationCostaRicaPage() {
  const google = await getGoogleReviews();
  const reviewCount = google.count;
  const rating = google.rating;

  // Page-specific structured data. The global layout only emits a
  // sitewide LocalBusiness schema — this page had zero page-level JSON-LD,
  // so the 7 on-page FAQs never surfaced as rich results. FAQPage is the
  // single biggest CTR lever here (expandable Q&A in the SERP); Service
  // gives Google structured price data; BreadcrumbList clarifies hierarchy.
  const pageUrl = `${siteConfig.siteUrl}/private-transportation-costa-rica`;
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
        serviceType: "Private transportation",
        name: "Private Transportation in Costa Rica",
        description:
          "Door-to-door private transfers across Costa Rica from SJO and LIR airports to La Fortuna, Monteverde, Manuel Antonio, Tamarindo and any destination. Priced per vehicle, not per person.",
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
          offerCount: POPULAR_ROUTES.length,
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
            name: "Private Transportation in Costa Rica",
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
            Private Transportation
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              in Costa Rica
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Door-to-door private transfers from <strong className="text-white">$135 USD</strong>.
            Modern vehicles, your own private bilingual driver, flight tracking
            included. One flat price per vehicle — not per person.
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

      {/* WHAT IS PRIVATE TRANSPORTATION */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            What is private transportation in Costa Rica?
          </h2>
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg space-y-4">
            <p>
              Private transportation in Costa Rica means a vehicle reserved
              exclusively for your group — no shared rides, no other passengers,
              no detours. You choose the pickup time, the pickup address (any
              hotel, Airbnb, or location in the country), and the destination.
              A professional bilingual driver arrives in a modern van or SUV and
              takes you directly there. It&apos;s the simplest way to handle all
              your ground transportation in Costa Rica — from the moment you land
              until you&apos;re back at the airport.
            </p>
            <p>
              Most travelers start with an{" "}
              <strong className="text-white">airport transfer</strong> from SJO
              (San José) or LIR (Liberia) to their first hotel, then book
              point-to-point transfers between destinations for the rest of the
              trip. Whether you need a single airport transfer or full ground
              transportation for a two-week itinerary, every leg is a private,
              door-to-door ride priced per vehicle.
            </p>
            <p>
              Unlike a shared shuttle (which costs about <strong className="text-amber-400">$55 per person</strong>{" "}
              and stops at multiple hotels along the way), private transportation
              is priced <strong className="text-amber-400">per vehicle</strong>{" "}
              — same total cost whether you're 1 traveler or 5. For families,
              couples, and groups of 3 or more, private transfers are typically
              the same total cost as shared shuttles but get you to your
              destination 1-2 hours faster.
            </p>
            <p>
              Costa Rica's roads are challenging for first-time visitors —
              narrow mountain routes, sudden weather changes, and limited
              English signage. Private transportation removes the stress of
              renting a car (typical all-in cost: $450-700 for a week after
              mandatory insurance) and gets you to your hotel without
              navigation, parking, or driving worries.
            </p>
          </div>
        </div>
      </section>

      {/* 2026 PRICES */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              2026 Rates · All Taxes Included
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              Private transportation prices in Costa Rica
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Per vehicle, not per person. Same price for 1 or 5 passengers
              in a standard van. Larger vans for groups of 6+ are also available.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-amber-500/20 bg-zinc-950/50">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="border-b border-amber-500/20 bg-amber-500/5">
                  <th className="text-left p-4 text-amber-400 font-semibold">From</th>
                  <th className="text-left p-4 text-amber-400 font-semibold">To</th>
                  <th className="text-right p-4 text-amber-400 font-semibold">From (USD)</th>
                  <th className="text-right p-4 text-amber-400 font-semibold hidden md:table-cell">
                    Drive time
                  </th>
                </tr>
              </thead>
              <tbody>
                {POPULAR_ROUTES.map((r) => (
                  <tr
                    key={`${r.from}-${r.to}`}
                    className="border-b border-white/5 hover:bg-amber-500/5 transition-colors"
                  >
                    <td className="p-4 text-white/80">{r.from}</td>
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
            Need a different route?{" "}
            <Link href="/routes" className="text-amber-400 hover:underline font-medium">
              Browse all 1,200+ routes →
            </Link>
          </p>
        </div>
      </section>

      {/* THE FLEET */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Modern 2024+ Fleet · Air-Conditioned
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              The vehicles for your private transfer
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Every transfer runs in a clean, modern, air-conditioned vehicle
              sized to your group — from a premium SUV for couples to an
              executive van for groups of 12.
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

      {/* PRIVATE DRIVER */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            Your private driver in Costa Rica
          </h2>
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg space-y-4">
            <p>
              Every private transfer comes with your own professional{" "}
              <strong className="text-white">private driver</strong> — not a
              rideshare app, not a rotating pool. You get a vetted, fully
              licensed, bilingual (English–Spanish) driver who knows Costa
              Rica&apos;s roads, weather, and best stops, and takes you door to
              door safely.
            </p>
            <p>
              Hiring a private driver in Costa Rica means you skip the stress of
              renting a car, navigating unfamiliar mountain routes, and finding
              parking. Your driver tracks your flight and waits if you&apos;re
              delayed, helps with luggage, and is happy to stop for photos,
              coffee, or a quick bite along the way. Traveling several days? The
              same private driver can stay with your group for multi-day trips
              and full-day tours.
            </p>
            <p>
              Every driver is background-checked, ICT-licensed, and insured
              through INS, Costa Rica&apos;s national insurer. Message Diego on
              WhatsApp and he&apos;ll match you with the right private driver and
              vehicle for your group and route.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-amber-300 transition-colors"
            >
              Book a Private Driver
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            What&apos;s included in every private transfer
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
            Private transportation vs other options
          </h2>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" /> Private transportation
              </h3>
              <p className="text-white/80">
                <strong className="text-white">Best for groups of 2+, families, honeymooners.</strong>{" "}
                Door-to-door, direct route, ~3 h SJO → La Fortuna. From $135.
                Same total price for 1 or 5 passengers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Shared shuttle</h3>
              <p className="text-white/70">
                ~$55 per person. 12-passenger van with multiple stops. Takes 4-5 h
                SJO → La Fortuna because of pickup/drop-off detours. Good for solo
                travelers on a budget.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Rental car</h3>
              <p className="text-white/70">
                $450-700 all-in for a week (after mandatory insurance, gas, return
                fees). Best for confident drivers exploring off-route. Costa
                Rica's roads are harder to drive than they look.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white/90 mb-2">Uber / Taxi</h3>
              <p className="text-white/70">
                Uber only works inside San José urban area, not for intercity
                transport. Taxi SJO → La Fortuna costs $250-300 — more than a
                private transfer.
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
            Private transportation FAQs
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
                Ready to book your private transfer?
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                Instant quote in under a minute. Confirm with a card payment.
                Driver waiting at your hotel lobby on the day.
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
