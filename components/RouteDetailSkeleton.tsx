// Placeholder shown while a route detail page is fetching from Supabase.
// Mimics the rough layout of RouteDetail so the page doesn't jump around
// when content lands. Server-rendered, no JS, no animations on the
// skeleton bars (they're just lighter pulsing blocks).

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-800/60 rounded-md animate-pulse ${className}`}
    />
  );
}

export default function RouteDetailSkeleton() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <Bar className="h-4 w-64 mb-6" />

          {/* Hero block */}
          <section className="mb-12">
            <Bar className="h-6 w-40 mb-4" />
            <Bar className="h-12 w-3/4 mb-3" />
            <Bar className="h-12 w-1/2 mb-6" />
            <div className="flex gap-4">
              <Bar className="h-5 w-20" />
              <Bar className="h-5 w-28" />
              <Bar className="h-5 w-28" />
            </div>
          </section>

          {/* Price cards */}
          <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 md:p-8 mb-12">
            <Bar className="h-8 w-2/3 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-xl p-4 h-44">
                <Bar className="h-24 w-full mb-3" />
                <Bar className="h-3 w-2/3 mb-2" />
                <Bar className="h-7 w-1/2" />
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 h-44">
                <Bar className="h-24 w-full mb-3" />
                <Bar className="h-3 w-2/3 mb-2" />
                <Bar className="h-7 w-1/2" />
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 h-44">
                <Bar className="h-24 w-full mb-3" />
                <Bar className="h-3 w-2/3 mb-2" />
                <Bar className="h-7 w-1/2" />
              </div>
            </div>
            <Bar className="h-12 w-full" />
          </section>

          {/* Content sections */}
          <Bar className="h-7 w-1/2 mb-3" />
          <Bar className="h-4 w-full mb-2" />
          <Bar className="h-4 w-full mb-2" />
          <Bar className="h-4 w-5/6 mb-10" />

          <Bar className="h-7 w-1/2 mb-3" />
          <Bar className="h-4 w-full mb-2" />
          <Bar className="h-4 w-3/4 mb-10" />
        </div>
      </main>
      <Footer />
    </>
  );
}
