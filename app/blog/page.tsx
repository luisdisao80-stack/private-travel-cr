import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <span className="text-amber-400 text-sm font-medium tracking-wider">
                TRAVEL BLOG
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Costa Rica Travel{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Tips
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Insights from local drivers who know Costa Rica inside out.
            </p>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p>No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-gradient-to-br from-gray-900 to-black border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-32 rounded-xl bg-gradient-to-br from-amber-900 to-amber-600 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-amber-200 text-4xl">🌴</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded uppercase tracking-wider font-medium">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {post.readTime} min read
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                        {post.description}
                      </p>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {post.author}
                        </p>
                        <span className="text-amber-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
