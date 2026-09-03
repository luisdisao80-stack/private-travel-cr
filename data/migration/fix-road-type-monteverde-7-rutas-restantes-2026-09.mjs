// Termina de sacar el "camino de lastre" de las páginas de Monteverde.
//
// Continuación de fix-road-type-monteverde-2-rutas-2026-09.mjs, que arregló
// sjo-to-monteverde y lir-to-monteverde. Estas son las 7 páginas publicadas
// que quedaban diciéndole al cliente que el camino es de lastre:
//
//   la-fortuna-to-monteverde        monteverde-to-la-fortuna
//   manuel-antonio-quepos-to-monteverde   monteverde-to-manuel-antonio
//   monteverde-to-tamarindo         monteverde-to-sjo
//   tamarindo-to-monteverde
//
// Las 7 son rutas de la lista de prioritarias de Diego. Dejarlas contradiciendo
// a las 2 que ya arreglé era peor que cualquiera de los dos estados por
// separado: la misma pregunta contestada distinto según en qué página caiga
// el cliente.
//
// LOS DOS ACCESOS SON DISTINTOS y hay que tenerlo claro antes de tocar esto:
//
//   - Desde SJO y desde LIR se sube por la Ruta 606 desde Sardinal. Es la que
//     se pavimentó en 2020 (monteverde-travel-guide.md líneas 26, 29, 34, 163).
//   - Desde La Fortuna se da la vuelta al lago Arenal por Tilarán. Es otro
//     camino, así que el dato de la 606 no aplica ahí. El blog lo cubre aparte
//     en la línea 41: "Road around Lake Arenal — about 4 hours, fully paved,
//     scenic." También pavimentado, pero por otra fuente.
//
// Lo que NO cambio: que el tramo final es lento, empinado y con curvas. Eso
// sigue siendo cierto y es lo que explica por qué el viaje dura más de lo que
// dice Google Maps. Lo único que sale es la afirmación de que es de lastre.
//
// Para revertir: los valores viejos están en ANTES, abajo.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-road-type-monteverde-7-rutas-restantes-2026-09.mjs
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

// Valores previos, por si hay que devolverlo.
const ANTES = {
  3142: {
    road_type: "Scenic paved road around the lake. Final section to Monteverde is gravel but well-maintained.",
    journey_description:
      "This route follows the northern shore of Lake Arenal through the Tilaran Mountains, offering panoramic views of the lake and surrounding volcanic landscape. The final section into Monteverde is on maintained gravel road. Total travel time is approximately 3 to 3.5 hours between two of Costa Rica's most important natural areas.",
    google_maps_note:
      "Google says 2.5-3 hours. Honestly, it's about 3.5 with the unpaved section leading into Monteverde. The road from Tilarán to Monteverde is the rough part — about 45 minutes on dirt road. Our vans handle it fine, but it does slow you down.",
    family_info:
      "Approximately 3 to 3.5 hours including the gravel road section. The paved road along Lake Arenal offers excellent scenery. The unpaved stretch into Monteverde is well-maintained. Child seats available at no charge.",
  },
  3183: {
    journey_description:
      "The route heads north from the Pacific coast, crosses the Central Valley, and climbs into the Tilaran Mountains to reach the cloud forest. Approximately 5.5 hours with the final section on gravel road. A significant elevation and climate change from sea level to 1,400 meters.",
    family_info:
      "Approximately 5.5 hours. Mountain roads and a gravel section into Monteverde. Two stops included. Bring layers for children — Monteverde is cooler. Child seats provided at no charge.",
  },
  3201: {
    road_type: "Gravel then paved. The lake road is scenic and well-maintained.",
    google_maps_note:
      "Google says 2.5-3 hours. It's more like 3-3.5 with the dirt roads. The road around Lake Arenal is scenic and paved but winding. The unpaved section out of Monteverde adds 45 minutes. Still, it's one of the most beautiful short drives in Costa Rica.",
    family_info:
      "Approximately 3 to 3.5 hours. The Lake Arenal section is paved and scenic. Gravel road on departure from Monteverde. Child seats included at no charge.",
  },
  3203: {
    road_type: "First hour gravel out of Monteverde, then fully paved highway.",
    journey_description:
      "A transfer from cloud forest to Pacific national park region. Approximately 4 to 4.5 hours, starting with gravel road out of Monteverde and joining the Pacific coast highway.",
    family_info:
      "Approximately 5.5 hours. The gravel road out of Monteverde is the initial challenge, followed by mountain roads and the Pacific coastal highway. Two stops included. Child seats provided at no charge.",
  },
  3215: {
    road_type: "Gravel road for the first hour (descent from Monteverde), then fully paved Pan-American Highway.",
    journey_description:
      "The descent from cloud forest back to the Central Valley and SJO airport. Approximately 3.5 to 4 hours. Starts with 40 km of gravel road down to Sardinal, then joins the Pan-American Highway eastbound to San José.",
    google_maps_note:
      "Realistic 3.5 to 4 hours including the gravel descent. For early international flights, leave Monteverde no later than 4am. Mountain fog in the early hours can slow the gravel section.",
    family_info:
      "Approximately 4 hours to SJO. The gravel road out of Monteverde is the roughest section; the remainder is paved highway. For early flights, pre-dawn pickups are available. Child seats included at no charge.",
  },
  3490: {
    journey_description:
      "A transfer from cloud forest to Pacific beach across the Guanacaste lowlands. Approximately 4 hours, starting on gravel road out of Monteverde and joining paved highway to Tamarindo.",
    google_maps_note: "Realistic 4 hours. The gravel section adds time but the rest is smooth.",
    family_info:
      "Approximately 4 hours. Gravel road out of Monteverde, then flat highway through Guanacaste. One stop included. Bring layers — the temperature change is significant. Child seats available at no charge.",
  },
  3552: {
    road_type: "Paved highway through Guanacaste, then gravel road for the final ascent into Monteverde.",
    google_maps_note: "Realistic 4 hours including the gravel ascent.",
    family_info:
      "Approximately 4 hours. Highway through Guanacaste, then mountain roads with a gravel section into Monteverde. One stop included. Pack layers for the temperature change. Child seats available at no charge.",
    local_recommendation:
      "When you start climbing the gravel section, the temperature drops fast and the mist begins. That's the cloud forest entrance — completely different ecosystem in 30 minutes.",
  },
};

const CAMBIOS = {
  // --- La Fortuna <-> Monteverde: vuelta al lago Arenal por Tilarán ---
  3142: {
    road_type:
      "Scenic paved road around the northern shore of Lake Arenal, then the winding climb into Monteverde. Paved the whole way, but slow — the curves are what cost you time, not the surface.",
    journey_description:
      "This route follows the northern shore of Lake Arenal through the Tilaran Mountains, offering panoramic views of the lake and surrounding volcanic landscape. The road is paved the whole way; the final climb into Monteverde is narrow and winding, which is what makes it slower than the distance suggests. Total travel time is approximately 3 to 3.5 hours between two of Costa Rica's most important natural areas.",
    google_maps_note:
      "Google says 2.5-3 hours. Realistically it's about 3.5. The Tilarán to Monteverde stretch is paved but narrow and full of curves, so you simply cannot drive it fast — that's where the extra time goes.",
    family_info:
      "Approximately 3 to 3.5 hours on paved road the whole way. The route along Lake Arenal is one of the best views in the country. The final climb into Monteverde is winding, so if a child gets carsick that's the stretch to prepare for. Child seats available at no charge.",
  },
  3201: {
    road_type:
      "Paved throughout. The winding descent out of Monteverde, then the scenic lake road around Arenal.",
    google_maps_note:
      "Google says 2.5-3 hours. It's more like 3-3.5. The road around Lake Arenal is paved, scenic and winding, and the descent out of Monteverde is slow going for the curves. Still one of the most beautiful short drives in Costa Rica.",
    family_info:
      "Approximately 3 to 3.5 hours. Paved the entire way. The descent out of Monteverde is winding, then the Lake Arenal section is scenic and easy. Child seats included at no charge.",
  },

  // --- Manuel Antonio <-> Monteverde ---
  3183: {
    journey_description:
      "The route heads north from the Pacific coast, crosses the Central Valley, and climbs into the Tilaran Mountains to reach the cloud forest. Approximately 5.5 hours, paved the whole way, ending with the steep winding climb up Route 606. A significant elevation and climate change from sea level to 1,400 meters.",
    family_info:
      "Approximately 5.5 hours on paved roads, ending with a winding mountain climb into Monteverde. Two stops included. Bring layers for children — Monteverde is cooler. Child seats provided at no charge.",
  },
  3203: {
    road_type:
      "Winding descent out of Monteverde on Route 606, then fully paved highway to the coast. Paved throughout.",
    journey_description:
      "A transfer from cloud forest to Pacific national park region. Approximately 4 to 4.5 hours, starting with the steep winding descent out of Monteverde and joining the Pacific coast highway.",
    family_info:
      "Approximately 5.5 hours. The winding descent out of Monteverde is the slow part, followed by mountain roads and the Pacific coastal highway — all paved. Two stops included. Child seats provided at no charge.",
  },

  // --- Monteverde -> SJO ---
  3215: {
    road_type:
      "Winding descent down Route 606 for the first hour, then the fully paved Pan-American Highway. Paved throughout.",
    journey_description:
      "The descent from cloud forest back to the Central Valley and SJO airport. Approximately 3.5 to 4 hours. Starts with the 35 km descent down Route 606 to Sardinal — paved since 2020, but steep and full of curves — then joins the Pan-American Highway eastbound to San José.",
    google_maps_note:
      "Realistic 3.5 to 4 hours including the mountain descent. For early international flights, leave Monteverde no later than 4am. Mountain fog in the early hours is the real risk on the descent, not the road surface.",
    family_info:
      "Approximately 4 hours to SJO, paved the whole way. The winding descent out of Monteverde is the slowest section; the remainder is highway. For early flights, pre-dawn pickups are available. Child seats included at no charge.",
  },

  // --- Tamarindo <-> Monteverde ---
  3490: {
    journey_description:
      "A transfer from cloud forest to Pacific beach across the Guanacaste lowlands. Approximately 4 hours, starting with the winding descent out of Monteverde and joining paved highway to Tamarindo.",
    google_maps_note:
      "Realistic 4 hours. The winding mountain descent adds time but the rest is smooth, flat highway.",
    family_info:
      "Approximately 4 hours. Winding descent out of Monteverde, then flat highway through Guanacaste — paved throughout. One stop included. Bring layers, the temperature change is significant. Child seats available at no charge.",
  },
  3552: {
    road_type:
      "Paved highway through Guanacaste, then the steep winding climb up Route 606 into Monteverde. Paved throughout.",
    google_maps_note: "Realistic 4 hours including the mountain ascent, which is paved but slow.",
    family_info:
      "Approximately 4 hours. Highway through Guanacaste, then a winding paved mountain climb into Monteverde. One stop included. Pack layers for the temperature change. Child seats available at no charge.",
  },
  // 3552 local_recommendation se reescribe abajo junto con el resto.
};

CAMBIOS[3552].local_recommendation =
  "When you turn off the highway and start the climb into the mountains, the temperature drops fast and the mist begins. That's the cloud forest entrance — completely different ecosystem in 30 minutes.";

let ok = 0;
const total = Object.keys(CAMBIOS).length;
for (const [id, campos] of Object.entries(CAMBIOS)) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(campos),
  });
  if (res.ok) {
    ok++;
    console.log(`${id} OK  (${Object.keys(campos).join(", ")})`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}
console.log(`\n${ok}/${total} filas actualizadas.`);
