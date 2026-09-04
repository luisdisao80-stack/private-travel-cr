/**
 * Monteverde ↔ SJO son 4 horas (Diego, 2026-09-03).
 *
 * La columna `duracion` decía "3 H" en los dos sentidos, y era el único número
 * del sitio que lo decía: la prosa de esas mismas filas ya hablaba de "3.5 to 4
 * hours", el blog ya publicaba 4 h en tres tablas distintas, y el campo
 * budget_tip ya decía "Standard direct transfer: 4 hours, $235". O sea que el
 * encabezado de la página contradecía a su propio cuerpo, y por debajo del piso
 * del rango que el cuerpo describía.
 *
 * Se cambian dos cosas y nada más:
 *   - `duracion` a "4 H" en los dos sentidos.
 *   - la única frase que afirma un número plano equivocado ("approximately 3.5
 *     hours from SJO" en late_night_info).
 *
 * La prosa que dice "3.5 to 4 hours" se queda como está. Es un rango correcto y
 * le sirve más al que está planeando que un número redondo: el encabezado da la
 * cifra para planificar y el texto explica de qué depende. Varias rutas del
 * sitio ya funcionan así.
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
  "monteverde-to-sjo": {
    duracion: ["3 H", "4 H"],
  },
  "sjo-to-monteverde": {
    duracion: ["3 H", "4 H"],
    late_night_info: [
      "Monteverde is approximately 3.5 hours from SJO.",
      "Monteverde is approximately 4 hours from SJO.",
    ],
  },
};

// archivo -> [[viejo, nuevo], ...]
const BLOG = {
  "content/blog/sjo-airport-arrival-guide.md": [
    [
      "**[Monteverde](/private-shuttle/sjo-to-monteverde):** ~3 hours 30 min",
      "**[Monteverde](/private-shuttle/sjo-to-monteverde):** ~4 hours",
    ],
  ],
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

  // --- blog ---
  for (const [archivo, pares] of Object.entries(BLOG)) {
    let txt = fs.readFileSync(archivo, "utf8");
    let tocado = false;
    for (const [viejo, nuevo] of pares) {
      if (txt.includes(nuevo) && !txt.includes(viejo)) continue; // ya aplicado
      if (!txt.includes(viejo)) { noEncontradas.push(`${archivo}: no contiene ${JSON.stringify(viejo)}`); continue; }
      txt = txt.split(viejo).join(nuevo);
      tocado = true;
    }
    if (tocado) { fs.writeFileSync(archivo, txt, "utf8"); console.log(`  ${archivo}: actualizado`); }
  }

  if (noEncontradas.length) {
    console.log("\nNO ENCONTRADAS:");
    noEncontradas.forEach((n) => console.log("   ", n));
  }

  // --- control: releer TODAS las columnas de las 4 filas del viaje ---
  const { data: control } = await db
    .from("routes")
    .select("*")
    .in("slug", ["monteverde-to-sjo", "sjo-to-monteverde"]);

  console.log("\ncontrol sobre las filas Monteverde <-> SJO:");
  let sospechas = 0;
  for (const f of control) {
    console.log(`\n  ${f.slug}  duracion=${JSON.stringify(f.duracion)}`);
    for (const [col, val] of Object.entries(f)) {
      if (val == null) continue;
      const txt = typeof val === "object" ? JSON.stringify(val) : String(val);
      // frases que afirman un número plano de 3 horas y pico: lo que no debería quedar
      const malas = txt.match(/\b(approximately |about |realistic(?:ally)? )?3([.,]5)?\s*(h\b|H\b|hours?)(?!\s*(to|-|–))/gi);
      if (malas) { console.log(`     [${col}] ${[...new Set(malas.map((m) => m.trim()))].join(" | ")}`); sospechas++; }
    }
  }
  if (sospechas === 0) console.log("\n  limpio: ninguna afirmación suelta de 3 horas.");
  else console.log(`\n  revisar ${sospechas} campo(s) de arriba a mano (los rangos "3.5 to 4" son correctos).`);
}

main();
