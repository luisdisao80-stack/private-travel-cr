import { siteConfig } from "@/lib/site-config";

type Crumb = {
  name: string;
  url?: string;
};

type Props = {
  /** Ordered from root to current page. The last item's `url` is optional —
   *  Google ignores it for the current page. */
  items: Crumb[];
};

/**
 * BreadcrumbList JSON-LD. Google shows the breadcrumb in the SERP snippet
 * instead of the raw URL, which lifts CTR. The visual breadcrumb shown to
 * the user lives separately in each page's markup.
 */
export default function BreadcrumbSchema({ items }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      ...(c.url
        ? { item: c.url.startsWith("http") ? c.url : `${siteConfig.siteUrl}${c.url}` }
        : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
