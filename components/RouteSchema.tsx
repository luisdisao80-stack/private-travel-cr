import { siteConfig } from "@/lib/site-config";
import type { Route } from "@/lib/types";
import { parseDurationToMinutes } from "@/lib/quote-helpers";
import { displayLocation } from "@/lib/locations";

type Props = {
  route: Route;
  basePath: "/routes" | "/private-shuttle";
};

/**
 * JSON-LD schema for a single shuttle route landing page.
 *
 * Emits a TaxiService with nested Offer. We use TaxiService (vs generic
 * Service) because Google has explicit support for it under Local Business
 * / Transportation.
 *
 * NOTE: we do NOT embed AggregateRating here. Google's "Review snippets"
 * rich result only accepts AggregateRating under a fixed list of parents
 * (Book, Course, Event, HowTo, LocalBusiness, MediaObject, Movie, Product,
 * Recipe, SoftwareApplication). TaxiService is NOT on that list and
 * Search Console reports it as "Invalid object type for field
 * <parent_node>". The site-wide LocalBusiness in SchemaOrg already carries
 * the rating on every page, so the trust signal is preserved.
 */
export default function RouteSchema({ route, basePath }: Props) {
  const pageUrl = `${siteConfig.siteUrl}${basePath}/${route.slug}`;
  const price = route.precio1a6 ?? 0;
  const durationMin = parseDurationToMinutes(route.duracion);

  // Friendly, search-aligned names ("San Jose Airport" not "SJO - Juan
  // Santamaria Int. Airport") so the schema Google reads matches how people
  // actually query. Same rename table used in the page metadata + visible UI.
  const originName = displayLocation(route.origen);
  const destName = displayLocation(route.destino);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": `${pageUrl}#service`,
    name: `Private Shuttle ${originName} to ${destName}`,
    description:
      route.journey_description ||
      `Private door-to-door shuttle from ${originName} to ${destName}, Costa Rica. Professional bilingual driver, modern vehicle, fixed price.`,
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
