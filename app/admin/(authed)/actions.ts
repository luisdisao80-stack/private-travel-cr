"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

  // Fetch current items so we can mutate the target trip element.
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
}
