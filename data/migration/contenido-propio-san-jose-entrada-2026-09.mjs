// Segunda pasada sobre San José centro: los 12 tramos que ENTRAN a la ciudad.
//
// Después de correr contenido-propio-san-jose-centro-2026-09.mjs verifiqué las
// 26 páginas campo por campo, y aparecieron dos campos más que venían de
// plantilla. No los había visto porque solo estaba mirando family_info y
// late_night_info:
//
//   traveler_tip          26 filas, 15 textos distintos  (12 comparten uno)
//   local_recommendation  26 filas, 16 textos distintos  (11 comparten uno)
//
// Los 12 repetidos son justo los que entran a San José, y el texto que
// compartían era genérico de la ciudad, no del viaje:
//
//   tip: "San José traffic can be intense during rush hours (7-9am, 4-7pm)
//         — plan departures outside these windows"
//   loc: "Insider tip: Ask your driver for local recommendations at San José
//         — they know the best spots that tourists usually miss..."
//
// El segundo es relleno puro: no dice nada de ninguna ruta. Sirve igual en
// las 11. Eso es exactamente lo que Google lee como página repetida.
//
// Acá va uno propio para cada tramo. El criterio para el tip es que sea algo
// que de verdad cambie la decisión de quien viaja ESE tramo (a qué hora salir,
// qué llevar a mano, si le conviene más otro aeropuerto), y para la
// recomendación, algo que se ve o se cruza en ESE camino.
//
// De dónde salen los datos:
//   - duración y precio: columnas duracion / precio1a6 de la misma fila
//   - por dónde pasa: road_type y journey_description de la misma fila
//   - la 606 de Monteverde está pavimentada desde 2020: lo dice
//     content/blog/monteverde-travel-guide.md (líneas 26, 29, 34, 41, 163),
//     y ya lo corrigió fix-monteverde-lastre-todas-las-filas-2026-09.mjs
//
// Ojo con las distancias a LIR que se mencionan en Guanacaste: salen de las
// filas lir-liberia-int-airport-to-* de la misma tabla, no de memoria.
//
// Correr desde la raíz del proyecto:
//   node data/migration/contenido-propio-san-jose-entrada-2026-09.mjs
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
  4265: {
    // Jaco -> San Jose Downtown  (1,5 H, $195)
    traveler_tip:
      "The shortest transfer we run into San José, but Route 27 fills up toward the city on Sunday afternoons when the whole Central Valley drives home from the beach — leaving Jaco before noon or after 6pm avoids it",
    local_recommendation:
      "Ask the driver to slow down at the Río Tárcoles bridge on the way out — there are usually crocodiles visible on the sandbanks below, and it costs nothing to look. It is the single most reliable wildlife sighting on any of our Pacific routes.",
  },
  4251: {
    // Manuel Antonio / Quepos -> San Jose Downtown  (3 H, $250)
    traveler_tip:
      "Leave Manuel Antonio by early afternoon if you have an evening flight — the coastal stretch north is single-lane through the palm plantations and does not reward being in a hurry",
    local_recommendation:
      "The African palm plantations between Quepos and Parrita are worth a few minutes of attention: perfectly aligned rows that go on for kilometres, planted on what used to be United Fruit banana land. The old company towns along that road still have their original layout.",
  },
  4247: {
    // La Fortuna (Arenal) -> San Jose Downtown  (3 H, $250)
    traveler_tip:
      "The road climbs over the mountains above the Central Valley and it is genuinely cold and often fogged in up there, even when La Fortuna was hot when you left — keep a jacket within reach instead of in the luggage",
    local_recommendation:
      "The route passes through Zarcero, where the church park is full of topiary — bushes clipped into arches and animals, kept up for decades. It is a five-minute stop and it is the kind of thing people remember from the drive. Just ask the driver.",
  },
  4250: {
    // Monteverde (Cloud Forest) -> San Jose Downtown  (3H, $240)
    traveler_tip:
      "The first stretch is the descent off the mountain — steep, paved, and full of tight curves, so if anyone gets motion sick, take something before leaving Monteverde rather than once you are already on the switchbacks",
    local_recommendation:
      "On a clear morning the descent gives you the Gulf of Nicoya laid out below with the islands in it — the best view of the whole drive, and it comes in the first half hour. Sit on the left side going down.",
  },
  4244: {
    // Santa Teresa (Nicoya Peninsula) -> San Jose Downtown  (6 H, $395)
    traveler_tip:
      "Six hours plus a ferry crossing that runs on its own schedule — for a flight out of San José, come in the night before rather than the same morning, and tell us the flight time so we can pick the ferry or the overland route accordingly",
    local_recommendation:
      "If the timing lands on the afternoon ferry across the Gulf of Nicoya, that hour on the water is the best part of the trip — get out of the vehicle and go up to the top deck. Late crossings often catch the sunset.",
  },
  4252: {
    // Tamarindo (Guanacaste) -> San Jose Downtown  (5 H, $365)
    traveler_tip:
      "Five hours down the Interamericana, so if you are connecting to an international flight, check Liberia first — LIR is about an hour and a half from Tamarindo and often turns a long travel day into a short one",
    local_recommendation:
      "The drive crosses the Guanacaste dry forest, which looks like nowhere else in Costa Rica — in the dry season the trees drop their leaves completely and the whole landscape goes gold and bare. The yellow-flowering corteza amarilla trees bloom for only a few days at a time.",
  },
  4253: {
    // Flamingo (Guanacaste) -> San Jose Downtown  (5 H, $365)
    traveler_tip:
      "The way out is the small road through Brasilito and Huacas before you reach the highway, so the first half hour is slower than the map suggests — worth building in when you are timing a flight",
    local_recommendation:
      "Flamingo sits on a headland with the marina on one side and the beach on the other, and the lookout at the top of the hill is worth a stop on the way out — it is a two-minute detour and you get the whole bay before you leave it behind.",
  },
  4254: {
    // Conchal (Guanacaste) -> San Jose Downtown  (5 H, $365)
    traveler_tip:
      "Five hours in a vehicle right after the beach is a lot, so plan a proper shower and a change of clothes before pickup — Conchal's sand is crushed shell and it gets everywhere",
    local_recommendation:
      "Before leaving, walk the south end of Conchal one more time and look at what the sand actually is: millions of crushed shells instead of grains, which is why the water reads turquoise there and grey-brown at the beaches on either side. There are only a handful of beaches like it in the country.",
  },
  4267: {
    // Las Catalinas, Guanacaste -> San Jose Downtown  (4,5 H, $370)
    traveler_tip:
      "Las Catalinas is built to be walked rather than driven, so tell us which part of town you are staying in and we will agree on the pickup point beforehand — that saves the driver circling on departure morning",
    local_recommendation:
      "The trail network above Las Catalinas is open to anyone and the ridge trails give you the coastline from above. If you have a morning before the drive, that is the better use of it than a last beach hour.",
  },
  4272: {
    // Papagayo Peninsula, Guanacaste -> San Jose Downtown  (5 H, $360)
    traveler_tip:
      "The peninsula has a controlled entrance and the resorts are spread out well past it, so give us the hotel name when you book — the gate and the drive to your door add real time on a five-hour departure day",
    local_recommendation:
      "The Gulf of Papagayo is one of the calmest stretches of water on this coast, protected enough that it stays flat when the beaches further south are breaking. If you have a last morning, it is better spent on the water than on the sand.",
  },
  4276: {
    // Puerto Viejo (Caribbean Coast) -> San Jose Downtown  (4,5 H, $340)
    traveler_tip:
      "The last stretch into San José climbs through Braulio Carrillo, which fogs in by mid-afternoon most days — leaving the Caribbean in the morning means a clearer and noticeably faster climb over the mountains",
    local_recommendation:
      "The Braulio Carrillo crossing is dense primary rainforest starting right at the edge of the highway, and it is the closest thing to untouched jungle you will see from a road in Costa Rica. Between the tunnel and the descent to Limón there is nothing but forest on both sides.",
  },
  4487: {
    // LIR - Liberia Int. Airport -> San Jose Downtown  (4 H, 215 km, $325)
    traveler_tip:
      "We track your flight number, so a delay costs you nothing — but if you are connecting onward out of San José the same day, give yourself a buffer, because the last hour into the city is the least predictable part of the four",
    local_recommendation:
      "About two thirds of the way in, the road passes Sarchí, the town that makes the painted ox carts you see on postcards. The workshops still paint them by hand and the world's largest one sits in the middle of the town park.",
  },
};

const base = env.NEXT_PUBLIC_SUPABASE_URL;
let ok = 0;
const total = Object.keys(CONTENIDO).length;

for (const [id, campos] of Object.entries(CONTENIDO)) {
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(campos),
  });
  if (res.ok) {
    const body = await res.json();
    if (!Array.isArray(body) || !body.length) {
      console.error(`${id} no encontró la fila`);
      continue;
    }
    ok++;
    console.log(`${id} OK  ${body[0].slug}`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
console.log(`\n${ok}/${total} filas actualizadas.`);
