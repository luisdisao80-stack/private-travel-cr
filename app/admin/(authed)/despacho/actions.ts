"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requireAdmin() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
}

function str(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Guarda (o borra, si no hay proveedor) la asignación de un tramo. */
export async function saveDispatchAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const order_number = str(fd, "orden");
  const fecha = str(fd, "fecha");
  const tramo = Math.max(1, parseInt(str(fd, "tramo") || "1", 10) || 1);
  const providerRaw = str(fd, "provider_id");
  const netoRaw = str(fd, "neto").replace(/[$,\s]/g, "");
  const nota = str(fd, "nota");
  const estado = str(fd, "estado") === "hoja_enviada" ? "hoja_enviada" : "asignado";

  if (!order_number || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { ok: false, error: "Faltan datos del tramo" };
  }

  if (!providerRaw) {
    const { error } = await supabaseAdmin
      .from("dispatch")
      .delete()
      .match({ order_number, fecha, tramo });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/despacho");
    return { ok: true };
  }

  const provider_id = Number(providerRaw);
  const { data: prov, error: provErr } = await supabaseAdmin
    .from("providers")
    .select("id,es_planta")
    .eq("id", provider_id)
    .maybeSingle();
  if (provErr || !prov) return { ok: false, error: "Proveedor no encontrado" };

  let neto_usd: number | null = null;
  if (!prov.es_planta) {
    if (netoRaw === "") return { ok: false, error: "A los externos siempre se les pone el neto" };
    const n = Number(netoRaw);
    if (!Number.isFinite(n) || n <= 0) return { ok: false, error: "Neto inválido" };
    neto_usd = n;
  }

  const { error } = await supabaseAdmin
    .from("dispatch")
    .upsert(
      { order_number, fecha, tramo, provider_id, neto_usd, nota: nota || null, estado },
      { onConflict: "order_number,fecha,tramo" }
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/despacho");
  return { ok: true };
}

/** Marca / desmarca "hoja enviada" sin tocar el resto. */
export async function setDispatchEstadoAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const order_number = str(fd, "orden");
  const fecha = str(fd, "fecha");
  const tramo = Math.max(1, parseInt(str(fd, "tramo") || "1", 10) || 1);
  const estado = str(fd, "estado") === "hoja_enviada" ? "hoja_enviada" : "asignado";
  const { error } = await supabaseAdmin
    .from("dispatch")
    .update({ estado })
    .match({ order_number, fecha, tramo });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/despacho");
  return { ok: true };
}

// ---------------- Proveedores ----------------

export async function upsertProviderAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const idRaw = str(fd, "id");
  const nombre = str(fd, "nombre");
  if (!nombre) redirect("/admin/despacho/proveedores?error=nombre");
  const row = {
    nombre,
    chat_whatsapp: str(fd, "chat_whatsapp") || null,
    telefono: str(fd, "telefono") || null,
    es_planta: fd.get("es_planta") === "on",
    vehiculo: str(fd, "vehiculo") || null,
    activo: idRaw ? fd.get("activo") === "on" : true,
    notas: str(fd, "notas") || null,
  };
  const q = idRaw
    ? supabaseAdmin.from("providers").update(row).eq("id", Number(idRaw))
    : supabaseAdmin.from("providers").insert(row);
  const { error } = await q;
  if (error) {
    console.error("[admin] upsertProvider failed:", error);
    redirect(`/admin/despacho/proveedores?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/despacho");
  revalidatePath("/admin/despacho/proveedores");
  redirect("/admin/despacho/proveedores?saved=1");
}

export async function deleteProviderAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  if (!id) redirect("/admin/despacho/proveedores");
  // Si ya tiene tramos asignados no se borra: se desactiva, para no perder historial.
  const { count } = await supabaseAdmin
    .from("dispatch")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", id);
  if (count && count > 0) {
    await supabaseAdmin.from("providers").update({ activo: false }).eq("id", id);
    revalidatePath("/admin/despacho/proveedores");
    redirect("/admin/despacho/proveedores?saved=desactivado");
  }
  const { error } = await supabaseAdmin.from("providers").delete().eq("id", id);
  if (error) redirect(`/admin/despacho/proveedores?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/despacho");
  revalidatePath("/admin/despacho/proveedores");
  redirect("/admin/despacho/proveedores?saved=borrado");
}
