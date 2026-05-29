"use client";

import Link from "next/link";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { BlogPostMeta } from "@/lib/blog";

type Props = {
  /** Latest blog posts, sorted newest-first by the server. We render the
   *  top 3. Passed in from app/page.tsx so the static blog file reads
   *  happen at build time, not in the browser. */
  posts: BlogPostMeta[];
};

export default function BlogHighlights({ posts }: Props) {
  const { lang } = useLanguage();
  const top3 = posts.slice(0, 3);

  if (top3.length === 0) return null;

  const heading = lang === "en" ? "Plan Your Costa Rica Trip" : "Planificá Tu Viaje a Costa Rica";
  const eyebrow = lang === "en" ? "Travel Tips" : "Guía de Viaje";
  const subhead =
    lang === "en"
      ? "Real advice from someone who lives here, drives these routes every week, and has heard every traveler question."
      : "Consejos reales de alguien que vive aquí, maneja estas rutas cada semana, y ha escuchado todas las preguntas que se pueda imaginar.";
  const readMore = lang === "en" ? "Read article" : "Leer artículo";
  const seeAll = lang === "en" ? "See all articles" : "Ver todos los artículos";
  const readTime = lang === "en" ? "min read" : "min lectura";

  return (
    <section
      id="blog-highlights"
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-amber-400">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.05] mb-4"
          >
            {heading}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed"
          >
            {subhead}
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {top3.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
              className="group"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block h-full bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-black">
                  {post.image ? (
                    <NextImage
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Category pill */}
                  {post.category ? (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase text-amber-300">
                      {post.category}
                    </span>
                  ) : null}
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 flex flex-col gap-3">
                  <h3 className="text-base md:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      {post.readTime} {readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
                      {readMore}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* See all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-10 md:mt-12"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-white font-semibold text-sm transition-all"
          >
            {seeAll}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
