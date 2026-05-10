import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRouteBySlug, getRelatedRoutes, getIndexableRoutes } from "@/lib/routes-db";
import { isPopularRoute } from "@/lib/popular-routes";
import RouteDetail from "@/components/RouteDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

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

  const title = "Private Shuttle " + route.origen + " to " + route.destino + " | From $" + route.precio1a6 + " USD";
  const description = route.journey_description || "Private shuttle service from " + route.origen + " to " + route.destino + ". Door-to-door, professional bilingual drivers. Starting at $" + route.precio1a6 + " USD.";

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      "private shuttle " + route.origen + " to " + route.destino,
      route.origen + " to " + route.destino,
      "private transfer " + route.destino,
      route.origen + " transportation",
      "Costa Rica private shuttle",
    ],
    openGraph: {
      title,
      description: description.substring(0, 160),
      type: "website",
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

  const related = await getRelatedRoutes(route.origen, slug, 4);
  return <RouteDetail route={route} related={related} basePath="/private-shuttle" />;
}
