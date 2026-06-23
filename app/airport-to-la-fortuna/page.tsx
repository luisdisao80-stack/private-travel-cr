import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Plane,
  Clock,
  ShieldCheck,
  Star,
  MessageCircle,
  ArrowRight,
  MapPin,
  Mountain,
  Baby,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { siteConfig } from "@/lib/site-config";
import { getGoogleReviews } from "@/lib/google-reviews";

// SEO target (GSC June 2026):
//   "private shuttle | private travel costa rica | airport to la fortuna"
//      → 80 impressions / 36 clicks / 45% CTR — already strong because
//      the exact phrase appears in our brand snippet.
//
// Plus the related cluster Google merges in:
//   - "san jose airport to la fortuna" / "sjo to la fortuna" / "lir to la fortuna"
//   - "how to get from san jose airport to arenal"
//   - "airport to arenal volcano"
//
// This page is the exact-match anchor: H1 = "Airport to La Fortuna",
// both airports (SJO + LIR) covered, full price + time table for each
// vehicle tier, FAQ targeting "how to get from" queries.

export const metadata: Metadata = {
  title: "Airport to La Fortuna (Arenal) — Private Shuttle from $220 | SJO & LIR",
  description:
    "Private shuttle from San José (SJO) or Liberia (LIR) airport to La Fortuna / Arenal Volcano. Door-to-door, 3 h drive, from $220 USD per vehicle. Flight tracking, free child seats, ⭐ 5.0 · 200+ reviews.",
  keywords: [
    "airport to la fortuna",
    "san jose airport to la fortuna",
    "SJO to la fortuna",
    "LIR to la fortuna",
    "liberia airport to la fortuna",
    "airport to arenal",
    "san jose to arenal volcano",
    "private shuttle la fortuna",
    "how to get to la fortuna",
    "shuttle to arenal",
  ],
  alternates: { canonical: "/airport-to-la-fortuna" },
  openGraph: {
    title: "Airport to La Fortuna — Private Shuttle from $220",
    description:
      "Private door-to-door shuttle from SJO or LIR airport to La Fortuna / Arenal in 3 hours. Free child seats, flight tracking, ⭐ 5.0 reviews.",
    url: `${siteConfig.siteUrl}/airport-to-la-fortuna`,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private shuttle from airport to La Fortuna, Costa Rica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport to La Fortuna — Private Shuttle from $220",
    description:
      "Private door-to-door shuttle from SJO or LIR airport to La Fortuna in 3 hours.",
    images: [siteConfig.ogImage],
  },
};

export const revalidate = 86400;

const VEHICLE_PRICING_SJO = [
  { vehicle: "Hyundai Staria", pax: "1-5", price: 220 },
  { vehicle: "Toyota Hiace", pax: "6-9", price: 260 },
  { vehicle: "Maxus V90", pax: "10-12", price: 320 },
];

const VEHICLE_PRICING_LIR = [
  { vehicle: "Hyundai Staria", pax: "1-5", price: 225 },
  { vehicle: "Toyota Hiace", pax: "6-9", price: 265 },
  { vehicle: "Maxus V90", pax: "10-12", price: 325 },
];

export default async function AirportToLaFortunaPage() {
  const google = await getGoogleReviews();
  const reviewCount = google.count;
  const rating = google.rating;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-amber-500/30 bg-amber-500/5">
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Costa Rica&apos;s most popular route
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Airport to{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              La Fortuna
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-4">
            Private door-to-door shuttle from <strong className="text-white">SJO</strong> or{" "}
            <strong className="text-white">LIR</strong> airport to La Fortuna / Arenal Volcano.
            From <strong className="text-amber-400">$220 USD</strong> per vehicle. 3-hour drive.
          </p>

          <p className="text-sm text-white/60 max-w-xl mx-auto mb-8">
            ⭐ {rating.toFixed(1)} · {reviewCount}+ Google reviews · ICT licensed · Flight
            tracking included · Free child seats
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book?from=sjo&to=la-fortuna&direct=1"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-base hover:bg-amber-300 transition-colors"
            >
              Book SJO → La Fortuna
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/book?from=lir&to=la-fortuna&direct=1"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-bold text-base hover:bg-white/5 transition-colors"
            >
              Book LIR → La Fortuna
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg space-y-4">
            <p>
              La Fortuna — the gateway town to Arenal Volcano National Park — is
              about a <strong className="text-white">3-hour drive from San José International Airport (SJO)</strong>{" "}
              and also <strong className="text-white">3 hours from Liberia Airport (LIR)</strong>.
              Both routes are scenic mountain drives. There&apos;s no airport in
              La Fortuna itself, so 99% of travelers arrive by private shuttle,
              shared shuttle, or rental car.
            </p>
            <p>
              We run private shuttles from <strong className="text-amber-400">both airports</strong>{" "}
              to every hotel in the La Fortuna area — Tabacón, Nayara, The Springs,
              Arenal Observatory, Arenal Manoa, Lomas del Volcán, and 25+ other
              properties. Door-to-door means we pick you up at the airport
              arrivals curb and drop you off at your hotel lobby in La Fortuna.
              No transfers, no extra stops.
            </p>
          </div>
        </div>
      </section>

      {/* WHICH AIRPORT */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Which airport should you fly into?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SJO */}
            <div className="p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-7 h-7 text-amber-400" />
                <div>
                  <div className="text-xs tracking-widest text-amber-400 font-semibold uppercase">
                    Most popular
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    SJO — San José
                  </h3>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed mb-5">
                Juan Santamaría International Airport (SJO) is Costa Rica&apos;s
                main international gateway, located near San José in Alajuela.
                Most flights from the US, Canada, and Europe arrive here.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Drive time:</strong> ~3 hours to La Fortuna
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Route:</strong> Highway 1 → Naranjo → Ciudad Quesada → La Fortuna
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    Most international flights, more flight options
                  </span>
                </li>
              </ul>
            </div>

            {/* LIR */}
            <div className="p-8 rounded-2xl border border-white/10 bg-zinc-950/50">
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-7 h-7 text-amber-400" />
                <div>
                  <div className="text-xs tracking-widest text-amber-400 font-semibold uppercase">
                    Alternative
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    LIR — Liberia
                  </h3>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed mb-5">
                Daniel Oduber International Airport (LIR) is in Guanacaste,
                northwest Costa Rica. Smaller than SJO but ideal if you&apos;re
                combining La Fortuna with the Guanacaste beaches.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Drive time:</strong> ~3 hours to La Fortuna
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Route:</strong> Cañas → Tilarán → Lake Arenal → La Fortuna
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>
                    Best if also visiting Tamarindo, Papagayo, Conchal
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              2026 prices · All taxes included
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">
              Pricing — airport to La Fortuna
            </h2>
            <p className="mt-3 text-white/60">
              Per vehicle, not per person. Same price for 1 or up to 5 passengers
              in a standard van.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SJO PRICING */}
            <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/50 overflow-hidden">
              <div className="p-5 bg-amber-500/5 border-b border-amber-500/20">
                <h3 className="font-bold text-amber-400 text-lg">SJO → La Fortuna</h3>
                <p className="text-sm text-white/60">3-hour drive · 130 km</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/60 font-medium">Vehicle</th>
                    <th className="text-left p-4 text-white/60 font-medium">Pax</th>
                    <th className="text-right p-4 text-white/60 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {VEHICLE_PRICING_SJO.map((v) => (
                    <tr key={v.vehicle} className="border-b border-white/5">
                      <td className="p-4 text-white">{v.vehicle}</td>
                      <td className="p-4 text-white/70">{v.pax}</td>
                      <td className="p-4 text-right text-amber-400 font-bold">
                        ${v.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LIR PRICING */}
            <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/50 overflow-hidden">
              <div className="p-5 bg-amber-500/5 border-b border-amber-500/20">
                <h3 className="font-bold text-amber-400 text-lg">LIR → La Fortuna</h3>
                <p className="text-sm text-white/60">3-hour drive · 145 km</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/60 font-medium">Vehicle</th>
                    <th className="text-left p-4 text-white/60 font-medium">Pax</th>
                    <th className="text-right p-4 text-white/60 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {VEHICLE_PRICING_LIR.map((v) => (
                    <tr key={v.vehicle} className="border-b border-white/5">
                      <td className="p-4 text-white">{v.vehicle}</td>
                      <td className="p-4 text-white/70">{v.pax}</td>
                      <td className="p-4 text-right text-amber-400 font-bold">
                        ${v.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            VIP service (+$80) adds a 1-2 hour scenic stop (waterfall, viewpoint,
            coffee farm), welcome kit (local snacks + sparkling water), and
            concierge driver recommendations.
          </p>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            What&apos;s included in your airport transfer
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Plane, label: "Meet & greet at the airport arrivals curb" },
              { icon: Clock, label: "Flight tracking — driver waits if your flight is delayed" },
              { icon: MapPin, label: "Door-to-door drop-off at your La Fortuna hotel" },
              { icon: Baby, label: "Free child seats (infant, convertible, booster)" },
              { icon: ShieldCheck, label: "Full insurance through INS" },
              { icon: Check, label: "All tolls and taxes — no hidden fees" },
            ].map(({ icon: Icon, label }) => (
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

      {/* THE DRIVE */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            What to expect on the drive
          </h2>
          <div className="space-y-6 text-white/80 leading-relaxed text-lg">
            <p>
              <strong className="text-white">From SJO:</strong> the route leaves
              Alajuela on Costa Rica&apos;s main north-south highway, climbs
              through the coffee plantations of Naranjo and Zarcero (famous for
              its topiary park), and descends into the Northern Plains. The
              landscape shifts from coffee hills to dairy farms to rainforest as
              you approach the volcano. You&apos;ll see Arenal Volcano on the
              horizon about 30 minutes before reaching La Fortuna.
            </p>
            <p>
              <strong className="text-white">From LIR:</strong> the route heads
              east through Cañas and Tilarán, then circles the northern shore of
              Lake Arenal — one of the most scenic stretches of road in Costa
              Rica, with constant volcano views across the water. The drive
              ends with a gentle descent into the La Fortuna valley.
            </p>
            <p>
              Both routes include a short rest stop (~15-20 minutes) for
              restrooms, snacks, and photos. If you booked VIP service, your
              driver will add 1-2 longer stops at recommended viewpoints,
              waterfalls, or coffee tours along the way.
            </p>
          </div>
        </div>
      </section>

      {/* HOTELS WE SERVE */}
      <section className="px-4 py-16 border-t border-amber-500/10 bg-gradient-to-b from-amber-500/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
            We drop off at every La Fortuna hotel
          </h2>
          <p className="text-white/60 text-center mb-10">
            Including these flagship properties — and 50+ others.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { slug: "tabacon-thermal-resort", name: "Tabacón Thermal Resort" },
              { slug: "nayara-springs", name: "Nayara Springs" },
              { slug: "nayara-gardens", name: "Nayara Gardens" },
              { slug: "nayara-tented-camp", name: "Nayara Tented Camp" },
              { slug: "the-springs-resort", name: "The Springs Resort" },
              { slug: "arenal-springs-resort", name: "Arenal Springs Resort" },
              { slug: "arenal-observatory-lodge", name: "Arenal Observatory" },
              { slug: "arenal-kioro", name: "Arenal Kioro" },
              { slug: "arenal-manoa", name: "Arenal Manoa" },
              { slug: "lomas-del-volcan", name: "Lomas del Volcán" },
              { slug: "amor-arenal", name: "Amor Arenal" },
              { slug: "casa-luna-arenal", name: "Hotel Casa Luna" },
            ].map((h) => (
              <Link
                key={h.slug}
                href={`/hotels/${h.slug}`}
                className="rounded-xl border border-amber-500/10 bg-zinc-950/50 hover:border-amber-500/40 px-4 py-3 text-sm text-white/80 hover:text-amber-400 transition-colors"
              >
                {h.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 border-t border-amber-500/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
            Airport to La Fortuna FAQs
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How long is the drive from SJO airport to La Fortuna?",
                a: "About 3 hours by private shuttle (~130 km). A shared shuttle takes 4-5 hours because of multiple pickup/drop-off detours. A rental car takes the same time as private but adds the stress of driving Costa Rica's mountain highways with limited English signage.",
              },
              {
                q: "How long is the drive from LIR (Liberia) airport to La Fortuna?",
                a: "About 3 hours by private shuttle (~145 km). The route circles Lake Arenal with stunning volcano views — many travelers consider this drive more scenic than the SJO route.",
              },
              {
                q: "How much does a private shuttle from the airport to La Fortuna cost?",
                a: "From SJO: $220 USD per vehicle for 1-5 passengers (Hyundai Staria), $260 for 6-9 (Toyota Hiace), $320 for 10-12 (Maxus V90). From LIR: $225 / $265 / $325. All prices include taxes, tolls, free child seats, and flight tracking.",
              },
              {
                q: "What if my flight is delayed?",
                a: "Flight tracking is included free. We monitor your flight in real-time and adjust pickup automatically. The driver waits at no extra cost — there's no time limit fee.",
              },
              {
                q: "Should I fly into SJO or LIR for La Fortuna?",
                a: "If La Fortuna is your only / first destination, SJO is more convenient because it has more flight options. If you're combining La Fortuna with the Guanacaste beaches (Tamarindo, Papagayo, Conchal), LIR makes more sense because the beaches are 1-1.5 h from LIR vs 4-5 h from SJO.",
              },
              {
                q: "What's the cheapest way to get from the airport to La Fortuna?",
                a: "Cheapest is the public bus ($5 per person, 4.5 h, transfer required in Ciudad Quesada). Next cheapest is a shared shuttle (~$55 per person, 4-5 h). For groups of 3+, a private shuttle ($220 for 1-5 pax) often costs the same as shared shuttles in total but is 1-2 h faster.",
              },
              {
                q: "Can the driver pick us up at any hotel near the airport?",
                a: "Yes. We do door-to-door — pickup at any hotel, Airbnb, or address near SJO/LIR or in San José, Alajuela, Heredia, Liberia, etc. Just tell us the address at booking.",
              },
              {
                q: "Do you provide child seats for the drive?",
                a: "Yes — infant (0-2 years, rear-facing), convertible (2-4 years), and booster (4-8 years) are all available at no charge. Costa Rican law requires child seats for kids under 12.",
              },
            ].map((f) => (
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
                Book your airport transfer to La Fortuna
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                Instant quote. Confirm with a card payment. Driver waiting at
                arrivals on the day of your flight.
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
                  WhatsApp Diego
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
