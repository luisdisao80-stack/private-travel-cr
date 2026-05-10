import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Users, Car, ArrowRight } from "lucide-react";
import { getRouteBySlug, getIndexableSlugs, getRelatedRoutes } from "@/lib/routes-db";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getIndexableSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return { title: "Route not found" };

  const title = "Private Shuttle " + route.origen + " to " + route.destino + " | $" + route.precio1a6 + " USD";
  const description = route.journey_description || "Private shuttle service from " + route.origen + " to " + route.destino + ". Door-to-door, professional bilingual drivers. Starting at $" + route.precio1a6 + " USD.";

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      route.origen + " to " + route.destino,
      "private shuttle " + route.destino,
      route.origen + " transportation",
      "Costa Rica shuttle",
      "private transfer Costa Rica",
    ],
    openGraph: {
      title,
      description: description.substring(0, 160),
      type: "website",
    },
    robots: route.is_indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: "/routes/" + slug },
  };
}

function parsePOI(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const points = parsePOI(route.points_of_interest);
  const related = await getRelatedRoutes(route.origen, slug, 4);
  const whatsappUrl = "https://wa.me/50686334133?text=" + encodeURIComponent("Hello! I'm interested in a private shuttle from " + route.origen + " to " + route.destino + ".");

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          {" / "}
          <Link href="/routes" className="hover:text-amber-400">Routes</Link>
          {" / "}
          <span className="text-gray-300">{route.origen} to {route.destino}</span>
        </nav>

        <section className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">PRIVATE SHUTTLE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {route.origen} <span className="text-amber-400">to</span> {route.destino}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-300 mb-6">
            {route.duracion ? (
              <span className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-amber-400" />
                {route.duracion}
              </span>
            ) : null}
            <span className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-amber-400" />
              1-9 passengers
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Car size={16} className="text-amber-400" />
              Door-to-door
            </span>
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">1-6 PAX</div>
              <div className="text-2xl font-bold text-amber-400">${route.precio1a6}</div>
            </div>
            {route.precio7a9 ? (
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">7-9 PAX</div>
                <div className="text-2xl font-bold text-amber-400">${route.precio7a9}</div>
              </div>
            ) : null}
            {route.precio10a12 ? (
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">10-12 PAX</div>
                <div className="text-2xl font-bold text-amber-400">${route.precio10a12}</div>
              </div>
            ) : null}
            {route.precio13a18 ? (
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">13-18 PAX</div>
                <div className="text-2xl font-bold text-amber-400">${route.precio13a18}</div>
              </div>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mb-6">Prices in USD per vehicle. All-inclusive: A/C, WiFi, water, child seats, door-to-door.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-center transition">Book Now</a>
            <Link href="/#cotizador" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl text-center transition">Get a Quote</Link>
          </div>
        </section>

        {route.journey_description ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">About this journey</h2>
            <p className="text-gray-300 leading-relaxed">{route.journey_description}</p>
          </section>
        ) : null}

        {points.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Points of interest along the way</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {points.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-300">
                  <MapPin size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {route.road_type ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Road conditions</h2>
            <p className="text-gray-300 leading-relaxed">{route.road_type}</p>
          </section>
        ) : null}

        {route.traveler_tip ? (
          <section className="mb-10 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Traveler Tip</h3>
            <p className="text-gray-300 leading-relaxed">{route.traveler_tip}</p>
          </section>
        ) : null}

        {route.family_info ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Traveling with family</h2>
            <p className="text-gray-300 leading-relaxed">{route.family_info}</p>
          </section>
        ) : null}

        {route.budget_tip ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Budget breakdown</h2>
            <p className="text-gray-300 leading-relaxed">{route.budget_tip}</p>
          </section>
        ) : null}

        {route.google_maps_note ? (
          <section className="mb-10 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">About travel times</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{route.google_maps_note}</p>
          </section>
        ) : null}

        {route.late_night_info ? (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Available 24/7</h2>
            <p className="text-gray-300 leading-relaxed">{route.late_night_info}</p>
          </section>
        ) : null}

        {route.local_recommendation ? (
          <section className="mb-10 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Local insider tip</h3>
            <p className="text-gray-300 leading-relaxed">{route.local_recommendation}</p>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Other routes from {route.origen}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={"/routes/" + r.slug} className="group flex items-center justify-between bg-gray-900/50 border border-amber-500/10 hover:border-amber-500/40 rounded-xl p-5 transition">
                  <div>
                    <div className="text-xs text-amber-400 mb-1">{r.duracion}</div>
                    <div className="text-white font-medium">{r.destino}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">${r.precio1a6}</div>
                    <ArrowRight size={16} className="text-gray-500 ml-auto mt-1 group-hover:text-amber-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to book?</h2>
          <p className="text-gray-300 mb-6">Get your private shuttle from {route.origen} to {route.destino} starting at ${route.precio1a6} USD</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition">Book Now</a>
        </section>
      </div>
    </main>
  );
}
