// Cierra las últimas dos repeticiones de las 34 páginas prioritarias, y de
// paso arregla una contradicción de horas que apareció al revisarlas.
//
// 1) road_type: cuatro filas decían exactamente "Fully paved highway
//    throughout." — cierto en las cuatro, pero son cuatro caminos distintos y
//    en la página se lee como la misma frase repetida:
//      3191 manuel-antonio -> SJO        3 H
//      3564 tamarindo -> SJO             5 H
//      3145 la-fortuna -> papagayo       4,5 H
//      3181 manuel-antonio -> la-fortuna 5,5 H
//
// 2) google_maps_note: 3588 y 3253 compartían el párrafo de plantilla
//    ("Google Maps may show a shorter time, but real driving conditions...").
//    Las dos llegan a La Fortuna en 4,5 H, por eso les tocó el mismo texto.
//
// 3) LA CONTRADICCIÓN DE HORAS. Esto no lo andaba buscando; salió al leer las
//    filas completas. Dos filas se contradicen consigo mismas:
//
//      3145 la-fortuna-to-papagayo
//           duracion              4,5 H
//           google_maps_note      "Realistic 3 hours."
//           journey_description   "Approximately 3 hours of paved highway"
//
//      3181 manuel-antonio-quepos-to-la-fortuna
//           duracion              5,5 H
//           google_maps_note      "Realistic 5 hours. Long but scenic."
//           journey_description   "Approximately 5 hours."
//
//    En 3145 son hora y media de diferencia DENTRO DE LA MISMA PÁGINA: el
//    encabezado dice 4,5 H y el texto de abajo dice 3. El cliente lee las dos
//    cosas y no sabe cuál creer.
//
//    Cuál gana: 'duracion'. Es la columna que manda en el encabezado y en la
//    cotización, o sea que es la que el cliente ya está comprando. Además el
//    4,5 H concuerda con las otras filas de la misma tabla — la-fortuna->LIR
//    son 3 H y papagayo->LIR son 1,5 H, y LIR queda de camino — y con el
//    sentido contrario (3253 papagayo->la-fortuna, que ya decía 4,5 H).
//    El "3 hours" es el dato suelto, no el otro.
//
//    OJO: acá NO se está cambiando ninguna duración ni ninguna promesa al
//    cliente. Solo se alinea el texto con la duración que ya estaba
//    publicada. Si Diego dice que la buena es 3 H, hay que cambiar 'duracion'
//    (y con ella el precio, seguramente), no este texto.
//
//    Esto queda pendiente de que Diego confirme, junto con las otras
//    diferencias blog-vs-base que ya le pasé.
//
// El journey_description se toca por REEMPLAZO DE FRASE EXACTA, no
// reescribiendo el campo: es el método que funcionó con lo del lastre de
// Monteverde. Si la frase no está, no hace nada y avisa.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-road-type-y-contradiccion-horas-2026-09.mjs
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

const CONTENIDO = {
  3191: {
    // manuel-antonio-quepos -> SJO  (3 H)
    road_type:
      "Fully paved throughout: the coastal road north through the African palm plantations, then Route 27 up into the Central Valley. The coastal stretch is single-lane and sets the pace of the trip.",
  },
  3564: {
    // tamarindo -> SJO  (5 H)
    road_type:
      "Fully paved throughout. Guanacaste beach roads at the start, then the Pan-American Highway for most of the drive, where slow truck traffic is the main variable.",
  },
  3145: {
    // la-fortuna -> papagayo  (4,5 H)
    road_type:
      "Fully paved the whole way — down out of the northern lowlands, onto the highway across Guanacaste, and then the private road network inside the Papagayo peninsula.",
    google_maps_note:
      "Realistic 4.5 hours door to door. Google Maps measures to the peninsula entrance rather than to your hotel, and the resorts sit well past the gate — that gap accounts for most of the difference.",
  },
  3181: {
    // manuel-antonio-quepos -> la-fortuna  (5,5 H)
    road_type:
      "Fully paved throughout, with the mountain section falling in the second half of the drive as you climb away from the Pacific toward the northern lowlands.",
    google_maps_note:
      "Realistic 5.5 hours. Long but scenic — the mountain stretch in the middle is slower than the map assumes, and it is the part worth staying awake for.",
  },
  3588: {
    // conchal -> la-fortuna  (4,5 H)
    google_maps_note:
      "Plan for 4.5 hours rather than what Google Maps shows. The Guanacaste plains are fast, but the winding climb toward Arenal at the end is slower than the map assumes.",
  },
  3253: {
    // papagayo -> la-fortuna  (4,5 H)
    google_maps_note:
      "Plan for 4.5 hours rather than what Google Maps shows. Two things it does not account for: getting out of the peninsula past the gate at the start, and the winding climb toward Arenal at the end.",
  },
};

// reemplazos de frase exacta en journey_description (id -> [viejo, nuevo])
const FRASES = {
  3145: ["Approximately 3 hours of paved highway driving.", "Approximately 4.5 hours of paved highway driving."],
  3181: ["Approximately 5 hours.", "Approximately 5.5 hours."],
};

const base = env.NEXT_PUBLIC_SUPABASE_URL;

// 1) campos escritos a mano
let ok = 0;
for (const [id, campos] of Object.entries(CONTENIDO)) {
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(campos),
  });
  if (res.ok) {
    const body = await res.json();
    ok++;
    console.log(`${id} OK  ${body[0].slug.padEnd(52)} ${Object.keys(campos).join(", ")}`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

// 2) la contradicción de horas, por frase exacta
console.log("\ncontradicción de horas en journey_description:");
for (const [id, [viejo, nuevo]] of Object.entries(FRASES)) {
  const fila = (await (await fetch(`${base}/rest/v1/routes?id=eq.${id}&select=id,slug,journey_description`, { headers: H })).json())[0];
  if (!fila.journey_description?.includes(viejo)) {
    console.log(`  ${id} ${fila.slug}: no encontró "${viejo}" (¿ya corrió?)`);
    continue;
  }
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ journey_description: fila.journey_description.split(viejo).join(nuevo) }),
  });
  console.log(res.ok ? `  ${id} ${fila.slug}: "${viejo}" -> "${nuevo}"` : `  ${id} FALLÓ ${res.status}`);
}
console.log(`\n${ok}/${Object.keys(CONTENIDO).length} filas actualizadas.`);
