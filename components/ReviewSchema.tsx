import { siteConfig } from "@/lib/site-config";
import { reviews } from "@/lib/reviews-data";

// The Elfsight widget renders Google reviews client-side, so AI crawlers and
// non-JS bots never see the actual review text. SchemaOrg.tsx already emits
// the LocalBusiness + aggregateRating; here we add a Graph of individual
// Review entities pointing back at the same business @id so the review
// bodies become indexable text.
export default function ReviewSchema() {
  const businessId = `${siteConfig.siteUrl}/#business`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": reviews.map((r) => ({
      "@type": "Review",
      itemReviewed: { "@id": businessId },
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      name: r.title,
      reviewBody: r.body,
      publisher: {
        "@type": "Organization",
        name: r.source === "google" ? "Google" : "TripAdvisor",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
