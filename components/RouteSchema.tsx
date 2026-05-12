import { siteConfig } from "@/lib/site-config";
import type { Route } from "@/lib/types";
import { parseDurationToMinutes } from "@/lib/quote-helpers";

type Props = {
  route: Route;
  basePath: "/routes" | "/private-shuttle";
};

/**
 * JSON-LD schema for a single shuttle route landing page.
 *
 * Emits a TaxiService with nested Offer + AggregateRating. We use TaxiService
 * (vs generic Service) because Google has explicit support for it under
 * Local Business / Transportation. The AggregateRating mirrors the
 * site-wide Google rating so route pages inherit the trust signals.
 */
export default function RouteSchema({ route, basePath }: Props) {
  const pageUrl = `${siteConfig.siteUrl}${basePath}/${route.slug}`;
  const price = route.precio1a6 ?? 0;
  const durationMin = parseDurationToMinutes(route.duracion);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${pageUrl}#service`,
    name: `Private Shuttle ${route.origen} to ${route.destino}`,
    description:
      route.journey_description ||
      `Private door-to-door shuttle from ${route.origen} to ${route.destino}, Costa Rica. Professional bilingual driver, modern vehicle, fixed price.`,
    url: pageUrl,
    image: siteConfig.ogImage,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.siteUrl}/#business`,
      name: siteConfig.name,
      telephone: siteConfig.business.phoneE164,
      email: siteConfig.business.email,
      url: siteConfig.siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "Costa Rica",
    },
    serviceType: "Private shuttle transfer",
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().split("T")[0],
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 6,
        unitText: "passengers",
      },
    },
    ...(durationMin > 0
      ? {
          // ISO 8601 duration. e.g. 180 min → PT3H
          duration: `PT${Math.floor(durationMin / 60)}H${durationMin % 60}M`,
        }
      : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.business.rating.googleStars,
      reviewCount: siteConfig.business.rating.googleReviews,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
