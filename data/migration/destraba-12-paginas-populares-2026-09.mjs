// Destraba 12 páginas que estaban listas para publicar y nadie las publicó.
//
// Esto salió revisando el build: esperaba 26 páginas nuevas de San José y
// solo aparecieron 22. Faltaban Flamingo y Las Catalinas en los dos
// sentidos. Las filas existían, tenían slug y yo les acababa de escribir el
// texto — pero no salían.
//
// La causa: generateStaticParams() filtra por getIndexableRoutes(), o sea
// por la columna is_indexable, ANTES de aplicar isPopularRoute(). Si
// is_indexable viene en false, agregar el destino a POPULAR_DESTINATIONS no
// hace nada. Son dos llaves distintas y hay que abrir las dos.
//
// Barriendo la tabla entera: de 150 pares donde los dos extremos son
// populares, 138 se publican y 12 están en false. Son justo los pares que se
// volvieron populares DESPUÉS de que alguien fijara is_indexable — Flamingo y
// Las Catalinas (que Diego agregó el 27-08), Papagayo y San José centro.
// Nunca se volvió a tocar la columna.
//
// Las 12 no son todas iguales:
//
//   4 estaban COMPLETAS (8/8 campos, texto propio, ya verificado):
//     4099 san-jose-downtown-to-flamingo              5 H    $365
//     4253 flamingo-to-san-jose-downtown              5 H    $365
//     4111 san-jose-downtown-to-las-catalinas         4,5 H  $370
//     4267 las-catalinas-to-san-jose-downtown         4,5 H  $370
//
//   8 estaban VACÍAS (0/8 campos). Son los saltos cortos entre Papagayo y
//   las playas de Guanacaste, 55 min y $145 cada uno. Publicarlas vacías
//   sería peor que dejarlas escondidas: son justo las páginas delgadas que
//   Google castiga. Así que primero se les escribe el texto, y hasta
//   entonces se destraban.
//
// Los 4 pares cortos, en los dos sentidos:
//   Papagayo <-> Tamarindo, Conchal, Flamingo, Las Catalinas
//
// Lo que tienen en común y lo que las distingue: las cuatro salen o entran
// por el portón de la península de Papagayo, y las de Flamingo, Conchal y
// Las Catalinas se cruzan en el entronque de Huacas. Lo que cambia es el
// otro extremo, y por ahí van los textos.
//
// Duración y precio salen de duracion / precio1a6 de la misma fila.
//
// Correr desde la raíz del proyecto:
//   node data/migration/destraba-12-paginas-populares-2026-09.mjs
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

// --- las 8 vacías: texto completo (55 min, $145 cada una) ---
const GATE =
  "The Papagayo peninsula has a controlled entrance and the resorts sit well past it, so give us the hotel name when you book and we will come to the door rather than meeting you at the gate.";

const CONTENIDO = {
  4786: {
    // papagayo -> tamarindo
    journey_description:
      "A short hop down the Guanacaste coast from the Papagayo Peninsula resorts to Tamarindo, the busiest surf town on this stretch. Approximately 55 minutes on paved road, out through the peninsula gate and south past the dry forest.",
    road_type:
      "Private paved road inside the peninsula, then paved highway south. Easy driving throughout with no unpaved sections.",
    family_info:
      "Under an hour, which makes it one of the easiest transfers we run with small children — short enough that nobody needs a stop and nobody gets restless. Child seats at no charge, fitted before we arrive, and A/C throughout. " + GATE,
    late_night_info:
      "At any hour with no surcharge. Fifty-five minutes on paved road is straightforward after dark. Allow a few extra minutes for the peninsula gate on the way out, especially late at night.",
    traveler_tip:
      "Close enough to do as a day trip rather than a move — plenty of guests staying in Papagayo come down to Tamarindo for an afternoon and go back the same evening",
    local_recommendation:
      "Tamarindo is the liveliest town on this coast, which is the point of coming down from the quiet of the peninsula: restaurants, surf shops and a beach that actually has a scene. Sunset is when the beach fills up.",
    google_maps_note:
      "Realistic 55 minutes door to door. Google Maps measures from the peninsula entrance rather than your hotel, and the resorts are spread well past it — that is most of the difference on a trip this short.",
    budget_tip:
      "At $145 for the vehicle rather than per person, this short hop works out well for a family or a group of friends — the same price whether there is one of you or six.",
  },
  4785: {
    // tamarindo -> papagayo
    journey_description:
      "A short transfer north up the Guanacaste coast from Tamarindo to the Papagayo Peninsula resorts. Approximately 55 minutes on paved road, ending inside the peninsula's private road network.",
    road_type:
      "Paved highway north out of Tamarindo, then the well-maintained private roads inside the Papagayo peninsula. No unpaved sections.",
    family_info:
      "Under an hour door to door, short enough that it barely counts as a travel day with children. Free child seats fitted before pickup, A/C throughout. " + GATE,
    late_night_info:
      "Any hour, no surcharge. The road north is paved and quick even late. Build in a few minutes for the peninsula gate at the arrival end and have the hotel name handy.",
    traveler_tip:
      "If you are moving from the busy end of the coast to the quiet one, this is the shortest version of that change in the whole region — under an hour between two completely different atmospheres",
    local_recommendation:
      "The Gulf of Papagayo is noticeably calmer water than Tamarindo — protected enough that it stays flat when the surf beaches south of here are breaking. Worth a morning on the water once you arrive.",
    google_maps_note:
      "Realistic 55 minutes. The drive itself is quick; what Google Maps does not include is the peninsula gate and the distance from it to your hotel at the far end.",
    budget_tip:
      "$145 covers the whole vehicle, not each seat, so this is one of the cheaper ways to change beaches in Guanacaste if there are several of you.",
  },
  4782: {
    // papagayo -> conchal
    journey_description:
      "A short transfer from the Papagayo Peninsula resorts south to Playa Conchal, the crushed-shell beach next to Brasilito. Approximately 55 minutes on paved road via the Huacas junction.",
    road_type:
      "Private paved road out of the peninsula, then paved highway south through the Huacas junction and on to Brasilito and Conchal.",
    family_info:
      "Under an hour to one of the gentlest beaches in the country for small children — Conchal has calm water and no strong current on the south end. Short enough that no stop is needed. Free child seats and A/C throughout. " + GATE,
    late_night_info:
      "Available at any hour with no surcharge. Under an hour on paved road, easy after dark. Allow a few minutes for the peninsula gate on departure.",
    traveler_tip:
      "Have swimsuits reachable rather than packed — a transfer this short means people usually go from the vehicle straight to the water",
    local_recommendation:
      "Look closely at Conchal's sand when you arrive: it is crushed shell rather than grains, which is exactly why the water reads turquoise there and grey-brown at the beaches on either side. Only a handful of beaches in the country are built that way.",
    google_maps_note:
      "Realistic 55 minutes door to door. The map measures to the peninsula entrance at one end and to Brasilito at the other, so both ends run a little longer than it shows.",
    budget_tip:
      "$145 for the vehicle regardless of how many of you there are — worth comparing against per-person shuttle fares if you are travelling as a family.",
  },
  4781: {
    // conchal -> papagayo
    journey_description:
      "A short transfer north from Playa Conchal to the Papagayo Peninsula resorts. Approximately 55 minutes on paved road, out through Brasilito and the Huacas junction and up the coast.",
    road_type:
      "Paved road from Conchal out through Brasilito, then paved highway north and the private road network inside the Papagayo peninsula.",
    family_info:
      "Under an hour, which makes this an easy move with children — no stop needed and nobody has time to get restless. Have a change of clothes in the vehicle: Conchal's crushed-shell sand travels with you. Free child seats, A/C throughout. " + GATE,
    late_night_info:
      "At any hour with no surcharge. Short and fully paved. Give us the hotel name inside the peninsula so the gate does not slow down the arrival end at night.",
    traveler_tip:
      "The first few minutes are the small road out through Brasilito before you reach the highway, which is slower than the distance suggests — worth knowing if you are timing this against something",
    local_recommendation:
      "The Gulf of Papagayo is one of the calmest stretches of water on this coast, protected enough to stay flat when the beaches further south are breaking. Different swimming from Conchal, and worth a morning.",
    google_maps_note:
      "Realistic 55 minutes. Google Maps routes you to the peninsula entrance, not to your hotel, and the resorts sit well past the gate — that gap is most of the difference here.",
    budget_tip:
      "The $145 is for the vehicle, not per seat, so the cost per person drops sharply with a family or a group.",
  },
  4778: {
    // papagayo -> flamingo
    journey_description:
      "A short transfer from the Papagayo Peninsula resorts south to Flamingo, the headland town with the marina. Approximately 55 minutes on paved road via the Huacas junction.",
    road_type:
      "Private paved road out of the peninsula, then paved highway south, with the last stretch on the smaller roads through Huacas into Flamingo.",
    family_info:
      "Under an hour door to door, one of the easiest transfers we run with young children — no stop needed and no long stretch to sit through. Free child seats fitted before pickup, and A/C throughout. " + GATE,
    late_night_info:
      "Any hour, no surcharge. The route is paved throughout and quick at night. Allow a few minutes for the peninsula gate on the way out.",
    traveler_tip:
      "The last stretch into Flamingo is on smaller roads through Huacas, so the final fifteen minutes are slower than the highway average the map assumes",
    local_recommendation:
      "Flamingo sits on a headland with the marina on one side and the beach on the other, and the lookout at the top of the hill gives you the whole bay. It is a two-minute detour on the way in — just ask the driver.",
    google_maps_note:
      "Realistic 55 minutes. Two things the map misses on a trip this short: the peninsula gate and the distance from it to your hotel, and the smaller roads on the approach to Flamingo.",
    budget_tip:
      "$145 covers the vehicle rather than each passenger, which makes short hops like this one good value for a group.",
  },
  4777: {
    // flamingo -> papagayo
    journey_description:
      "A short transfer north from Flamingo to the Papagayo Peninsula resorts. Approximately 55 minutes on paved road, out through Huacas and up the coast into the peninsula.",
    road_type:
      "Smaller paved roads out through Huacas at the start, then paved highway north and the private road network inside the Papagayo peninsula.",
    family_info:
      "Under an hour, short enough that it hardly interrupts the day with children. Free child seats, A/C throughout, and no stop necessary unless you want one. " + GATE,
    late_night_info:
      "At any hour with no surcharge. Fully paved and short. Give us the hotel name inside the peninsula so the gate does not hold up the arrival at night.",
    traveler_tip:
      "The first stretch out through Brasilito and Huacas is slower than the highway that follows, so allow a little more than the distance suggests if you are connecting to something",
    local_recommendation:
      "The water in the Gulf of Papagayo is calmer than at Flamingo — protected enough that it stays flat when the coast further south is breaking. If you have been surfing, it is a change of pace worth a morning.",
    google_maps_note:
      "Realistic 55 minutes. The map measures to the peninsula entrance rather than your hotel, and the resorts are spread well past the gate.",
    budget_tip:
      "The $145 is per vehicle, not per person, so a family or a group of friends splits it and the short hop becomes very reasonable.",
  },
  4776: {
    // papagayo -> las catalinas
    journey_description:
      "A short transfer from the Papagayo Peninsula resorts south to Las Catalinas, the walkable town above Playa Danta. Approximately 55 minutes on paved road via the Huacas junction and Potrero.",
    road_type:
      "Private paved road out of the peninsula, then paved highway south, with the final stretch on the smaller road through Potrero into Las Catalinas.",
    family_info:
      "Under an hour, which makes it an easy move with children, and Las Catalinas at the other end is built to be walked rather than driven — once you arrive, you are done with vehicles. Free child seats and A/C throughout. " + GATE,
    late_night_info:
      "Any hour, no surcharge. Paved throughout. Two things to give us for a night arrival: the hotel name inside Papagayo for the gate, and where you are staying in Las Catalinas so we agree the drop-off point in advance.",
    traveler_tip:
      "Las Catalinas is designed for walking rather than driving, so tell us which part of town you are staying in and we will agree the drop-off point beforehand instead of the driver circling on arrival",
    local_recommendation:
      "The trail network above Las Catalinas is open to anyone and the ridge trails give you the coastline from above. It is the best thing about the town and most visitors never find out it is there.",
    google_maps_note:
      "Realistic 55 minutes. The map measures from the peninsula entrance rather than your hotel, and it routes you to the edge of Las Catalinas rather than to where you are actually staying.",
    budget_tip:
      "$145 for the whole vehicle rather than per seat, so the more of you there are, the better this short transfer works out.",
  },
  4775: {
    // las catalinas -> papagayo
    journey_description:
      "A short transfer north from Las Catalinas to the Papagayo Peninsula resorts. Approximately 55 minutes on paved road, out through Potrero and up the coast into the peninsula.",
    road_type:
      "Smaller paved road out through Potrero at the start, then paved highway north and the private road network inside the Papagayo peninsula.",
    family_info:
      "Under an hour door to door and no stop needed, which makes it one of the simpler moves to do with small children. Free child seats fitted before pickup, A/C throughout. " + GATE,
    late_night_info:
      "At any hour with no surcharge. Short and paved. For a night departure, tell us where in Las Catalinas you are staying so the pickup point is settled in advance rather than sorted out in the dark.",
    traveler_tip:
      "Las Catalinas is car-free by design, so vehicles stage at the edge of town — agree the pickup point with us when you book and you save the driver hunting for you on departure morning",
    local_recommendation:
      "The Gulf of Papagayo is calmer, more protected water than the beaches around Las Catalinas, which is worth knowing if you want a flat morning on the water after a few days of swell.",
    google_maps_note:
      "Realistic 55 minutes. The map starts you at the edge of Las Catalinas and finishes at the peninsula entrance, so both ends of a trip this short run longer than it shows.",
    budget_tip:
      "The $145 covers the vehicle, not each passenger — short transfers like this one are where travelling as a group saves the most.",
  },
};

const base = env.NEXT_PUBLIC_SUPABASE_URL;

// 1) escribir el texto de las 8 vacías
let escritas = 0;
console.log("texto para las 8 páginas vacías:");
for (const [id, campos] of Object.entries(CONTENIDO)) {
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(campos),
  });
  if (res.ok) {
    const b = await res.json();
    escritas++;
    console.log(`  ${id} OK  ${b[0].slug}`);
  } else {
    console.error(`  ${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

// 2) destrabar las 12 — pero solo si de verdad quedaron llenas
const TODAS = [4099, 4253, 4111, 4267, ...Object.keys(CONTENIDO).map(Number)];
const CAMPOS = [
  "journey_description",
  "family_info",
  "late_night_info",
  "traveler_tip",
  "local_recommendation",
  "road_type",
  "google_maps_note",
  "budget_tip",
];
const filas = await (await fetch(`${base}/rest/v1/routes?id=in.(${TODAS.join(",")})&select=*`, { headers: H })).json();
console.log("\ndestrabando (is_indexable = true):");
let abiertas = 0;
for (const f of filas.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const vacios = CAMPOS.filter((c) => !f[c] || !String(f[c]).trim());
  if (vacios.length) {
    console.error(`  ${f.id} ${f.slug}: NO se destraba, le faltan ${vacios.join(", ")}`);
    continue;
  }
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${f.id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ is_indexable: true }),
  });
  if (res.ok) {
    abiertas++;
    console.log(`  ${f.id} OK  ${f.slug}`);
  } else {
    console.error(`  ${f.id} FALLÓ ${res.status}`);
  }
}
console.log(`\n${escritas}/8 con texto nuevo, ${abiertas}/12 destrabadas.`);
