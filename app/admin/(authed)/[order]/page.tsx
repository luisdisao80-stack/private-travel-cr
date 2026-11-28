import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MessageCircle, Phone, Plane, Calendar, Users, Hotel, FileText, TrendingUp, Globe, MapPinned, Smartphone, Baby, Send, Download, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { pdfTokenFor } from "@/lib/pdf-token";
import { getAllHotels } from "@/lib/hotels-db";
import type { CartItem } from "@/lib/CartContext";
import {
  STATUSES,
  statusBadgeClass,
  formatCRDateTime,
  pickupAt,
} from "@/components/admin/booking-helpers";
import EditableTripAddresses from "@/components/admin/EditableTripAddresses";
import EditableTripFlight from "@/components/admin/EditableTripFlight";
import ResendConfirmationButton from "@/components/admin/ResendConfirmationButton";
import {
  updateBookingStatusAction,
  updateTripDateTimeAction,
  resendConfirmationEmailAction,
  sendTripUpdateEmailAction,
  deleteTripAction,
} from "../actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ order: string }>;
  searchParams: Promise<{ saved?: string; sent?: string }>;
};

export default async function AdminBookingDetailPage({
  params,
  searchParams,
}: Props) {
  const { order } = await params;
  const { saved, sent } = await searchParams;
  const orderNumber = decodeURIComponent(order);

  // One-shot status flags set by the server actions via redirect.
  // ?saved=trip-N       → trip N was just edited (DB only, no email sent)
  // ?saved=trip-deleted → a trip was just removed + total recalculated
  // ?sent=update        → the update notification email was just dispatched
  const justDeletedTrip = saved === "trip-deleted";
  const justSavedTripIdx =
    !justDeletedTrip && saved?.startsWith("trip-")
      ? parseInt(saved.slice(5), 10)
      : null;
  const justSentUpdate = sent === "update";

  // Fetch the booking and the hotel list in parallel — hotels feed the
  // per-trip <EditableTripAddresses> autocomplete so Diego gets the same
  // 156-hotel suggestions the customer sees on /book. The list is small
  // (~156 rows) and cached in Supabase, so the added round-trip is
  // negligible next to the booking read.
  const [{ data, error }, hotels] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select(
        "order_number, customer_name, customer_email, customer_phone, customer_hotel, flight_number, flight_time, notes, items, total_usd, currency, status, created_at, reminder_sent_at, tilopay_auth, tilopay_last4, attribution",
      )
      .eq("order_number", orderNumber)
      .maybeSingle(),
    getAllHotels(),
  ]);

  if (error) {
    return (
      <div className="bg-adm-danger/10 border border-adm-danger/30 text-adm-danger text-sm rounded-md px-4 py-3">
        Failed to load booking: {error.message}
      </div>
    );
  }
  if (!data) notFound();

  const items = (data.items as CartItem[]) || [];
  const phone = data.customer_phone || "";
  const phoneDigits = phone.replace(/[^0-9]/g, "");
  const whatsappHref = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith("00") ? phoneDigits.slice(2) : phoneDigits}`
    : "";

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs text-adm-muted hover:text-adm-accent-hover mb-4"
      >
        <ChevronLeft size={14} /> All bookings
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-adm-faint">
            Order number
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono">
            {data.order_number}
          </h1>
          <div className="text-xs text-adm-faint mt-1">
            Created {formatCRDateTime(new Date(data.created_at))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ${statusBadgeClass(data.status)}`}
          >
            {data.status || "—"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-adm-surface border border-adm-border rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-4">
            Customer
          </h2>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={data.customer_name || "—"} />
            <Row
              label="Email"
              value={
                data.customer_email ? (
                  <a
                    href={`mailto:${data.customer_email}`}
                    className="text-adm-accent hover:text-adm-accent-hover inline-flex items-center gap-1.5"
                  >
                    <Mail size={12} /> {data.customer_email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Phone"
              value={
                phone ? (
                  <span className="inline-flex items-center gap-3">
                    <a
                      href={`tel:${phone}`}
                      className="text-adm-accent hover:text-adm-accent-hover inline-flex items-center gap-1.5"
                    >
                      <Phone size={12} /> {phone}
                    </a>
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-adm-ok hover:text-adm-ok inline-flex items-center gap-1.5"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    )}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            {data.customer_hotel && (
              <Row
                label="Hotel"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Hotel size={12} className="text-adm-faint" />
                    {data.customer_hotel}
                  </span>
                }
              />
            )}
            {data.flight_number && (
              <Row
                label="Flight"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Plane size={12} className="text-adm-faint" />
                    {data.flight_number}
                    {data.flight_time ? ` · ${data.flight_time}` : ""}
                  </span>
                }
              />
            )}
            {data.notes && (
              <Row
                label="Notes"
                value={
                  <span className="inline-flex items-start gap-1.5">
                    <FileText
                      size={12}
                      className="text-adm-faint mt-0.5 shrink-0"
                    />
                    <span className="whitespace-pre-wrap">{data.notes}</span>
                  </span>
                }
              />
            )}
          </div>
        </div>

        <div className="bg-adm-surface border border-adm-border rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-4">
            Payment
          </h2>
          <div className="space-y-3 text-sm">
            <Row
              label="Total"
              value={
                <span className="text-lg font-bold text-adm-accent">
                  ${Number(data.total_usd || 0).toFixed(2)} {data.currency || "USD"}
                </span>
              }
            />
            {data.tilopay_auth && (
              <Row label="Tilopay auth" value={<span className="font-mono text-xs">{data.tilopay_auth}</span>} />
            )}
            {data.tilopay_last4 && (
              <Row label="Card last 4" value={<span className="font-mono">**** {data.tilopay_last4}</span>} />
            )}
            <Row
              label="Reminder sent"
              value={
                data.reminder_sent_at
                  ? formatCRDateTime(new Date(data.reminder_sent_at))
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-adm-surface border border-adm-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-4">
          Trips ({items.length})
        </h2>
        {/* One-shot banner after deleteTripAction redirects back with
            ?saved=trip-deleted. Mirrors the per-trip date/time banner:
            confirms the DB change and points at the notify button, since
            deletes (like edits) never auto-email the customer. */}
        {justDeletedTrip && (
          <div className="mb-4 rounded-md border border-adm-ok/40 bg-adm-ok/10 px-3 py-2 text-xs text-adm-ok leading-relaxed">
            ✅ <strong>Trip deleted.</strong> The total has been
            recalculated with the remaining trips. The customer has NOT
            been notified yet — use &ldquo;Notify customer of
            changes&rdquo; below to send the updated details.
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-adm-faint">No trip items found.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => {
              const pu = pickupAt(it);
              return (
                <div
                  key={it.id || idx}
                  className="border border-adm-border rounded-lg p-4 bg-adm-bg/40"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="font-bold text-sm">
                      {it.fromName} → {it.toName}
                    </div>
                    <div className="text-xs text-adm-muted">
                      {it.vehicleName} ·{" "}
                      <span className="uppercase">{it.serviceType}</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-adm-text-2">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar size={12} className="text-adm-faint" />
                      {pu ? formatCRDateTime(pu) : `${it.date} ${it.pickupTime}`}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Users size={12} className="text-adm-faint" />
                      {it.passengers} adult{it.passengers === 1 ? "" : "s"}
                      {it.children
                        ? ` · ${it.children} child${it.children === 1 ? "" : "ren"}`
                        : ""}
                    </div>
                    {/* Pickup + drop-off addresses — inline-editable via
                        the shared HotelAddressAutocomplete. Previously
                        read-only, so a customer who typed an ambiguous
                        address ("the yellow house near the church")
                        forced Diego to fix it via raw SQL. The row now
                        always renders (even if the customer left it
                        empty — falls back to fromName / toName in
                        italics) so Diego can add an address post-hoc
                        as well. Silent save; use "Resend confirmation"
                        below to notify the customer. */}
                    <EditableTripAddresses
                      orderNumber={data.order_number}
                      tripIndex={idx}
                      pickupPlace={it.pickupPlace ?? ""}
                      dropoffPlace={it.dropoffPlace ?? ""}
                      fromName={it.fromName}
                      toName={it.toName}
                      hotels={hotels}
                    />

                    {/* Flight number — inline-editable, always rendered
                        (even when the customer booked without one) so
                        Diego can add it when the client sends it later
                        by email/WhatsApp. DB-only save, same contract as
                        the address editor above. */}
                    <EditableTripFlight
                      orderNumber={data.order_number}
                      tripIndex={idx}
                      flightNumber={it.flightNumber ?? ""}
                    />
                    {/* Child-seat request line — was missing from this
                        view entirely, so Diego never saw what the
                        customer asked for and only found out at pickup.
                        Highlighted in amber so it stands out next to
                        the other neutral-gray meta rows. */}
                    {(() => {
                      const parts: string[] = [];
                      if (it.infantSeats)
                        parts.push(`${it.infantSeats} infant`);
                      if (it.convertibleSeats)
                        parts.push(`${it.convertibleSeats} convertible`);
                      if (it.boosterSeats)
                        parts.push(`${it.boosterSeats} booster`);
                      if (parts.length === 0) return null;
                      return (
                        <div className="inline-flex items-center gap-1.5 sm:col-span-2 text-adm-accent font-medium">
                          <Baby size={12} className="text-adm-accent" />
                          <span className="text-adm-accent/70">Child seats:</span>{" "}
                          {parts.join(" + ")}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Edit date / time — common request: customer messages
                      Diego saying "we got the date wrong, can you push it
                      to the 25th?" Before this form existed every change
                      needed raw-SQL access. Wrapped in <details> so the
                      card stays clean until needed; default-collapsed. */}
                  <details className="mt-3 border-t border-adm-border pt-3 group">
                    <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-adm-faint hover:text-adm-accent-hover transition-colors select-none">
                      Change date / time
                    </summary>
                    <form
                      action={updateTripDateTimeAction}
                      className="mt-3 flex flex-wrap items-end gap-2"
                    >
                      <input
                        type="hidden"
                        name="orderNumber"
                        value={data.order_number}
                      />
                      <input
                        type="hidden"
                        name="tripIndex"
                        value={idx}
                      />
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-adm-faint">
                          Date
                        </span>
                        <input
                          type="date"
                          name="date"
                          defaultValue={it.date}
                          required
                          className="bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm text-adm-text"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-adm-faint">
                          Pickup time
                        </span>
                        <input
                          type="time"
                          name="pickupTime"
                          defaultValue={it.pickupTime}
                          required
                          className="bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm text-adm-text"
                        />
                      </label>
                      <button
                        type="submit"
                        className="bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-xs px-4 py-2 rounded-md transition-colors"
                      >
                        Save change
                      </button>
                      <span className="text-[10px] text-adm-faint ml-1 leading-relaxed">
                        Saves the change to the database only — the customer
                        is <strong className="text-adm-accent">NOT</strong>{" "}
                        emailed automatically. After saving, use the
                        &ldquo;Notify customer of changes&rdquo; button below
                        when you&apos;re ready to send the update email.
                      </span>
                    </form>

                    {/* Per-trip "saved" confirmation. Shows once the
                        updateTripDateTimeAction redirects with
                        ?saved=trip-<idx> — matches the index of THIS
                        trip card so multi-trip bookings only flash the
                        banner on the one Diego just edited. */}
                    {justSavedTripIdx === idx && (
                      <div className="mt-3 rounded-md border border-adm-ok/40 bg-adm-ok/10 px-3 py-2 text-xs text-adm-ok leading-relaxed">
                        ✅ <strong>Saved.</strong> The new date / time is in
                        the database. The customer has NOT been notified yet
                        — scroll down to &ldquo;Notify customer of
                        changes&rdquo; to send the update email when ready.
                      </div>
                    )}
                  </details>

                  {/* Delete this trip — Diego 2026-09-15: multi-trip
                      quotes where the customer drops a leg ("la vuelta
                      ya no la ocupamos"). The <details> wrapper doubles
                      as the confirmation step (open, then click the red
                      button) with zero client JS — same pattern as the
                      date/time editor above. Hidden on single-trip
                      bookings: deleting the only trip would leave a
                      husk; the server action refuses it too. Silent
                      save, notify via the button below — same contract
                      as every other trip edit on this page. */}
                  {items.length > 1 && (
                    <details className="mt-3 border-t border-adm-border pt-3">
                      <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-adm-faint hover:text-adm-danger transition-colors select-none">
                        Delete this trip
                      </summary>
                      <form
                        action={deleteTripAction}
                        className="mt-3 flex flex-wrap items-center gap-3"
                      >
                        <input
                          type="hidden"
                          name="orderNumber"
                          value={data.order_number}
                        />
                        <input type="hidden" name="tripIndex" value={idx} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 bg-adm-danger hover:bg-adm-danger/85 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors"
                        >
                          <Trash2 size={12} />
                          Yes, delete this trip
                        </button>
                        <span className="text-[10px] text-adm-faint ml-1 leading-relaxed">
                          Removes this trip and recalculates the total with
                          the remaining trips. The customer is{" "}
                          <strong className="text-adm-accent">NOT</strong>{" "}
                          emailed automatically — use &ldquo;Notify customer
                          of changes&rdquo; below when you&apos;re ready.
                        </span>
                      </form>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AttributionCard attribution={data.attribution as Record<string, unknown> | null} />

      <div className="bg-adm-surface border border-adm-border rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-4">
          Change status
        </h2>
        <form
          action={updateBookingStatusAction}
          className="flex items-center gap-3 flex-wrap"
        >
          <input
            type="hidden"
            name="orderNumber"
            value={data.order_number}
          />
          <select
            name="status"
            defaultValue={data.status || ""}
            className="bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-xs px-4 py-2 rounded-md transition-colors"
          >
            Save
          </button>
        </form>
      </div>

      {/* Notify-customer-of-changes card. Used after Diego edits a
          trip's date / time — the save action no longer auto-emails
          (Diego asked for that on 2026-06-24 because iterative edits
          kept blasting the customer mid-change). When this button
          fires, it dispatches the "your booking has been updated"
          template (sendBookingUpdateEmails — not the same as the
          "confirmation" copy below). Border + background flip green
          right after an edit so it visually pulls Diego's eye to it. */}
      <div
        className={`border rounded-xl p-5 mt-6 transition-colors ${
          (justSavedTripIdx !== null || justDeletedTrip) && !justSentUpdate
            ? "bg-adm-ok/5 border-adm-ok/40"
            : "bg-adm-surface border-adm-border"
        }`}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-2 inline-flex items-center gap-2">
          <Send size={14} className="text-adm-ok" />
          Notify customer of changes
        </h2>
        <p className="text-xs text-adm-faint mb-4 leading-relaxed">
          Sends an &ldquo;Your booking has been updated&rdquo; email with
          the current trip details + a refreshed .ics calendar invite to{" "}
          <span className="text-adm-accent font-medium">
            {data.customer_email || "(no email on file)"}
          </span>
          . Use this AFTER you&apos;ve edited a trip&apos;s date / time
          above and verified the change is correct.
        </p>
        {justSentUpdate && (
          <div className="mb-4 rounded-md border border-adm-ok/40 bg-adm-ok/10 px-3 py-2 text-xs text-adm-ok">
            ✅ <strong>Update email sent</strong> to {data.customer_email}.
          </div>
        )}
        <form
          action={sendTripUpdateEmailAction}
          className="flex items-center gap-3 flex-wrap"
        >
          <input
            type="hidden"
            name="orderNumber"
            value={data.order_number}
          />
          <button
            type="submit"
            disabled={!data.customer_email}
            className="inline-flex items-center gap-2 bg-adm-ok hover:bg-adm-ok/85 disabled:bg-adm-surface-2 disabled:text-adm-faint disabled:cursor-not-allowed text-adm-on-accent font-bold text-xs px-4 py-2 rounded-md transition-colors"
          >
            <Send size={12} />
            Send update email to customer
          </button>
        </form>
      </div>

      {/* Resend confirmation card — separate from Change status so the
          two actions don't crowd each other and Diego doesn't fire one
          when he meant the other. The form uses a server action with
          one hidden input; clicking the button re-fires the original
          "Booking Confirmed" email to the customer ONLY (no internal
          copy — Diego already knows about the booking; duplicate pings
          for the same order train him to ignore them). Only shown for
          approved bookings — resending a "confirmation" for a pending
          / cancelled booking would confuse the customer. */}
      {data.status === "approved" && (
        <div className="bg-adm-surface border border-adm-border rounded-xl p-5 mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-2 inline-flex items-center gap-2">
            <Send size={14} className="text-adm-accent" />
            Resend confirmation email
          </h2>
          <p className="text-xs text-adm-faint mb-4 leading-relaxed">
            Use when a customer messages saying they didn&apos;t receive
            the ORIGINAL confirmation (e.g. it landed in spam), or after
            you&apos;ve corrected a pickup / drop-off address and want
            the customer to have the refreshed details. Re-sends the
            original &ldquo;Booking Confirmed&rdquo; template to{" "}
            <span className="text-adm-accent font-medium">
              {data.customer_email || "(no email on file)"}
            </span>{" "}
            only — your internal inbox is NOT copied. For date / time
            changes to an existing booking, use &ldquo;Notify customer
            of changes&rdquo; above instead.
          </p>
          <ResendConfirmationButton
            orderNumber={data.order_number}
            customerEmail={data.customer_email}
            action={resendConfirmationEmailAction}
          />
        </div>
      )}

      {/* Driver Trip Sheet PDF — same PDF pipeline as the customer
          receipt but with pricing stripped. Diego 2026-07-05: forwards
          this file to his drivers over WhatsApp without revealing what
          the customer paid. Opens in a new tab (target="_blank") so he
          doesn't lose the admin page context; download attribute
          renames the file to match the driver-sheet naming convention
          the API sets in Content-Disposition. Only shown once the
          booking is approved — pending/rejected bookings 409 from the
          PDF route. */}
      {data.status === "approved" && (
        <div className="bg-adm-surface border border-adm-border rounded-xl p-5 mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-2 inline-flex items-center gap-2">
            <Download size={14} className="text-adm-info" />
            Driver trip sheet (no pricing)
          </h2>
          <p className="text-xs text-adm-faint mb-4 leading-relaxed">
            Downloads a PDF with the trip details (route, addresses,
            date, passengers, flight, notes) but WITHOUT the total, the
            per-trip prices, or the Tilopay auth / card info. Send this
            to your driver over WhatsApp and they won&apos;t see what
            the customer paid.
          </p>
          <a
            href={`/api/booking/${encodeURIComponent(
              data.order_number,
            )}/pdf?variant=driver&t=${pdfTokenFor(data.order_number)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-adm-info hover:bg-adm-info/85 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors"
          >
            <Download size={12} />
            Download driver PDF
          </a>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-20 shrink-0 text-[11px] uppercase tracking-wider text-adm-faint pt-0.5">
        {label}
      </div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  );
}

// "Where did this booking come from?" card. Renders nothing for legacy
// bookings (placed before the attribution column existed) so the admin
// stays clean. Bookings going forward will show the full provenance.
function AttributionCard({
  attribution,
}: {
  attribution: Record<string, unknown> | null;
}) {
  if (!attribution || Object.keys(attribution).length === 0) return null;

  const get = (k: string) => {
    const v = attribution[k];
    return typeof v === "string" && v ? v : null;
  };

  const referrerDomain = get("referrer_domain");
  const landingPage = get("landing_page");
  const utmSource = get("utm_source");
  const utmMedium = get("utm_medium");
  const utmCampaign = get("utm_campaign");
  const utmContent = get("utm_content");
  const utmTerm = get("utm_term");
  const country = get("country");
  const city = get("city");
  const region = get("region");
  const device = get("device");
  const firstSeenAt = get("first_seen_at");
  const userAgent = get("user_agent");

  // Country flag emoji from ISO 3166 alpha-2 (e.g. "US" → 🇺🇸). Falls back
  // to the raw code if anything goes sideways (e.g. unicode glyph hidden).
  const flag =
    country && country.length === 2
      ? String.fromCodePoint(
          ...country
            .toUpperCase()
            .split("")
            .map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
        )
      : "";

  const geo = [city, region, country].filter(Boolean).join(", ");
  const hasUtm = utmSource || utmMedium || utmCampaign || utmContent || utmTerm;

  return (
    <div className="bg-adm-surface border border-adm-border rounded-xl p-5 mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-adm-muted mb-4 inline-flex items-center gap-2">
        <TrendingUp size={14} className="text-adm-accent" />
        Where this booking came from
      </h2>
      <div className="space-y-3 text-sm">
        {referrerDomain && (
          <Row
            label="Source"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Globe size={12} className="text-adm-faint" />
                <span className="font-medium">
                  {referrerDomain === "direct" ? "Direct / typed URL" : referrerDomain}
                </span>
              </span>
            }
          />
        )}
        {landingPage && (
          <Row
            label="Landed on"
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPinned size={12} className="text-adm-faint" />
                <code className="text-xs bg-adm-bg/40 px-1.5 py-0.5 rounded">
                  {landingPage}
                </code>
              </span>
            }
          />
        )}
        {hasUtm && (
          <Row
            label="UTM"
            value={
              <div className="flex flex-wrap gap-1.5 text-xs">
                {utmSource && (
                  <span className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent px-2 py-0.5 rounded">
                    source: {utmSource}
                  </span>
                )}
                {utmMedium && (
                  <span className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent px-2 py-0.5 rounded">
                    medium: {utmMedium}
                  </span>
                )}
                {utmCampaign && (
                  <span className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent px-2 py-0.5 rounded">
                    campaign: {utmCampaign}
                  </span>
                )}
                {utmContent && (
                  <span className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent px-2 py-0.5 rounded">
                    content: {utmContent}
                  </span>
                )}
                {utmTerm && (
                  <span className="bg-adm-accent/10 border border-adm-accent/30 text-adm-accent px-2 py-0.5 rounded">
                    term: {utmTerm}
                  </span>
                )}
              </div>
            }
          />
        )}
        {geo && (
          <Row
            label="Location"
            value={
              <span className="inline-flex items-center gap-1.5">
                {flag && <span className="text-base leading-none">{flag}</span>}
                <span>{geo}</span>
              </span>
            }
          />
        )}
        {device && (
          <Row
            label="Device"
            value={
              <span className="inline-flex items-center gap-1.5 capitalize">
                <Smartphone size={12} className="text-adm-faint" />
                {device}
              </span>
            }
          />
        )}
        {firstSeenAt && (
          <Row
            label="First seen"
            value={
              <span className="text-xs text-adm-muted">
                {(() => {
                  try {
                    return formatCRDateTime(new Date(firstSeenAt));
                  } catch {
                    return firstSeenAt;
                  }
                })()}
              </span>
            }
          />
        )}
        {userAgent && (
          <Row
            label="UA"
            value={
              <details className="text-xs text-adm-faint">
                <summary className="cursor-pointer hover:text-adm-text-2">
                  Show raw user-agent
                </summary>
                <code className="block mt-1 break-all bg-adm-bg/40 p-2 rounded">
                  {userAgent}
                </code>
              </details>
            }
          />
        )}
      </div>
    </div>
  );
}
