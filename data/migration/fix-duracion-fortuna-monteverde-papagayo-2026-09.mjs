// Diego, 03-09: "de la fortuna a papagayo son 3,5 horas e igual para
// monteverde".
//
// Esto cierra la pregunta que le había hecho. Las 4 filas (los dos pares en
// los dos sentidos) quedan en 3,5 H, y se corrige TODO el texto que menciona
// horas, no solo la columna duracion.
//
// Cómo estaban. Fijate que no era un dato malo, eran varios peleándose
// dentro de la misma página:
//
//   3142 la-fortuna-to-monteverde     duracion "4 H"
//        journey_description          "approximately 3 to 3.5 hours"
//        family_info                  "Approximately 3 to 3.5 hours"
//        google_maps_note             "Realistically it's about 3.5"
//        late_night_info              "Four hours around the northern shore"
//        -> CUATRO números distintos en una sola página: 4, 3-3.5, 3.5 y 4.
//
//   3201 monteverde-to-la-fortuna     duracion "4 H", textos 3-3.5
//   3145 la-fortuna-to-papagayo       duracion "4,5 H", textos 4.5 y 4
//   3253 papagayo-to-la-fortuna       duracion "4,5 H", textos 4,5
//
// Lo interesante: en las dos de Monteverde el google_maps_note YA decía 3.5,
// o sea que el dato bueno estaba en la página desde antes y el encabezado
// era el equivocado. Diego confirma que 3,5 es el correcto.
//
// Ojo con lo de ayer: yo había "arreglado" 3145 poniendo el texto en 4.5
// para que cuadrara con duracion, porque duracion era lo único que tenía
// para decidir. Estaba alineando hacia el número equivocado. El dato de
// Diego manda sobre la columna.
//
// NO se toca ningún precio. La duración no fija el precio: Fortuna->Papagayo
// sigue en $285 y Fortuna->Monteverde en $255. Si Diego quiere revisarlos
// ahora que el viaje es más corto, es decisión aparte.
//
// El método es reemplazo de FRASE EXACTA, como el del lastre de Monteverde:
// si la frase no está, avisa y no toca nada. Así es idempotente y auditable.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-duracion-fortuna-monteverde-papagayo-2026-09.mjs
//
// Después: destildar "Use existing Build Cache" en el redeploy de Vercel.

import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// id -> { duracion, frases: [[campo, viejo, nuevo], ...] }
const FIX = {
  3142: {
    // la-fortuna-to-monteverde   4 H -> 3,5 H
    duracion: "3,5 H",
    frases: [
      [
        "journey_description",
        "Total travel time is approximately 3 to 3.5 hours between",
        "Total travel time is approximately 3.5 hours between",
      ],
      ["family_info", "Approximately 3 to 3.5 hours on paved road", "Approximately 3.5 hours on paved road"],
      [
        "late_night_info",
        "Four hours around the northern shore of Lake Arenal",
        "Three and a half hours around the northern shore of Lake Arenal",
      ],
      // google_maps_note ya dice "Realistically it's about 3.5" — se deja
    ],
  },
  3201: {
    // monteverde-to-la-fortuna   4 H -> 3,5 H
    duracion: "3,5 H",
    frases: [
      ["journey_description", "Approximately 3 to 3.5 hours with views", "Approximately 3.5 hours with views"],
      ["google_maps_note", "It's more like 3-3.5.", "It's more like 3.5."],
      ["family_info", "Approximately 3 to 3.5 hours. Paved the entire way.", "Approximately 3.5 hours. Paved the entire way."],
      [
        "late_night_info",
        "Four hours: the winding descent out of Monteverde",
        "Three and a half hours: the winding descent out of Monteverde",
      ],
    ],
  },
  3145: {
    // la-fortuna-to-papagayo   4,5 H -> 3,5 H
    duracion: "3,5 H",
    frases: [
      [
        "journey_description",
        "Approximately 4.5 hours of paved highway driving.",
        "Approximately 3.5 hours of paved highway driving.",
      ],
      ["google_maps_note", "Realistic 4.5 hours door to door.", "Realistic 3.5 hours door to door."],
      ["family_info", "Approximately 4 hours.", "Approximately 3.5 hours."],
      ["budget_tip", "direct, comfortable, around 4 hours.", "direct, comfortable, around 3.5 hours."],
      [
        "late_night_info",
        "Four and a half hours on paved highway",
        "Three and a half hours on paved highway",
      ],
    ],
  },
  3253: {
    // papagayo-to-la-fortuna   4,5 H -> 3,5 H
    duracion: "3,5 H",
    frases: [
      ["journey_description", "approximately 4,5 H in our comfortable", "approximately 3,5 H in our comfortable"],
      ["google_maps_note", "Plan for 4.5 hours rather than", "Plan for 3.5 hours rather than"],
      [
        "family_info",
        "Four and a half hours from the peninsula to the volcano",
        "Three and a half hours from the peninsula to the volcano",
      ],
    ],
  },
};

const base = env.NEXT_PUBLIC_SUPABASE_URL;
let filasOk = 0;
const noEncontradas = [];

for (const [id, { duracion, frases }] of Object.entries(FIX)) {
  const fila = (await (await fetch(`${base}/rest/v1/routes?id=eq.${id}&select=*`, { headers: H })).json())[0];
  if (!fila) {
    console.error(`${id} no existe`);
    continue;
  }
  const cambios = { duracion };
  for (const [campo, viejo, nuevo] of frases) {
    const actual = fila[campo];
    if (!actual || !actual.includes(viejo)) {
      noEncontradas.push(`${id} ${campo}: "${viejo}"`);
      continue;
    }
    cambios[campo] = actual.split(viejo).join(nuevo);
  }
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(cambios),
  });
  if (res.ok) {
    filasOk++;
    console.log(`${id} OK  ${fila.slug.padEnd(46)} "${fila.duracion}" -> "${duracion}"  (${Object.keys(cambios).length - 1} campo/s de texto)`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

console.log(`\n${filasOk}/4 filas.`);
if (noEncontradas.length) {
  console.log(`\n${noEncontradas.length} frase(s) no encontrada(s) (normal si el script ya corrió):`);
  noEncontradas.forEach((f) => console.log(`  - ${f}`));
}

// control final: que no quede ningún número viejo suelto en esas 4 filas
console.log("\ncontrol — menciones de horas que quedan:");
const revisar = await (await fetch(`${base}/rest/v1/routes?id=in.(3142,3201,3145,3253)&select=*`, { headers: H })).json();
let sospechosas = 0;
for (const f of revisar.sort((a, b) => a.id - b.id)) {
  for (const [c, v] of Object.entries(f)) {
    if (typeof v !== "string") continue;
    for (const m of v.match(/\b\d+([.,]\d+)?\s*(?:to\s*\d+([.,]\d+)?\s*)?(?:hours?|hrs?|H)\b/gi) || []) {
      const ok = /^(3[.,]5|3,5)\s*(hours?|H)$/i.test(m.trim()) || /2\.5-3/.test(m);
      if (!ok) {
        console.log(`  ${f.id} ${c}: "${m}"`);
        sospechosas++;
      }
    }
  }
  for (const [c, v] of Object.entries(f)) {
    if (typeof v !== "string") continue;
    if (/\b(four|four and a half|Four)\b/.test(v)) {
      console.log(`  ${f.id} ${c}: dice "four" en letras`);
      sospechosas++;
    }
  }
}
console.log(sospechosas ? `\n${sospechosas} para revisar a mano.` : "\nlimpio: solo quedan menciones de 3,5.");
