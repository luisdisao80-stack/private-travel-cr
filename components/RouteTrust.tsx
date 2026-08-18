import { ShieldCheck, Star, Clock, Baby, Car, Heart } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * "Why book with us" trust block for route pages.
 *
 * The homepage answers the buyer-trust questions with TrustStrip +
 * WhyUsComparison, but those are client components (framer-motion) and
 * live only on the home. Route pages are the actual buying moment, yet
 * they had no consolidated credibility block. This is a server-rendered
 * (zero extra JS) equivalent that reinforces the decision right next to
 * the price: licensing, rating, flight tracking, child seats, fleet, and
 * the local-family-business angle competitors can't claim.
 *
 * English-only to match the rest of RouteDetail's copy.
 */

const badges = [
  {
    Icon: ShieldCheck,
    title: "Licensed & insured",
    sub: "ICT-certified tourist transport (#3205-2022), fully insured.",
  },
  {
    Icon: Star,
    title: `${siteConfig.business.rating.googleStars.toFixed(1)} star rating`,
    sub: `${siteConfig.business.rating.googleReviews}+ reviews on Google & TripAdvisor.`,
  },
  {
    Icon: Clock,
    title: "24/7 flight tracking",
    sub: "We watch your flight and adjust the pickup — even at 2 AM.",
  },
  {
    Icon: Baby,
    title: "Free child seats",
    sub: "Infant and booster seats on request, at no extra charge.",
  },
  {
    Icon: Car,
    title: "Modern private fleet",
    sub: "A/C, free WiFi and bottled water in every vehicle.",
  },
  {
    Icon: Heart,
    title: "Local family business",
    sub: "Costa Rican owner-operated since 2022 — not a faceless agency.",
  },
];

export default function RouteTrust() {
  return (
    <section className="mb-12" aria-labelledby="route-trust-heading">
      <h2 id="route-trust-heading" className="text-2xl font-bold text-white mb-6">
        Why book with Private Travel CR?
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(({ Icon, title, sub }) => (
          <div
            key={title}
            className="flex items-start gap-3 bg-gray-900/50 border border-white/5 rounded-xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="text-white font-semibold leading-tight mb-1">{title}</div>
              <div className="text-sm text-gray-400 leading-snug">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
