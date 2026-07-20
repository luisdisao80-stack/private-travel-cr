"use client";

import { useState, useTransition, useEffect } from "react";
import { MapPin, Pencil } from "lucide-react";
import HotelAddressAutocomplete from "@/components/HotelAddressAutocomplete";
import type { Hotel } from "@/lib/types";
import { updateTripAddressAction } from "@/app/admin/(authed)/actions";

// Per-trip pickup + drop-off address editor for /admin/[order]. Renders
// each address as a display line by default with a small ✏️ button; on
// click the row swaps to <HotelAddressAutocomplete> + Save / Cancel.
//
// Why here and not inline in page.tsx: the display ↔ edit toggle, the
// pending state, and the "✓ Saved" fade all need client state. Rather
// than convert the whole booking detail page to a client component
// (which would kill its server-side Supabase fetch), we island THIS
// small piece as a client component and keep the rest server-rendered.
//
// Reuses the exact autocomplete the customer uses (the one that suggests
// the 156 hotels + falls back to free text) so Diego benefits from the
// same "type marriott, pick the row" experience when correcting a
// customer's ambiguous address.

type Props = {
  orderNumber: string;
  tripIndex: number;
  pickupPlace: string;
  dropoffPlace: string;
  /** For the empty-string fallback + context-boost in the autocomplete. */
  fromName: string;
  toName: string;
  /** All hotels — passed down from the server-rendered page so we don't
   *  refetch from the client. */
  hotels: Hotel[];
};

type Field = "pickupPlace" | "dropoffPlace";

export default function EditableTripAddresses({
  orderNumber,
  tripIndex,
  pickupPlace,
  dropoffPlace,
  fromName,
  toName,
  hotels,
}: Props) {
  return (
    <>
      <EditableAddressRow
        orderNumber={orderNumber}
        tripIndex={tripIndex}
        field="pickupPlace"
        label="Pickup"
        initialValue={pickupPlace}
        fallbackName={fromName}
        contextArea={fromName}
        hotels={hotels}
      />
      <EditableAddressRow
        orderNumber={orderNumber}
        tripIndex={tripIndex}
        field="dropoffPlace"
        label="Drop-off"
        initialValue={dropoffPlace}
        fallbackName={toName}
        contextArea={toName}
        hotels={hotels}
      />
    </>
  );
}

type RowProps = {
  orderNumber: string;
  tripIndex: number;
  field: Field;
  label: string;
  initialValue: string;
  /** fromName or toName — used as the display / fallback if the address
   *  itself is empty, matching the customer form's `|| fromName` rule. */
  fallbackName: string;
  contextArea: string;
  hotels: Hotel[];
};

function EditableAddressRow({
  orderNumber,
  tripIndex,
  field,
  label,
  initialValue,
  fallbackName,
  contextArea,
  hotels,
}: RowProps) {
  const [editing, setEditing] = useState(false);
  // currentValue is what's persisted (or last-successfully-saved). draft
  // is the in-flight edit buffer — kept separate so Cancel reverts
  // cleanly without touching what's shown when collapsed.
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fade the "✓ Saved" pill after 2s. Cheap timer, cleared on unmount /
  // re-save so a fast second edit doesn't show stale confirmations.
  useEffect(() => {
    if (savedAt == null) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  function beginEdit() {
    setDraft(currentValue);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setDraft(currentValue);
    setEditing(false);
    setError(null);
  }

  function save() {
    const trimmed = draft.trim();
    // Empty draft is legal — it means "clear to the location name". The
    // server action does the same fallback, so we mirror it locally for
    // the optimistic display value.
    const optimistic = trimmed || fallbackName;

    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("orderNumber", orderNumber);
        fd.set("tripIndex", String(tripIndex));
        fd.set("field", field);
        fd.set("newValue", trimmed);
        await updateTripAddressAction(fd);
        setCurrentValue(optimistic);
        setSavedAt(Date.now());
        setEditing(false);
      } catch (e) {
        // Server actions throw on redirect() and other unwind paths; a
        // real DB error is what we care about surfacing. Log and show.
        console.error("[EditableTripAddresses] save failed:", e);
        setError("Save failed — try again in a moment.");
      }
    });
  }

  // Display fallback: when currentValue is empty (customer never filled
  // this field), show the location name in muted color rather than a
  // literal blank — matches the read-only rendering the page used to do.
  const displayValue = currentValue || fallbackName;
  const displayIsFallback = !currentValue;

  return (
    <div className="inline-flex items-start gap-1.5 sm:col-span-2 w-full">
      <MapPin size={12} className="text-gray-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {!editing ? (
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-gray-500 shrink-0">{label}:</span>
            <span
              className={
                displayIsFallback
                  ? "text-gray-500 italic"
                  : "text-gray-300"
              }
            >
              {displayValue}
            </span>
            <button
              type="button"
              onClick={beginEdit}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 hover:text-amber-400 transition-colors ml-1"
              aria-label={`Edit ${label.toLowerCase()} address`}
            >
              <Pencil size={10} />
              Edit
            </button>
            {savedAt != null && (
              <span className="text-[10px] text-green-400 animate-pulse">
                ✓ Saved
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">
                {label} address
              </span>
              <span className="text-[10px] text-gray-600">
                (leave blank → use &ldquo;{fallbackName}&rdquo;)
              </span>
            </div>
            <HotelAddressAutocomplete
              value={draft}
              onChange={setDraft}
              hotels={hotels}
              contextArea={contextArea}
              placeholder={`Hotel, Airbnb or address in ${contextArea}`}
              inputClassName="w-full bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm text-white"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold text-xs px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5"
              >
                {pending && (
                  <span
                    className="inline-block w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin"
                    aria-hidden
                  />
                )}
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={pending}
                className="text-xs text-gray-400 hover:text-white disabled:cursor-not-allowed transition-colors px-2 py-1.5"
              >
                Cancel
              </button>
              {error && (
                <span className="text-[11px] text-red-300">{error}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Saves the address to the database only — the customer is{" "}
              <strong className="text-amber-300">NOT</strong> emailed
              automatically. Use &ldquo;Resend confirmation&rdquo; below
              when you&apos;re ready to send the corrected details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
