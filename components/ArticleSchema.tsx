import { siteConfig } from "@/lib/site-config";

type Props = {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  /**
   * Cuándo se corrigió el artículo por última vez. Antes esto no existía y el
   * schema mandaba dateModified = datePublished siempre, o sea que un artículo
   * corregido ayer le decía a Google que no se toca desde mayo.
   */
  dateModified?: string;
  authorName: string;
};

export default function ArticleSchema({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image
      ? image.startsWith("http")
        ? image
        : `${siteConfig.siteUrl}${image}`
      : siteConfig.ogImage,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: siteConfig.logo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
