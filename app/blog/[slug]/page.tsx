import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog";
import { readPostMarkdown, extractHowToSteps } from "@/lib/blog-howto";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import HowToSchema from "@/components/HowToSchema";
import ArticleSchema from "@/components/ArticleSchema";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

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

          {/* Featured image */}
          {post.image && (
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-amber-900 to-amber-600">
              <img
                src={post.image}
                alt={post.imageAlt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content - usa estilos definidos en globals.css */}
          <article
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

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
