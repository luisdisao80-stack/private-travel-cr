/**
 * Unifica el formato de la columna `duracion` de la tabla `routes`.
 *
 * De 1.618 filas, 129 estaban fuera del formato de la casa: "3h", "4H",
 * "5,5H", " 6 H" y "2h 30min". Se veía: en la home, con las tarjetas sacadas
 * de la base, quedaba "3 H" al lado de "3H".
 *
 * Pero el problema de fondo no era estético. `parseDurationToMinutes` hacía
 * `.replace("H","")` y después `parseFloat`, así que:
 *   - "2h 30min" -> 2 horas (se perdían los 30 min), en 34 filas
 *   - "45 min"   -> 45 HORAS (parseFloat leía 45 y lo multiplicaba por 60),
 *                   en 122 filas
 * Eso salía publicado en el `duration` de schema.org que lee Google y en el
 * tiempo que ve el cliente en el cotizador. En vivo se podía leer PT55H0M en
 * papagayo-to-tamarindo: 55 horas para un viaje de 55 minutos.
 *
 * El parser ya está arreglado en lib/quote-helpers.ts, y este script lo
 * importa a propósito en vez de repetir la lógica: si mañana cambia la forma
 * de interpretar una duración, el dato guardado y el que se muestra siguen
 * saliendo del mismo lugar.
 *
 * Idempotente: convierte a minutos y vuelve a formatear, así que correrlo dos
 * veces no cambia nada la segunda.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { parseDurationToMinutes } from "../../lib/quote-helpers";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
// Con la clave anónima el UPDATE no escribe y PostgREST tampoco devuelve
// error: la política de RLS simplemente hace que no coincida ninguna fila.
// La primera corrida de este script informó "129/129 actualizadas" sin haber
// tocado nada. Para escribir hace falta la service role.
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
  console.error("falta SUPABASE_SERVICE_ROLE_KEY en .env.local; con la anon key el update no escribe nada.");
  process.exit(1);
}
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, key);

/**
 * El formato de la casa, el que ya usan 1.367 filas:
 *   menos de una hora -> "45 min"
 *   horas exactas     -> "3 H"
 *   con fracción      -> "3,5 H"  (coma decimal, como el resto del sitio)
 */
function formatoCasa(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = minutos / 60;
  if (Number.isInteger(horas)) return `${horas} H`;
  return `${String(horas).replace(".", ",")} H`;
}

async function main() {
  // PostgREST corta en 1000 filas: hay que paginar.
  const todas: { slug: string; duracion: string | null }[] = [];
  for (let p = 0; ; p++) {
    const { data, error } = await db
      .from("routes")
      .select("slug,duracion")
      .range(p * 1000, p * 1000 + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todas.push(...data);
    if (data.length < 1000) break;
  }
  console.log(`filas leídas: ${todas.length}`);

  const cambios = todas
    .filter((r) => r.duracion)
    .map((r) => ({ slug: r.slug, viejo: r.duracion!, nuevo: formatoCasa(parseDurationToMinutes(r.duracion!)) }))
    .filter((c) => c.viejo !== c.nuevo);

  console.log(`a cambiar: ${cambios.length}`);
  const resumen: Record<string, { a: string; n: number }> = {};
  cambios.forEach((c) => {
    resumen[c.viejo] = { a: c.nuevo, n: (resumen[c.viejo]?.n ?? 0) + 1 };
  });
  Object.entries(resumen)
    .sort((a, b) => b[1].n - a[1].n)
    .forEach(([viejo, { a, n }]) => console.log(`   ${JSON.stringify(viejo).padEnd(14)} -> ${JSON.stringify(a).padEnd(10)} ${n} filas`));

  if (cambios.length === 0) {
    console.log("\nnada que hacer.");
    return;
  }

  let ok = 0;
  const fallaron: string[] = [];
  for (const c of cambios) {
    // El .select() es lo que permite distinguir "escribí" de "no coincidió
    // ninguna fila". Sin él, un update bloqueado por RLS se ve idéntico a uno
    // exitoso y el script informa un éxito que no ocurrió.
    const { data, error } = await db
      .from("routes")
      .update({ duracion: c.nuevo })
      .eq("slug", c.slug)
      .select("slug");
    if (error) fallaron.push(`${c.slug}: ${error.message}`);
    else if (!data || data.length === 0) fallaron.push(`${c.slug}: no se actualizó ninguna fila`);
    else ok++;
  }
  console.log(`\nactualizadas: ${ok}/${cambios.length}`);
  fallaron.forEach((f) => console.log("   FALLÓ", f));

  // --- control: releer todo y confirmar que no quedó ningún formato raro ---
  const control: { slug: string; duracion: string | null }[] = [];
  for (let p = 0; ; p++) {
    const { data } = await db.from("routes").select("slug,duracion").range(p * 1000, p * 1000 + 999);
    if (!data || data.length === 0) break;
    control.push(...data);
    if (data.length < 1000) break;
  }
  const bueno = /^\d+(,\d+)? H$|^\d+ min$/;
  const raros = control.filter((r) => r.duracion && !bueno.test(r.duracion));
  console.log(`\ncontrol sobre ${control.length} filas:`);
  if (raros.length === 0) {
    console.log("   limpio: todas las duraciones están en el formato de la casa.");
  } else {
    console.log(`   quedan ${raros.length} fuera de formato:`);
    raros.slice(0, 20).forEach((r) => console.log("     ", r.slug, JSON.stringify(r.duracion)));
  }
}

main();
