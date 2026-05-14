import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getRouteBySlug, getRelatedRoutes, getIndexableRoutes } from "@/lib/routes-db";
import { isPopularRoute } from "@/lib/popular-routes";
import { siteConfig } from "@/lib/site-config";
import RouteDetail from "@/components/RouteDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  // Popular routes are statically generated under /private-shuttle/[slug] instead;
  // exclude them here so /routes/[slug] only pre-renders the long tail.
  const routes = await getIndexableRoutes();
  return routes
    .filter((r) => !isPopularRoute(r.origen, r.destino))
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return { title: "Route not found" };

  // Popular routes redirect to /private-shuttle/[slug]; the canonical there
  // will be the indexed one. Mark the /routes/ variant noindex defensively in
  // case Google requests it before the redirect lands.
  if (isPopularRoute(route.origen, route.destino)) {
    return {
      title: "Redirecting…",
      robots: { index: false, follow: true },
      alternates: { canonical: "/private-shuttle/" + slug },
    };
  }

  const title = "Private Shuttle " + route.origen + " to " + route.destino + " | $" + route.precio1a6 + " USD";
  const description = route.journey_description || "Private shuttle service from " + route.origen + " to " + route.destino + ". Door-to-door, professional bilingual drivers. Starting at $" + route.precio1a6 + " USD.";

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      route.origen + " to " + route.destino,
      "private shuttle " + route.destino,
      route.origen + " transportation",
      "Costa Rica shuttle",
      "private transfer Costa Rica",
    ],
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${siteConfig.siteUrl}/routes/${slug}`,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      alternateLocale: "es_CR",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `Private shuttle from ${route.origen} to ${route.destino}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: [siteConfig.ogImage],
    },
    robots: route.is_indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: "/routes/" + slug },
  };
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  // 308 permanent redirect to the SEO landing page for popular pairs.
  if (isPopularRoute(route.origen, route.destino)) {
    permanentRedirect("/private-shuttle/" + slug);
  }

  const related = await getRelatedRoutes(route.origen, slug, 4);
  return <RouteDetail route={route} related={related} basePath="/routes" />;
}
