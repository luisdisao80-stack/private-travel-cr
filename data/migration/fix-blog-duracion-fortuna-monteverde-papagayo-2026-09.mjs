// El blog, alineado con lo que confirmó Diego: La Fortuna <-> Monteverde y
// La Fortuna <-> Papagayo son 3,5 horas.
//
// La base ya quedó con fix-duracion-fortuna-monteverde-papagayo-2026-09.mjs.
// Esto es la otra mitad: el blog decía OTRA cosa, y no una — tres cifras
// distintas para la misma ruta según el archivo que abrieras:
//
//   La Fortuna -> Monteverde
//     "3 h"            best-time-to-visit, transportation-guide (x2),
//                      how-much-does-cost, vs-mexico, 7-day-itinerary
//     "3 to 3.5 hours" la-fortuna-to-monteverde.md
//     "4 hours"        la-fortuna-travel-guide, monteverde-travel-guide (x2)
//     "3.5 hours"      costa-rica-without-rental-car (x2)   <- el que estaba bien
//
//   La Fortuna -> Papagayo
//     "4.5 hours"      honeymoon-costa-rica
//     "4 h 30 min"     how-much-does-cost
//
// Un cliente que lee dos artículos ve dos números y deja de creerle a los
// dos. Y Google ve un sitio que se contradice sobre su propio producto.
//
// OJO con lo que NO se toca: las menciones de "3 hours" del jeep-boat-jeep
// (el cruce en lancha por el lago Arenal) son de OTRO servicio y sí duran
// eso. Solo se cambia la cifra del viaje por carretera. Por eso cada
// reemplazo lleva el contexto pegado y no se reemplaza "3 hours" suelto.
//
// De paso, family-travel-costa-rica.md decía "includes bumpy section" de la
// ruta a Monteverde. Es el mito del lastre otra vez: la 606 está pavimentada
// desde 2020 (content/blog/monteverde-travel-guide.md líneas 26 y 163). Lo
// que es cierto es que es angosta y con curvas, y así queda.
//
// QUEDA PENDIENTE, no se toca porque Diego no lo confirmó: el blog dice
// "Monteverde -> SJO (4 hours)" y la base dice 3 H. Es otra diferencia, de
// otra ruta, y hay que preguntarle.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-blog-duracion-fortuna-monteverde-papagayo-2026-09.mjs
//
// Es idempotente: si ya corrió, no encuentra nada y lo dice.

import fs from "fs";
import path from "path";

// archivo -> [[viejo, nuevo], ...]
const CAMBIOS = {
  "content/blog/monteverde-travel-guide.md": [
    [
      "1. **Road around Lake Arenal** — about 4 hours, fully paved, scenic.",
      "1. **Road around Lake Arenal** — about 3.5 hours, fully paved, scenic.",
    ],
    [
      "**[Monteverde → La Fortuna](/private-shuttle/monteverde-to-la-fortuna)** (4 hours road, or 3 hours jeep-boat-jeep)",
      "**[Monteverde → La Fortuna](/private-shuttle/monteverde-to-la-fortuna)** (3.5 hours road, or 3 hours jeep-boat-jeep)",
    ],
  ],
  "content/blog/la-fortuna-travel-guide.md": [
    [
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** (4 hours by road, or 3 hours via jeep-boat-jeep across Lake Arenal)",
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** (3.5 hours by road, or 3 hours via jeep-boat-jeep across Lake Arenal)",
    ],
  ],
  "content/blog/best-time-to-visit-costa-rica.md": [
    [
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** — the classic connector, 3 h",
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** — the classic connector, 3.5 h",
    ],
  ],
  "content/blog/costa-rica-vs-mexico-vacation.md": [
    [
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** (3 hours, cloud forest)",
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** (3.5 hours, cloud forest)",
    ],
  ],
  "content/blog/costa-rica-transportation-guide-2026.md": [
    [
      "| [La Fortuna ↔ Monteverde](/private-shuttle/la-fortuna-to-monteverde) | $255 | $300 | 3 h |",
      "| [La Fortuna ↔ Monteverde](/private-shuttle/la-fortuna-to-monteverde) | $255 | $300 | 3.5 h |",
    ],
    [
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** — 3 h",
      "**[La Fortuna → Monteverde](/private-shuttle/la-fortuna-to-monteverde)** — 3.5 h",
    ],
  ],
  "content/blog/how-much-does-private-transportation-cost-costa-rica.md": [
    [
      "| [La Fortuna ↔ Monteverde](/private-shuttle/la-fortuna-to-monteverde) | **$255** | $300 | 3 h |",
      "| [La Fortuna ↔ Monteverde](/private-shuttle/la-fortuna-to-monteverde) | **$255** | $300 | 3.5 h |",
    ],
    [
      "| [La Fortuna ↔ Papagayo](/private-shuttle/la-fortuna-to-papagayo) | **$285** | $330 | 4 h 30 min |",
      "| [La Fortuna ↔ Papagayo](/private-shuttle/la-fortuna-to-papagayo) | **$285** | $330 | 3 h 30 min |",
    ],
  ],
  "content/blog/costa-rica-7-day-itinerary.md": [
    [
      "**Private shuttle La Fortuna to Monteverde (3 hours).** Around the lake on Route 142. Or take the taxi-boat-taxi option (also 3 hours, more scenic).",
      "**Private shuttle La Fortuna to Monteverde (3.5 hours).** Around the lake on Route 142. Or take the taxi-boat-taxi option (about 3 hours, more scenic).",
    ],
  ],
  "content/blog/la-fortuna-to-monteverde.md": [
    ["Driving around the lake takes **3 to 3.5 hours**.", "Driving around the lake takes **about 3.5 hours**."],
    ["You spend 3 hours getting there, not 8", "You spend 3.5 hours getting there, not 8"],
  ],
  "content/blog/family-travel-costa-rica.md": [
    [
      "[La Fortuna to Monteverde](/private-shuttle/la-fortuna-to-monteverde) (3.5h, includes bumpy section)",
      "[La Fortuna to Monteverde](/private-shuttle/la-fortuna-to-monteverde) (3.5h, winding mountain section at the end)",
    ],
  ],
  // Este apareció en el control de la primera corrida: se me había pasado.
  // Es la misma tabla de precios pero en otro archivo, con el formato "3h30min".
  "content/blog/how-much-does-costa-rica-shuttle-cost.md": [
    ["| La Fortuna ↔ Monteverde | $255 | 3h |", "| La Fortuna ↔ Monteverde | $255 | 3h30min |"],
  ],
  "content/blog/honeymoon-costa-rica.md": [
    [
      "the direct [La Fortuna → Papagayo shuttle](/private-shuttle/la-fortuna-to-papagayo) is $285 and about 4.5 hours",
      "the direct [La Fortuna → Papagayo shuttle](/private-shuttle/la-fortuna-to-papagayo) is $285 and about 3.5 hours",
    ],
  ],
};

let archivosTocados = 0;
let cambiosHechos = 0;
const noEncontrados = [];

for (const [archivo, pares] of Object.entries(CAMBIOS)) {
  const ruta = path.resolve(archivo);
  if (!fs.existsSync(ruta)) {
    console.error(`FALTA el archivo ${archivo}`);
    continue;
  }
  const original = fs.readFileSync(ruta, "utf8");
  let texto = original;
  const hechos = [];
  for (const [viejo, nuevo] of pares) {
    if (!texto.includes(viejo)) {
      noEncontrados.push(`${archivo}: "${viejo.slice(0, 70)}..."`);
      continue;
    }
    texto = texto.split(viejo).join(nuevo);
    hechos.push(viejo.slice(0, 60));
    cambiosHechos++;
  }
  if (texto !== original) {
    fs.writeFileSync(ruta, texto);
    archivosTocados++;
    console.log(`${archivo}  (${hechos.length} cambio/s)`);
  }
}

console.log(`\n${archivosTocados} archivos, ${cambiosHechos} cambios.`);
if (noEncontrados.length) {
  console.log(`\n${noEncontrados.length} frase(s) no encontrada(s) (normal si ya corrió):`);
  noEncontrados.forEach((f) => console.log(`  - ${f}`));
}

// control: buscar cifras viejas que hayan quedado sueltas
console.log("\ncontrol — menciones de estas dos rutas que NO dicen 3.5:");
const dir = "content/blog";
let sospechosas = 0;
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".md"))) {
  const lineas = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
  lineas.forEach((l, i) => {
    const esRuta =
      /la-fortuna-to-monteverde|monteverde-to-la-fortuna|la-fortuna-to-papagayo|papagayo-peninsula-guanacaste-to-la-fortuna/.test(l) ||
      /(La Fortuna|Arenal).{0,40}(Monteverde|Papagayo)|(Monteverde|Papagayo).{0,40}(La Fortuna|Arenal)/.test(l);
    if (!esRuta) return;
    // Si la línea habla del cruce en lancha, sus horas son de otro servicio.
    const sinBarco = l.replace(/\([^)]*(jeep|boat|lancha)[^)]*\)/gi, "").replace(/or\s+\d+\s*hours?\s+(via\s+)?(jeep|taxi-boat)[^,.]*/gi, "");
    const m = sinBarco.match(/\b\d+([.,]\d+)?\s*h(?:ours?|rs?)?\s*(?:30\s*min)?|\b\d+\s*to\s*\d+([.,]\d+)?\s*hours?/gi) || [];
    // 3.5 / 3,5 / 3h30min / "3 h 30 min" son todos la misma cifra buena
    const malas = m.filter((x) => !/3[.,]5|3\s*h\s*30/i.test(x));
    if (malas.length) {
      console.log(`  ${f}:${i + 1}  ${malas.join(" / ")}   ${l.trim().slice(0, 95)}`);
      sospechosas++;
    }
  });
}
console.log(
  sospechosas
    ? `\n${sospechosas} línea(s) para mirar a mano. OJO: el filtro pide que la línea\nnombre las dos puntas, así que también cae alguna que menciona Monteverde o\nLa Fortuna pero cuya cifra es de OTRA ruta (Manuel Antonio, SJO, Caño Negro).`
    : "\nlimpio."
);
