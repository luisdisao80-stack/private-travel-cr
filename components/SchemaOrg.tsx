import { siteConfig } from "@/lib/site-config";

export default function SchemaOrg() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.siteUrl}/#business`,
    name: siteConfig.name,
    alternateName: "PTCR",
    description: siteConfig.descriptionEN,
    url: siteConfig.siteUrl,
    telephone: siteConfig.business.phoneE164,
    email: siteConfig.business.email,
    image: siteConfig.ogImage,
    logo: siteConfig.logo,
    priceRange: "$$",
    foundingDate: `${siteConfig.business.foundedYear}-01-01`,
    founder: {
      "@type": "Person",
      name: siteConfig.business.founder,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.business.address.city,
      addressRegion: siteConfig.business.address.region,
      addressCountry: siteConfig.business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.business.coordinates.latitude,
      longitude: siteConfig.business.coordinates.longitude,
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Costa Rica",
      },
      {
        "@type": "City",
        name: "La Fortuna",
      },
      {
        "@type": "City",
        name: "Manuel Antonio",
      },
      {
        "@type": "City",
        name: "Monteverde",
      },
      {
        "@type": "City",
        name: "Tamarindo",
      },
      {
        "@type": "City",
        name: "Jaco",
      },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.business.rating.googleStars,
      reviewCount: siteConfig.business.rating.googleReviews,
      bestRating: 5,
      worstRating: 1,
    },
    award: siteConfig.business.awards,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.business.phoneE164,
      contactType: "customer service",
      areaServed: "CR",
      availableLanguage: ["English", "Spanish"],
    },
    sameAs: [
      siteConfig.business.whatsappUrl,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
