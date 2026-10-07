"use client";

import { useState, useTransition, useEffect } from "react";
import { Plane, Pencil } from "lucide-react";
import { updateTripFlightAction } from "@/app/admin/(authed)/actions";

// Per-trip flight-number editor for /admin/[order]. Same display ↔ edit
// island pattern as EditableTripAddresses: the booking detail page stays
// a server component and only this row carries client state.
//
// Why it ALWAYS renders (even when the trip has no flight yet): the most
// common case is a customer who books without a flight number and emails
// it later — Diego needs an "add" affordance, not just an "edit" one.
// (Diego 2026-10-06: "en el admin necesito poder modificar el numero de
// vuelo".)

type Props = {
  orderNumber: string;
  tripIndex: number;
  flightNumber: string;
};

export default function EditableTripFlight({
  orderNumber,
  tripIndex,
  flightNumber,
}: Props) {
  const [editing, setEditing] = useState(false);
  // currentValue = last-persisted value; draft = in-flight edit buffer,
  // kept separate so Cancel reverts cleanly.
  const [currentValue, setCurrentValue] = useState(flightNumber);
  const [draft, setDraft] = useState(flightNumber);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fade the "✓ Saved" pill after 2s, same as the address editor.
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
    // Mirror the server action's normalization (trim + uppercase) so the
    // optimistic display matches what actually got stored.
    const normalized = draft.trim().toUpperCase();

    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("orderNumber", orderNumber);
        fd.set("tripIndex", String(tripIndex));
        fd.set("newValue", normalized);
        await updateTripFlightAction(fd);
        setCurrentValue(normalized);
        setSavedAt(Date.now());
        setEditing(false);
      } catch (e) {
        console.error("[EditableTripFlight] save failed:", e);
        setError("Save failed — try again in a moment.");
      }
    });
  }

  return (
    <div className="inline-flex items-start gap-1.5">
      <Plane size={12} className="text-gray-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {!editing ? (
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-gray-500 shrink-0">Flight:</span>
            <span
              className={
                currentValue ? "text-gray-300" : "text-gray-500 italic"
              }
            >
              {currentValue || "none"}
            </span>
            <button
              type="button"
              onClick={beginEdit}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 hover:text-amber-400 transition-colors ml-1"
              aria-label="Edit flight number"
            >
              <Pencil size={10} />
              {currentValue ? "Edit" : "Add"}
            </button>
            {savedAt != null && (
              <span className="text-[10px] text-green-400 animate-pulse">
                ✓ Saved
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              placeholder="e.g. DL 619 (blank = remove)"
              autoFocus
              className="w-44 bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm text-white uppercase placeholder:normal-case placeholder:text-gray-600"
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
              Saves to the database only — the customer is{" "}
              <strong className="text-amber-300">NOT</strong> emailed
              automatically. Use &ldquo;Resend confirmation&rdquo; below
              when you&apos;re ready to send the updated details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
