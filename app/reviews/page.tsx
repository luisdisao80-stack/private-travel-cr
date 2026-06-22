import { Metadata } from "next";
import Link from "next/link";
import { Star, ExternalLink, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import GoogleGLogo from "@/components/GoogleGLogo";
import RedditTestimonials from "@/components/RedditTestimonials";
import ReviewSchema from "@/components/ReviewSchema";
import { getGoogleReviews } from "@/lib/google-reviews";
import { reviews as curatedReviews } from "@/lib/reviews-data";
import { reviewStats } from "@/lib/reviews-data";
import { siteConfig } from "@/lib/site-config";

// Aggregator page that pulls together every public review source we
// have into one citation-ready URL. Why it exists:
//   1. **SEO authority.** A page titled "Private Travel CR reviews"
//      with quoted customer voices + schema.org Review markup is
//      exactly what Google + AI engines look for when answering
//      "is X reputable?".
//   2. **Conversion.** Closes the deal for the visitor on the fence.
//   3. **Outbound surface.** Linkable from emails, social bios, and
//      Reddit replies as a "see all our reviews" anchor.
//
// Re-uses the live Google fetch + the curated TripAdvisor/Google
// snapshot already powering the home page so we never drift out of
// sync.

export const metadata: Metadata = {
  title: "Reviews · Private Travel CR (5.0 ⭐ Google, TripAdvisor Travellers' Choice 2025)",
  description:
    "Real customer reviews of Private Travel Costa Rica — 200+ five-star Google reviews, TripAdvisor Travellers' Choice 2025 award, and unsolicited Reddit recommendations from travelers who used our private shuttle service.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Reviews of Private Travel Costa Rica",
    description:
      "200+ five-star Google reviews, TripAdvisor Travellers' Choice 2025, and Reddit recommendations — see what travelers say.",
    url: `${siteConfig.siteUrl}/reviews`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export const revalidate = 86400; // refresh once a day, same as the Google fetch

export default async function ReviewsPage() {
  const google = await getGoogleReviews();
  const liveRating = google.rating || reviewStats.google.rating;
  const liveCount = google.count || reviewStats.google.count;

  return (
    <>
      <Navbar />
      <ReviewSchema googleReviews={google.reviews} />

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pt-28 pb-20">
        {/* Hero — aggregate score */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-[0.18em] uppercase mb-5">
              <Star size={12} className="fill-amber-400" />
              Trusted by travelers
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-4">
              What travelers say about{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Private Travel CR
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-base md:text-lg leading-relaxed">
              Real reviews from real customers across Google, TripAdvisor, and Reddit — quoted in full, with links back to the original sources.
            </p>
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
            {/* Google */}
            <a
              href={reviewStats.google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10"
            >
              <GoogleGLogo size={36} className="mx-auto mb-3" />
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-3xl font-bold text-white">{liveRating.toFixed(1)}</div>
              <div className="text-sm text-gray-400 mt-1">
                {liveCount}+ Google reviews
              </div>
              <div className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
                Read on Google
                <ExternalLink size={11} />
              </div>
            </a>

            {/* TripAdvisor */}
            <a
              href="https://www.tripadvisor.com/Attraction_Review-g309226-d25394648-Reviews-Private_Travel_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="flex items-center justify-center mb-3 h-9">
                <Award size={36} className="text-emerald-400" />
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-emerald-400 text-emerald-400" />
                ))}
              </div>
              <div className="text-xl font-bold text-white">Travellers&apos; Choice</div>
              <div className="text-sm text-gray-400 mt-1">TripAdvisor 2025</div>
              <div className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
                Read on TripAdvisor
                <ExternalLink size={11} />
              </div>
            </a>

            {/* Reddit */}
            <a
              href="https://www.reddit.com/r/CostaRicaTravel/comments/1cexxjl/amazing_private_transportation/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="flex items-center justify-center mb-3 h-9">
                <span
                  aria-hidden="true"
                  className="inline-block w-9 h-9 rounded-full bg-[#FF4500]"
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              <div className="text-xl font-bold text-white">Recommended</div>
              <div className="text-sm text-gray-400 mt-1">r/CostaRicaTravel threads</div>
              <div className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
                Read on Reddit
                <ExternalLink size={11} />
              </div>
            </a>
          </div>
        </section>

        {/* Curated written reviews — TripAdvisor + Google quoted in full */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-3">
              Written reviews from Google &amp; TripAdvisor
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              Quoted verbatim with the original reviewer&apos;s name and date.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {curatedReviews.map((r) => (
              <article
                key={r.id}
                className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl p-6 md:p-7"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-wider uppercase text-gray-400">
                    {r.source === "google" ? "Google" : "TripAdvisor"}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-snug mb-2">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  &ldquo;{r.body}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-500">
                  <span>
                    <span className="text-gray-300 font-semibold">{r.author}</span>
                    {r.location ? ` · ${r.location}` : ""}
                  </span>
                  <span>{r.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Reddit testimonials — re-used from the home page */}
        <RedditTestimonials />

        {/* Ready to book CTA */}
        <section className="max-w-3xl mx-auto px-4 mt-16">
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 rounded-3xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to join them?
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Browse 1,200+ private shuttle routes across Costa Rica or get a custom quote on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/routes"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-colors shadow-2xl shadow-amber-500/30"
              >
                Browse routes
              </Link>
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
              >
                WhatsApp +506 8633-4133
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
