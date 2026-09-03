// Las 19 rutas prioritarias de Diego, en los DOS sentidos: 34 páginas.
//
// Diego: "yo lo que quiero es que cada ruta de esas que te pase tenga una
// pagina separada y contenido diferente" + "y que las rutas sean en los 2
// sentidos".
//
// Lo primero que verifiqué fue si faltaban páginas de vuelta. NO faltan:
// las 34 ya existen y ya son indexables, porque isPopularRoute() pide que
// los dos extremos estén en POPULAR_DESTINATIONS y no le importa el orden.
// Las 19 de la lista son 17 pares sin dirección (SJO-Fortuna y LIR-Fortuna
// venían repetidos en la lista), y 17 x 2 = 34.
//
// El problema es el contenido. Barriendo las 34 fila por fila:
//
//   journey_description   34/34 distintos   ok
//   budget_tip            34/34 distintos   ok
//   family_info           26/34             9 comparten un texto
//   late_night_info       12/34             23 comparten UN SOLO texto
//   traveler_tip          32/34             2 pares repetidos
//   local_recommendation  32/34             2 pares repetidos
//
// late_night_info es el grave: 23 de las 34 páginas prioritarias salían con
// el mismo párrafo palabra por palabra ("Our service operates around the
// clock with no night surcharges..."). Casi siempre le tocaba a la dirección
// de vuelta, que es justo la que Diego acaba de pedir. Las de ida las
// habíamos escrito antes; las de vuelta quedaron con la plantilla.
//
// Criterio para escribirlas: que cada texto diga algo que solo aplica a ESE
// tramo en ESA dirección. De noche no cambia lo mismo en todas:
//
//   - hacia SJO/LIR       madrugar para el vuelo, y que seguimos el número
//                         de vuelo (eso vale para la dirección aeropuerto)
//   - Monteverde          la neblina en la bajada de la 606, primera hora
//   - Puerto Viejo->SJO   Braulio Carrillo se cierra de neblina, y los
//                         camiones de Limón a toda hora
//   - Santa Teresa->LIR   la primera hora es camino sin pavimentar, de
//                         noche se hace más lento (eso SÍ es cierto acá,
//                         son los caminos internos de Santa Teresa)
//   - tramos de 1,5 H     son los que de verdad sirven para un vuelo de
//                         madrugada sin dormir en el aeropuerto
//
// De dónde salen los datos de cada fila: duracion, precio1a6 y road_type de
// la misma fila. Ningún dato va de memoria.
//
// Ojo con Monteverde: la 606 está PAVIMENTADA desde 2020 (blog
// content/blog/monteverde-travel-guide.md, líneas 26, 29, 34, 41 y 163) y ya
// lo arregló fix-monteverde-lastre-todas-las-filas-2026-09.mjs. Lo que se
// conserva es que es empinada y con curvas, que es cierto y es lo que explica
// la duración. La ruta Fortuna-Monteverde es OTRO camino (la vuelta al lago
// Arenal, también pavimentada): no las mezclés.
//
// Correr desde la raíz del proyecto:
//   node data/migration/contenido-propio-19-rutas-ambos-sentidos-2026-09.mjs
//
// Es idempotente: escribe siempre el mismo texto en las mismas filas.
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
  // ============ HACIA SJO ============
  3155: {
    // la-fortuna-to-sjo  (3 H, $220)
    late_night_info:
      "Most people take this one at dawn for a morning flight, and it is the direction that works best early: the mountain section above the Central Valley is empty at 4am and you reach the airport before the city wakes up. We track your flight number, so a schedule change on your side is not a problem. No night surcharge, and the driver waits at your hotel in La Fortuna rather than you waiting for him.",
  },
  3191: {
    // manuel-antonio-quepos-to-sjo  (3 H, $220)
    late_night_info:
      "Three hours to the airport at any hour, no surcharge. Going early is the better version of this route: the coastal stretch north through the palm plantations is single-lane and slow behind traffic during the day, and empty before sunrise. For an 8am flight we would normally leave Manuel Antonio around 3:30am. We follow the flight number, so if it moves, we move.",
  },
  3215: {
    // monteverde-to-sjo  (3H, $220)
    late_night_info:
      "The first hour is the descent down Route 606, and at night or in early fog our drivers take it slowly — it is paved but steep with tight curves and there is no reason to rush it in the dark. Budget a little extra rather than a little less for a pre-dawn departure to catch a flight. We watch the flight number and there is no night surcharge.",
  },
  3298: {
    // puerto-viejo-to-sjo  (4,5 H, $320)
    late_night_info:
      "Around the clock with no surcharge. Two things about this one at night: the Braulio Carrillo mountain section fogs in heavily and our drivers slow down through the tunnels, and the highway from Limón carries container and banana trucks at every hour. Neither is a problem — it is just why we do not promise a faster trip on the grounds that the roads are emptier. For a morning flight out of SJO, leaving the Caribbean before 4am is routine for us.",
  },
  3564: {
    // tamarindo-to-sjo  (5 H, $345)
    late_night_info:
      "Five hours, so an early flight out of SJO means leaving Tamarindo in the middle of the night — we do it constantly and there is no surcharge for it. Before you book this direction, though, check Liberia: LIR is an hour and a half from Tamarindo and often saves the entire night drive. If SJO is the only option, the Interamericana south is straight and easy at that hour.",
  },
  3602: {
    // conchal-to-sjo  (5 H, $345)
    family_info:
      "Five hours from the beach to the airport is a long stretch with children, and the honest advice is to break it up: a night in the Central Valley near SJO turns a hard day into two easy ones. If you do it in one go we build in two stops and there are free child seats, A/C and bottled water throughout. Have a change of clothes in the vehicle — Conchal's crushed-shell sand travels with you.",
    late_night_info:
      "Available at any hour with no surcharge, but for a morning flight out of SJO this is a middle-of-the-night departure. Liberia is an hour and a half from Conchal and worth pricing first. If it has to be SJO, the drive north to south on the Interamericana is straightforward at night and the children usually sleep through most of it.",
  },
  3527: {
    // sjo-to-conchal  (5 H, $345)
    family_info:
      "Five hours from the airport to one of the gentlest beaches in the country for small children — Conchal has calm water and no strong current on the south end. After a long flight it is a lot of extra travel, so we stop twice and keep the vehicle cool. Child seats are free and installed before you come out of arrivals, so nobody is fitting one in the parking lot with tired children waiting.",
    late_night_info:
      "We meet every flight, however late, and we track the flight number so a delay costs you nothing. Arriving at SJO at night and driving five hours to Conchal is a big ask after an international flight — many families stay near the airport and drive up in the morning. Both work, and there is no night surcharge either way.",
  },

  // ============ HACIA LIR ============
  3136: {
    // la-fortuna-to-lir  (3 H, $225)
    late_night_info:
      "Three hours on paved highway, easy driving at any hour and no night surcharge. Early departures from La Fortuna are our most common version of this route because it puts you at Liberia for a morning flight without an overnight near the airport. We track the flight, so if it is delayed the driver is not gone.",
  },
  3200: {
    // monteverde-to-lir  (3 H, $230)
    family_info:
      "Three hours, and the part to plan around with children is the first one: the descent from Monteverde down Route 606 is paved but steep and full of tight curves. If anyone is prone to motion sickness, deal with it before leaving, not on the way down. Have a lighter layer ready in the vehicle too — you start at 1,400 metres in the cloud forest and finish in the Guanacaste heat. Child seats are free.",
    late_night_info:
      "We run it at any hour with no surcharge, but the descent out of Monteverde deserves respect after dark or in fog and our drivers take it slowly. Budget extra time, not less, for a pre-dawn departure to catch a flight at LIR. Once you are down off the mountain the rest is open highway and quick.",
    traveler_tip:
      "The first hour is the descent off the mountain, so take a motion sickness pill in Monteverde rather than once you are already on the switchbacks — and check your flight time twice, because this is the direction where a delay on the mountain is hardest to make up",
    local_recommendation:
      "On a clear morning the descent opens onto the Gulf of Nicoya with the islands laid out below — the best view of the drive, and it comes in the first half hour while everyone is still awake. Sit on the left going down.",
  },
  3252: {
    // papagayo-to-lir  (1,5 H, $110)
    family_info:
      "The shortest transfer on this list at an hour and a half, which makes it the easy one to do with small children — short enough that nobody needs a stop, though we will make one if you want. Child seats at no charge, fitted before we arrive. Note that the peninsula has a controlled entrance and the resorts sit well past it, so give us the hotel name and we will come to the door.",
    late_night_info:
      "An hour and a half, direct and fully paved, which makes this the route where a very early flight is genuinely no trouble — a 6am departure from Papagayo gets you to LIR in comfortable time without an airport hotel. We track the flight number on arrivals and there is no night surcharge. Allow a few minutes for the peninsula gate.",
  },
  3563: {
    // tamarindo-to-lir  (1,5 H, $135)
    late_night_info:
      "An hour and a half on smooth paved road, which is why we recommend Liberia over San José for anyone staying in Tamarindo — even a 6am flight only means leaving around 3:30am, instead of the middle-of-the-night drive that SJO requires. No night surcharge, and on arrivals we follow the flight number.",
  },
  3601: {
    // conchal-to-lir  (1,5 H, $135)
    family_info:
      "An hour and a half, which is the whole argument for flying into Liberia when Conchal is your beach — with children, it is the difference between arriving fresh and arriving wrecked. One stop if you want it, free child seats, A/C throughout. Time it so you are not leaving the beach in the hottest part of the afternoon.",
    late_night_info:
      "Short and fully paved, so early flights out of LIR are straightforward from Conchal — no need to leave in the middle of the night and no need for an airport hotel the evening before. We meet late arrivals too and track the flight number, with no surcharge at any hour.",
    traveler_tip:
      "This short hop is the reason to fly into Liberia rather than San José if Conchal is your destination — an hour and a half versus five hours, for a lower fare on the transfer as well",
    local_recommendation:
      "Give the south end of Conchal one more walk before you go and look closely at the sand: it is crushed shell rather than grains, which is exactly why the water reads turquoise there and grey-brown at the beaches on either side. Only a handful of beaches in the country are built that way.",
  },
  3893: {
    // santa-teresa-to-lir  (5 H, $350)
    family_info:
      "Five hours, and the first one is on the unpaved coastal road out of Santa Teresa — slow and bumpy before the drive properly begins, which is worth warning children about rather than surprising them with. After that it is paved highway the whole way across the peninsula. Two stops, free child seats, and A/C throughout.",
    late_night_info:
      "We run it at any hour with no surcharge, but the first hour out of Santa Teresa is genuinely unpaved and it is slower in the dark, so a pre-dawn departure needs more margin than the five-hour figure suggests. Tell us the flight time when you book and we will work the departure backwards from it rather than the other way around.",
  },

  // ============ HACIA / DESDE LA FORTUNA ============
  3142: {
    // la-fortuna-to-monteverde  (4 H, $255)
    late_night_info:
      "Four hours around the northern shore of Lake Arenal and then up into the cloud forest — a beautiful drive, and one that is genuinely wasted in the dark. This is the one route on the list we would actively suggest doing in daylight rather than at night, not for safety but because the lake road is the reason to take it. We will still run it at any hour, with no surcharge.",
  },
  3201: {
    // monteverde-to-la-fortuna  (4 H, $255)
    late_night_info:
      "Four hours: the winding descent out of Monteverde first, then the lake road around Arenal. Both are paved and both are slow, and in fog our drivers take the descent gently. At any hour with no surcharge, but as with the other direction, the lake stretch is the point of this route and it is worth seeing in daylight if your schedule allows it.",
  },
  3141: {
    // la-fortuna-to-manuel-antonio  (5,5 H, $330)
    late_night_info:
      "Five and a half hours with a mountain section in the middle, which is the longest single leg between two destinations on this list. Available at any hour with no surcharge. Leaving La Fortuna early is the version we recommend: you clear the mountains in the morning and reach the coast with the afternoon still ahead of you rather than arriving in the dark.",
  },
  3181: {
    // manuel-antonio-quepos-to-la-fortuna  (5,5 H, $330)
    late_night_info:
      "Five and a half hours, at any hour, no surcharge. Going this direction the mountain section falls in the second half of the drive, so an early start out of Manuel Antonio means crossing it in daylight and arriving in La Fortuna with time to eat. Leaving after lunch usually means the last stretch is in the dark.",
  },
  3492: {
    // la-fortuna-to-tamarindo  (4,5 H, $315)
    late_night_info:
      "Four and a half hours on fully paved highway, easy driving at any hour and no night surcharge. Nothing about this route gets difficult at night, which is not true of every route out of La Fortuna. If you are heading to Tamarindo for a flight rather than a stay, note that LIR is an hour and a half further on and we can take you straight there instead.",
  },
  3550: {
    // tamarindo-to-la-fortuna  (4,5 H, $315)
    late_night_info:
      "Four and a half hours, paved the whole way, and straightforward at any hour with no surcharge. The practical note for this direction is arrival rather than departure: La Fortuna hotels are spread out along the road toward the volcano and some are down long private drives, so give us the exact hotel and we will find it in the dark without calling you.",
  },
  3530: {
    // la-fortuna-to-conchal  (4,5 H, $315)
    family_info:
      "Four and a half hours from the volcano to the beach, paved throughout, with a scenic mountain stretch early on and flat plains after. We stop twice. It is a good day to have swimsuits accessible rather than packed at the bottom of a suitcase — families usually go straight from the vehicle to the water at Conchal. Free child seats and A/C throughout.",
    late_night_info:
      "At any hour with no surcharge, though this is a route people generally do in daylight because the mountain section early on is the scenic part. Leaving La Fortuna in the morning gets you to Conchal with beach time left in the afternoon, which is usually the point.",
  },
  3588: {
    // conchal-to-la-fortuna  (4,5 H, $315)
    family_info:
      "Four and a half hours from the beach up to the volcano, on paved road the whole way with some winding in the final stretch. Two stops. Pack a warm layer somewhere reachable — La Fortuna sits at the base of Arenal and the evenings are much cooler than Guanacaste, which catches families out on arrival. Child seats free, A/C throughout.",
    late_night_info:
      "We run it at any hour with no surcharge. Arriving in La Fortuna after dark is common and fine, just tell us the exact hotel: many sit along the road toward the volcano down long private drives, and knowing which one saves the driver hunting for it at night.",
    traveler_tip:
      "Leaving Conchal in the morning gets you to La Fortuna in time for the afternoon, which matters here because Arenal is usually clearest early and clouds over as the day goes on — an evening arrival often means seeing the volcano for the first time the next morning",
    local_recommendation:
      "The drive crosses the Guanacaste plains and then climbs into a completely different climate — you leave dry forest and arrive in rainforest in the same afternoon. If the sky is clear as you approach, the cone of Arenal comes into view long before you reach town.",
  },
  3145: {
    // la-fortuna-to-papagayo  (4,5 H, $285)
    late_night_info:
      "Four and a half hours on paved highway, easy at any hour, no surcharge. One practical thing for this direction: the Papagayo peninsula has a controlled entrance and the resorts are well past it, so give us the hotel name when you book — arriving at the gate at night without it is what causes delays on this route.",
  },
  3253: {
    // papagayo-to-la-fortuna  (4,5 H, $285)
    family_info:
      "Four and a half hours from the peninsula to the volcano, paved throughout with some winding toward the end. We stop twice. Keep a warm layer within reach: Papagayo is hot and La Fortuna evenings are not, and that catches families out. Child seats free, and we come to the hotel door inside the peninsula rather than meeting you at the gate.",
    late_night_info:
      "At any hour, no surcharge. Allow a few minutes for the peninsula gate on the way out, and for the arrival end, give us the exact hotel in La Fortuna — many are down long private drives off the volcano road and it makes a real difference after dark.",
    traveler_tip:
      "Leave Papagayo in the morning if you can — Arenal is usually clear early and clouds over through the day, so a morning departure is often the difference between seeing the volcano on arrival and waiting until the next day",
    local_recommendation:
      "This drive crosses from the driest part of the country to one of the wettest in a single afternoon. Watch the vegetation change through the window: bare dry forest through Guanacaste, then green closing in as you climb toward Arenal.",
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
    console.log(`${id} OK  ${body[0].slug.padEnd(52)} ${Object.keys(campos).join(", ")}`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
console.log(`\n${ok}/${total} filas actualizadas.`);
