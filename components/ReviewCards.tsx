import { Star } from "lucide-react";
import { reviews } from "@/lib/reviews-data";

/**
 * Server-rendered grid of curated customer reviews.
 *
 * Replaces the 637 KB Elfsight Google Reviews widget. Same trust signal,
 * zero JavaScript, and the review text is in the initial HTML so it's
 * indexable by Google and citable by AI search engines (ChatGPT,
 * Perplexity, Google AI Overview) — Elfsight rendered everything
 * client-side so crawlers and AI bots never saw the actual quotes.
 *
 * To edit the list, see lib/reviews-data.ts.
 */
export default function ReviewCards() {
  const GoogleBadge = () => (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-300/80">
      <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
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
      Google
    </span>
  );

  const TripAdvisorBadge = () => (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
      <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#34E0A1" />
        <circle cx="8.5" cy="13" r="2.5" fill="#000" />
        <circle cx="15.5" cy="13" r="2.5" fill="#000" />
        <circle cx="8.5" cy="13" r="0.8" fill="#fff" />
        <circle cx="15.5" cy="13" r="0.8" fill="#fff" />
      </svg>
      TripAdvisor
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
      {reviews.map((r) => (
        <article
          key={r.id}
          className="flex flex-col rounded-2xl bg-gradient-to-br from-gray-900/70 to-black/70 border border-white/10 hover:border-amber-500/30 transition-colors p-6 backdrop-blur-sm"
        >
          {/* Source + date */}
          <div className="flex items-center justify-between mb-3">
            {r.source === "google" ? <GoogleBadge /> : <TripAdvisorBadge />}
            <span className="text-[10px] uppercase tracking-wider text-gray-500">
              {r.date}
            </span>
          </div>

          {/* 5 stars */}
          <div className="flex items-center gap-0.5 mb-3">
            {[...Array(r.rating)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-amber-400 text-amber-400"
                strokeWidth={0}
              />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">
            {r.title}
          </h3>

          {/* Body */}
          <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-6 flex-1">
            {r.body}
          </p>

          {/* Author */}
          <div className="pt-3 border-t border-white/5">
            <p className="text-sm font-semibold text-white">{r.author}</p>
            <p className="text-xs text-gray-500">{r.location}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
