// Transactional email via Resend. Server-only.
//
// Env vars:
//   RESEND_API_KEY   - required.
//   EMAIL_FROM       - optional, defaults to Resend's sandbox sender.
//                      Switch to "Private Travel CR <bookings@privatetravelcr.com>"
//                      once the domain is verified in Resend.
//   BUSINESS_EMAIL   - optional, defaults to info@privatetravelcr.com.
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
const DEFAULT_BUSINESS = "info@privatetravelcr.com";

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
        return [
          "BEGIN:VEVENT",
          `UID:${data.orderNumber}-${idx}@privatetravelcr.com`,
          `DTSTAMP:${dtstamp}`,
          `SEQUENCE:${sequence}`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${escapeIcs(it.tourName)}`,
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
      return [
        "BEGIN:VEVENT",
        `UID:${data.orderNumber}-${idx}@privatetravelcr.com`,
        `DTSTAMP:${dtstamp}`,
        `SEQUENCE:${sequence}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcs(`Private Shuttle: ${it.fromName} → ${it.toName}`)}`,
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
  return `
    <tr>
      <td style="padding:14px 16px;border-top:1px solid #1f2937;vertical-align:top;">
        <div style="font-size:12px;color:#fbbf24;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">
          Tour #${idx + 1}${it.durationLabel ? ` · ${escapeHtml(it.durationLabel)}` : ""}
        </div>
        <div style="font-size:14px;color:#ffffff;font-weight:600;line-height:1.35;">
          ${escapeHtml(it.tourName)}
        </div>
        <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
          ${formatDate(it.date)} · Departure ${format12h(it.pickupTime)} · ${escapeHtml(pax)}
        </div>
        ${
          it.pickupHotel
            ? `<div style="font-size:12px;color:#9ca3af;margin-top:4px;">Pickup: ${escapeHtml(it.pickupHotel)}</div>`
            : ""
        }
      </td>
      <td style="padding:14px 16px;border-top:1px solid #1f2937;text-align:right;vertical-align:top;white-space:nowrap;">
        <div style="font-size:16px;color:#ffffff;font-weight:700;">$${it.totalPrice.toFixed(2)}</div>
        <div style="font-size:11px;color:#9ca3af;">USD</div>
      </td>
    </tr>
  `;
}

function shuttleRowHtml(it: CartItem, idx: number): string {
  const service = it.serviceType === "vip" ? "VIP" : "Standard";
  const pickup =
    it.pickupPlace && it.pickupPlace !== it.fromName
      ? ` <span style="color:#9ca3af">· ${escapeHtml(it.pickupPlace)}</span>`
      : "";
  const dropoff =
    it.dropoffPlace && it.dropoffPlace !== it.toName
      ? ` <span style="color:#9ca3af">· ${escapeHtml(it.dropoffPlace)}</span>`
      : "";
  // Highlight extra wait/stop hours on its own line so Diego (internal
  // email) and the customer don't miss it — it changes how the driver
  // schedules the day. Hidden when 0.
  const extraStops =
    it.extraStopHours && it.extraStopHours > 0
      ? `<div style="font-size:12px;color:#fbbf24;font-weight:600;margin-top:6px;">⏱ Extra wait: ${it.extraStopHours}h paid</div>`
      : "";
  // Highlighted child-seat line — same yellow as Extra wait because they
  // both change what the driver loads in the van and how he plans the trip.
  // Emoji helps Diego spot it instantly when scanning his order inbox.
  const seatsLine = childSeatsSummary(it);
  const childSeats = seatsLine
    ? `<div style="font-size:12px;color:#fbbf24;font-weight:600;margin-top:6px;">👶 Child seats: ${escapeHtml(seatsLine)}</div>`
    : "";
  return `
    <tr>
      <td style="padding:14px 16px;border-top:1px solid #1f2937;vertical-align:top;">
        <div style="font-size:12px;color:#fbbf24;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">
          Trip #${idx + 1} · ${escapeHtml(service)} · ${escapeHtml(it.vehicleName)}
        </div>
        <div style="font-size:14px;color:#ffffff;font-weight:600;">
          ${escapeHtml(it.fromName)}${pickup}
        </div>
        <div style="font-size:12px;color:#9ca3af;margin:2px 0 2px 0;">↓</div>
        <div style="font-size:14px;color:#ffffff;font-weight:600;">
          ${escapeHtml(it.toName)}${dropoff}
        </div>
        <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
          ${formatDate(it.date)} · ${format12h(it.pickupTime)} · ${it.passengers} pax
          ${it.flightNumber ? ` · Flight ${escapeHtml(it.flightNumber)}` : ""}
        </div>
        ${extraStops}
        ${childSeats}
      </td>
      <td style="padding:14px 16px;border-top:1px solid #1f2937;text-align:right;vertical-align:top;white-space:nowrap;">
        <div style="font-size:16px;color:#ffffff;font-weight:700;">$${it.totalPrice.toFixed(2)}</div>
        <div style="font-size:11px;color:#9ca3af;">USD</div>
      </td>
    </tr>
  `;
}

function tripRowsHtml(items: BookingItem[]): string {
  return items
    .map((it, idx) => (isTourItem(it) ? tourRowHtml(it, idx) : shuttleRowHtml(it, idx)))
    .join("");
}

function shellHtml({
  title,
  intro,
  data,
  showCustomer,
}: {
  title: string;
  intro: string;
  data: BookingEmailInput;
  showCustomer: boolean;
}): string {
  // Customer block — three lines (name, email, phone) all rendered in
  // pure-white-on-near-black so they pop in the dark email shell. The
  // .ptcr-text-white class is targeted by the dark-mode CSS in shellHtml
  // so iOS Mail and Outlook can't auto-invert the color to gray.
  const customerBlock = showCustomer
    ? `
      <tr>
        <td style="padding:16px;border-top:1px solid #1f2937;">
          <div style="font-size:12px;color:#fbbf24;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">Customer</div>
          <div class="ptcr-text-white" style="font-size:16px;color:#ffffff;font-weight:700;line-height:1.3;">${escapeHtml(data.customerName)}</div>
          <div class="ptcr-text-white" style="font-size:14px;color:#ffffff;font-weight:600;margin-top:4px;line-height:1.4;">${escapeHtml(data.customerEmail)}</div>
          ${data.customerPhone ? `<div class="ptcr-text-white" style="font-size:14px;color:#ffffff;font-weight:600;margin-top:2px;line-height:1.4;">${escapeHtml(data.customerPhone)}</div>` : ""}
        </td>
      </tr>
    `
    : "";

  // Dark-mode template — restored 2026-05-26 after Diego confirmed the
  // dark look renders correctly in Hotmail and matches the premium-amber
  // brand. The previous light-mode swap was an over-correction for an
  // iOS-Gmail edge case; keeping dark for consistency with the rest of
  // the site UI.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <!-- Tell iOS Mail + Outlook the email is DESIGNED for dark mode so
       Smart-Invert leaves our pure-white text alone. Without these
       three meta tags Apple Mail rewrites #ffffff to a medium gray
       and the whole template renders washed-out on iPhone (Diego
       screenshot 2026-06-22). meta name="color-scheme" is the formal
       standard; the supported-color-schemes alias covers older iOS
       versions that haven't adopted it yet. -->
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <style>
    /* Block all auto-dark-mode rewrites on email clients that respect
       this CSS rule (Apple Mail iOS 13+, Outlook 2021+). The clients
       that don't honor it fall through to the inline white colors. */
    :root { color-scheme: dark light; supported-color-schemes: dark light; }
    /* Override iOS Mail's Smart-Invert specifically. The data-ogsc /
       data-ogsb attributes are Outlook's dark-mode toggles — we set
       them so Outlook doesn't try to "help" by inverting either. */
    [data-ogsc] body, [data-ogsb] body { background:#000000 !important; }
    [data-ogsc] .ptcr-text-white { color:#ffffff !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color-scheme:dark light;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(180deg,#0a0a0a,#000);border:1px solid rgba(245,158,11,0.25);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 20px 24px;text-align:center;border-bottom:1px solid #1f2937;">
              <a href="https://www.privatetravelcr.com" style="display:inline-block;text-decoration:none;">
                <img
                  src="https://www.privatetravelcr.com/logo-ptcr.svg"
                  alt="Private Travel Costa Rica"
                  width="180"
                  height="78"
                  style="display:block;margin:0 auto 4px auto;width:180px;height:auto;border:0;"
                />
                <!-- Outlook strips SVG; the eyebrow below works as fallback. -->
              </a>
              <div style="font-size:11px;color:#fbbf24;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Private Travel CR</div>
              <h1 style="margin:12px 0 0 0;font-size:24px;color:#ffffff;font-weight:800;">${escapeHtml(title)}</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#d1d5db;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(245,158,11,0.15);border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#9ca3af;">Order number</td>
                        <td style="font-size:13px;color:#fbbf24;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;">${escapeHtml(data.orderNumber)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#9ca3af;padding-top:6px;">Total</td>
                        <td style="font-size:18px;color:#ffffff;font-weight:700;text-align:right;padding-top:6px;">$${data.totalUsd.toFixed(2)} USD</td>
                      </tr>
                      ${
                        data.authCode
                          ? `<tr><td style="font-size:12px;color:#9ca3af;padding-top:6px;">Auth code</td><td style="font-size:12px;color:#d1d5db;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">${escapeHtml(data.authCode)}</td></tr>`
                          : ""
                      }
                      ${
                        data.cardLast4
                          ? `<tr><td style="font-size:12px;color:#9ca3af;padding-top:6px;">Card</td><td style="font-size:12px;color:#d1d5db;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">•••• ${escapeHtml(data.cardLast4)}</td></tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
                ${tripRowsHtml(data.items)}
                ${customerBlock}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 28px 24px;text-align:center;">
              <p style="margin:0 0 16px 0;font-size:13px;color:#9ca3af;">
                We&rsquo;ll be in touch shortly with the final pickup details.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://wa.me/50686334133" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;">Chat on WhatsApp</a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="mailto:info@privatetravelcr.com" style="display:inline-block;background:transparent;color:#fbbf24;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;border:1px solid rgba(245,158,11,0.4);">Email us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:rgba(255,255,255,0.02);border-top:1px solid #1f2937;text-align:center;">
              <div style="font-size:11px;color:#6b7280;">
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
  const businessTo = process.env.BUSINESS_EMAIL || DEFAULT_BUSINESS;

  const customerHtml = shellHtml({
    title: "Booking Confirmed",
    intro: `Thank you, ${data.customerName.split(" ")[0] || "friend"}. We've received your payment.`,
    data,
    showCustomer: false,
  });
  const internalHtml = shellHtml({
    title: "New booking received",
    intro: `Order ${data.orderNumber} just paid. Reach out to confirm pickup details.`,
    data,
    showCustomer: true,
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
      replyTo: businessTo,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from,
      to: businessTo,
      subject: `🚐 New booking · ${data.orderNumber} · $${data.totalUsd.toFixed(2)} USD`,
      html: internalHtml,
      replyTo: data.customerEmail,
      // Same .ics goes to the internal inbox too — Diego asked for the
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
  const businessTo = process.env.BUSINESS_EMAIL || DEFAULT_BUSINESS;

  const customerHtml = shellHtml({
    title: "Booking updated",
    intro: `Hi ${data.customerName.split(" ")[0] || "there"}, we've updated your booking with the new date or pickup time. Latest details below — please replace any earlier confirmation with this one.`,
    data,
    showCustomer: false,
  });
  const internalHtml = shellHtml({
    title: "Booking updated by admin",
    intro: `Order ${data.orderNumber} — trip date / pickup time changed. The customer is being notified at the same time.`,
    data,
    showCustomer: true,
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
      replyTo: businessTo,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from,
      to: businessTo,
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
