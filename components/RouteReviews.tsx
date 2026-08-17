import { Star, Quote } from "lucide-react";
import { getRouteReviews } from "@/lib/reviews-data";

/**
 * Route-page social proof.
 *
 * Surfaces the curated 5-star reviews that actually mention this route's
 * endpoints (via getRouteReviews). When at least one review names this
 * origin/destination we say so in the heading ("What travelers say about
 * <origin> → <destination>"); otherwise we fall back to the strongest
 * general reviews under a neutral heading so every route page still carries
 * real social proof next to the price.
 *
 * NOTE: rendered as visible content only — we deliberately do NOT emit
 * Review/AggregateRating JSON-LD here. Same reason RouteSchema avoids it:
 * Google rejects those ratings when nested under a TaxiService parent
 * (Search Console "Invalid object type"). The site-wide LocalBusiness schema
 * already carries the 5.0 aggregate rating on every page.
 */
export default function RouteReviews({
  origen,
  destino,
  originName,
  destName,
}: {
  /** Raw DB names — matched against each review's `places` tags. */
  origen: string;
  destino: string;
  /** Friendly display names for the heading. */
  originName: string;
  destName: string;
}) {
  const { reviews, routeSpecific } = getRouteReviews(origen, destino);
  if (reviews.length === 0) return null;

  return (
    <section className="mb-12" aria-labelledby="route-reviews-heading">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Star size={20} className="fill-amber-400 text-amber-400" strokeWidth={0} />
        </div>
        <h2 id="route-reviews-heading" className="text-2xl font-bold text-white">
          {routeSpecific
            ? `What travelers say about ${originName} → ${destName}`
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
  );
}
