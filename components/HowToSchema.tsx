import type { HowToStep } from "@/lib/blog-howto";

type Props = {
  name: string;
  description?: string;
  url: string;
  image?: string;
  totalTimeISO?: string;
  steps: HowToStep[];
};

export default function HowToSchema({
  name,
  description,
  url,
  image,
  totalTimeISO,
  steps,
}: Props) {
  if (steps.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    image,
    totalTime: totalTimeISO,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${url}#step-${i + 1}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
