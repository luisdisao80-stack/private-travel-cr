import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import FAQSchema from "@/components/FAQSchema";
import ReviewSchema from "@/components/ReviewSchema";
import { getAllLocations } from "@/lib/routes-db";
import { getAllHotels } from "@/lib/hotels-db";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getAllPosts } from "@/lib/blog";

/*
 * LCP perf: dynamic-import every below-the-fold client section. With the
 * Next.js default (`ssr: true`) the HTML is still server-rendered — so
 * Google/Perplexity see the full marketing copy — but the framer-motion
 * JS chunk for each section ships in a separate bundle that the browser
 * downloads AFTER the above-the-fold paint completes. Cuts initial JS
 * by roughly half and frees the main thread during the LCP window.
 */
const Reviews = dynamic(() => import("@/components/Reviews"));
const WhyUsComparison = dynamic(() => import("@/components/WhyUsComparison"));
const ServiceComparison = dynamic(() => import("@/components/ServiceComparison"));
const FleetPreview = dynamic(() => import("@/components/FleetPreview"));
const PopularRoutes = dynamic(() => import("@/components/PopularRoutes"));
const RedditTestimonials = dynamic(() => import("@/components/RedditTestimonials"));
const BlogHighlights = dynamic(() => import("@/components/BlogHighlights"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));

export const revalidate = 3600;

export default async function Home() {
  const [locations, hotels, google] = await Promise.all([
    getAllLocations(),
    getAllHotels(),
    getGoogleReviews(),
  ]);
  // Blog posts are read off-disk synchronously — no Promise.all slot needed.
  // Newest-first; BlogHighlights renders the top 3.
  const posts = getAllPosts();
  return (
    <main className="min-h-screen bg-black">
      <FAQSchema />
      <ReviewSchema googleReviews={google.reviews} />
      <Navbar />

      <section id="inicio">
        <Hero locations={locations} hotels={hotels} />
      </section>

      <Reviews
        googleReviews={google.reviews}
        liveGoogleCount={google.count}
        liveGoogleRating={google.rating}
      />

      {/* Shuttle vs rental car / Uber / bus — now also carries the
          trust-indicators row that used to live in BenefitsSection.
          BenefitsSection was redundant with the comparison table and
          got removed; its file stays in the repo for easy re-add. */}
      <WhyUsComparison />

      {/* STANDARD VS VIP */}
      <ServiceComparison />

      <FleetPreview />

      <PopularRoutes />

      {/* Reddit social proof — unsolicited recommendations from real
          travelers on r/CostaRicaTravel. Sits high in the conversion
          stack because trust from peer reviews tends to be the
          decisive moment for someone choosing between competitors.
          Also doubles as citation-ready content for AI engines. */}
      <RedditTestimonials />

      {/* Travel Tips — promotes the blog from the home page so visitors
          discover the long-form guides without having to dig into the
          nav. Sits between PopularRoutes (transactional) and FAQ
          (objection handling) so it reads as a natural "still researching?
          here's some help" beat. */}
      <BlogHighlights posts={posts} />

      <FAQSection />

      <Footer />

      <WhatsAppFloat />
    </main>
  );
}
