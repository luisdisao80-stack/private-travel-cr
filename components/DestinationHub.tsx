import Link from "next/link";
import { MapPin, Clock, ArrowRight, HelpCircle, Star, Check } from "lucide-react";
import type { Route, RouteFAQ } from "@/lib/types";
import type { Destination } from "@/lib/destinations";
import { isPopularRoute } from "@/lib/popular-routes";
import { displayLocation } from "@/lib/locations";
import { siteConfig } from "@/lib/site-config";
import { getReviewsForPlace } from "@/lib/reviews-data";
import { getGoogleReviews } from "@/lib/google-reviews";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";
import RouteTrust from "@/components/RouteTrust";
import { Quote } from "lucide-react";
import Price from "@/components/Price";

// Internal links to each incoming route use /private-shuttle/[slug] when the
// pair is popular; otherwise /routes/[slug] — same rule RouteDetail uses.
function routeHref(route: Route): string {
  return isPopularRoute(route.origen, route.destino)
    ? `/private-shuttle/${route.slug}`
    : `/routes/${route.slug}`;
}

function buildHubFAQs(dest: Destination, fromPrice: number | null): RouteFAQ[] {
  const list: RouteFAQ[] = [];
  if (fromPrice) {
    list.push({
      question: `How much is a private shuttle to ${dest.name}?`,
      answer: `Private shuttles to ${dest.name} start at $${fromPrice} USD per vehicle (1-5 passengers). The price is per vehicle, not per person — your whole group rides together for one flat rate. Exact pricing depends on where you're coming from; see the full list of routes above.`,
    });
  }
  list.push(
    {
      question: `Is the shuttle to ${dest.name} private?`,
      answer: `Yes. Every Private Travel CR transfer to ${dest.name} is fully private — just your group, no shared seats with strangers. The price covers the whole vehicle door-to-door, with a professional bilingual driver, free WiFi, bottled water, free child seats on request, and full insurance.`,
    },
    {
      question: `Do you offer door-to-door pickup for ${dest.name}?`,
      answer: dest.isAirport
        ? `Yes — we pick up at any hotel, villa, or address on your itinerary and drop you right at the ${dest.name} terminal, timed to your flight with a buffer for traffic.`
        : `Yes — we pick up anywhere (airport, hotel, Airbnb, or private villa) and drop you at your exact address in the ${dest.name} area. We confirm the pickup point 24 hours before your trip.`,
    }
  );
  return list;
}

export default async function DestinationHub({
  destination,
  routes,
}: {
  destination: Destination;
  /** Indexable routes INTO this destination, cheapest first. */
  routes: Route[];
}) {
  const fromPrice = routes.length > 0 ? routes[0].precio1a6 ?? null : null;
  const faqs = buildHubFAQs(destination, fromPrice);

  // Destination-focused social proof: reviews that name this place, with a
  // graceful fallback to the strongest general reviews.
  const google = await getGoogleReviews();
  const { reviews, placeSpecific } = getReviewsForPlace(destination.dbName, google.reviews);

  const whatsappUrl =
    "https://wa.me/50686334133?text=" +
    encodeURIComponent(
      `Hello! I'd like a private shuttle to ${destination.name}, Costa Rica.`
    );

  const heading = destination.isAirport
    ? `Private Shuttle to ${destination.name}`
    : `Private Shuttle to ${destination.name}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Routes", url: "/routes" },
          { name: `Shuttle to ${destination.name}`, url: `/shuttle-to/${destination.slug}` },
        ]}
      />
      <FAQSchema faqs={faqs} />
      <div className="max-w-5xl mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          {" / "}
          <Link href="/routes" className="hover:text-amber-400">Routes</Link>
          {" / "}
          <span className="text-gray-300">Shuttle to {destination.name}</span>
        </nav>

        <section className="mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {destination.isAirport ? "AIRPORT TRANSFERS" : "DESTINATION HUB"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {heading}
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-3xl">{destination.tagline}</p>
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" strokeWidth={0} />
                ))}
              </span>
              <span className="font-semibold text-white">
                {siteConfig.business.rating.googleStars.toFixed(1)}
              </span>
              <span className="text-gray-400">
                ({siteConfig.business.rating.googleReviews}+ reviews)
              </span>
            </span>
            {fromPrice ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">from</span>
                <span className="font-semibold text-amber-400">
                  <Price usd={fromPrice} /> USD
                </span>
              </span>
            ) : null}
          </div>
        </section>

        <section className="mb-10">
          <p className="text-gray-300 leading-relaxed text-lg mb-6 max-w-3xl">
            {destination.intro}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {destination.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-gray-300">
                <Check size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </section>

        {routes.length > 0 ? (
          <section className="mb-12" aria-labelledby="hub-routes-heading">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <MapPin size={20} className="text-amber-400" />
              </div>
              <h2 id="hub-routes-heading" className="text-2xl font-bold text-white">
                {destination.isAirport
                  ? `Departure shuttles to ${destination.name}`
                  : `All the ways to reach ${destination.name}`}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {destination.isAirport
                ? `Book a private transfer to ${destination.name} from anywhere in Costa Rica. Tap any route for full pricing and details.`
                : `Private door-to-door shuttles to ${destination.name} from every major town and airport. Tap any route for full pricing and details.`}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {routes.map((r) => (
                <Link
                  key={r.id}
                  href={routeHref(r)}
                  className="group flex items-center justify-between bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                >
                  <div className="min-w-0 pr-4">
                    <div className="text-white font-medium truncate">
                      {displayLocation(r.origen)}{" "}
                      <span className="text-amber-400">→</span>{" "}
                      {displayLocation(r.destino)}
                    </div>
                    {r.duracion ? (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-amber-400/70" />
                        {r.duracion}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-amber-400 font-bold"><Price usd={r.precio1a6 ?? 0} /></div>
                    <ArrowRight size={16} className="text-gray-500 ml-auto mt-1 group-hover:text-amber-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Why-us credibility block — licensing, rating, flight tracking,
            child seats, fleet, local business. */}
        <RouteTrust />

        {reviews.length > 0 ? (
          <section className="mb-12" aria-labelledby="hub-reviews-heading">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Star size={20} className="fill-amber-400 text-amber-400" strokeWidth={0} />
              </div>
              <h2 id="hub-reviews-heading" className="text-2xl font-bold text-white">
                {placeSpecific
                  ? `What travelers say about ${destination.name}`
                  : "What our travelers say"}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Rated 5.0 stars across 200+ Google and TripAdvisor reviews.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col rounded-2xl bg-gradient-to-br from-gray-900/70 to-black/70 border border-white/10 p-6"
                >
                  <Quote size={22} className="text-amber-400/60 mb-3" />
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                  {r.title ? (
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">{r.title}</h3>
                  ) : null}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{r.body}</p>
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <p className="text-sm font-semibold text-white">{r.author}</p>
                    <p className="text-xs text-gray-500">
                      {r.location} · {r.source === "google" ? "Google" : "TripAdvisor"} · {r.date}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-12" aria-labelledby="hub-faq-heading">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <HelpCircle size={20} className="text-amber-400" />
            </div>
            <h2 id="hub-faq-heading" className="text-2xl font-bold text-white">
              Frequently asked about shuttles to {destination.name}
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
                <div className="px-5 pb-5 text-gray-300 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to book your shuttle to {destination.name}?
          </h2>
          <p className="text-gray-300 mb-6">
            Get an instant price and reserve door-to-door in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl transition"
            >
              Get a Price
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition"
            >
              WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
