"use client";

import { Star, ExternalLink, Award } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { reviewStats } from "@/lib/reviews-data";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";

export default function Reviews() {
  const { t } = useLanguage();

  const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  const TripAdvisorLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#34E0A1" />
      <circle cx="8.5" cy="13" r="2.5" fill="#000" />
      <circle cx="15.5" cy="13" r="2.5" fill="#000" />
      <circle cx="8.5" cy="13" r="0.8" fill="#fff" />
      <circle cx="15.5" cy="13" r="0.8" fill="#fff" />
    </svg>
  );

  return (
    <section
      id="reseñas"
      className="relative py-20 md:py-28 px-4 overflow-hidden bg-black"
    >
      {/* Decorative gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-amber-500/30 bg-amber-500/5">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              {t.reviews.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {t.reviews.titlePart1}{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {t.reviews.titlePart2}
            </span>
          </h2>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1.5 mb-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 fill-amber-400 text-amber-400"
                strokeWidth={0}
              />
            ))}
            <span className="ml-2 text-2xl font-bold text-white">5.0</span>
          </div>

          {/* Platform stats: Google + TripAdvisor */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <a
              href={reviewStats.google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 transition-all"
            >
              <GoogleLogo />
              <span className="text-sm text-white/80">
                <span className="font-semibold">{reviewStats.google.count}+</span>{" "}
                {t.reviews.googleReviews}
              </span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </a>

            <a
              href={reviewStats.tripadvisor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 transition-all"
            >
              <TripAdvisorLogo />
              <span className="text-sm text-white/80">
                <span className="font-semibold">{reviewStats.tripadvisor.count}</span>{" "}
                {t.reviews.tripadvisorReviews}
              </span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </a>
          </div>

          {/* Travelers' Choice badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/40">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {t.reviews.travelersChoice} {reviewStats.tripadvisor.travelersChoiceYear}
            </span>
          </div>
        </div>

        {/* Live Google reviews — Elfsight widget. Auto-syncs with the same
            Google Business Profile as the legacy site, so new reviews
            appear here without us touching the code. */}
        <GoogleReviewsWidget />

        {/* CTAs finales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href={reviewStats.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/40 transition-all text-sm font-medium text-white"
          >
            <GoogleLogo />
            {t.reviews.readOnGoogle}
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </a>
          <a
            href={reviewStats.tripadvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/40 transition-all text-sm font-medium text-white"
          >
            <TripAdvisorLogo />
            {t.reviews.readOnTripadvisor}
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </a>
        </div>
      </div>
    </section>
  );
}
