// Emits an ItemList JSON-LD block where each item is a Restaurant entity.
// Google uses this for the "list of places" rich result on local-intent
// queries like "best restaurants in la fortuna" — exactly the query we're
// chasing rankings on. Each restaurant carries name, priceRange, cuisine,
// and an address rooted in La Fortuna / Alajuela / Costa Rica so the
// geo signal is unambiguous.

type Restaurant = {
  name: string;
  priceRange: string;
  cuisine: string;
  /** Optional override of the default La Fortuna locality. */
  locality?: string;
};

type Props = {
  restaurants: Restaurant[];
  /** Title of the list itself — surfaces in some rich results. */
  name?: string;
  /** Canonical URL of the article that owns this list. */
  url?: string;
};

export default function RestaurantListSchema({
  restaurants,
  name = "Best Restaurants in La Fortuna, Costa Rica",
  url,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(url ? { url } : {}),
    itemListElement: restaurants.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Restaurant",
        name: r.name,
        priceRange: r.priceRange,
        servesCuisine: r.cuisine,
        address: {
          "@type": "PostalAddress",
          addressLocality: r.locality ?? "La Fortuna",
          addressRegion: "Alajuela",
          addressCountry: "CR",
        },
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
