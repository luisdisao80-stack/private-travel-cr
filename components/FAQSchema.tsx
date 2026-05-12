import { FAQS_EN, type FAQ } from "@/lib/faqs";

type Props = {
  /** Override the default Q&A list (English) — used by route pages that ship
   *  their own narrower set. Falls back to the site-wide FAQ. */
  faqs?: FAQ[];
};

/**
 * Emits an FAQPage JSON-LD block. Google rich-results parses this for the
 * collapsible FAQ snippet in search results, and LLMs (ChatGPT, Perplexity)
 * lift it directly into answers when citing the site.
 */
export default function FAQSchema({ faqs = FAQS_EN }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
