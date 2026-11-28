"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, Plus, Send, Trash2 } from "lucide-react";

// Client-side create-quote form. Handles the array-of-trips dynamism
// (add / remove / live total) locally, then hands off to the server
// action once submitted. Each trip's fields ride the FormData with
// name="trips[N].<field>" so the action can reassemble the array on
// the server without a JSON payload.
//
// The customer + notes sections stay flat (no repeats). Total USD is
// the sum of every trip's tripPrice unless Diego overrides it with a
// manual value — mirrors how the public /book calculator works so a
// customer-facing booking and an admin-created one produce identical
// bookings rows in the end.

type Trip = {
  id: string;
  fromName: string;
  toName: string;
  pickupPlace: string;
  dropoffPlace: string;
  date: string;
  pickupTime: string;
  passengers: string;
  serviceType: "standard" | "vip";
  vehicleName: string;
  flightNumber: string;
  tripPrice: string;
};

function emptyTrip(): Trip {
  return {
    // A stable id-per-render for React keys; the server action doesn't
    // see this — it iterates by index.
    id: Math.random().toString(36).slice(2, 10),
    fromName: "",
    toName: "",
    pickupPlace: "",
    dropoffPlace: "",
    date: "",
    pickupTime: "",
    passengers: "1",
    serviceType: "standard",
    vehicleName: "",
    flightNumber: "",
    tripPrice: "",
  };
}

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export default function CreateQuoteForm({ action }: Props) {
  const [trips, setTrips] = useState<Trip[]>([emptyTrip()]);
  const [overrideTotal, setOverrideTotal] = useState<string>("");

  // Live total — sum of every trip's tripPrice unless Diego typed a
  // manual override. Non-numeric values are treated as 0 so the total
  // never NaN's out mid-typing.
  const computedTotal = useMemo(() => {
    return trips.reduce((sum, t) => {
      const n = parseFloat(t.tripPrice);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [trips]);

  const displayedTotal =
    overrideTotal.trim() !== ""
      ? overrideTotal
      : computedTotal > 0
        ? computedTotal.toFixed(2)
        : "";

  function updateTrip(idx: number, patch: Partial<Trip>) {
    setTrips((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    );
  }

  function addTrip() {
    setTrips((prev) => [...prev, emptyTrip()]);
  }

  function removeTrip(idx: number) {
    setTrips((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={action} className="space-y-6">
      {/* CUSTOMER */}
      <section className="bg-adm-surface border border-adm-border rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-accent mb-4">
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
        </div>
      </section>

      {/* TRIPS — one section per trip in the array */}
      {trips.map((trip, idx) => (
        <section
          key={trip.id}
          className="bg-adm-surface border border-adm-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-adm-accent">
              Trip #{idx + 1}
            </h2>
            {trips.length > 1 && (
              <button
                type="button"
                onClick={() => removeTrip(idx)}
                className="inline-flex items-center gap-1 text-[11px] text-adm-danger hover:text-adm-danger transition-colors"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="From"
              name={`trips[${idx}].fromName`}
              required
              placeholder="SJO - Juan Santamaria Int. Airport"
              value={trip.fromName}
              onChange={(v) => updateTrip(idx, { fromName: v })}
            />
            <Field
              label="To"
              name={`trips[${idx}].toName`}
              required
              placeholder="La Fortuna (Arenal)"
              value={trip.toName}
              onChange={(v) => updateTrip(idx, { toName: v })}
            />
            <Field
              label="Pickup address / hotel (optional)"
              name={`trips[${idx}].pickupPlace`}
              placeholder="Tabacón Thermal Resort"
              value={trip.pickupPlace}
              onChange={(v) => updateTrip(idx, { pickupPlace: v })}
            />
            <Field
              label="Drop-off address / hotel (optional)"
              name={`trips[${idx}].dropoffPlace`}
              placeholder="17662 Tide Line Drive"
              value={trip.dropoffPlace}
              onChange={(v) => updateTrip(idx, { dropoffPlace: v })}
            />
            <Field
              label="Date"
              name={`trips[${idx}].date`}
              type="date"
              required
              value={trip.date}
              onChange={(v) => updateTrip(idx, { date: v })}
            />
            <Field
              label="Pickup time"
              name={`trips[${idx}].pickupTime`}
              type="time"
              required
              value={trip.pickupTime}
              onChange={(v) => updateTrip(idx, { pickupTime: v })}
            />
            <Field
              label="Passengers"
              name={`trips[${idx}].passengers`}
              type="number"
              required
              min="1"
              max="12"
              value={trip.passengers}
              onChange={(v) => updateTrip(idx, { passengers: v })}
            />
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-adm-faint mb-1.5">
                Service type
              </label>
              <select
                name={`trips[${idx}].serviceType`}
                value={trip.serviceType}
                onChange={(e) =>
                  updateTrip(idx, {
                    serviceType: e.target.value as "standard" | "vip",
                  })
                }
                className="w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="vip">VIP (+$80 hasta 5 pax · +$100 6-7 · +$120 8-9 · +$150 10-12)</option>
              </select>
            </div>
            <Field
              label="Vehicle (auto-picked if empty)"
              name={`trips[${idx}].vehicleName`}
              placeholder="Hyundai Staria / Toyota Hiace / Maxus V90"
              value={trip.vehicleName}
              onChange={(v) => updateTrip(idx, { vehicleName: v })}
            />
            <Field
              label="Flight number (optional)"
              name={`trips[${idx}].flightNumber`}
              placeholder="e.g. UA123"
              value={trip.flightNumber}
              onChange={(v) => updateTrip(idx, { flightNumber: v })}
            />
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-adm-faint mb-1.5">
                Trip price USD
                <span className="text-adm-accent ml-0.5">*</span>
              </label>
              <input
                type="number"
                name={`trips[${idx}].tripPrice`}
                required
                min="1"
                step="1"
                placeholder="220"
                value={trip.tripPrice}
                onChange={(e) =>
                  updateTrip(idx, { tripPrice: e.target.value })
                }
                className="w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
        </section>
      ))}

      {/* Add another trip button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addTrip}
          className="inline-flex items-center gap-2 bg-adm-surface hover:bg-adm-surface-2 border border-dashed border-adm-accent/40 hover:border-adm-accent/70 text-adm-accent font-semibold text-xs px-5 py-3 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Add another trip
        </button>
      </div>

      {/* TOTAL */}
      <section className="bg-adm-surface border border-adm-border rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-accent mb-4">
          Total
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-adm-faint mb-1.5">
              Auto sum of trips
            </label>
            <div className="w-full bg-adm-bg border border-adm-border-strong rounded-md px-3 py-2 text-sm font-mono text-adm-muted">
              ${computedTotal.toFixed(2)} USD
            </div>
            <p className="text-[10px] text-adm-faint mt-1.5">
              Automatically added from each trip&apos;s price.
            </p>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-adm-faint mb-1.5">
              Override total (optional)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder={
                computedTotal > 0 ? computedTotal.toFixed(2) : "220"
              }
              value={overrideTotal}
              onChange={(e) => setOverrideTotal(e.target.value)}
              className="w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm font-mono"
            />
            <p className="text-[10px] text-adm-faint mt-1.5 flex items-start gap-1">
              <Info size={11} className="text-adm-accent mt-0.5 shrink-0" />
              Leave blank to use the auto sum. Fill in if you agreed a
              different total (discount, add-ons).
            </p>
          </div>
        </div>
        {/* The action reads totalUsd from the FormData — send whichever
            the operator elected (override wins over sum). */}
        <input type="hidden" name="totalUsd" value={displayedTotal} />
      </section>

      {/* NOTES */}
      <section className="bg-adm-surface border border-adm-border rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-accent mb-4">
          Internal notes (optional)
        </h2>
        <textarea
          name="notes"
          rows={3}
          placeholder="Anything the driver should know…"
          className="w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm resize-y"
        />
      </section>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-adm-faint">
          {trips.length === 1
            ? "1 trip"
            : `${trips.length} trips`}{" "}
          · Sending to customer:{" "}
          <span className="text-adm-accent font-mono">
            ${displayedTotal || "0.00"} USD
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin"
            className="text-xs text-adm-muted hover:text-adm-text transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={trips.length === 0 || !displayedTotal}
            className="inline-flex items-center gap-2 bg-adm-accent hover:bg-adm-accent-hover disabled:bg-adm-surface-2 disabled:text-adm-faint disabled:cursor-not-allowed text-adm-on-accent font-bold text-sm px-6 py-3 rounded-md transition-colors"
          >
            <Send size={14} />
            Send payment link to customer
          </button>
        </div>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  min?: string;
  max?: string;
};

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  value,
  onChange,
  min,
  max,
}: FieldProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-adm-faint mb-1.5">
        {label}
        {required && <span className="text-adm-accent ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={onChange ? undefined : defaultValue}
        value={onChange ? value ?? "" : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        min={min}
        max={max}
        className="w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}
