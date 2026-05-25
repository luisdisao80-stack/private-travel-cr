import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import FAQSchema from "@/components/FAQSchema";
import ReviewSchema from "@/components/ReviewSchema";
import ToursPreview from "@/components/ToursPreview";
import { getAllLocations } from "@/lib/routes-db";
import { getAllHotels } from "@/lib/hotels-db";
import { getGoogleReviews } from "@/lib/google-reviews";

/*
 * LCP perf: dynamic-import every below-the-fold client section. With the
 * Next.js default (`ssr: true`) the HTML is still server-rendered — so
 * Google/Perplexity see the full marketing copy — but the framer-motion
 * JS chunk for each section ships in a separate bundle that the browser
 * downloads AFTER the above-the-fold paint completes. Cuts initial JS
 * by roughly half and frees the main thread during the LCP window.
 */
const Reviews = dynamic(() => import("@/components/Reviews"));
const BenefitsSection = dynamic(() => import("@/components/BenefitsSection"));
const WhyUsComparison = dynamic(() => import("@/components/WhyUsComparison"));
const ServiceComparison = dynamic(() => import("@/components/ServiceComparison"));
const FleetPreview = dynamic(() => import("@/components/FleetPreview"));
const PopularRoutes = dynamic(() => import("@/components/PopularRoutes"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));

export const revalidate = 3600;

export default async function Home() {
  const [locations, hotels, google] = await Promise.all([
    getAllLocations(),
    getAllHotels(),
    getGoogleReviews(),
  ]);
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

      {/* BENEFICIOS CON ICONOS */}
      <BenefitsSection />

      {/* SHUTTLE VS RENTAL CAR / UBER / BUS */}
      <WhyUsComparison />

      {/* STANDARD VS VIP */}
      <ServiceComparison />

      <FleetPreview />

      <PopularRoutes />

      {/* La Fortuna tours catalog preview — surfaces the 4 featured
          tours and CTAs to the full /tours page. Server-rendered so the
          card images, names and prices are in the initial HTML for SEO. */}
      <ToursPreview />

      <FAQSection />

      <Footer />

      <WhatsAppFloat />
    </main>
  );
}
