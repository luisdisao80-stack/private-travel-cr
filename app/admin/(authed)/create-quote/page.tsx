import Link from "next/link";
import { ChevronLeft, Send, Info } from "lucide-react";
import { createQuoteAction } from "../actions";

export const dynamic = "force-dynamic";

// Admin-only form for creating a booking on behalf of a customer who
// can't (or doesn't want to) use the public site. Submitting fires
// createQuoteAction, which inserts a pending booking with a
// payment_token and emails the customer a single-CTA "complete your
// booking" message. Once the customer pays, the normal Tilopay
// callback flips the status to approved and the standard confirmation
// pipeline runs — Diego gets the same "🚐 New booking" ping as with
// any customer-initiated booking.
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
          booking&rdquo; email.
        </p>
      </div>

      <form action={createQuoteAction} className="space-y-6">
        {/* CUSTOMER */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
            Customer
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Full name"
              name="customerName"
              required
              placeholder="Jane Doe"
            />
            <Field
              label="Email"
              name="customerEmail"
              type="email"
              required
              placeholder="jane@example.com"
            />
            <Field
              label="Phone (with country code)"
              name="customerPhone"
              placeholder="+1 555 123 4567"
            />
            <Field
              label="Flight number (optional)"
              name="flightNumber"
              placeholder="e.g. UA123"
            />
          </div>
        </section>

        {/* TRIP */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
            Trip
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="From"
              name="fromName"
              required
              placeholder="SJO - Juan Santamaria Int. Airport"
            />
            <Field
              label="To"
              name="toName"
              required
              placeholder="La Fortuna (Arenal)"
            />
            <Field
              label="Pickup address / hotel (optional)"
              name="pickupPlace"
              placeholder="Tabacón Thermal Resort"
            />
            <Field
              label="Drop-off address / hotel (optional)"
              name="dropoffPlace"
              placeholder="17662 Tide Line Drive"
            />
            <Field
              label="Date"
              name="date"
              type="date"
              required
            />
            <Field
              label="Pickup time"
              name="pickupTime"
              type="time"
              required
            />
            <Field
              label="Passengers"
              name="passengers"
              type="number"
              required
              defaultValue="1"
              min="1"
              max="12"
            />
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                Service type
              </label>
              <select
                name="serviceType"
                defaultValue="standard"
                className="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="vip">VIP (+$80)</option>
              </select>
            </div>
            <Field
              label="Vehicle (auto-picked if empty)"
              name="vehicleName"
              placeholder="Hyundai Staria / Toyota Hiace / Maxus V90"
            />
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                Total USD (what the customer pays)
              </label>
              <input
                type="number"
                name="totalUsd"
                required
                min="1"
                step="1"
                placeholder="220"
                className="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-1.5 flex items-start gap-1">
                <Info size={11} className="text-amber-400 mt-0.5 shrink-0" />
                Enter the exact total you agreed with the customer. Includes
                everything (VIP surcharge, extra stops, discounts).
              </p>
            </div>
          </div>
        </section>

        {/* NOTES */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
            Internal notes (optional)
          </h2>
          <textarea
            name="notes"
            rows={3}
            placeholder="Anything the driver should know…"
            className="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm resize-y"
          />
        </section>

        <div className="flex items-center justify-end gap-3 flex-wrap">
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-6 py-3 rounded-md transition-colors"
          >
            <Send size={14} />
            Send payment link to customer
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-amber-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        max={max}
        className="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}
