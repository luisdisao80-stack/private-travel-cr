import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/blog";
import { getIndexableRoutes } from "@/lib/routes-db";
import { getIndexableHotelSlugs } from "@/lib/hotels-db";
import { getIndexableTourSlugs } from "@/lib/tours-db";
import { getAllDestinationSlugs } from "@/lib/destinations";
import { isPopularRoute, isTopRoute } from "@/lib/popular-routes";

/**
 * Every URL in this file used to carry `lastModified: new Date()`. That is the
 * build time, so the sitemap told Google all 864 pages changed today — and it
 * said that again the next day, and the day after. A lastmod that is always
 * "now" is not a freshness signal, it is noise, and Google's documented
 * response is to stop trusting the field for the whole site. So we only send
 * lastmod where we actually know it (blog posts, from their frontmatter) and
 * leave it off everywhere else. An absent lastmod is honest; Google falls back
 * to its own crawl history, which is what it was doing anyway.
 *
 * The day the `routes` table gets an `updated_at` column, route pages should
 * start carrying a real one too — that is the missing piece here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/fleet`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/routes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/reviews`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/hotels`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tours`, changeFrequency: "weekly", priority: 0.9 },
    // Exact-match SEO landing pages — added 2026-06-23 to capture
    // non-branded query clusters identified in GSC. Priority 0.95
    // (just below homepage) because each one targets a query cluster
    // worth 200-800 impressions/month.
    { url: `${baseUrl}/private-transportation-costa-rica`, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/airport-to-la-fortuna`, changeFrequency: "weekly", priority: 0.95 },
    // Airport-transfer query cluster (~2,900 impressions/mo, stuck on page 2
    // at pos 14-26 with ~0 clicks per GSC). Dedicated landing page added
    // 2026-08-08 to consolidate "Costa Rica airport transfers / SJO / LIR
    // shuttle" intent that the individual /private-shuttle/ pages don't rank
    // for as a group.
    { url: `${baseUrl}/costa-rica-airport-transfers`, changeFrequency: "weekly", priority: 0.95 },
    // /book is the booking wizard — transactional, no canonical content of
    // its own. SEO entries belong on /private-shuttle/[slug] and /routes/[slug].
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Los únicos lastmod reales del sitemap: `updated` si el artículo se corrigió,
  // si no la fecha de publicación. Ambas salen del frontmatter del .md.
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => {
    const fecha = post.updated || post.date;
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      ...(fecha ? { lastModified: new Date(fecha) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  // Popular pairs live at /private-shuttle/[slug]; the long tail stays at
  // /routes/[slug].
  //
  // Three tiers, not two (Diego 2026-09-03: "enfocar la atención de Google en
  // esas páginas que son las que más venden"). Before this, all 150 popular
  // pages shared 0.9 and the 491 long-tail pages sat at 0.6 — close enough
  // that the sitemap was telling Google the 34 pages that pay for the site
  // matter about as much as sjo-to-puntarenas. Priority is a weak signal on
  // its own; the point is that it should at least not contradict the internal
  // linking, which now favours the same 34 (see getRelatedRoutes).
  const routes = await getIndexableRoutes();
  const routePages: MetadataRoute.Sitemap = routes.map((r) => {
    const popular = isPopularRoute(r.origen, r.destino);
    const top = isTopRoute(r.origen, r.destino);
    return {
      url: `${baseUrl}${popular ? "/private-shuttle" : "/routes"}/${r.slug}`,
      changeFrequency: top ? "weekly" : "monthly",
      priority: top ? 1.0 : popular ? 0.8 : 0.4,
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
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // La Fortuna tour detail pages — the catalog launched 2026-05.
  // Higher priority (0.8) than the long-tail route pages because these
  // are direct revenue endpoints and there are only ~10 of them.
  const tourSlugs = await getIndexableTourSlugs();
  const tourPages: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${baseUrl}/tours/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Destination hub pages (/shuttle-to/[slug]) — one strong internal-linking
  // hub per destination that aggregates every indexable route into that place
  // ("all the ways to reach La Fortuna"). Priority 0.9: they rival the popular
  // /private-shuttle/ pages as entry points for "shuttle to <place>" queries.
  const destinationPages: MetadataRoute.Sitemap = getAllDestinationSlugs().map((slug) => ({
    url: `${baseUrl}/shuttle-to/${slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...destinationPages,
    ...routePages,
    ...hotelPages,
    ...tourPages,
  ];
}
