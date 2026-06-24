"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingEmails, sendBookingUpdateEmails } from "@/lib/email";
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
