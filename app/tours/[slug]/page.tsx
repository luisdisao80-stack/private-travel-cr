import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import TourBookingPanel from "@/components/tours/TourBookingPanel";
import { getTourBySlug, getIndexableTourSlugs, getAllTours } from "@/lib/tours-db";
import { siteConfig } from "@/lib/site-config";
import {
  Clock,
  Users,
  CheckCircle2,
  Backpack,
  MapPin,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getIndexableTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  return {
    title: tour.meta_title || `${tour.name} | Private Travel CR`,
    description:
      tour.meta_description ||
      tour.short_description ||
      `${tour.name} — book online with Private Travel CR. From $${Math.floor(Number(tour.adult_price))} per adult. Taxes included.`,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.name,
      description: tour.short_description || tour.meta_description || "",
      url: `${siteConfig.siteUrl}/tours/${tour.slug}`,
      siteName: siteConfig.name,
      type: "website",
      images: tour.hero_image
        ? [
            {
              url: tour.hero_image,
              width: 1200,
              height: 630,
              alt: tour.name,
            },
          ]
        : [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: tour.name,
      description: tour.short_description || "",
    },
  };
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  // Pull a couple of related tours to cross-sell at the bottom (different
  // category preferred so we don't show the same thing twice).
  const all = await getAllTours();
  const related = all
    .filter((t) => t.slug !== tour.slug)
    .sort((a, b) => {
      const aDiff = a.category !== tour.category ? 1 : 0;
      const bDiff = b.category !== tour.category ? 1 : 0;
      return bDiff - aDiff || b.priority - a.priority;
    })
    .slice(0, 3);

  const adultPrice = Math.floor(Number(tour.adult_price));
  const childPrice = tour.child_price != null ? Math.floor(Number(tour.child_price)) : null;

  // schema.org TouristTrip + Offer for rich results
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.name,
    description: tour.short_description || tour.description || "",
    image: tour.hero_image ? [tour.hero_image] : [],
    touristType: ["Families", "Couples", "Adventure travelers"],
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: adultPrice,
      url: `${siteConfig.siteUrl}/tours/${tour.slug}`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
        {/* Hero image — compact but tall enough that the subject of the
            photo (frog eye, sloth face, etc.) lands in the visible
            window. object-position: center 30% biases the crop up
            so the subject sits roughly under the badge rather than
            getting cut off at the bottom. Gradient is now lighter
            at the top so the photo reads through. */}
        <section className="relative h-[26vh] min-h-[220px] max-h-[320px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-amber-600">
            {tour.hero_image ? (
              <Image
                src={tour.hero_image}
                alt={tour.name}
                fill
                sizes="100vw"
                priority
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            ) : null}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-8">
            <div className="max-w-6xl mx-auto">
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 text-amber-400 text-xs hover:text-amber-300 mb-1.5 transition-colors"
              >
                <ArrowLeft size={12} />
                Back to tours
              </Link>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/40 mb-1.5">
                <MapPin size={10} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                  La Fortuna · Arenal
                </span>
              </div>
              <h1 className="text-lg md:text-2xl font-bold text-white mb-1 max-w-3xl tracking-tight leading-tight">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" />
                  {tour.duration_label}
                </span>
                {tour.min_age ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    Ages {tour.min_age}+
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Body — tight top padding so the Highlights/booking panel
            sit right under the slim hero banner instead of after a
            big dark gap. */}
        <section className="px-4 pt-6 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Highlights */}
              {tour.highlights.length > 0 ? (
                <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Highlights</h2>
                  </div>
                  <ul className="space-y-2">
                    {tour.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle2
                          size={16}
                          className="text-amber-400 mt-0.5 shrink-0"
                        />
                        <span className="text-sm leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Description */}
              {tour.description ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    About this tour
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                    {tour.description}
                  </div>
                </div>
              ) : null}

              {/* Included */}
              {tour.includes.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    What&apos;s included
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tour.includes.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-300 text-sm"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-green-400 mt-0.5 shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* What to bring */}
              {tour.what_to_bring.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Backpack size={20} className="text-amber-400" />
                    <h2 className="text-2xl font-bold text-white">What to bring</h2>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tour.what_to_bring.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-300 text-sm"
                      >
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Schedule */}
              {tour.schedule_times.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Departure times
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {tour.schedule_times.map((slot, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-gray-900/40 border border-white/10 px-4 py-3"
                      >
                        <div className="text-[10px] uppercase tracking-wider text-gray-500">
                          Departure
                        </div>
                        <div className="text-lg font-bold text-white">
                          {slot.departure}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Returns ~{slot.return}
                        </div>
                      </div>
                    ))}
                  </div>
                  {tour.pickup_zone ? (
                    <p className="text-sm text-gray-500 mt-4">
                      <span className="text-amber-400">Pickup area:</span>{" "}
                      {tour.pickup_zone}.{" "}
                      <span className="text-gray-600">
                        Hotels outside this zone may have a small extra transport fee
                        — we&apos;ll quote it before you book.
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* Kid policy */}
              {tour.child_policy_note ? (
                <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-5">
                  <h3 className="font-bold text-blue-300 mb-1">
                    Traveling with kids
                  </h3>
                  <p className="text-sm text-gray-300">
                    {tour.child_policy_note}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Right: sticky booking panel */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <TourBookingPanel
                  tour={{
                    id: tour.id,
                    slug: tour.slug,
                    name: tour.name,
                    adultPrice,
                    childPrice,
                    minAge: tour.min_age,
                    childAgeMin: tour.child_age_min,
                    childAgeMax: tour.child_age_max,
                    childPolicyNote: tour.child_policy_note,
                    scheduleTimes: tour.schedule_times,
                    minPax: tour.min_pax,
                  }}
                />
              </div>
            </aside>
          </div>
        </section>

        {/* Related tours */}
        {related.length > 0 ? (
          <section className="px-4 pb-20">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tours/${t.slug}`}
                    className="group rounded-2xl bg-gray-900/40 border border-white/10 hover:border-amber-500/40 overflow-hidden transition-all"
                  >
                    <div className="relative w-full h-40 bg-gradient-to-br from-amber-900 to-amber-600">
                      {t.hero_image ? (
                        <Image
                          src={t.hero_image}
                          alt={t.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-white mb-2 leading-tight">
                        {t.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-amber-400" />
                          {t.duration_label}
                        </span>
                        <span className="text-amber-400 font-bold text-base">
                          ${Math.floor(Number(t.adult_price))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
