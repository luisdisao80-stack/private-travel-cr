import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllPostSlugs } from "@/lib/blog";
import { getIndexableRoutes } from "@/lib/routes-db";
import { getIndexableHotelSlugs } from "@/lib/hotels-db";
import { getIndexableTourSlugs } from "@/lib/tours-db";
import { isPopularRoute } from "@/lib/popular-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/fleet`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/routes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/hotels`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tours`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    // Exact-match SEO landing pages — added 2026-06-23 to capture
    // non-branded query clusters identified in GSC. Priority 0.95
    // (just below homepage) because each one targets a query cluster
    // worth 200-800 impressions/month.
    { url: `${baseUrl}/private-transportation-costa-rica`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/airport-to-la-fortuna`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    // /book is the booking wizard — transactional, no canonical content of
    // its own. SEO entries belong on /private-shuttle/[slug] and /routes/[slug].
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogSlugs = getAllPostSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Popular pairs live at /private-shuttle/[slug] (higher priority for SEO);
  // the long tail stays at /routes/[slug].
  const routes = await getIndexableRoutes();
  const routePages: MetadataRoute.Sitemap = routes.map((r) => {
    const popular = isPopularRoute(r.origen, r.destino);
    return {
      url: `${baseUrl}${popular ? "/private-shuttle" : "/routes"}/${r.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: popular ? 0.9 : 0.6,
    };
  });

  // Hotel landing pages — long-tail SEO for "shuttle from <hotel name>"
  // queries that no competitor in CR covers well. Priority bumped from 0.7
  // → 0.85 (2026-06-23) after /hotels/peace-lodge converted $545 in a single
  // day. These pages are clearly high-value entry points; the prior 0.7
  // value was treating them as second-tier when they actually rival the
  // popular /private-shuttle/ landing pages for conversion.
  // changeFrequency upgraded weekly → so Google revisits sooner.
  const hotelSlugs = await getIndexableHotelSlugs();
  const hotelPages: MetadataRoute.Sitemap = hotelSlugs.map((slug) => ({
    url: `${baseUrl}/hotels/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // La Fortuna tour detail pages — the catalog launched 2026-05.
  // Higher priority (0.8) than the long-tail route pages because these
  // are direct revenue endpoints and there are only ~10 of them.
  const tourSlugs = await getIndexableTourSlugs();
  const tourPages: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${baseUrl}/tours/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...routePages, ...hotelPages, ...tourPages];
}
