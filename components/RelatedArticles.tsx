import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

type Props = {
  posts: BlogPostMeta[];
  /** Optional heading override. Defaults to "Plan your trip" — the
   *  RouteDetail page tucks this section in between the related-routes
   *  grid and the booking CTA, so a generic header reads naturally. */
  heading?: string;
};

// Server component: no interactivity, just static cards. Keeping it
// non-client lets it render inline in RouteDetail without bringing
// in a framer-motion bundle. The cards mirror BlogHighlights' visual
// vocabulary (amber border, hover glow, line-clamp) so the site feels
// consistent whether you discover the blog from the home page or from
// a route page.
export default function RelatedArticles({ posts, heading }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={20} className="text-amber-400" />
        <h2 className="text-2xl font-bold text-white">
          {heading ?? "Plan your trip"}
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-gradient-to-br from-gray-900/95 to-black/95 border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10"
          >
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
              {post.category ? (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase text-amber-300">
                  {post.category}
                </span>
              ) : null}
            </div>
            <div className="p-4 md:p-5 flex flex-col gap-2">
              <h3 className="text-sm md:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center justify-between pt-2 mt-auto border-t border-white/5">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock size={11} />
                  {post.readTime} min read
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 group-hover:gap-1.5 transition-all">
                  Read
                  <ArrowRight size={11} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
