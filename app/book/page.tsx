import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BookWizardClient from "@/components/book/BookWizardClient";
import { getAllLocations } from "@/lib/routes-db";

export const metadata = {
  title: "Book Your Private Shuttle | Private Travel Costa Rica",
  description:
    "Get an instant quote and book your private shuttle in Costa Rica. Live pricing, child seats, and door-to-door service from SJO and LIR airports.",
};

export const revalidate = 3600;

export default async function BookPage() {
  const locations = await getAllLocations();
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <BookWizardClient locations={locations} />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
