import BenefitsSection from "@/components/BenefitsSection";
import FleetPreview from "@/components/FleetPreview";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Reviews from "@/components/Reviews";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import PopularRoutes from "@/components/PopularRoutes";
import ServiceComparison from "@/components/ServiceComparison";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import FAQSchema from "@/components/FAQSchema";
import ReviewSchema from "@/components/ReviewSchema";
import { getAllLocations } from "@/lib/routes-db";

export const revalidate = 3600;

export default async function Home() {
  const locations = await getAllLocations();
  return (
    <main className="min-h-screen bg-black">
      <FAQSchema />
      <ReviewSchema />
      <Navbar />

      <section id="inicio">
        <Hero locations={locations} />
      </section>

      <Reviews />

      {/* BENEFICIOS CON ICONOS */}
      <BenefitsSection />

      {/* STANDARD VS VIP */}
      <ServiceComparison />

      <FleetPreview />

      <PopularRoutes />

      <FAQSection />

      <Footer />

      <WhatsAppFloat />
    </main>
  );
}
