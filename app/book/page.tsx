import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import QuoteSection from "@/components/QuoteSection";

export const metadata = {
  title: "Book Your Private Shuttle | Private Travel Costa Rica",
  description: "Get an instant quote and book your private shuttle in Costa Rica. Live pricing, child seats, and door-to-door service from SJO and LIR airports.",
};

export const revalidate = 3600;

export default function BookPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24">
        <QuoteSection />
      </div>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
