import Link from "next/link";
import { MapPin, Clock, Users, Car, ArrowRight, HelpCircle, Building2, Star } from "lucide-react";
import type { Route, RouteFAQ, Hotel } from "@/lib/types";
import type { BlogPostMeta } from "@/lib/blog";
import { isPopularRoute } from "@/lib/popular-routes";
import { isAirport } from "@/lib/quote-helpers";
import { getDestinationByDbName } from "@/lib/destinations";
import { displayLocation } from "@/lib/locations";
import { siteConfig } from "@/lib/site-config";
import RouteSchema from "@/components/RouteSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";
import RelatedArticles from "@/components/RelatedArticles";
import RouteReviews from "@/components/RouteReviews";
import RouteTrust from "@/components/RouteTrust";
import Price from "@/components/Price";

// Generic auto-FAQs that work for every route. Manual route.faqs land
// above these (they're more route-specific = higher SEO value).
// `originName`/`destName` are the friendly, search-aligned display names
// (e.g. "San Jose Airport") so both the visible Q&As and the FAQ schema
// match how travelers actually phrase these queries.
function buildAutoFAQs(route: Route, originName: string, destName: string): RouteFAQ[] {
  const baseList: RouteFAQ[] = [
    {
      question: `How much does a private shuttle from ${originName} to ${destName} cost?`,
      answer: `Private shuttle from ${originName} to ${destName} starts at $${route.precio1a6} USD per vehicle (1-5 passengers). The price is per vehicle, not per person — everyone in your group travels together for the same flat rate. Larger vehicles for 6-18 passengers are available at higher tiers.`,
    },
  ];
  if (route.duracion) {
    baseList.push({
      question: `How long does the drive from ${originName} to ${destName} take?`,
      answer: `The drive from ${originName} to ${destName} takes approximately ${route.duracion}. Travel times can vary slightly depending on traffic, weather, and road conditions. Our drivers monitor conditions in real time to choose the fastest safe route.`,
    });
  }
  baseList.push(
    {
      question: `Is the shuttle from ${originName} to ${destName} private?`,
      answer: `Yes. Every Private Travel CR shuttle is fully private — you ride only with your group, no shared seats with strangers. The price covers the entire vehicle door-to-door, including a professional bilingual driver, free WiFi, bottled water, free child seats on request, and full insurance.`,
    },
    {
      question: `Do you pick up at any address in ${originName}?`,
      answer: `Yes, we offer door-to-door pickup anywhere in ${originName} — hotels, Airbnbs, private villas, or any specific address you give us at booking. We confirm the exact pickup location 24 hours before your trip.`,
    }
  );

  // Airport-specific FAQ: only shown when one endpoint is SJO or LIR, since
  // "flight delayed" only makes sense on airport-pickup routes. Uses the
  // exact origen/destino DB values (not the display names) because
  // isAirport() matches against the raw Supabase strings.
  const airportName = isAirport(route.origen) ? originName : isAirport(route.destino) ? destName : null;
  if (airportName) {
    baseList.push({
      question: `What happens if my flight at ${airportName} is delayed or cancelled?`,
      answer: `Don't worry — when you book, we ask for your flight number and monitor it in real time. If your flight is delayed, we automatically adjust your pickup time at no extra cost. If it's cancelled, we reschedule your shuttle for the new date, free of charge.`,
    });
  }

  return baseList;
}

function parsePOI(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Internal links to related routes use /private-shuttle/[slug] when the related
// route is among the popular pairs; otherwise fall back to /routes/[slug].
function routeHref(route: Route): string {
  return isPopularRoute(route.origen, route.destino)
    ? `/private-shuttle/${route.slug}`
    : `/routes/${route.slug}`;
}

type Props = {
  route: Route;
  related: Route[];
  /** Hotels at the destination — for cross-cluster internal linking
   *  ("Top hotels in <destino>"). Optional so the component still works
   *  when the caller doesn't supply them. */
  destinationHotels?: Hotel[];
  /** Blog posts to surface as "Plan your trip" cards. Picked by
   *  lib/related-articles.getRelatedArticles in the parent page so the
   *  pairing logic stays out of the view layer. Optional — the section
   *  is hidden if empty. */
  relatedArticles?: BlogPostMeta[];
  /** Where `basePath` controls breadcrumb + Other-routes-from links. */
  basePath: "/routes" | "/private-shuttle";
};

export default function RouteDetail({
  route,
  related,
  destinationHotels = [],
  relatedArticles = [],
  basePath,
}: Props) {
  const points = parsePOI(route.points_of_interest);

  // Friendly, search-aligned display names ("San Jose Airport" instead of
  // "SJO - Juan Santamaria Int. Airport") for every VISIBLE label + heading
  // + FAQ + schema. The raw route.origen/route.destino values are kept ONLY
  // in the /book links and quote params below, because the booking system
  // matches against the exact DB names. (Diego 2026-08: the page metadata
  // title was already switched to friendly names in July; this brings the
  // H1, breadcrumb, section headings, FAQs and schema in line so the whole
  // page reinforces the "san jose airport to la fortuna" query cluster.)
  const originName = displayLocation(route.origen);
  const destName = displayLocation(route.destino);

  const whatsappUrl =
    "https://wa.me/50686334133?text=" +
    encodeURIComponent(
      "Hello! I'm interested in a private shuttle from " + originName + " to " + destName + "."
    );

  // Manual FAQs (from Supabase routes.faqs JSONB) win the top slots —
  // they're route-specific and more valuable for long-tail SEO. Auto-FAQs
  // fill in below so every route page still ships with at least 3-4 Q&As.
  const manualFAQs = Array.isArray(route.faqs) ? route.faqs : [];
  const allFAQs: RouteFAQ[] = [...manualFAQs, ...buildAutoFAQs(route, originName, destName)];

  // If this route's destination has a curated hub page, link to it so the
  // visitor (and Google) can jump to "every way to reach <destination>".
  const destinationHub = getDestinationByDbName(route.destino);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
      <RouteSchema route={route} basePath={basePath} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Routes", url: "/routes" },
          {
            name: `${originName} to ${destName}`,
            url: `${basePath}/${route.slug}`,
          },
        ]}
      />
      <FAQSchema faqs={allFAQs} />
      <div className="max-w-5xl mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          {" / "}
          <Link href={basePath === "/private-shuttle" ? "/routes" : "/routes"} className="hover:text-amber-400">
            Routes
          </Link>
          {" / "}
          <span className="text-gray-300">{originName} to {destName}</span>
        </nav>

        <section className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">PRIVATE SHUTTLE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {originName} <span className="text-amber-400">to</span> {destName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
            {/* Rating badge — 5.0 stars + review count. Puts the trust
                signal in the hero where every visitor sees it, matching
                how competitors lead their route pages. Visible only; the
                machine-readable aggregateRating lives in the site-wide
                LocalBusiness schema (RouteSchema deliberately omits it). */}
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
            {route.duracion ? (
              <span className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-amber-400" />
                {route.duracion}
              </span>
            ) : null}
            <span className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-amber-400" />
              1-12 passengers
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Car size={16} className="text-amber-400" />
              Door-to-door
            </span>
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            How much does a private shuttle from {originName} to {destName} cost?
          </h2>
          {/* Vehicle/PAX tier cards. Clarity recordings (2026-06-03) showed
              25% of visitors clicking these cards expecting them to be
              interactive — they'd click 'Hyundai Staria', see nothing
              happen, then bounce. Wrapping each tier in a Link to the
              booking flow turns every one of those misclicks into a
              real conversion path. */}
          {/* Each tier card now passes `adults=N` to the booking page so
              the calculator initializes with a passenger count that
              actually matches the tier's price. Before, clicking the
              "6-9 PAX · Toyota Hiace $375" card landed the visitor at
              the calculator with 2 passengers (the default), which
              showed the $330 Staria price — looked like a bait-and-
              switch and confused buyers. The values picked here are
              the lower bound of each tier so the calculator stays in
              the right pricing bracket. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Link
              href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&adults=2&direct=1`}
              className="bg-gray-900/50 rounded-xl p-4 text-center hover:bg-gray-900/70 hover:ring-2 hover:ring-amber-500/40 transition cursor-pointer"
            >
              <div className="bg-white rounded-lg p-2 mb-3 h-24 flex items-center justify-center">
                <img src="/staria.webp" alt="Hyundai Staria" width={200} height={120} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-xs text-gray-400 mb-1">1-5 PAX · Hyundai Staria</div>
              <div className="text-2xl font-bold text-amber-400"><Price usd={route.precio1a6 ?? 0} /></div>
            </Link>
            {route.precio7a9 ? (
              <Link
                href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&adults=6&direct=1`}
                className="bg-gray-900/50 rounded-xl p-4 text-center hover:bg-gray-900/70 hover:ring-2 hover:ring-amber-500/40 transition cursor-pointer"
              >
                <div className="bg-white rounded-lg p-2 mb-3 h-24 flex items-center justify-center">
                  <img src="/hiace.png" alt="Toyota Hiace" width={200} height={120} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-xs text-gray-400 mb-1">6-9 PAX · Toyota Hiace</div>
                <div className="text-2xl font-bold text-amber-400"><Price usd={route.precio7a9 ?? 0} /></div>
              </Link>
            ) : null}
            {route.precio10a12 ? (
              <Link
                href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&adults=10&direct=1`}
                className="bg-gray-900/50 rounded-xl p-4 text-center hover:bg-gray-900/70 hover:ring-2 hover:ring-amber-500/40 transition cursor-pointer"
              >
                <div className="bg-white rounded-lg p-2 mb-3 h-24 flex items-center justify-center">
                  <img src="/maxus-v90.webp" alt="Maxus V90" width={200} height={120} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-xs text-gray-400 mb-1">10-12 PAX · Maxus V90</div>
                <div className="text-2xl font-bold text-amber-400"><Price usd={route.precio10a12 ?? 0} /></div>
              </Link>
            ) : null}
            {route.precio13a18 ? (
              <Link
                href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&adults=13&direct=1`}
                className="bg-gray-900/50 rounded-xl p-4 text-center sm:col-span-2 md:col-span-3 hover:bg-gray-900/70 hover:ring-2 hover:ring-amber-500/40 transition cursor-pointer"
              >
                <div className="text-xs text-gray-400 mb-1">13-18 PAX</div>
                <div className="text-2xl font-bold text-amber-400"><Price usd={route.precio13a18 ?? 0} /></div>
              </Link>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mb-6">Prices in USD per vehicle. All-inclusive: A/C, WiFi, water, child seats, door-to-door.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&direct=1`}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl text-center transition"
            >
              Book Now
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-center transition">
              WhatsApp
            </a>
          </div>
        </section>

        {/* Why-us credibility block right under the price: licensing,
            rating, flight tracking, child seats, fleet, local business.
            Reinforces the buying decision before the visitor scrolls. */}
        <RouteTrust />

        {/* Social proof right after the price — reviews that mention this
            exact route's endpoints when we have them, top general reviews
            otherwise. Highest-impact spot for conversion: the visitor sees
            the price, then real travelers vouching for this trip. */}
        <RouteReviews
          origen={route.origen}
          destino={route.destino}
          originName={originName}
          destName={destName}
        />

        {route.journey_description ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              How is the drive from {originName} to {destName}?
            </h2>
            <p className="text-gray-300 leading-relaxed">{route.journey_description}</p>
          </section>
        ) : null}

        {points.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              What can you see between {originName} and {destName}?
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {points.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-300">
                  <MapPin size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {route.road_type ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              How are the road conditions from {originName} to {destName}?
            </h2>
            <p className="text-gray-300 leading-relaxed">{route.road_type}</p>
          </section>
        ) : null}

        {route.traveler_tip ? (
          <section className="mb-10 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Traveler Tip</h3>
            <p className="text-gray-300 leading-relaxed">{route.traveler_tip}</p>
          </section>
        ) : null}

        {route.family_info ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Is the shuttle from {originName} to {destName} family-friendly?
            </h2>
            <p className="text-gray-300 leading-relaxed">{route.family_info}</p>
          </section>
        ) : null}

        {route.budget_tip ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Budget breakdown</h2>
            <p className="text-gray-300 leading-relaxed">{route.budget_tip}</p>
          </section>
        ) : null}

        {route.google_maps_note ? (
          <section className="mb-10 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">About travel times</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{route.google_maps_note}</p>
          </section>
        ) : null}

        {route.late_night_info ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Is the shuttle from {originName} to {destName} available 24/7?
            </h2>
            <p className="text-gray-300 leading-relaxed">{route.late_night_info}</p>
          </section>
        ) : null}

        {route.local_recommendation ? (
          <section className="mb-10 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Local insider tip</h3>
            <p className="text-gray-300 leading-relaxed">{route.local_recommendation}</p>
          </section>
        ) : null}

        {/* FAQ section — visible Q&As (manual + auto). Native <details> so
            every answer is in SSR HTML, indexable by Google, and works
            without JS. */}
        <section className="mb-12" aria-labelledby="route-faq-heading">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <HelpCircle size={20} className="text-amber-400" />
            </div>
            <h2 id="route-faq-heading" className="text-2xl font-bold text-white">
              Frequently asked about {originName} → {destName}
            </h2>
          </div>
          <div className="space-y-3">
            {allFAQs.map((faq, i) => (
              <details
                key={i}
                // First Q&A opens by default so the page lands with visible
                // content; the rest stay collapsed but in the DOM.
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

        {/* Hotels at destination — cross-cluster internal linking from
            the route topical cluster into the hotel topical cluster.
            Helps Google understand the topical relationship + gives the
            booker a logical next click (where to stay). */}
        {destinationHotels.length > 0 ? (
          <section className="mb-12" aria-labelledby="dest-hotels-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Building2 size={20} className="text-amber-400" />
              </div>
              <h2 id="dest-hotels-heading" className="text-2xl font-bold text-white">
                Top hotels in {destName}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              We pick up at any of these properties. Click for shuttle pricing from {destName} to anywhere in Costa Rica.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {destinationHotels.map((h) => (
                <Link
                  key={h.id}
                  href={`/hotels/${h.slug}`}
                  className="group flex items-center justify-between bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                >
                  <div className="min-w-0 pr-4 flex-1">
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

        {destinationHub ? (
          <section className="mb-12">
            <Link
              href={`/shuttle-to/${destinationHub.slug}`}
              className="group flex items-center justify-between bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-6 transition"
            >
              <div className="pr-4">
                <div className="text-white font-bold text-lg mb-1">
                  See every shuttle to {destName}
                </div>
                <div className="text-sm text-gray-400">
                  Compare all routes and prices into {destName} on one page.
                </div>
              </div>
              <ArrowRight
                size={20}
                className="text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Other routes from {originName}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={routeHref(r)}
                  className="group flex items-center justify-between bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition"
                >
                  <div>
                    <div className="text-xs text-amber-400 mb-1">{r.duracion}</div>
                    <div className="text-white font-medium">{displayLocation(r.destino)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold"><Price usd={r.precio1a6 ?? 0} /></div>
                    <ArrowRight size={16} className="text-gray-500 ml-auto mt-1 group-hover:text-amber-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Internal blog linking: surfaces 2-3 articles relevant to this
            route (exact pair match wins, falls back to destination/origin
            keywords and finally to general guides). Sends researchers
            deeper into the site, lifts time-on-page, and gives Google
            more topical context for ranking the route page. */}
        <RelatedArticles posts={relatedArticles} heading="Plan your trip" />

        <section className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to book?</h2>
          <p className="text-gray-300 mb-6">Get your private shuttle from {originName} to {destName} starting at ${route.precio1a6} USD</p>
          <Link
            href={`/book?from=${encodeURIComponent(route.origen)}&to=${encodeURIComponent(route.destino)}&direct=1`}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl transition"
          >
            Book Now
          </Link>
        </section>
      </div>
    </main>
  );
}
