// Transactional email via Resend. Server-only.
//
// Env vars:
//   RESEND_API_KEY   - required.
//   EMAIL_FROM       - optional, defaults to Resend's sandbox sender.
//                      Switch to "Private Travel CR <bookings@privatetravelcr.com>"
//                      once the domain is verified in Resend.
//   BUSINESS_EMAIL   - optional, comma-separated list of internal recipients.
//                      Defaults to the addresses in DEFAULT_BUSINESS_LIST
//                      (info@ + Diego's iCloud — added 2026-06-26 so the
//                      booking ping always reaches a Mail.app he checks on
//                      his phone, not just the workspace inbox).
//
// Failures are logged and swallowed so a flaky email API never blocks the
// booking redirect after a successful payment.

import { Resend } from "resend";
import type { CartItem } from "@/lib/CartContext";

// A tour booking ships through the same email pipeline as a shuttle
// booking, but the shape of the item is different (no fromName/toName/
// vehicle/etc.). Both shapes live side-by-side in BookingEmailInput.items
// and the template branches on `type === 'tour'`.
export type TourEmailItem = {
  type: "tour";
  tourSlug: string;
  tourName: string;
  date: string;       // "YYYY-MM-DD"
  pickupTime: string; // "HH:MM" departure
  adults: number;
  children: number;
  durationLabel?: string;
  durationHours?: number;
  totalPrice: number;
  pickupHotel?: string;
};

type BookingItem = CartItem | TourEmailItem;

function isTourItem(it: BookingItem): it is TourEmailItem {
  return (it as TourEmailItem).type === "tour";
}

// Format child-seat requests into a single human line:
//   "1 infant car seat"
//   "2 boosters"
//   "1 infant + 1 convertible + 2 boosters"
// Returns empty string if the visitor asked for none, so callers can use
// it directly as a conditional render guard.
//
// This was the missing piece in the email + admin + PDF — the cart and the
// Supabase row stored the counts, but every downstream surface dropped
// them on the floor. A customer would click "I need 2 infant seats" and
// Diego had no way to know, leading to surprises at pickup.
function childSeatsSummary(it: CartItem): string {
  const parts: string[] = [];
  if (it.infantSeats && it.infantSeats > 0) {
    parts.push(
      `${it.infantSeats} infant car seat${it.infantSeats === 1 ? "" : "s"}`,
    );
  }
  if (it.convertibleSeats && it.convertibleSeats > 0) {
    parts.push(
      `${it.convertibleSeats} convertible${it.convertibleSeats === 1 ? "" : "s"}`,
    );
  }
  if (it.boosterSeats && it.boosterSeats > 0) {
    parts.push(
      `${it.boosterSeats} booster${it.boosterSeats === 1 ? "" : "s"}`,
    );
  }
  return parts.join(" + ");
}

const DEFAULT_FROM = "Private Travel CR <onboarding@resend.dev>";

// Google Business Profile review link — Diego's GBP was verified
// 2026-07 and the plan is to systematically capture reviews from
// every customer after a completed trip. Kept as a single exported
// constant so the PDF QR-code generator can pull the same URL and
// we can update it in one place if Google changes the short link.
//
// IMPORTANT: no CTA copy anywhere may mention a specific rating
// ("5 stars", "give us five", etc.). Google explicitly penalises
// profiles that solicit directed / incentivised reviews.
export const REVIEW_URL = "https://g.page/r/CeinMJ5pgxMPEBM/review";

// Default internal recipients for "new booking" / "booking updated" pings.
// Resend's `to` field accepts up to 50 addresses as an array, so we just
// pass the whole list. Order matters only for replyTo — the FIRST entry
// is what customer "Reply" hits, so info@ stays primary and the iCloud
// backup is purely a "phone notification" target Diego asked for so he
// doesn't miss bookings when he's away from the workspace inbox.
const DEFAULT_BUSINESS_LIST = [
  "info@privatetravelcr.com",
  "diegosa80@icloud.com",
] as const;
const DEFAULT_BUSINESS = DEFAULT_BUSINESS_LIST[0]; // kept for replyTo fallback

// Parse BUSINESS_EMAIL env var into a clean recipient list. Accepts a
// single address or a comma-separated list (e.g. "a@x.com,b@y.com").
// Trims whitespace and drops empty entries so a trailing comma in the
// Vercel env editor doesn't blow up the send.
function getBusinessRecipients(): string[] {
  const raw = process.env.BUSINESS_EMAIL;
  if (!raw) return [...DEFAULT_BUSINESS_LIST];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : [...DEFAULT_BUSINESS_LIST];
}

let cached: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export type BookingEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalUsd: number;
  authCode?: string | null;
  cardLast4?: string | null;
  items: BookingItem[];
  /** Customer-submitted note captured on the booking form (special
   *  requests: "please stop at Denny's for 20 min", "baby seat needed",
   *  allergies, etc.). Rendered as a strong callout at the BOTTOM of
   *  the reservation on the internal + customer emails and on both
   *  PDF variants. Empty / null / whitespace = block is omitted.
   *
   *  Diego 2026-07-17: yesterday a customer requested an intermediate
   *  stop via this field. The note was stored in the DB and visible
   *  in the admin panel — but NEVER surfaced in the confirmation
   *  email or driver sheet. Driver discovered it last-minute. This
   *  field closes that loop. */
  notes?: string | null;
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function format12h(time: string): string {
  if (!time || !time.includes(":")) return time || "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${period}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Format an ISO date `YYYY-MM-DD` + `HH:MM` (Costa Rica local) as the
 *  basic UTC date-time form ICS expects: `YYYYMMDDTHHMMSSZ`. CR is UTC-6
 *  with no DST. */
function toIcsUtc(dateIso: string, time: string, offsetMin = 0): string {
  // Treat input as Costa Rica local (UTC-6), convert to UTC.
  const [y, m, d] = dateIso.split("-").map((s) => parseInt(s, 10));
  const [h, mi] = time.split(":").map((s) => parseInt(s, 10));
  if ([y, m, d, h, mi].some((n) => Number.isNaN(n))) return "";
  // Local time → minutes since epoch in CR → add 6h to get UTC, add offset.
  const utcMs = Date.UTC(y, m - 1, d, h + 6, mi + offsetMin, 0);
  const dt = new Date(utcMs);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}` +
    `T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Build a multi-event .ics file covering every trip in the booking.
 *
 * `sequence` is the iCalendar SEQUENCE field — 0 for the initial
 * confirmation, a higher integer for each subsequent revision (admin
 * edits the date / time, etc.). Google Calendar / Apple Calendar /
 * Outlook recognise the same UID + higher SEQUENCE as "update this
 * existing event" instead of creating a duplicate. Without it the
 * customer ends up with two overlapping events when we re-send a
 * confirmation with a new time. */
export function buildBookingIcs(
  data: BookingEmailInput,
  sequence = 0,
): string {
  const dtstamp = toIcsUtc(
    new Date().toISOString().slice(0, 10),
    new Date().toISOString().slice(11, 16)
  );
  const events = data.items
    .map((it, idx) => {
      // ── Tour event ──────────────────────────────────────────────
      if (isTourItem(it)) {
        const durMin = Math.round((it.durationHours ?? 4) * 60);
        const start = toIcsUtc(it.date, it.pickupTime);
        const end = toIcsUtc(it.date, it.pickupTime, durMin);
        if (!start || !end) return "";
        const pax =
          it.adults +
          (it.children > 0 ? ` adult${it.adults !== 1 ? "s" : ""} + ${it.children} child${it.children !== 1 ? "ren" : ""}` : ` adult${it.adults !== 1 ? "s" : ""}`);
        const desc = [
          `Private Travel CR · Order ${data.orderNumber}`,
          data.customerName ? `Customer: ${data.customerName}` : "",
          data.customerPhone ? `Phone: ${data.customerPhone}` : "",
          `Tour: ${it.tourName}`,
          `Departure: ${it.pickupTime}`,
          it.durationLabel ? `Duration: ${it.durationLabel}` : "",
          `Travelers: ${pax}`,
          it.pickupHotel ? `Pickup: ${it.pickupHotel}` : "",
          "",
          "Questions? WhatsApp +506 8633-4133",
        ]
          .filter(Boolean)
          .join("\\n");
        // Prepend the customer name onto the calendar event title so the
        // Google Calendar / iCal notification that fires 24h and 2h
        // before pickup surfaces WHO the trip is for. Diego added this
        // 2026-07-05 — the previous summary just said the tour name and
        // he'd have to open the event to see whose trip it was.
        const summary = data.customerName
          ? `${data.customerName} — ${it.tourName}`
          : it.tourName;
        return [
          "BEGIN:VEVENT",
          `UID:${data.orderNumber}-${idx}@privatetravelcr.com`,
          `DTSTAMP:${dtstamp}`,
          `SEQUENCE:${sequence}`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${escapeIcs(summary)}`,
          `DESCRIPTION:${desc}`,
          `LOCATION:${escapeIcs(it.pickupHotel || "La Fortuna, Costa Rica")}`,
          "STATUS:CONFIRMED",
          // Two alarms: one the day before so the customer can plan,
          // and one 2h before pickup as a final heads-up. VALARM overrides
          // the calendar app's default 10-min alert in most clients.
          "BEGIN:VALARM",
          "TRIGGER:-PT24H",
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcs(`Reminder: ${it.tourName} tomorrow`)}`,
          "END:VALARM",
          "BEGIN:VALARM",
          "TRIGGER:-PT2H",
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcs(`${it.tourName} pickup in 2 hours`)}`,
          "END:VALARM",
          "END:VEVENT",
        ].join("\r\n");
      }

      // ── Shuttle event (existing) ────────────────────────────────
      // Try to parse the duration like "3h" / "3h 30min" into minutes; default 180.
      let durMin = 180;
      const dur = it.duration?.trim();
      if (dur) {
        const h = dur.match(/(\d+)\s*h/i);
        const m = dur.match(/(\d+)\s*min/i);
        if (h) durMin = parseInt(h[1], 10) * 60 + (m ? parseInt(m[1], 10) : 0);
      }
      const start = toIcsUtc(it.date, it.pickupTime);
      const end = toIcsUtc(it.date, it.pickupTime, durMin);
      if (!start || !end) return "";
      const pickup =
        it.pickupPlace && it.pickupPlace !== it.fromName ? it.pickupPlace : it.fromName;
      const dropoff =
        it.dropoffPlace && it.dropoffPlace !== it.toName ? it.dropoffPlace : it.toName;
      const seats = childSeatsSummary(it);
      const desc = [
        `Private Travel CR · Order ${data.orderNumber}`,
        data.customerName ? `Customer: ${data.customerName}` : "",
        data.customerPhone ? `Phone: ${data.customerPhone}` : "",
        `From: ${pickup}`,
        `To: ${dropoff}`,
        `Passengers: ${it.passengers}`,
        `Service: ${it.serviceType === "vip" ? "VIP" : "Standard"}`,
        `Vehicle: ${it.vehicleName}`,
        // Child seats line is the one we routinely missed when only the
        // ICS event description was visible (in the calendar app). Now
        // it shows up right under the vehicle line so the driver loading
        // the van knows what to bring.
        seats ? `Child seats: ${seats}` : "",
        it.flightNumber ? `Flight: ${it.flightNumber}` : "",
        it.extraStopHours && it.extraStopHours > 0
          ? `Extra wait: ${it.extraStopHours}h paid`
          : "",
        "",
        "Questions? WhatsApp +506 8633-4133",
      ]
        .filter(Boolean)
        .join("\\n");
      // Prepend the customer name onto the shuttle calendar event so the
      // 24h / 2h reminders show WHO is being picked up without opening
      // the event. See the tour branch above — same pattern.
      const shuttleSummary = data.customerName
        ? `${data.customerName} — ${it.fromName} → ${it.toName}`
        : `Private Shuttle: ${it.fromName} → ${it.toName}`;
      return [
        "BEGIN:VEVENT",
        `UID:${data.orderNumber}-${idx}@privatetravelcr.com`,
        `DTSTAMP:${dtstamp}`,
        `SEQUENCE:${sequence}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(shuttleSummary)}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${escapeIcs(pickup)}`,
        "STATUS:CONFIRMED",
        // Two alarms: 24h before so the customer can plan, plus 2h
        // before for the final heads-up. VALARM overrides the calendar
        // app's default 10-min alert in most clients.
        "BEGIN:VALARM",
        "TRIGGER:-PT24H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcs(`Reminder: Private shuttle ${it.fromName} → ${it.toName} tomorrow`)}`,
        "END:VALARM",
        "BEGIN:VALARM",
        "TRIGGER:-PT2H",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcs(`Private shuttle ${it.fromName} → ${it.toName} pickup in 2 hours`)}`,
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n");
    })
    .filter(Boolean)
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Private Travel CR//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

function tourRowHtml(it: TourEmailItem, idx: number): string {
  const pax =
    it.children > 0
      ? `${it.adults} adult${it.adults !== 1 ? "s" : ""} + ${it.children} child${it.children !== 1 ? "ren" : ""}`
      : `${it.adults} adult${it.adults !== 1 ? "s" : ""}`;
  // Same green pickup treatment as shuttle rows — the driver needs
  // the pickup hotel highlighted on tour bookings too.
  const pickupBox = it.pickupHotel
    ? `
      <div class="ptcr-pickup-box" style="margin:10px 0 0 0;padding:12px 14px;background:#dcfce7;border-left:4px solid #16a34a;border-radius:8px;">
        <div class="ptcr-pickup-eyebrow" style="font-size:10px;color:#15803d;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
          📍 Pickup at
        </div>
        <div class="ptcr-pickup-text" style="font-size:14px;color:#14532d;font-weight:700;line-height:1.4;">
          ${escapeHtml(it.pickupHotel)}
        </div>
      </div>
    `
    : "";
  return `
    <tr>
      <td style="padding:16px 20px;border-top:1px solid #e5e7eb;vertical-align:top;">
        <div class="ptcr-navy" style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
          Tour #${idx + 1}${it.durationLabel ? ` · ${escapeHtml(it.durationLabel)}` : ""}
        </div>
        <div class="ptcr-heading" style="font-size:15px;color:#111827;font-weight:700;line-height:1.35;">
          ${escapeHtml(it.tourName)}
        </div>
        <div class="ptcr-trip-meta" style="font-size:14px;color:#b45309;font-weight:700;margin-top:10px;padding:8px 12px;background:#fef3c7;border-radius:6px;display:inline-block;">
          📅 ${formatDate(it.date)} · 🕐 Departure ${format12h(it.pickupTime)} · 👥 ${escapeHtml(pax)}
        </div>
        ${pickupBox}
      </td>
      <td style="padding:16px 20px;border-top:1px solid #e5e7eb;text-align:right;vertical-align:top;white-space:nowrap;">
        <div class="ptcr-orange" style="font-size:18px;color:#ea580c;font-weight:800;">$${it.totalPrice.toFixed(2)}</div>
        <div class="ptcr-muted" style="font-size:11px;color:#6b7280;">USD</div>
      </td>
    </tr>
  `;
}

function shuttleRowHtml(it: CartItem, idx: number): string {
  const service = it.serviceType === "vip" ? "VIP" : "Standard";
  // Dedicated PICKUP address block — new for 2026-07-02 (Diego).
  // Bright green pill with a border-left accent so the driver spots
  // the pickup address at a single glance when he opens the email on
  // his phone in the morning. Only rendered when pickupPlace is
  // actually different from the origin city string; otherwise the
  // city name IS the pickup and the block would be redundant.
  const pickupBox =
    it.pickupPlace && it.pickupPlace !== it.fromName
      ? `
        <div class="ptcr-pickup-box" style="margin:10px 0 4px 0;padding:12px 14px;background:#dcfce7;border-left:4px solid #16a34a;border-radius:8px;">
          <div class="ptcr-pickup-eyebrow" style="font-size:10px;color:#15803d;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
            📍 Pickup at
          </div>
          <div class="ptcr-pickup-text" style="font-size:14px;color:#14532d;font-weight:700;line-height:1.4;">
            ${escapeHtml(it.pickupPlace)}
          </div>
        </div>
      `
      : "";
  // Dropoff address — matches the same treatment as the pickup box
  // but in blue so the driver can tell them apart at a glance
  // (green = start here, blue = end here). Diego 2026-07-05 asked
  // to promote dropoff from the muted grey pill it used to be to
  // a full blue box on par with the green PICKUP.
  const dropoffBox =
    it.dropoffPlace && it.dropoffPlace !== it.toName
      ? `
        <div class="ptcr-dropoff-box" style="margin:10px 0 4px 0;padding:12px 14px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:8px;">
          <div class="ptcr-dropoff-eyebrow" style="font-size:10px;color:#1e40af;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
            🏁 Drop off at
          </div>
          <div class="ptcr-dropoff-text" style="font-size:14px;color:#1e3a8a;font-weight:700;line-height:1.4;">
            ${escapeHtml(it.dropoffPlace)}
          </div>
        </div>
      `
      : "";
  // Highlight extra wait/stop hours on its own line — orange pill
  // (upgraded from amber). Same reason as before: the driver's day
  // planning changes if there's paid wait time.
  const extraStops =
    it.extraStopHours && it.extraStopHours > 0
      ? `<div style="font-size:12px;color:#c2410c;font-weight:700;margin-top:8px;background:#ffedd5;padding:6px 10px;border-radius:6px;display:inline-block;">⏱ Extra wait: ${it.extraStopHours}h paid</div>`
      : "";
  // Highlighted child-seat line — orange pill matching Extra wait.
  const seatsLine = childSeatsSummary(it);
  const childSeats = seatsLine
    ? `<div style="font-size:12px;color:#c2410c;font-weight:700;margin-top:8px;background:#ffedd5;padding:6px 10px;border-radius:6px;display:inline-block;">👶 Child seats: ${escapeHtml(seatsLine)}</div>`
    : "";
  return `
    <tr>
      <td style="padding:16px 20px;border-top:1px solid #e5e7eb;vertical-align:top;">
        <div class="ptcr-navy" style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
          Trip #${idx + 1} · ${escapeHtml(service)} · ${escapeHtml(it.vehicleName)}
        </div>
        <div class="ptcr-heading" style="font-size:15px;color:#111827;font-weight:700;line-height:1.4;">
          ${escapeHtml(it.fromName)}
        </div>
        ${pickupBox}
        <div class="ptcr-muted" style="font-size:12px;color:#9ca3af;margin:6px 0 6px 0;">↓</div>
        <div class="ptcr-heading" style="font-size:15px;color:#111827;font-weight:700;line-height:1.4;">
          ${escapeHtml(it.toName)}
        </div>
        ${dropoffBox}
        <div class="ptcr-trip-meta" style="font-size:14px;color:#b45309;font-weight:700;margin-top:12px;padding:8px 12px;background:#fef3c7;border-radius:6px;display:inline-block;">
          📅 ${formatDate(it.date)} · 🕐 ${format12h(it.pickupTime)} · 👥 ${it.passengers} pax${it.flightNumber ? ` · ✈️ Flight ${escapeHtml(it.flightNumber)}` : ""}
        </div>
        ${extraStops}
        ${childSeats}
      </td>
      <td style="padding:16px 20px;border-top:1px solid #e5e7eb;text-align:right;vertical-align:top;white-space:nowrap;">
        <div class="ptcr-orange" style="font-size:18px;color:#ea580c;font-weight:800;">$${it.totalPrice.toFixed(2)}</div>
        <div class="ptcr-muted" style="font-size:11px;color:#6b7280;">USD</div>
      </td>
    </tr>
  `;
}

function tripRowsHtml(items: BookingItem[]): string {
  return items
    .map((it, idx) => (isTourItem(it) ? tourRowHtml(it, idx) : shuttleRowHtml(it, idx)))
    .join("");
}

/**
 * Render the customer-note callout that sits at the BOTTOM of the
 * reservation table (per Diego's placement request 2026-07-17: "pon
 * la nota abajo en la reserva no arriba"). Returns "" when the note
 * is empty / null / whitespace so callers can splat this into the
 * template without a wrapper condition.
 *
 * Two variants:
 *   internal — red/orange strong callout for the 🚐 New booking
 *              email (Diego reads this on his phone at 6am). Impossible
 *              to miss so stops / requests get seen before dispatch.
 *   customer — amber soft callout for the confirmation email. Purpose
 *              is to reassure the customer that their request was
 *              received (reduces "did they see my note?" WhatsApp
 *              messages).
 *
 * The block is a full-width `<tr>` inside the same reservation table
 * as the trip rows, styled with a border-left accent + soft background.
 * Multi-trip bookings share ONE note per booking, so we render exactly
 * once at the bottom rather than per-trip. Colors + font size follow
 * the spec Diego signed off on. All colors inline (iOS Mail Smart-Invert
 * safe) with matching @media (prefers-color-scheme: dark) overrides in
 * the shell CSS so Gmail Android dark mode doesn't wash out the pill.
 */
function renderNoteBlockHtml(
  notes: string | null | undefined,
  variant: "internal" | "customer",
): string {
  if (!notes || !notes.trim()) return "";
  const safe = escapeHtml(notes.trim());
  if (variant === "internal") {
    return `
      <tr>
        <td colspan="2" style="padding:0;">
          <div class="ptcr-request-box ptcr-request-internal" style="margin:16px 20px 8px 20px;padding:12px 14px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:8px;">
            <div class="ptcr-request-eyebrow-internal" style="font-size:11px;color:#991b1b;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
              ⚠️ CUSTOMER REQUEST
            </div>
            <div class="ptcr-request-text-internal" style="font-size:15px;color:#7f1d1d;font-weight:700;line-height:1.45;white-space:pre-wrap;">${safe}</div>
          </div>
        </td>
      </tr>
    `;
  }
  return `
    <tr>
      <td colspan="2" style="padding:0;">
        <div class="ptcr-request-box ptcr-request-customer" style="margin:16px 20px 8px 20px;padding:12px 14px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
          <div class="ptcr-request-eyebrow-customer" style="font-size:11px;color:#b45309;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
            SPECIAL REQUEST
          </div>
          <div class="ptcr-request-text-customer" style="font-size:14px;color:#78350f;font-weight:700;line-height:1.45;white-space:pre-wrap;">${safe}</div>
        </div>
      </td>
    </tr>
  `;
}

function shellHtml({
  title,
  intro,
  data,
  showCustomer,
  showReview = false,
  noteVariant,
}: {
  title: string;
  intro: string;
  data: BookingEmailInput;
  showCustomer: boolean;
  /** When true, append the "After your trip / Leave a Google review"
   *  amber pill block. Only set on customer-facing emails for approved
   *  bookings (confirmation + update). Never on internal / admin
   *  pings, never on the pre-payment quote email — Google penalises
   *  profiles that solicit reviews before the service is delivered. */
  showReview?: boolean;
  /** Which customer-note styling to render at the bottom of the
   *  reservation table. `internal` = red/orange callout for Diego's
   *  🚐 New booking email; `customer` = amber soft callout for the
   *  confirmation email. Block is omitted entirely when data.notes
   *  is empty / null / whitespace. */
  noteVariant: "internal" | "customer";
}): string {
  // Customer block — light-mode redesign 2026-06-30. After three failed
  // attempts to defeat iOS Mail Smart-Invert on the dark template
  // (PR #4 @media, PR #5 #fefefe, PR #7 text-shadow), Diego confirmed
  // it still washed out on iPhone. Root cause is unavoidable at that
  // color-scheme level — Apple Mail treats any near-white text on
  // near-black as "dark-mode-adaptable" and softens contrast for
  // user comfort, regardless of what CSS declares. Every major
  // transactional email service (Stripe, Shopify, Airbnb) sidesteps
  // this by using a light theme; going with the industry standard now.
  // Post-trip Google review CTA — amber pill matching the meta-line
  // treatment already used inside the trip rows so it feels native to
  // the template. Only rendered when showReview is true (customer
  // confirmation + customer update emails). Table-based layout with
  // explicit color: on every text node so iOS Mail Smart-Invert can't
  // wash out the copy. No mention of star count / rating anywhere —
  // Google penalises directed solicitations.
  const reviewBlock = showReview
    ? `
      <tr>
        <td style="padding:0 24px 20px 24px;">
          <table role="presentation" class="ptcr-review-box" width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:10px;">
            <tr>
              <td style="padding:16px 18px;">
                <div class="ptcr-review-eyebrow" style="font-size:10px;color:#b45309;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">
                  After your trip
                </div>
                <div class="ptcr-review-title" style="font-size:15px;color:#78350f;font-weight:800;line-height:1.3;margin-bottom:4px;">
                  Enjoyed your ride with us?
                </div>
                <div class="ptcr-review-body" style="font-size:13px;color:#78350f;line-height:1.5;margin-bottom:12px;">
                  Your feedback helps our small family business grow &mdash; takes 30 seconds.
                </div>
                <a href="${REVIEW_URL}" style="display:inline-block;background:#1e3a8a;color:#ffffff;font-weight:700;font-size:13px;text-decoration:none;padding:10px 18px;border-radius:8px;">
                  Leave a Google review &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    : "";

  const customerBlock = showCustomer
    ? `
      <tr>
        <td style="padding:20px 24px;border-top:1px solid #e5e7eb;">
          <div style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Customer</div>
          <div style="font-size:16px;color:#111827;font-weight:700;line-height:1.3;">${escapeHtml(data.customerName)}</div>
          <div style="font-size:14px;color:#374151;font-weight:500;margin-top:4px;line-height:1.4;">${escapeHtml(data.customerEmail)}</div>
          ${data.customerPhone ? `<div style="font-size:14px;color:#374151;font-weight:500;margin-top:2px;line-height:1.4;">${escapeHtml(data.customerPhone)}</div>` : ""}
        </td>
      </tr>
    `
    : "";

  // Light-mode template — 2026-06-30. Three previous attempts to defeat
  // iOS Mail Smart-Invert on the dark template all fell short (PR #4
  // @media + color-scheme, PR #5 #fefefe swap, PR #7 text-shadow
  // trick). Empirically, Apple Mail iOS always softens near-white text
  // on near-black backgrounds regardless of CSS declarations — it's
  // the OS treating the email like a screen the user is staring at
  // in bed, not a document. The only reliable escape is to give it
  // a light background so Smart-Invert never activates. Every major
  // transactional email service (Stripe, Shopify, Airbnb, Square)
  // ships light-mode emails for exactly this reason.
  //
  // Palette — 2026-07-02: switched from amber to a nautical trio
  // (Diego's spec).
  //   Navy   #1e3a8a  — eyebrows, order number, "Trip #N", CTA border
  //   Orange #ea580c  — total, trip price, primary emphasis
  //   Green  #16a34a  — dedicated PICKUP address block so drivers
  //                     spot the pickup at a glance (was the whole
  //                     point of this redesign per Diego).
  // Headings stay near-black (#111827) for max legibility.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <!-- Force light rendering across every client. "only light" locks
       Apple Mail out of Smart-Invert and stops Outlook 2021+ from
       auto-darkening the template. -->
  <meta name="color-scheme" content="only light" />
  <meta name="supported-color-schemes" content="only light" />
  <style>
    :root { color-scheme: only light; supported-color-schemes: only light; }
    /* Belt-and-suspenders block for any client that STILL tries to
       flip colors in dark mode — pin the surface colors so the nautical
       navy/orange/green palette stays intact regardless of what the
       OS thinks. */
    @media (prefers-color-scheme: dark) {
      body, table { background: #f3f4f6 !important; }
      .ptcr-card { background: #ffffff !important; }
      .ptcr-heading { color: #111827 !important; }
      .ptcr-body { color: #374151 !important; }
      .ptcr-muted { color: #6b7280 !important; }
      .ptcr-navy { color: #1e3a8a !important; }
      .ptcr-orange { color: #ea580c !important; }
      .ptcr-green { color: #16a34a !important; }
      .ptcr-pickup-box { background: #dcfce7 !important; border-color: #16a34a !important; }
      .ptcr-pickup-eyebrow { color: #15803d !important; }
      .ptcr-pickup-text { color: #14532d !important; }
      .ptcr-dropoff-box { background: #dbeafe !important; border-color: #3b82f6 !important; }
      .ptcr-dropoff-eyebrow { color: #1e40af !important; }
      .ptcr-dropoff-text { color: #1e3a8a !important; }
      .ptcr-trip-meta { color: #b45309 !important; }
      /* Review CTA — Gmail Android is the main dark-mode client
         we care about here. Keep the amber palette pinned so the
         block still reads as the same call-out. */
      .ptcr-review-box { background: #fef3c7 !important; border-color: #f59e0b !important; }
      .ptcr-review-eyebrow { color: #b45309 !important; }
      .ptcr-review-title { color: #78350f !important; }
      .ptcr-review-body { color: #78350f !important; }
      /* Customer-request callout — new 2026-07-17. Two variants
         share the .ptcr-request-box class but split for the color
         palette so Gmail Android dark mode doesn't wash out the
         "impossible to miss" red on Diego's internal email or the
         soft amber on the customer confirmation. */
      .ptcr-request-internal { background: #fef2f2 !important; border-color: #dc2626 !important; }
      .ptcr-request-eyebrow-internal { color: #991b1b !important; }
      .ptcr-request-text-internal { color: #7f1d1d !important; }
      .ptcr-request-customer { background: #fef3c7 !important; border-color: #f59e0b !important; }
      .ptcr-request-eyebrow-customer { color: #b45309 !important; }
      .ptcr-request-text-customer { color: #78350f !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="ptcr-card" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding:32px 24px 24px 24px;text-align:center;background:#eff6ff;border-bottom:3px solid #1e3a8a;">
              <a href="https://www.privatetravelcr.com" style="display:inline-block;text-decoration:none;">
                <img
                  src="https://www.privatetravelcr.com/logo-ptcr.svg"
                  alt="Private Travel Costa Rica"
                  width="180"
                  height="78"
                  style="display:block;margin:0 auto 4px auto;width:180px;height:auto;border:0;"
                />
              </a>
              <div class="ptcr-navy" style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Private Travel CR</div>
              <h1 class="ptcr-heading" style="margin:14px 0 0 0;font-size:24px;color:#111827;font-weight:800;">${escapeHtml(title)}</h1>
              <p class="ptcr-body" style="margin:10px 0 0 0;font-size:14px;color:#374151;line-height:1.5;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="ptcr-muted" style="font-size:12px;color:#6b7280;">Order number</td>
                        <td class="ptcr-navy" style="font-size:13px;color:#1e3a8a;font-family:'SFMono-Regular',Menlo,monospace;font-weight:700;text-align:right;">${escapeHtml(data.orderNumber)}</td>
                      </tr>
                      <tr>
                        <td class="ptcr-muted" style="font-size:12px;color:#6b7280;padding-top:8px;">Total</td>
                        <td class="ptcr-orange" style="font-size:20px;color:#ea580c;font-weight:800;text-align:right;padding-top:8px;">$${data.totalUsd.toFixed(2)} USD</td>
                      </tr>
                      ${
                        data.authCode
                          ? `<tr><td class="ptcr-muted" style="font-size:12px;color:#6b7280;padding-top:6px;">Auth code</td><td class="ptcr-body" style="font-size:12px;color:#374151;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">${escapeHtml(data.authCode)}</td></tr>`
                          : ""
                      }
                      ${
                        data.cardLast4
                          ? `<tr><td class="ptcr-muted" style="font-size:12px;color:#6b7280;padding-top:6px;">Card</td><td class="ptcr-body" style="font-size:12px;color:#374151;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">•••• ${escapeHtml(data.cardLast4)}</td></tr>`
                          : ""
                      }
                    </table>
                    <!-- Foreign-transaction-fee heads-up. Customer-only. -->
                    ${
                      showCustomer
                        ? ""
                        : `<p style="font-size:11px;color:#6b7280;font-style:italic;margin:14px 0 0 0;line-height:1.5;">💳 Your bank may add a small foreign transaction fee (~3% on international USD charges). That fee comes from your bank, not from us — travel-friendly cards (Chase Sapphire, Capital One Venture, Amex Platinum, etc.) usually waive it.</p>`
                    }
                  </td>
                </tr>
                ${tripRowsHtml(data.items)}
                ${customerBlock}
                ${renderNoteBlockHtml(data.notes, noteVariant)}
              </table>
            </td>
          </tr>
          ${reviewBlock}
          <tr>
            <td style="padding:24px 24px 28px 24px;text-align:center;">
              <p class="ptcr-muted" style="margin:0 0 18px 0;font-size:13px;color:#6b7280;">
                We&rsquo;ll be in touch shortly with the final pickup details.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://wa.me/50686334133" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;">Chat on WhatsApp</a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="mailto:info@privatetravelcr.com" style="display:inline-block;background:#ffffff;color:#1e3a8a;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;border:1px solid #1e3a8a;">Email us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <div class="ptcr-muted" style="font-size:11px;color:#6b7280;">
                Private Travel Costa Rica · La Fortuna, Alajuela · +506 8633-4133
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingEmails(data: BookingEmailInput): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping booking emails");
    return;
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  // businessRecipients[] is what gets the "new booking" ping (one email,
  // multiple To: addresses). businessReplyTo is what the customer hits
  // when they reply to their confirmation — always the FIRST entry so
  // customer conversations land in the primary workspace inbox.
  const businessRecipients = getBusinessRecipients();
  const businessReplyTo = businessRecipients[0] || DEFAULT_BUSINESS;

  const customerHtml = shellHtml({
    title: "Booking Confirmed",
    intro: `Thank you, ${data.customerName.split(" ")[0] || "friend"}. We've received your payment.`,
    data,
    showCustomer: false,
    showReview: true,
    noteVariant: "customer",
  });
  const internalHtml = shellHtml({
    title: "New booking received",
    intro: `Order ${data.orderNumber} just paid. Reach out to confirm pickup details.`,
    data,
    showCustomer: true,
    noteVariant: "internal",
  });

  const ics = buildBookingIcs(data);
  const icsAttachment = {
    filename: `private-travel-cr-${data.orderNumber}.ics`,
    content: Buffer.from(ics, "utf-8").toString("base64"),
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  };

  // Fire both in parallel; one failing must not stop the other.
  const [customerRes, internalRes] = await Promise.allSettled([
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Booking Confirmed · ${data.orderNumber}`,
      html: customerHtml,
      replyTo: businessReplyTo,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from,
      to: businessRecipients,
      subject: `🚐 New booking · ${data.orderNumber} · $${data.totalUsd.toFixed(2)} USD`,
      html: internalHtml,
      replyTo: data.customerEmail,
      // Same .ics goes to every internal recipient — Diego asked for the
      // 'Add to Calendar' chip in his Gmail. Before this it was customer-
      // only, so the operator had to manually copy trip dates into the
      // driver's schedule. Now one click puts every confirmed booking
      // on the dispatch calendar.
      attachments: [icsAttachment],
    }),
  ]);

  if (customerRes.status === "rejected") {
    console.error("[email] customer send failed:", customerRes.reason);
  } else if (customerRes.value.error) {
    console.error("[email] customer send error:", customerRes.value.error);
  }
  if (internalRes.status === "rejected") {
    console.error("[email] internal send failed:", internalRes.reason);
  } else if (internalRes.value.error) {
    console.error("[email] internal send error:", internalRes.value.error);
  }
}

/**
 * Re-send the booking confirmation after Diego edits a trip's date or
 * pickup time from the admin panel. Uses the same shellHtml + ICS
 * machinery as the initial confirmation so the customer's calendar
 * event updates correctly when they re-add the attachment.
 *
 * Why a separate function vs. a `kind` flag on sendBookingEmails:
 * the subject line and intro copy need to be different ("Updated"
 * not "Confirmed") so the customer doesn't think they were charged
 * twice, and forking here keeps that branching localised. Everything
 * downstream (HTML body, ICS event, attachments) stays identical
 * because what we want IS a re-sent confirmation with the new times.
 */
export async function sendBookingUpdateEmails(
  data: BookingEmailInput,
): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping update emails");
    return;
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const businessRecipients = getBusinessRecipients();
  const businessReplyTo = businessRecipients[0] || DEFAULT_BUSINESS;

  const customerHtml = shellHtml({
    title: "Booking updated",
    intro: `Hi ${data.customerName.split(" ")[0] || "there"}, we've updated your booking with the new date or pickup time. Latest details below — please replace any earlier confirmation with this one.`,
    data,
    showCustomer: false,
    showReview: true,
    noteVariant: "customer",
  });
  const internalHtml = shellHtml({
    title: "Booking updated by admin",
    intro: `Order ${data.orderNumber} — trip date / pickup time changed. The customer is being notified at the same time.`,
    data,
    showCustomer: true,
    noteVariant: "internal",
  });

  // SEQUENCE must monotonically increase per the iCalendar spec for the
  // recipient's calendar to overwrite the existing event with this one.
  // We use the current Unix timestamp (seconds since epoch) — guaranteed
  // monotonic across edits even if multiple admins make changes within
  // the same minute, and never collides with the 0 we send at initial
  // confirmation. Trimmed to a reasonable size so calendar clients that
  // store SEQUENCE in a small int don't roll over.
  const sequence = Math.floor(Date.now() / 1000) % 2147483647;
  const ics = buildBookingIcs(data, sequence);
  const icsAttachment = {
    filename: `private-travel-cr-${data.orderNumber}-updated.ics`,
    content: Buffer.from(ics, "utf-8").toString("base64"),
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  };

  const [customerRes, internalRes] = await Promise.allSettled([
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Booking updated · ${data.orderNumber}`,
      html: customerHtml,
      replyTo: businessReplyTo,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from,
      to: businessRecipients,
      subject: `✏️ Booking updated · ${data.orderNumber}`,
      html: internalHtml,
      replyTo: data.customerEmail,
      attachments: [icsAttachment],
    }),
  ]);

  if (customerRes.status === "rejected") {
    console.error("[email] customer update send failed:", customerRes.reason);
  } else if (customerRes.value.error) {
    console.error("[email] customer update send error:", customerRes.value.error);
  }
  if (internalRes.status === "rejected") {
    console.error("[email] internal update send failed:", internalRes.reason);
  } else if (internalRes.value.error) {
    console.error("[email] internal update send error:", internalRes.value.error);
  }
}

/**
 * "Diego prepared a booking for you — click to pay" email. Sent when
 * Diego creates a booking on behalf of a customer via the admin
 * /admin/create-quote form (2026-06-30 feature). The customer receives
 * ONE email with a trip summary and a single Pay button that leads to
 * a token-guarded /pay/[token] page → Tilopay checkout.
 *
 * Diego doesn't get an internal ping here — he just created the row,
 * he knows about it. The normal "🚐 New booking" email fires later,
 * on payment success, from the callback route, using the existing
 * sendBookingEmails path.
 */
export async function sendPaymentRequestEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalUsd: number;
  items: BookingItem[];
  payUrl: string;
  expiresAt: Date;
}): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping payment-request email");
    return;
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const businessRecipients = getBusinessRecipients();
  const businessReplyTo = businessRecipients[0] || DEFAULT_BUSINESS;

  const firstName = data.customerName.split(" ")[0] || "friend";
  const totalStr = `$${data.totalUsd.toFixed(2)} USD`;

  // Expiry rendered in a warm short form, e.g. "Wed Jul 2, 6:30 PM CST".
  // We show it inline so the customer sees the urgency without doing
  // date math themselves.
  const expiresStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Costa_Rica",
  }).format(data.expiresAt);

  // Reuse the same trip rows + card / customer / header shell as the
  // regular confirmation email, but swap the title + intro copy and
  // insert a big Pay Now CTA card above the trip rows.
  const rowsHtml = data.items
    .map((it, idx) => (isTourItem(it) ? tourRowHtml(it, idx) : shuttleRowHtml(it, idx)))
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Complete your Costa Rica booking</title>
  <meta name="color-scheme" content="only light" />
  <meta name="supported-color-schemes" content="only light" />
  <style>
    :root { color-scheme: only light; supported-color-schemes: only light; }
    @media (prefers-color-scheme: dark) {
      body, table { background: #f3f4f6 !important; }
      .ptcr-card { background: #ffffff !important; }
      .ptcr-heading { color: #111827 !important; }
      .ptcr-body { color: #374151 !important; }
      .ptcr-muted { color: #6b7280 !important; }
      .ptcr-navy { color: #1e3a8a !important; }
      .ptcr-orange { color: #ea580c !important; }
      .ptcr-green { color: #16a34a !important; }
      .ptcr-pickup-box { background: #dcfce7 !important; border-color: #16a34a !important; }
      .ptcr-pickup-eyebrow { color: #15803d !important; }
      .ptcr-pickup-text { color: #14532d !important; }
      .ptcr-dropoff-box { background: #dbeafe !important; border-color: #3b82f6 !important; }
      .ptcr-dropoff-eyebrow { color: #1e40af !important; }
      .ptcr-dropoff-text { color: #1e3a8a !important; }
      .ptcr-trip-meta { color: #b45309 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="ptcr-card" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding:32px 24px 24px 24px;text-align:center;background:#eff6ff;border-bottom:3px solid #1e3a8a;">
              <a href="https://www.privatetravelcr.com" style="display:inline-block;text-decoration:none;">
                <img src="https://www.privatetravelcr.com/logo-ptcr.svg" alt="Private Travel Costa Rica" width="180" height="78" style="display:block;margin:0 auto 4px auto;width:180px;height:auto;border:0;" />
              </a>
              <div class="ptcr-navy" style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Private Travel CR</div>
              <h1 class="ptcr-heading" style="margin:14px 0 0 0;font-size:24px;color:#111827;font-weight:800;">Complete your booking</h1>
              <p class="ptcr-body" style="margin:10px 0 0 0;font-size:14px;color:#374151;line-height:1.5;">Hi ${escapeHtml(firstName)}, Diego from Private Travel CR prepared this booking for you. One click below to confirm and pay.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #ea580c;border-radius:12px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <div style="font-size:12px;color:#c2410c;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Amount to pay</div>
                    <div style="font-size:32px;color:#7c2d12;font-weight:800;margin:6px 0 14px 0;">${totalStr}</div>
                    <a href="${escapeHtml(data.payUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:800;font-size:16px;text-decoration:none;padding:16px 32px;border-radius:12px;letter-spacing:0.02em;">Pay now &amp; confirm booking →</a>
                    <div style="font-size:11px;color:#6b7280;margin-top:12px;">Secure payment via Tilopay · Link expires ${escapeHtml(expiresStr)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="ptcr-muted" style="font-size:12px;color:#6b7280;">Order number</td>
                        <td class="ptcr-navy" style="font-size:13px;color:#1e3a8a;font-family:'SFMono-Regular',Menlo,monospace;font-weight:700;text-align:right;">${escapeHtml(data.orderNumber)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${rowsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 28px 24px;text-align:center;">
              <p class="ptcr-muted" style="margin:0 0 12px 0;font-size:13px;color:#6b7280;">Questions before you pay? WhatsApp Diego directly:</p>
              <a href="https://wa.me/50686334133" style="display:inline-block;background:#ffffff;color:#16a34a;font-weight:700;font-size:14px;text-decoration:none;padding:10px 20px;border-radius:10px;border:1px solid #16a34a;">Chat on WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <div class="ptcr-muted" style="font-size:11px;color:#6b7280;">
                Private Travel Costa Rica · La Fortuna, Alajuela · +506 8633-4133
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const res = await resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Complete your Costa Rica booking · ${data.orderNumber} · ${totalStr}`,
      html,
      replyTo: businessReplyTo,
    });
    if (res.error) {
      console.error("[email] payment-request send error:", res.error);
    }
  } catch (e) {
    console.error("[email] payment-request send threw:", e);
  }
}
