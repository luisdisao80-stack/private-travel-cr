// Saca el "camino de lastre" de TODAS las filas de Monteverde, de una vez.
//
// Los dos intentos anteriores (fix-road-type-monteverde-2-rutas y
// fix-road-type-monteverde-7-rutas-restantes) los hice campo por campo,
// escribiendo cada texto a mano. Fue un error de método: el dato estaba
// repartido en más campos de los que fui encontrando, y cada vez que
// revisaba el HTML generado aparecía otro — road_type, journey_description,
// google_maps_note, family_info, late_night_info, local_recommendation y
// traveler_tip. Quedaron filas a medias.
//
// Este script cambia el enfoque: en vez de reescribir campos, reemplaza
// FRASES EXACTAS en todos los campos de texto de todas las filas que tengan
// "monteverde" en el slug. Son 20 frases, sacadas de un barrido que juntó
// las 30 distintas que mencionaban lastre. Es auditable: se ve exactamente
// qué texto entra y qué texto sale.
//
// LAS 10 FRASES QUE NO SE TOCAN son de otros lugares donde el lastre SÍ es
// cierto, y aparecen en estas rutas porque road_type se arma pegando el
// texto del origen con el del destino:
//
//   - caminos internos de Santa Teresa y del Mal País
//   - caminos internos de Nosara
//   - los tramos a Corcovado
//   - la entrada al Río Celeste desde Bijagua
//   - los cerros de Nicoya y la península
//   - Rincón de la Vieja ("Last section is unpaved but well-maintained.")
//   - Playa Avellanas ("Paved road most of the way, last short stretch is gravel.")
//
// Las dos últimas las verifiqué una por una porque la frase sola es ambigua:
// resultó que describen el OTRO extremo de la ruta, no la subida a Monteverde.
//
// EL DATO: la Ruta 606 desde Sardinal se pavimentó en 2020, y la vuelta al
// lago Arenal desde La Fortuna también está pavimentada. Las dos cosas salen
// de content/blog/monteverde-travel-guide.md (líneas 26, 29, 34, 41 y 163).
// Son dos accesos distintos y el blog los cubre por separado.
//
// Lo que se conserva en cada reemplazo: que el tramo es lento, empinado y con
// curvas. Eso es cierto y es lo que explica la duración. Lo único que sale es
// la afirmación de que es de lastre.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-monteverde-lastre-todas-las-filas-2026-09.mjs
//
// Es idempotente: si ya corrió, la segunda vez no encuentra nada que cambiar.
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

// frase vieja -> frase nueva
const REEMPLAZOS = [
  // El boilerplate del destino Monteverde. Es el que más aparece.
  [
    "Paved road with the final 35km being well-maintained gravel.",
    "Paved road all the way, with the final 35 km up Route 606 steep and winding.",
  ],
  [
    "The road to Monteverde is part of the adventure: after smooth paved highway through Guanacaste and the lowlands, the final climb into the cloud forest is a winding, partly-gravel mountain road with sweeping valley views.",
    "The road to Monteverde is part of the adventure: after smooth paved highway through Guanacaste and the lowlands, the final climb into the cloud forest is a winding, steep mountain road with sweeping valley views.",
  ],
  ["The final section into Monteverde is on maintained gravel road.", "The final section into Monteverde is a steep, winding paved climb."],
  ["Final section to Monteverde is gravel but well-maintained.", "Final climb to Monteverde is paved but steep and winding."],
  [
    "Honestly, it's about 3.5 with the unpaved section leading into Monteverde.",
    "Honestly, it's about 3.5 — the climb into Monteverde is paved but narrow and full of curves.",
  ],
  [
    "The road from Tilarán to Monteverde is the rough part — about 45 minutes on dirt road.",
    "The road from Tilarán to Monteverde is the slow part — about 45 minutes of tight curves, paved but not fast.",
  ],
  [
    "Approximately 3 to 3.5 hours including the gravel road section.",
    "Approximately 3 to 3.5 hours including the winding mountain climb.",
  ],
  ["The unpaved stretch into Monteverde is well-maintained.", "The final climb into Monteverde is paved, just slow and winding."],
  ["Gravel then paved.", "Paved throughout, winding at the start."],
  ["It's more like 3-3.5 with the dirt roads.", "It's more like 3-3.5 with the mountain curves."],
  ["The unpaved section out of Monteverde adds 45 minutes.", "The winding descent out of Monteverde adds 45 minutes."],
  ["Gravel road on departure from Monteverde.", "Winding descent on departure from Monteverde."],
  ["Gravel out of Monteverde, then paved highway.", "Winding descent out of Monteverde, then open highway."],
  [
    "Gravel/unpaved sections near Monteverde, well-paved highway the rest of the way.",
    "Steep winding climb near Monteverde, open highway the rest of the way.",
  ],
  [
    "Well-paved highway most of the way, gravel/unpaved sections on the final approach to Monteverde.",
    "Well-paved highway most of the way, steep winding curves on the final approach to Monteverde.",
  ],
  ["Paved highways then gravel mountain road to Monteverde.", "Paved highways then a steep winding mountain climb to Monteverde."],
  [
    "You go through the mountains via the Interamericana, then up the winding road to Monteverde including the unpaved stretch.",
    "You go through the mountains via the Interamericana, then up the long winding climb to Monteverde.",
  ],
  [
    "Take a motion sickness pill if you're prone — the descent from Monteverde has many curves on gravel.",
    "Take a motion sickness pill if you're prone — the descent from Monteverde has a lot of tight curves.",
  ],
  ["First hour gravel descending from Monteverde, then fully paved highway.", "First hour winding downhill from Monteverde, then open highway."],
  [
    "When you start the gravel descent from Monteverde, that's your last cloud forest experience — roll down windows and enjoy.",
    "When you start the descent from Monteverde, that's your last cloud forest experience — roll down windows and enjoy.",
  ],
];

const base = env.NEXT_PUBLIC_SUPABASE_URL;
const res = await fetch(`${base}/rest/v1/routes?slug=ilike.*monteverde*&select=*&limit=500`, { headers: H });
const filas = await res.json();
if (!Array.isArray(filas)) {
  console.error("No se pudo leer routes:", JSON.stringify(filas).slice(0, 300));
  process.exit(1);
}

let filasTocadas = 0;
let camposTocados = 0;
const porFrase = {};

for (const fila of filas) {
  const cambios = {};
  for (const [campo, valor] of Object.entries(fila)) {
    if (typeof valor !== "string") continue;
    let nuevo = valor;
    for (const [viejo, reemplazo] of REEMPLAZOS) {
      if (!nuevo.includes(viejo)) continue;
      const veces = nuevo.split(viejo).length - 1;
      porFrase[viejo] = (porFrase[viejo] || 0) + veces;
      nuevo = nuevo.split(viejo).join(reemplazo);
    }
    if (nuevo !== valor) {
      cambios[campo] = nuevo;
      camposTocados++;
    }
  }
  if (!Object.keys(cambios).length) continue;

  const r = await fetch(`${base}/rest/v1/routes?id=eq.${fila.id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(cambios),
  });
  if (r.ok) {
    filasTocadas++;
    console.log(`${String(fila.id).padStart(5)} ${fila.slug.padEnd(46)} ${Object.keys(cambios).join(", ")}`);
  } else {
    console.error(`${fila.id} FALLÓ ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
}

console.log(`\n${filasTocadas} filas, ${camposTocados} campos.`);
console.log("\nveces que se aplicó cada frase:");
for (const [f, n] of Object.entries(porFrase).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}x  ${f.slice(0, 78)}`);
}
const sinUsar = REEMPLAZOS.filter(([v]) => !porFrase[v]);
if (sinUsar.length) {
  console.log(`\n${sinUsar.length} frase(s) del mapa no aparecieron (normal si el script ya corrió antes):`);
  sinUsar.forEach(([v]) => console.log(`  - ${v.slice(0, 78)}`));
}
