import Link from "next/link";
import { CheckCircle2, Mail, MessageCircle, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WizardProgress from "@/components/book/WizardProgress";
import ClearCartOnMount from "@/components/book/ClearCartOnMount";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { pdfTokenFor } from "@/lib/pdf-token";

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
    <main className="min-h-screen bg-white text-slate-600">
      <ClearCartOnMount
        purchase={
          booking
            ? {
                orderNumber: booking.order_number,
                totalUsd: Number(booking.total_usd),
                itemCount: Array.isArray(booking.items) ? booking.items.length : 0,
              }
            : undefined
        }
      />
      <Navbar />
      <div className="pt-24">
        <WizardProgress current="done" />
      </div>
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-300 mb-6">
              <CheckCircle2 size={36} className="text-green-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Booking Confirmed</h1>
            <p className="text-slate-600 mb-8">
              {booking
                ? `Thank you, ${booking.customer_name}. We've received your payment.`
                : "We've received your payment."}
            </p>

            {booking ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-sm space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order number</span>
                  <span className="font-mono text-orange-600">{booking.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="text-blue-900 font-bold">
                    ${Number(booking.total_usd).toFixed(2)} {booking.currency}
                  </span>
                </div>
                {booking.tilopay_auth ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auth code</span>
                    <span className="font-mono text-slate-600">{booking.tilopay_auth}</span>
                  </div>
                ) : null}
                {booking.tilopay_last4 ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Card</span>
                    <span className="font-mono text-slate-600">•••• {booking.tilopay_last4}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmation sent to</span>
                  <span className="text-slate-600">{booking.customer_email}</span>
                </div>
              </div>
            ) : null}

            {/* The .pdf download is the fallback for customers whose inbox
                routes our Resend email to spam (common on Hotmail / Bell-
                south). They walk away with a printable confirmation
                regardless of deliverability. */}
            {booking ? (
              <a
                href={`/api/booking/${encodeURIComponent(
                  booking.order_number,
                )}/pdf?t=${pdfTokenFor(booking.order_number)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition mb-3"
              >
                <Download size={18} />
                Download Booking Confirmation (PDF)
              </a>
            ) : null}

            <p className="text-slate-500 mb-3 text-sm">
              We&apos;ll be in touch shortly by email and WhatsApp with the final pickup details.
            </p>
            {/* Red-tinted spam advisory — Diego asked for it to stand out
                so customers actually notice it before they assume the
                booking failed and message support. */}
            <p className="text-red-600 mb-6 text-sm font-semibold">
              ⚠️ If you don&apos;t see our email within 5 minutes, please check your spam folder
              and mark{" "}
              <span className="font-mono">bookings@privatetravelcr.com</span>
              {" "}as &ldquo;Not spam&rdquo;.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-slate-900 font-semibold transition"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:info@privatetravelcr.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold transition"
              >
                <Mail size={16} />
                Email us
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
