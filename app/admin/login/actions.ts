"use server";

import { redirect } from "next/navigation";
import { setAdminSession, verifyPassword } from "@/lib/admin-auth";

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!password || !verifyPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await setAdminSession();
  redirect("/admin");
}
