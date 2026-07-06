import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createQuoteAction } from "../actions";
import CreateQuoteForm from "@/components/admin/CreateQuoteForm";

export const dynamic = "force-dynamic";

// Admin-only form for creating a booking on behalf of a customer who
// can't (or doesn't want to) use the public site. Submitting fires
// createQuoteAction, which inserts a pending booking with a
// payment_token and emails the customer a single-CTA "complete your
// booking" message. Once the customer pays, the normal Tilopay
// callback flips the status to approved and the standard confirmation
// pipeline runs — Diego gets the same "🚐 New booking" ping as with
// any customer-initiated booking.
//
// Multi-trip support (2026-07-05): the form now takes an array of
// trips instead of a single trip. Diego wanted this after quoting a
// family that needed SJO→La Fortuna + La Fortuna→Manuel Antonio +
// Manuel Antonio→SJO in a single booking. The UI lives in a client
// component (CreateQuoteForm) because we need dynamic add/remove +
// live total; the page component stays a server component so this
// route can still be prerendered on the auth wrap.
export default function CreateQuotePage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400 mb-4"
      >
        <ChevronLeft size={14} /> All bookings
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Create quote for customer
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
          For customers who can&apos;t use the site. Fill this out and the
          customer receives a single email with a &ldquo;Pay now&rdquo;
          button — no form to fill on their end. Link expires in 48
          hours. Once they pay, you&apos;ll get the normal &ldquo;New
          booking&rdquo; email. Add multiple trips if the customer
          needs a round trip or multi-leg itinerary.
        </p>
      </div>

      <CreateQuoteForm action={createQuoteAction} />
    </div>
  );
}
