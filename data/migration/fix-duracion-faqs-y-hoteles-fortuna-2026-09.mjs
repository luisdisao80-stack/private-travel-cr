// La cola de lo mismo: 3,5 H para La Fortuna <-> Monteverde y <-> Papagayo.
//
// Los dos scripts anteriores arreglaron las 4 filas principales y el blog.
// Después de que salió a producción fui a mirar las páginas de verdad y
// encontré dos cosas que se me habían pasado, las dos por el mismo motivo:
// solo había revisado las columnas de texto que conocía.
//
// 1) La columna faqs, que es JSON y no la toqué. En la página de
//    la-fortuna-to-monteverde el encabezado ya decía 3,5 H y tres párrafos
//    más abajo la FAQ seguía diciendo "approximately 4 hours". Peor: la
//    misma página dice "$35 por hora extra pasado el viaje estándar de 4
//    horas", que ya no cuadra con nada.
//
// 2) El mismo viaje se vende también desde tres hoteles de La Fortuna
//    (Chateau Arenal, Arenal Observatory Lodge, Linda Vista del Norte), y
//    esas páginas son filas aparte que nadie tocó. Son 12 páginas más
//    —los dos sentidos por los tres hoteles por los dos destinos— con la
//    cifra vieja. Es la misma carretera.
//
// Cómo estaban las 6 de Papagayo, que son las peores. Tres números
// distintos en una sola página:
//
//   5006 chateau-arenal-to-papagayo   duracion "4,5 H"
//        journey_description          "Approximately 3 hours"
//        family_info                  "Approximately 4 hours"
//        budget_tip                   "around 4 hours"
//
// Esas 6 de Papagayo tienen is_indexable = false, o sea que no están en el
// sitemap. Se arreglan igual: la página existe, el cliente que llega por el
// buscador interno la ve, y alimenta el flujo de reserva.
//
// Lo que NO se toca, otra vez:
//   - "Google says 2.5-3 hours" se queda. Es lo que Google dice de verdad,
//     y es el contraste que hace útil a la nota.
//   - Las "3 hours" del jeep-boat-jeep. Otro servicio, y sí dura eso.
//   - Los precios.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-duracion-faqs-y-hoteles-fortuna-2026-09.mjs
//
// Es idempotente. Después: redeploy en Vercel con el build cache destildado.

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
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const H = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// Frases que se repiten en varias filas porque salieron de la misma plantilla.
const FAQ_CUATRO = [
  "the road around Lake Arenal — approximately 4 hours, fully paved, scenic",
  "the road around Lake Arenal — approximately 3.5 hours, fully paved, scenic",
];
const GMAPS_RANGO = ["It's more like 3-3.5 with the mountain curves.", "It's more like 3.5 with the mountain curves."];

// id -> { duracion?, frases: [[campo, viejo, nuevo], ...] }
// Los campos JSON (faqs) se tratan como texto: se serializa, se reemplaza y
// se vuelve a parsear. Funciona porque las frases no llevan comillas ni
// backslashes que el JSON tenga que escapar.
const FIX = {
  // ---- las dos principales: solo faltaba la columna faqs ----
  3142: {
    // la-fortuna-to-monteverde
    frases: [
      ["faqs", ...FAQ_CUATRO],
      ["faqs", "beyond the standard 4-hour trip", "beyond the standard 3.5-hour trip"],
    ],
  },
  3145: {
    // la-fortuna-to-papagayo
    frases: [
      [
        "faqs",
        "About four to four and a half hours, on paved highway throughout.",
        "About three and a half hours, on paved highway throughout.",
      ],
    ],
  },

  // ---- los tres hoteles de La Fortuna hacia Monteverde y de vuelta ----
  4975: { duracion: "3,5 H", frases: [["faqs", ...FAQ_CUATRO]] }, // chateau-arenal-to-monteverde
  5054: { duracion: "3,5 H", frases: [["google_maps_note", ...GMAPS_RANGO]] }, // monteverde-to-chateau-arenal
  5073: { duracion: "3,5 H", frases: [["faqs", ...FAQ_CUATRO]] }, // arenal-observatory-lodge-to-monteverde
  5152: { duracion: "3,5 H", frases: [["google_maps_note", ...GMAPS_RANGO]] }, // monteverde-to-arenal-observatory-lodge
  5171: { duracion: "3,5 H", frases: [["faqs", ...FAQ_CUATRO]] }, // linda-vista-del-norte-to-monteverde
  5250: { duracion: "3,5 H", frases: [["google_maps_note", ...GMAPS_RANGO]] }, // monteverde-to-linda-vista-del-norte

  // ---- los tres hoteles de La Fortuna hacia Papagayo y de vuelta ----
  // Estas son las que tenían tres cifras peleándose dentro de la página.
  // El google_maps_note de estas tres era la frase entera "Realistic 3 hours."
  // y nada más. No es un reemplazo de cifra, es un campo que nunca se escribió:
  // no contesta la pregunta que el cliente trae ("¿por qué Google me dice
  // menos?"). Se reemplaza el campo completo, no una frase adentro.
  5006: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "Approximately 3 hours of paved highway driving.", "Approximately 3.5 hours of paved highway driving."],
      ["family_info", "Approximately 4 hours.", "Approximately 3.5 hours."],
      ["budget_tip", "direct, comfortable, around 4 hours.", "direct, comfortable, around 3.5 hours."],
    ],
    campos: {
      google_maps_note:
        "Realistic 3.5 hours door to door. Google Maps measures to the Papagayo Peninsula entrance, not to your resort: the peninsula is gated and the hotels are spread well past it. Give us the resort name and we take you to the door.",
    },
  },
  5104: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "Approximately 3 hours of paved highway driving.", "Approximately 3.5 hours of paved highway driving."],
      ["family_info", "Approximately 4 hours.", "Approximately 3.5 hours."],
      ["budget_tip", "direct, comfortable, around 4 hours.", "direct, comfortable, around 3.5 hours."],
    ],
    campos: {
      google_maps_note:
        "Realistic 3.5 hours door to door. Two things the map does not account for: the Observatory Lodge access road down to the main highway at this end, and the gated entrance to the Papagayo Peninsula at the other. Tell us the resort name and we drive you to the door.",
    },
  },
  5202: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "Approximately 3 hours of paved highway driving.", "Approximately 3.5 hours of paved highway driving."],
      ["family_info", "Approximately 4 hours.", "Approximately 3.5 hours."],
      ["budget_tip", "direct, comfortable, around 4 hours.", "direct, comfortable, around 3.5 hours."],
    ],
    campos: {
      google_maps_note:
        "Realistic 3.5 hours door to door. The map stops at the Papagayo Peninsula gate, which is not where you are staying — the resorts sit well inside it. Give us the hotel name when you book and the drop-off is sorted beforehand.",
    },
  },
  5023: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "approximately 4,5 H in our comfortable", "approximately 3,5 H in our comfortable"],
      ["google_maps_note", "Plan for 4,5 H for this route", "Plan for 3,5 H for this route"],
    ],
  },
  5121: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "approximately 4,5 H in our comfortable", "approximately 3,5 H in our comfortable"],
      ["google_maps_note", "Plan for 4,5 H for this route", "Plan for 3,5 H for this route"],
    ],
  },
  5219: {
    duracion: "3,5 H",
    frases: [
      ["journey_description", "approximately 4,5 H in our comfortable", "approximately 3,5 H in our comfortable"],
      ["google_maps_note", "Plan for 4,5 H for this route", "Plan for 3,5 H for this route"],
    ],
  },
};

let filasOk = 0;
const noEncontradas = [];

for (const [id, { duracion, frases, campos }] of Object.entries(FIX)) {
  const fila = (await (await fetch(`${base}/rest/v1/routes?id=eq.${id}&select=*`, { headers: H })).json())[0];
  if (!fila) {
    console.error(`${id} no existe`);
    continue;
  }
  const cambios = {};
  if (duracion) cambios.duracion = duracion;
  // campos completos: se escriben tal cual, sin buscar frase vieja
  for (const [campo, valor] of Object.entries(campos || {})) {
    if (fila[campo] !== valor) cambios[campo] = valor;
  }

  for (const [campo, viejo, nuevo] of frases) {
    const esJson = fila[campo] && typeof fila[campo] === "object";
    const actual = esJson ? JSON.stringify(fila[campo]) : fila[campo];
    if (!actual || !actual.includes(viejo)) {
      noEncontradas.push(`${id} ${campo}: "${viejo.slice(0, 60)}"`);
      continue;
    }
    const nuevoTexto = actual.split(viejo).join(nuevo);
    cambios[campo] = esJson ? JSON.parse(nuevoTexto) : nuevoTexto;
  }

  if (!Object.keys(cambios).length) {
    console.log(`${id} sin cambios (ya estaba)`);
    continue;
  }
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(cambios),
  });
  if (res.ok) {
    filasOk++;
    console.log(`${id} OK  ${String(fila.slug).padEnd(50)} "${fila.duracion}" -> "${duracion || fila.duracion}"  (${Object.keys(cambios).join(", ")})`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

console.log(`\n${filasOk}/${Object.keys(FIX).length} filas.`);
if (noEncontradas.length) {
  console.log(`\n${noEncontradas.length} frase(s) no encontrada(s) (normal si ya corrió):`);
  noEncontradas.forEach((f) => console.log(`  - ${f}`));
}

// Control: barrer TODAS las filas de estos dos viajes, hoteles incluidos,
// y en TODAS las columnas incluida faqs. Esto es lo que me faltó la primera
// vez y por eso el control ahora no distingue entre columnas conocidas y no.
console.log("\ncontrol — todas las filas de estos dos viajes, todas las columnas:");
let filas = [];
for (let from = 0; ; from += 1000) {
  const r = await (
    await fetch(`${base}/rest/v1/routes?select=*&order=id`, { headers: { ...H, Range: `${from}-${from + 999}` } })
  ).json();
  if (!Array.isArray(r) || !r.length) break;
  filas = filas.concat(r);
  if (r.length < 1000) break;
}
const delViaje = filas.filter((f) => {
  const o = f.origen || "";
  const d = f.destino || "";
  const fa = (s) => /fortuna|arenal/i.test(s);
  const mp = (s) => /monteverde|papagayo/i.test(s);
  return (fa(o) && mp(d)) || (mp(o) && fa(d));
});
let sospechosas = 0;
for (const f of delViaje) {
  for (const [c, v] of Object.entries(f)) {
    const s = typeof v === "string" ? v : v && typeof v === "object" ? JSON.stringify(v) : "";
    if (!s) continue;
    for (const m of s.match(/\b\d+([.,]\d+)?\s*(?:to\s*\d+([.,]\d+)?\s*)?(?:hours?|hrs?|H)\b|[Ff]our(?:\s+and\s+a\s+half)?\s+hours?/g) || []) {
      // 3,5 / 3.5 está bien; "2.5-3 hours" es lo que dice Google y es a propósito;
      // "3 hours" del jeep-boat-jeep también.
      if (/3[.,]5/.test(m)) continue;
      const i = s.indexOf(m);
      const ctx = s.slice(Math.max(0, i - 90), i + 60);
      if (/Google says 2\.5-3|jeep|boat|24 hours|per extra hour|at any hour|no surcharge/i.test(ctx)) continue;
      console.log(`  ${f.id} ${String(f.slug).slice(0, 44).padEnd(44)} ${c}: "${m}"  ...${ctx.replace(/\s+/g, " ").trim().slice(0, 110)}...`);
      sospechosas++;
    }
  }
}
console.log(
  sospechosas ? `\n${sospechosas} para mirar a mano.` : `\nlimpio: las ${delViaje.length} filas de estos dos viajes solo dicen 3,5.`
);
