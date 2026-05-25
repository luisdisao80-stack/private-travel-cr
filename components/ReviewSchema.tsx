import { siteConfig } from "@/lib/site-config";
import { reviews as curatedReviews } from "@/lib/reviews-data";
import type { GoogleReview } from "@/lib/google-reviews";

// SchemaOrg.tsx already emits the LocalBusiness + aggregateRating; here we
// add a Graph of individual Review entities pointing back at the same
// business @id so the review bodies are exposed as structured data for
// search engines and AI crawlers (independent of the visible ReviewCards
// component that also renders them as HTML).
//
// Accepts the live Google reviews as a prop so the structured data stays
// in sync with what the visible cards render.

type Props = {
  googleReviews?: GoogleReview[];
};

export default function ReviewSchema({ googleReviews = [] }: Props) {
  const businessId = `${siteConfig.siteUrl}/#business`;

  const all = [
    ...googleReviews.map((g) => ({
      "@type": "Review" as const,
      itemReviewed: { "@id": businessId },
      author: { "@type": "Person" as const, name: g.authorName },
      datePublished: g.publishedAt,
      reviewRating: {
        "@type": "Rating" as const,
        ratingValue: g.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: g.text,
      publisher: { "@type": "Organization" as const, name: "Google" },
    })),
    ...curatedReviews.map((r) => ({
      "@type": "Review" as const,
      itemReviewed: { "@id": businessId },
      author: { "@type": "Person" as const, name: r.author },
      datePublished: r.date,
      reviewRating: {
        "@type": "Rating" as const,
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      name: r.title,
      reviewBody: r.body,
      publisher: {
        "@type": "Organization" as const,
        name: r.source === "google" ? "Google" : "TripAdvisor",
      },
    })),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": all,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
