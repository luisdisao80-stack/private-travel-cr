"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cargarSemana } from "@/lib/cierre-datos";
import { domingoDeLaSemana, esFechaIso, hoyCR, lunesDeLaSemana } from "@/lib/cierre-semanal";

async function requireAdmin() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
}

function str(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Cierra la semana: congela en `cierres` y `cierre_pagos` los viajes y el
 * monto de cada proveedor. Despues de esto, cambiar un neto en Despacho ya
 * no mueve lo que hay que pagar, que es el punto de cerrar.
 */
export async function cerrarSemanaAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const pedida = str(fd, "semana");
  if (!esFechaIso(pedida)) return { ok: false, error: "Semana inválida" };
  const lunes = lunesDeLaSemana(pedida);

  // No se cierra una semana que todavia no termina: los montos cambiarian.
  if (domingoDeLaSemana(lunes) > hoyCR()) {
    return { ok: false, error: "Esa semana todavía no termina. Se cierra el domingo." };
  }

  const semana = await cargarSemana(lunes);
  if (semana.cerrado) return { ok: false, error: "Esa semana ya está cerrada" };
  if (!semana.cierre.totalViajes) {
    return { ok: false, error: "Esa semana no tiene viajes despachados" };
  }

  const { error: cErr } = await supabaseAdmin.from("cierres").insert({
    semana_lunes: lunes,
    total_usd: semana.cierre.totalUsd,
    total_viajes: semana.cierre.totalViajes,
  });
  if (cErr) return { ok: false, error: cErr.message };

  const filas = semana.cierre.porProveedor.map((r) => ({
    semana_lunes: lunes,
    provider_id: r.providerId,
    proveedor: r.proveedor,
    es_planta: r.esPlanta,
    viajes: r.viajes,
    monto_usd: r.montoUsd,
    viajes_con_factura: r.viajesConFactura,
    viajes_sin_factura: r.viajesSinFactura,
  }));

  const { error: pErr } = await supabaseAdmin.from("cierre_pagos").insert(filas);
  if (pErr) {
    // Sin las filas por proveedor el cierre no sirve: se deshace entero.
    await supabaseAdmin.from("cierres").delete().eq("semana_lunes", lunes);
    return { ok: false, error: pErr.message };
  }

  revalidatePath("/admin/cierre");
  return { ok: true };
}

/** Marca (o desmarca) que a ese proveedor ya se le pagó esa semana. */
export async function marcarPagadoAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const pedida = str(fd, "semana");
  const providerRaw = str(fd, "provider_id");
  if (!esFechaIso(pedida)) return { ok: false, error: "Semana inválida" };
  const lunes = lunesDeLaSemana(pedida);
  const pagado = str(fd, "pagado") === "1";

  const q = supabaseAdmin
    .from("cierre_pagos")
    .update({ pagado, pagado_at: pagado ? new Date().toISOString() : null })
    .eq("semana_lunes", lunes);

  const { error } = providerRaw
    ? await q.eq("provider_id", Number(providerRaw))
    : await q.is("provider_id", null);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/cierre");
  return { ok: true };
}

/**
 * Reabre una semana cerrada, borrando lo congelado. Se niega si ya hay algun
 * pago marcado: ese pago se hizo contra estos montos y borrarlos dejaria el
 * registro del mes sin respaldo.
 */
export async function reabrirSemanaAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const pedida = str(fd, "semana");
  if (!esFechaIso(pedida)) return { ok: false, error: "Semana inválida" };
  const lunes = lunesDeLaSemana(pedida);

  const { data: pagos } = await supabaseAdmin
    .from("cierre_pagos")
    .select("proveedor")
    .eq("semana_lunes", lunes)
    .eq("pagado", true);

  if (pagos?.length) {
    return {
      ok: false,
      error: `No se puede reabrir: ya hay ${pagos.length} proveedor(es) marcados como pagados.`,
    };
  }

  // cierre_pagos cae por el on delete cascade de semana_lunes.
  const { error } = await supabaseAdmin.from("cierres").delete().eq("semana_lunes", lunes);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/cierre");
  return { ok: true };
}
