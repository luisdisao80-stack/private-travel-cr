import { siteConfig } from "@/lib/site-config";

type Props = {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  authorName: string;
};

export default function ArticleSchema({
  headline,
  description,
  url,
  image,
  datePublished,
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
    dateModified: datePublished,
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
