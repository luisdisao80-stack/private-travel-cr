import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllPostSlugs } from "@/lib/blog";
import { getIndexableRoutes } from "@/lib/routes-db";
import { getIndexableHotelSlugs } from "@/lib/hotels-db";
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
    { url: `${baseUrl}/hotels`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
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
  // queries that no competitor in CR covers well.
  const hotelSlugs = await getIndexableHotelSlugs();
  const hotelPages: MetadataRoute.Sitemap = hotelSlugs.map((slug) => ({
    url: `${baseUrl}/hotels/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...routePages, ...hotelPages];
}
