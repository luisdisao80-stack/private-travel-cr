/**
 * Monteverde ↔ San José centro son 4 horas y media (Diego, 2026-09-03).
 *
 * Continuación de fix-duracion-monteverde-sjo-2026-09.mjs. Ahí corregimos el
 * tramo al aeropuerto (4 H); estas dos filas quedaron pendientes porque no
 * había que adivinarles el número.
 *
 * Decían "3 H", y eso era imposible: el aeropuerto está en Alajuela, veinte
 * minutos ANTES del centro viniendo de Monteverde. Si el aeropuerto son 4 h,
 * el centro tiene que ser más, no menos. O sea que la fila no solo estaba
 * mal, estaba mal en la dirección peligrosa: al que sale de Monteverde para
 * el centro le prometía llegar hora y media antes de lo real.
 *
 * A diferencia del tramo del aeropuerto, acá el cuerpo del texto NO desmentía
 * al encabezado: la prosa repetía el mismo 3 en tres lugares distintos. Por eso
 * se tocan cuatro campos y no solo `duracion`; si arreglamos nada más el
 * encabezado, la página seguiría diciendo "Plan for 3 hours" más abajo.
 *
 * Formato: `duracion` va en formato de casa con coma ("4,5 H", como
 * sjo-to-puerto-viejo); la prosa es contenido del sitio y va en inglés con
 * punto ("4.5 hours", como el "3.5 to 4 hours" de las filas del aeropuerto).
 *
 * Ojo con la clave: con la anon el update no escribe y PostgREST NO devuelve
 * error, así que un update bloqueado por RLS se ve igual que uno exitoso. Va
 * con service role y con .select() para poder distinguirlos.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
  console.error("falta SUPABASE_SERVICE_ROLE_KEY; con la anon key no se escribe nada.");
  process.exit(1);
}
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key);

// slug -> { campo: [texto viejo, texto nuevo] }  (reemplazo de frase exacta)
const REEMPLAZOS = {
  "monteverde-to-san-jose-downtown": {
    duracion: ["3 H", "4,5 H"],
    journey_description: [
      "The journey takes approximately 3H in our comfortable, air-conditioned vehicles.",
      "The journey takes approximately 4.5 hours in our comfortable, air-conditioned vehicles.",
    ],
    google_maps_note: ["Plan for 3 hours.", "Plan for 4.5 hours."],
    // "Three hours, starting con la bajada": es la misma cifra escrita con
    // letras. Si no se toca, la sección de familias contradice al encabezado.
    family_info: [
      "Three hours, starting with the winding descent down Route 606.",
      "Four and a half hours, starting with the winding descent down Route 606.",
    ],
  },
  "san-jose-downtown-to-monteverde": {
    duracion: ["3 H", "4,5 H"],
    journey_description: [
      "The journey takes approximately 3H in our comfortable, air-conditioned vehicles.",
      "The journey takes approximately 4.5 hours in our comfortable, air-conditioned vehicles.",
    ],
    google_maps_note: ["Plan for 3 hours.", "Plan for 4.5 hours."],
  },
};

async function main() {
  const noEncontradas = [];
  let ok = 0;

  for (const [slug, campos] of Object.entries(REEMPLAZOS)) {
    const { data: filas, error } = await db.from("routes").select("*").eq("slug", slug);
    if (error || !filas?.length) {
      noEncontradas.push(`${slug}: no existe la fila`);
      continue;
    }
    const fila = filas[0];
    const cambios = {};

    for (const [campo, [viejo, nuevo]] of Object.entries(campos)) {
      const actual = fila[campo];
      if (actual == null) { noEncontradas.push(`${slug}.${campo}: vacío`); continue; }
      if (actual === nuevo || (typeof actual === "string" && actual.includes(nuevo) && !actual.includes(viejo))) {
        continue; // ya aplicado
      }
      if (!String(actual).includes(viejo)) {
        noEncontradas.push(`${slug}.${campo}: no contiene ${JSON.stringify(viejo)}`);
        continue;
      }
      cambios[campo] = String(actual).split(viejo).join(nuevo);
    }

    if (Object.keys(cambios).length === 0) { console.log(`  ${slug}: sin cambios`); continue; }

    const { data, error: e2 } = await db.from("routes").update(cambios).eq("slug", slug).select("slug");
    if (e2) noEncontradas.push(`${slug}: ${e2.message}`);
    else if (!data?.length) noEncontradas.push(`${slug}: no se actualizó ninguna fila (¿RLS?)`);
    else { ok++; console.log(`  ${slug}: ${Object.keys(cambios).join(", ")}`); }
  }

  console.log(`\nfilas actualizadas: ${ok}`);

  if (noEncontradas.length) {
    console.log("\nNO ENCONTRADAS:");
    noEncontradas.forEach((n) => console.log("   ", n));
  }

  // --- control: releer TODAS las columnas de las 4 filas del viaje Monteverde
  // <-> San José (centro y aeropuerto), no solo las dos que tocamos. El tramo
  // del aeropuerto tiene que seguir en 4 h después de esto.
  const { data: control } = await db
    .from("routes")
    .select("*")
    .in("slug", [
      "monteverde-to-san-jose-downtown",
      "san-jose-downtown-to-monteverde",
      "monteverde-to-sjo",
      "sjo-to-monteverde",
    ]);

  console.log("\ncontrol sobre las 4 filas Monteverde <-> San José:");
  let sospechas = 0;
  for (const f of control.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`\n  ${f.slug}  duracion=${JSON.stringify(f.duracion)}`);
    for (const [col, val] of Object.entries(f)) {
      if (val == null) continue;
      const txt = typeof val === "object" ? JSON.stringify(val) : String(val);
      // afirmaciones de "3 horas y pico" que no sean parte de un rango
      // ("3.5 to 4" es correcto) ni la nota que cita a Google a propósito.
      const malas = txt.match(
        /\b(approximately |about |plan for |realistic(?:ally)? |three )?3([.,]5)?\s*(h\b|H\b|hours?)(?!\s*(to|-|–))/gi,
      );
      if (malas) { console.log(`     [${col}] ${[...new Set(malas.map((m) => m.trim()))].join(" | ")}`); sospechas++; }
    }
  }
  if (sospechas === 0) console.log("\n  limpio: ninguna afirmación suelta de 3 horas.");
  else console.log(`\n  revisar ${sospechas} campo(s) de arriba a mano (los rangos "3.5 to 4" y el "Google says 3h" son correctos).`);
}

main();
