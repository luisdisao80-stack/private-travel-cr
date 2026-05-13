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
