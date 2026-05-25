import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { getFeaturedTours } from "@/lib/tours-db";

/**
 * Home-page featured-tours strip. Mirrors the role of PopularRoutes
 * for shuttle routes — surfaces the 4 highest-priority La Fortuna tours
 * from the catalog with a clear CTA to the full /tours page. Server-
 * rendered so the card images and prices land in the initial HTML and
 * the section is indexable + AI-citable.
 */
export default async function ToursPreview() {
  const tours = await getFeaturedTours(4);
  if (!tours.length) return null;

  return (
    <section
      id="tours"
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              LA FORTUNA TOURS
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            The best tours in{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              La Fortuna
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Arenal Volcano, hanging bridges, Río Celeste, wildlife floats and
            more — booked online in 2 minutes, taxes included.
          </p>
        </div>

        {/* Tour cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tours.map((tour) => {
            const adult = Math.floor(Number(tour.adult_price));
            return (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group rounded-2xl bg-gray-900/40 border border-white/10 hover:border-amber-500/40 overflow-hidden transition-all hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-amber-900 to-amber-600 overflow-hidden">
                  {tour.hero_image ? (
                    <Image
                      src={tour.hero_image}
                      alt={tour.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                  {tour.is_featured ? (
                    <span className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-amber-400 transition-colors min-h-[2.5em]">
                    {tour.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <Clock size={12} className="text-amber-400/70" />
                    <span className="line-clamp-1">{tour.duration_label}</span>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">
                        From
                      </p>
                      <p className="text-xl font-bold text-amber-400">
                        ${adult}
                        <span className="text-xs text-gray-500 font-normal ml-1">
                          /adult
                        </span>
                      </p>
                    </div>
                    <span className="text-amber-400 text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Book
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA to full catalog */}
        <div className="text-center mt-10">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-all"
          >
            See all 10 tours
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
