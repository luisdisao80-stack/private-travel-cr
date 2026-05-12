import Link from "next/link";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WizardProgress from "@/components/book/WizardProgress";
import ClearCartOnMount from "@/components/book/ClearCartOnMount";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Confirmed | Private Travel Costa Rica",
  description: "Your private shuttle booking is confirmed.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ orderNumber?: string }>;

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { orderNumber } = await searchParams;

  const booking = orderNumber
    ? (
        await supabaseAdmin
          .from("bookings")
          .select(
            "order_number, customer_name, customer_email, total_usd, currency, items, status, tilopay_auth, tilopay_last4"
          )
          .eq("order_number", orderNumber)
          .maybeSingle()
      ).data
    : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <ClearCartOnMount />
      <Navbar />
      <div className="pt-24">
        <WizardProgress current="done" />
      </div>
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-500/10 to-amber-500/5 border border-green-500/30 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/40 mb-6">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Booking Confirmed</h1>
            <p className="text-gray-300 mb-8">
              {booking
                ? `Thank you, ${booking.customer_name}. We've received your payment.`
                : "We've received your payment."}
            </p>

            {booking ? (
              <div className="bg-black/40 border border-amber-500/20 rounded-2xl p-5 text-left text-sm space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order number</span>
                  <span className="font-mono text-amber-400">{booking.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold">
                    ${Number(booking.total_usd).toFixed(2)} {booking.currency}
                  </span>
                </div>
                {booking.tilopay_auth ? (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auth code</span>
                    <span className="font-mono text-gray-200">{booking.tilopay_auth}</span>
                  </div>
                ) : null}
                {booking.tilopay_last4 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Card</span>
                    <span className="font-mono text-gray-200">•••• {booking.tilopay_last4}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-gray-400">Confirmation sent to</span>
                  <span className="text-gray-200">{booking.customer_email}</span>
                </div>
              </div>
            ) : null}

            <p className="text-gray-400 mb-6 text-sm">
              We&apos;ll be in touch shortly by email and WhatsApp with the final pickup details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:info@privatetravelcr.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition"
              >
                <Mail size={16} />
                Email us
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
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
