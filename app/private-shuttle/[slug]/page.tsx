import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRouteBySlug, getRelatedRoutes, getIndexableRoutes } from "@/lib/routes-db";
import { getHotelsByArea } from "@/lib/hotels-db";
import { isPopularRoute } from "@/lib/popular-routes";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog";
import { getRelatedArticles } from "@/lib/related-articles";
import { displayLocation } from "@/lib/locations";
import RouteDetail from "@/components/RouteDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const routes = await getIndexableRoutes();
  return routes
    .filter((r) => isPopularRoute(r.origen, r.destino))
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route || !isPopularRoute(route.origen, route.destino)) {
    return { title: "Route not found", robots: { index: false, follow: false } };
  }

  // Friendly display names ("San Jose Airport" instead of "SJO - Juan
  // Santamaria Int. Airport" — same rename table used across the site).
  // Diego 2026-07-02: matches how customers actually type the query
  // and gets us out of the low-search variants Google was showing us
  // for. The airport codes SJO/LIR still appear in the meta description
  // as a secondary hint for the visitors who know them.
  const originName = displayLocation(route.origen);
  const destName = displayLocation(route.destino);

  // Airport-code hint in parenthesis when either endpoint is an airport,
  // so people who search by code (a big chunk of the query volume) still
  // see the match in the SERP snippet.
  const originCode = /^SJO\b/.test(route.origen)
    ? " (SJO)"
    : /^LIR\b/.test(route.origen)
      ? " (LIR)"
      : "";
  const destCode = /^SJO\b/.test(route.destino)
    ? " (SJO)"
    : /^LIR\b/.test(route.destino)
      ? " (LIR)"
      : "";

  // Title format: "<Origin> to <Destination> Shuttle from $XXX | Private
  // Transfer 2026". Under 70 chars for most routes so Google shows the
  // full title in the SERP. Year appended for freshness signal.
  const title = `${originName}${originCode} to ${destName}${destCode} Shuttle from $${route.precio1a6} | Private Transfer 2026`;

  // Description leads with the same price anchor and adds trust signals
  // (bilingual driver, door-to-door, 5.0 rating).
  const description =
    route.journey_description ||
    `Private shuttle from ${originName}${originCode} to ${destName}${destCode} from $${route.precio1a6} USD. Door-to-door, bilingual driver, free child seats, flight tracking. ⭐ 5.0 · 200+ reviews.`;

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      `${originName} to ${destName}`,
      `${originName} to ${destName} shuttle`,
      `${originName} to ${destName} private transfer`,
      `${route.origen} to ${route.destino}`,
      `private shuttle ${destName}`,
      `${destName} airport transfer`,
      "Costa Rica private shuttle",
      "Costa Rica private transfer",
    ],
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${siteConfig.siteUrl}/private-shuttle/${slug}`,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      alternateLocale: "es_CR",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `Private shuttle from ${originName} to ${destName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: [siteConfig.ogImage],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/private-shuttle/" + slug },
  };
}

export default async function PrivateShuttleRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();
  // Only popular routes are valid under /private-shuttle/.
  if (!isPopularRoute(route.origen, route.destino)) notFound();

  const [related, destinationHotels] = await Promise.all([
    getRelatedRoutes(route.origen, slug, 4),
    getHotelsByArea(route.destino, 6),
  ]);
  // Blog cards under "Plan your trip" — read off-disk synchronously, no
  // need for a Promise.all slot. Top 3 matches by lib/related-articles.
  const relatedArticles = getRelatedArticles(
    { origen: route.origen, destino: route.destino },
    getAllPosts(),
    3,
  );
  return (
    <RouteDetail
      route={route}
      related={related}
      destinationHotels={destinationHotels}
      relatedArticles={relatedArticles}
      basePath="/private-shuttle"
    />
  );
}
