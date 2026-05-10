import BenefitsSection from "@/components/BenefitsSection";
import FleetPreview from "@/components/FleetPreview";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import QuoteSection from "@/components/QuoteSection";
import Reviews from "@/components/Reviews";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import PopularRoutes from "@/components/PopularRoutes";
import ServiceComparison from "@/components/ServiceComparison";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section id="inicio">
        <Hero />
      </section>

      {/* BENEFICIOS CON ICONOS */}
      <BenefitsSection />

      {/* STANDARD VS VIP */}
      <ServiceComparison />

      {/* COTIZADOR */}
      <QuoteSection />

      <FleetPreview />

      <PopularRoutes />

      <Reviews />

      <FAQSection />

      <Footer />

      <WhatsAppFloat />
    </main>
  );
}
