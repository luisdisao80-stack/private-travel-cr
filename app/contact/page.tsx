import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata = {
  title: "Contact Us | Private Travel Costa Rica",
  description: "Get a quote for your private shuttle in Costa Rica. Contact us via WhatsApp or email — bilingual drivers, door-to-door, available 24/7.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24">
        <ContactForm />
      </div>
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
