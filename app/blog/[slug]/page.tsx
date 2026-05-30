import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import { readPostMarkdown, extractHowToSteps } from "@/lib/blog-howto";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import HowToSchema from "@/components/HowToSchema";
import ArticleSchema from "@/components/ArticleSchema";
import AuthorBox from "@/components/AuthorBox";
import RestaurantListSchema from "@/components/RestaurantListSchema";
import FAQSchema from "@/components/FAQSchema";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Hardcoded data for the la-fortuna restaurants post — feeds two
// JSON-LD blocks (Restaurant ItemList + FAQPage) that we only inject
// on that specific slug. Centralised here so the article body and
// the schema stay in lockstep when we edit either side.
const LA_FORTUNA_RESTAURANTS = [
  { name: "Don Rufino", priceRange: "$$$", cuisine: "Fusion Costa Rican" },
  { name: "Anch'io", priceRange: "$$", cuisine: "Italian" },
  { name: "Soda La Hormiga", priceRange: "$", cuisine: "Costa Rican" },
  { name: "Lava Lounge", priceRange: "$$", cuisine: "International" },
  { name: "El Chante Verde", priceRange: "$$", cuisine: "Farm-to-Table Vegetarian" },
  { name: "Tiquicia", priceRange: "$$", cuisine: "Traditional Costa Rican" },
  { name: "Selva Rústica", priceRange: "$$$", cuisine: "Grill" },
  { name: "Benedictus Steakhouse", priceRange: "$$$$", cuisine: "Steakhouse" },
  { name: "Café Mediterráneo", priceRange: "$$", cuisine: "Italian" },
  { name: "Organico", priceRange: "$$", cuisine: "Vegan / Health Food" },
  { name: "Restaurante Nene", priceRange: "$", cuisine: "Costa Rican" },
  { name: "Rancho La Cascada", priceRange: "$$", cuisine: "Costa Rican" },
  { name: "Que Rico Arenal", priceRange: "$$", cuisine: "Italian" },
  { name: "La Choza de Laurel", priceRange: "$$", cuisine: "Traditional Costa Rican" },
  { name: "Restaurante Las Brasitas", priceRange: "$$", cuisine: "Mexican" },
];

const LA_FORTUNA_RESTAURANTS_FAQ = [
  {
    question: "What's the average cost of dinner in La Fortuna?",
    answer:
      "Plan on $15–25 per person at a mid-range place like Anch'io, Lava Lounge, or Café Mediterráneo. A soda lunch runs $7–10. A special-occasion dinner at Don Rufino or Benedictus Steakhouse is $35–55 per person before drinks. Add roughly 23% to the menu price for the built-in service charge and sales tax.",
  },
  {
    question: "Do La Fortuna restaurants accept US dollars?",
    answer:
      "Yes — almost every mid-range and tourist-facing restaurant in La Fortuna accepts USD, Costa Rican colones, and Visa/Mastercard. Change is usually returned in colones at the current exchange rate. Small local sodas like Soda La Hormiga and Restaurante Nene are typically cash only — bring small bills.",
  },
  {
    question: "What time do La Fortuna restaurants close?",
    answer:
      "Most La Fortuna restaurants close their kitchen by 9:30 or 10pm. La Fortuna is a small mountain town with an early-to-bed culture, so there is no real late-night dining scene. If you arrive after 9pm, plan to eat at your hotel.",
  },
  {
    question: "Are reservations needed at La Fortuna restaurants?",
    answer:
      "Reservations are recommended only at Don Rufino, Benedictus Steakhouse, Selva Rústica, and Que Rico Arenal during high season (mid-December through mid-April, and July). Everywhere else, walk-ins work fine. WhatsApp is the easiest way to reserve.",
  },
  {
    question: "What is a casado and where can I find one in La Fortuna?",
    answer:
      "A casado is the classic Costa Rican lunch plate: rice, black beans, a protein (chicken, beef, fish, or pork), fried plantains, and a small salad. It's the cheapest filling meal in Costa Rica, usually $7–12. The best casado in La Fortuna is at Soda La Hormiga or Restaurante Nene. A fancier version is available at Don Rufino.",
  },
  {
    question: "Is tap water safe to drink in La Fortuna restaurants?",
    answer:
      "Yes. La Fortuna's tap water comes from mountain springs and is safe to drink. Restaurants will pour it on request at no charge. Bottled water is widely available if you prefer.",
  },
  {
    question: "Are there vegan and vegetarian options in La Fortuna?",
    answer:
      "Yes. Organico and El Chante Verde are vegan-first restaurants with menus where most dishes are plant-based by default. Lava Lounge clearly flags vegan items. At any traditional soda, ask for 'casado sin carne' to get rice, beans, plantain, salad, and usually extra avocado or cheese.",
  },
  {
    question: "Which La Fortuna restaurants have volcano views?",
    answer:
      "Benedictus Steakhouse is the gold standard for Arenal Volcano views, with floor-to-ceiling windows facing the volcano. Que Rico Arenal offers a similar view at a much lower price point. Both are a short drive out of the town center, toward El Castillo. Downtown restaurants do not have volcano views.",
  },
];

// Generar páginas estáticas para cada post
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Metadata SEO dinámica por post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.siteUrl}/blog/${slug}`,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image
        ? [
            {
              url: post.image.startsWith("http")
                ? post.image
                : `${siteConfig.siteUrl}${post.image}`,
              width: 1200,
              height: 630,
              alt: post.imageAlt || post.title,
            },
          ]
        : [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canonicalUrl = `${siteConfig.siteUrl}/blog/${slug}`;
  const rawMarkdown = readPostMarkdown(slug);
  const howToSteps = rawMarkdown ? extractHowToSteps(rawMarkdown) : [];
  const isLaFortunaRestaurants = slug === "best-restaurants-la-fortuna";

  return (
    <>
      <ArticleSchema
        headline={post.title}
        description={post.description}
        url={canonicalUrl}
        image={post.image}
        datePublished={post.date}
        authorName={post.author}
      />
      {howToSteps.length > 0 && (
        <HowToSchema
          name={post.title}
          description={post.description}
          url={canonicalUrl}
          image={
            post.image
              ? post.image.startsWith("http")
                ? post.image
                : `${siteConfig.siteUrl}${post.image}`
              : undefined
          }
          steps={howToSteps}
        />
      )}
      {isLaFortunaRestaurants && (
        <>
          <RestaurantListSchema
            restaurants={LA_FORTUNA_RESTAURANTS}
            url={canonicalUrl}
          />
          <FAQSchema faqs={LA_FORTUNA_RESTAURANTS_FAQ} />
        </>
      )}
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded uppercase tracking-wider font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {post.readTime} min read
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {post.author}
            </p>
          </div>

          {/* Featured image — Next/Image auto-serves WebP/AVIF + responsive
              sizes for big bandwidth wins on mobile. fill+sizes lets us
              keep the existing aspect-ratio container without hardcoding
              pixel dimensions. */}
          {post.image && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-amber-900 to-amber-600">
              <Image
                src={post.image}
                alt={post.imageAlt || post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Content - usa estilos definidos en globals.css */}
          <article
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author box — E-E-A-T signal on every post so readers (and
              Google) know a real person with named experience wrote
              this. Sits between the article body and the booking CTA. */}
          <AuthorBox />

          {/* CTA */}
          <div className="mt-12 p-6 md:p-8 bg-amber-500/5 border border-amber-500/30 rounded-2xl text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Need a private shuttle in Costa Rica?
            </h3>
            <p className="text-gray-400 text-sm md:text-base mb-4">
              Door-to-door private transfers from SJO and LIR airports. Get an
              instant quote.
            </p>
            <Link
              href="/book"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
