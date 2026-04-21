import FleetSection from "@/components/FleetSection";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import QuoteCalculator from "@/components/QuoteCalculator";
import Reviews from "@/components/Reviews";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section id="inicio">
        <Hero />
      </section>

      <section
        id="cotizador"
        className="relative py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <span className="text-amber-400 text-sm font-medium">
                ✦ COTIZACIÓN INSTANTÁNEA
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Obtén tu precio en segundos
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Selecciona tu ruta, indica cuántas personas viajan y te damos el precio exacto al instante.
            </p>
          </div>

          <QuoteCalculator />
        </div>
      </section>

      <FleetSection />

      <Reviews />

      <WhatsAppFloat />
    </main>
  );
}