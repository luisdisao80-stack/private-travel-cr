import Link from "next/link";
import { XCircle, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WizardProgress from "@/components/book/WizardProgress";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Issue | Private Travel Costa Rica",
  description: "There was a problem completing your payment.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ orderNumber?: string; reason?: string }>;

function reasonText(reason?: string): string {
  switch (reason) {
    case "rejected":
      return "Your payment was declined. No charge was made.";
    case "consult_error":
      return "We couldn't verify the payment status. Please contact us so we can check.";
    case "missing_order":
      return "We couldn't find the booking reference for this transaction.";
    default:
      return "Something went wrong with your payment.";
  }
}

export default async function BookingErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { orderNumber, reason } = await searchParams;
  return (
    <main className="min-h-screen bg-white text-slate-600">
      <Navbar />
      <div className="pt-24">
        <WizardProgress current="checkout" />
      </div>
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 border border-red-300 mb-6">
              <XCircle size={36} className="text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Payment Issue</h1>
            <p className="text-slate-600 mb-8">{reasonText(reason)}</p>

            {orderNumber ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm mb-8">
                <span className="text-slate-500">Reference: </span>
                <span className="font-mono text-orange-600">{orderNumber}</span>
              </div>
            ) : null}

            <p className="text-slate-500 mb-6 text-sm">
              You can try again or contact us directly — we&apos;re happy to take the booking by WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition"
              >
                Try again
              </Link>
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-slate-900 font-semibold transition"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link href="/" className="text-orange-600 hover:text-orange-700 text-sm">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
