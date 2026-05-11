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
import { getAllLocations } from "@/lib/routes-db";

export const revalidate = 3600;

export default async function Home() {
  const locations = await getAllLocations();
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section id="inicio">
        <Hero locations={locations} />
      </section>

      {/* BENEFICIOS CON ICONOS */}
      <BenefitsSection />

      {/* STANDARD VS VIP */}
      <ServiceComparison />

      <FleetPreview />

      <PopularRoutes />

      <Reviews />

      <FAQSection />

      <Footer />

      <WhatsAppFloat />
    </main>
  );
}
