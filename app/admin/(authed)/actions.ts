"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  sendBookingEmails,
  sendBookingUpdateEmails,
  sendPaymentRequestEmail,
} from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import type { CartItem } from "@/lib/CartContext";

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

const ALLOWED_STATUSES = new Set([
  "pending",
  "approved",
  "completed",
  "cancelled",
]);

export async function updateBookingStatusAction(
  formData: FormData
): Promise<void> {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!orderNumber || !ALLOWED_STATUSES.has(status)) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("order_number", orderNumber);

  if (error) {
    console.error("[admin] updateBookingStatus failed:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${orderNumber}`);
}

// Validate the YYYY-MM-DD shape — defensive against pasted garbage. We
// don't validate the calendar date itself (Feb 30 etc.) because the
// browser date picker already does, and the rare manual-entry edge
// case isn't worth a calendar library on the server.
function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isValidTime(s: string): boolean {
  return /^\d{2}:\d{2}$/.test(s);
}

/**
 * Edit the date + time of a single trip inside a booking's items[] array.
 *
 * The items column is JSONB, so to "patch one element" we round-trip:
 * SELECT the array, mutate the target index, UPDATE with the full array.
 * Postgres has jsonb_set for this in a single statement but the SDK
 * doesn't expose it cleanly, and the SELECT+UPDATE pair is ~30ms total
 * on a row this small — fine for an admin edit that happens manually.
 *
 * Use case: customer messaged Diego asking to push their pickup back
 * a day or fix the time they entered wrong. Before this action existed
 * Diego had to email me to run raw SQL, which was slow and lossy.
 *
 * IMPORTANT — email behavior changed 2026-06-24:
 * This action ONLY saves the DB change. It does NOT email the customer.
 * Diego explicitly asked for this split because the auto-email made
 * iterative edits dangerous — every typo or in-progress change blasted
 * the customer with a "your booking changed" email. Now the flow is:
 *   1) Save change  → trip updated in DB, no email
 *   2) Verify it's right
 *   3) Click "Notify customer" → sendTripUpdateEmailAction fires the email
 * If you ever re-add the auto-send, talk to Diego first — he'll be mad.
 */
export async function updateTripDateTimeAction(
  formData: FormData
): Promise<void> {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const tripIndex = parseInt(String(formData.get("tripIndex") ?? ""), 10);
  const date = String(formData.get("date") ?? "").trim();
  const pickupTime = String(formData.get("pickupTime") ?? "").trim();

  if (!orderNumber || Number.isNaN(tripIndex) || tripIndex < 0) return;
  if (!isValidDate(date) || !isValidTime(pickupTime)) return;

  // Fetch only the items column — we used to also grab customer fields
  // for the auto-email, but that send moved out to a separate manual
  // action (sendTripUpdateEmailAction). Keeps this round-trip lean.
  const { data: row, error: readErr } = await supabaseAdmin
    .from("bookings")
    .select("items")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (readErr || !row) {
    console.error("[admin] updateTripDateTime read failed:", readErr);
    return;
  }

  const items = Array.isArray(row.items)
    ? (row.items as Record<string, unknown>[])
    : [];
  if (tripIndex >= items.length) {
    console.error(
      `[admin] updateTripDateTime: tripIndex ${tripIndex} out of range for order ${orderNumber}`,
    );
    return;
  }

  // Mutate the target trip in place, then write the whole items array
  // back. We DON'T touch the rest of the trip object so child seats,
  // flight info, addresses, service tier all survive untouched.
  items[tripIndex] = {
    ...items[tripIndex],
    date,
    pickupTime,
  };

  const { error: writeErr } = await supabaseAdmin
    .from("bookings")
    .update({ items })
    .eq("order_number", orderNumber);

  if (writeErr) {
    console.error("[admin] updateTripDateTime write failed:", writeErr);
    return;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${orderNumber}`);

  // Redirect back to the detail page with a "saved" flag so the UI can
  // surface a green confirmation banner + a CTA to send the update
  // email. Using a query string + redirect is the simplest way to pass
  // one-shot state from a server action without persisting it anywhere.
  redirect(`/admin/${orderNumber}?saved=trip-${tripIndex}`);
}

/**
 * Manually fire the "your booking has been updated" email after Diego
 * edits a trip's date / time. Split out from updateTripDateTimeAction
 * on 2026-06-24 so iterative edits never accidentally email the
 * customer mid-change. Diego triggers this from a dedicated button
 * on the booking detail page once he's confirmed the changes are right.
 *
 * Sends sendBookingUpdateEmails (not sendBookingEmails) — the template
 * is worded as "your booking has been UPDATED, here are the new
 * details" rather than the original "booking confirmed" copy.
 */
export async function sendTripUpdateEmailAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  if (!orderNumber) return;

  const { data: row, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "items, customer_name, customer_email, customer_phone, total_usd, tilopay_auth, tilopay_last4",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !row) {
    console.error("[admin] sendTripUpdateEmail read failed:", error);
    return;
  }
  if (!row.customer_email) {
    console.error(
      `[admin] sendTripUpdateEmail: order ${orderNumber} has no customer_email`,
    );
    return;
  }

  const items = Array.isArray(row.items)
    ? (row.items as unknown as CartItem[])
    : [];

  try {
    await sendBookingUpdateEmails({
      orderNumber,
      customerName: row.customer_name ?? "",
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone ?? null,
      totalUsd: Number(row.total_usd ?? 0),
      authCode: row.tilopay_auth ?? null,
      cardLast4: row.tilopay_last4 ?? null,
      items,
    });
  } catch (e) {
    console.error("[admin] sendTripUpdateEmail send threw:", e);
  }

  // Redirect back with a "sent" flag so the UI can flip the banner
  // from "saved, notify customer?" to "✅ customer notified".
  redirect(`/admin/${orderNumber}?sent=update`);
}

/**
 * Manually re-fire the original "Booking Confirmed" email for a booking
 * that didn't reach the customer. Most common cause: aggressive spam
 * filters at MSN / Hotmail / Outlook silently dropped the first send.
 * Now that EMAIL_FROM points at the verified privatetravelcr.com domain
 * (2026-06-20), the second send usually lands in the inbox cleanly.
 *
 * Diego triggers this from the admin booking detail page when a
 * customer messages him saying "I never got the confirmation".
 */
export async function resendConfirmationEmailAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  if (!orderNumber) return;

  const { data: row, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "items, customer_name, customer_email, customer_phone, total_usd, tilopay_auth, tilopay_last4",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !row) {
    console.error("[admin] resendConfirmation read failed:", error);
    return;
  }
  if (!row.customer_email) {
    console.error(
      `[admin] resendConfirmation: order ${orderNumber} has no customer_email`,
    );
    return;
  }

  const items = Array.isArray(row.items)
    ? (row.items as unknown as CartItem[])
    : [];

  try {
    await sendBookingEmails({
      orderNumber,
      customerName: row.customer_name ?? "",
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone ?? null,
      totalUsd: Number(row.total_usd ?? 0),
      authCode: row.tilopay_auth ?? null,
      cardLast4: row.tilopay_last4 ?? null,
      items,
    });
  } catch (e) {
    console.error("[admin] resendConfirmation send threw:", e);
  }

  revalidatePath(`/admin/${orderNumber}`);
}

// Generate a URL-safe token, 24 chars of base64url. Space is ~144 bits
// so guessing a valid token is effectively impossible (well beyond the
// number of ongoing bookings we'd ever have live at once).
function generatePaymentToken(): string {
  return randomBytes(18)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function nextBookingOrderNumber(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("next_booking_number");
  if (!error && typeof data === "string" && data.startsWith("PTCR-")) {
    return data;
  }
  console.error("[admin] next_booking_number RPC failed, falling back:", error);
  const ts = Date.now().toString(36).toUpperCase();
  return `PTCR-A${ts}`;
}

/**
 * Admin-created quote / payment link (2026-06-30 feature). Diego fills
 * out the customer + trip on /admin/create-quote, submits, and this
 * action:
 *   1) Inserts a pending booking row exactly like the public payment/start
 *      route does, with created_by_admin = true so we can filter later.
 *   2) Generates a random URL-safe payment_token + a 48h expiry, stored
 *      on the row so the public /pay/[token] page can look the booking
 *      up without leaking any customer info in the URL.
 *   3) Emails the customer a single-CTA "complete your booking" message
 *      via sendPaymentRequestEmail. No internal ping — Diego just made
 *      the row himself, no news for him yet. When the customer pays,
 *      the normal Tilopay callback fires sendBookingEmails as usual and
 *      Diego gets the "🚐 New booking" ping at that point.
 *
 * On success: redirect to /admin/<order> so Diego can see the row + the
 * "Resend payment link" button (added later on that page).
 */
// Pull one trip's payload out of the FormData at a given index. The
// CreateQuoteForm client sends fields named `trips[N].<field>` for
// each trip in its state array; this helper collects them into a
// plain object with defensive trimming. Multi-trip support was added
// 2026-07-05 after Diego booked a family that needed SJO→La Fortuna
// + La Fortuna→Manuel Antonio + Manuel Antonio→SJO in one payment.
type TripInput = {
  fromName: string;
  toName: string;
  pickupPlace: string;
  dropoffPlace: string;
  date: string;
  pickupTime: string;
  passengers: number;
  serviceType: "standard" | "vip";
  vehicleName: string;
  flightNumber: string;
  tripPrice: number;
};

function readTrip(formData: FormData, idx: number): TripInput | null {
  const get = (field: string): string =>
    String(formData.get(`trips[${idx}].${field}`) ?? "").trim();

  const fromName = get("fromName");
  const toName = get("toName");
  const date = get("date");
  const pickupTime = get("pickupTime");
  const tripPriceRaw = get("tripPrice");
  const passengersRaw = get("passengers");

  // A trip with no fromName is either an empty extra row the operator
  // dragged in and then abandoned, or a bug on the client — either way
  // we skip it silently rather than 500-ing.
  if (!fromName) return null;
  if (!toName || !date || !pickupTime) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!/^\d{2}:\d{2}$/.test(pickupTime)) return null;

  const passengers = Math.max(
    1,
    Math.min(12, parseInt(passengersRaw, 10) || 1),
  );
  const tripPrice = Number(tripPriceRaw);
  if (!Number.isFinite(tripPrice) || tripPrice <= 0) return null;

  const serviceRaw = get("serviceType");
  const serviceType: "vip" | "standard" =
    serviceRaw === "vip" ? "vip" : "standard";

  return {
    fromName,
    toName,
    pickupPlace: get("pickupPlace"),
    dropoffPlace: get("dropoffPlace"),
    date,
    pickupTime,
    passengers,
    serviceType,
    vehicleName: get("vehicleName"),
    flightNumber: get("flightNumber"),
    tripPrice,
  };
}

export async function createQuoteAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const totalUsdRaw = String(formData.get("totalUsd") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName || !customerEmail) return;

  // Walk trips[0..N-1] until we hit an empty slot. Cap at 20 so a
  // runaway form submission can't force us into an infinite loop.
  const trips: TripInput[] = [];
  for (let i = 0; i < 20; i++) {
    const t = readTrip(formData, i);
    if (t) trips.push(t);
    else if (i === 0) {
      // Trip #0 must exist; anything else is a valid stop condition.
      return;
    } else if (i > trips.length) {
      // We've walked past the last valid trip; stop scanning.
      break;
    }
  }
  if (trips.length === 0) return;

  const totalUsd = Number(totalUsdRaw);
  if (!Number.isFinite(totalUsd) || totalUsd <= 0) return;

  const orderNumber = await nextBookingOrderNumber();
  const token = generatePaymentToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Shape each trip as a CartItem so downstream consumers (email
  // template, admin detail page, PDF, ICS) render identically to a
  // customer-created booking.
  const items = trips.map((t, idx) => ({
    id: `${orderNumber}-${idx + 1}`,
    fromName: t.fromName,
    toName: t.toName,
    pickupPlace: t.pickupPlace || t.fromName,
    dropoffPlace: t.dropoffPlace || t.toName,
    date: t.date,
    pickupTime: t.pickupTime,
    passengers: t.passengers,
    children: 0,
    infantSeats: 0,
    convertibleSeats: 0,
    boosterSeats: 0,
    serviceType: t.serviceType,
    vehicleName:
      t.vehicleName ||
      (t.passengers <= 5
        ? "Hyundai Staria"
        : t.passengers <= 9
          ? "Toyota Hiace"
          : "Maxus V90"),
    basePrice: t.tripPrice,
    totalPrice: t.tripPrice,
    extraStopHours: 0,
    flightNumber: t.flightNumber || undefined,
    duration: null,
  }));

  // Bookings row keeps flight_number as a top-level column too, from
  // the pre-multi-trip era; populate it with the first airport-origin
  // trip's flight for backwards compat with any legacy reader.
  const firstFlight = trips.find((t) => t.flightNumber)?.flightNumber ?? null;

  const { error: insertErr } = await supabaseAdmin.from("bookings").insert({
    order_number: orderNumber,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone || null,
    flight_number: firstFlight,
    notes: notes || null,
    items,
    total_usd: totalUsd,
    currency: "USD",
    status: "pending",
    kind: "shuttle",
    created_by_admin: true,
    payment_token: token,
    token_expires_at: expiresAt.toISOString(),
  });

  if (insertErr) {
    console.error("[admin] createQuote insert failed:", insertErr);
    return;
  }

  const payUrl = `${siteConfig.siteUrl}/pay/${token}`;

  try {
    await sendPaymentRequestEmail({
      orderNumber,
      customerName,
      customerEmail,
      totalUsd,
      items: items as unknown as CartItem[],
      payUrl,
      expiresAt,
    });
  } catch (e) {
    console.error("[admin] createQuote email send threw:", e);
  }

  revalidatePath("/admin");
  redirect(`/admin/${orderNumber}?sent=quote`);
}
