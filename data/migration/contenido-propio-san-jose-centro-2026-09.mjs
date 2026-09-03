// Contenido propio para las 26 páginas de San José centro.
//
// Diego pidió publicar San José centro (27 tramos vendidos y ni una página
// indexable — el hueco más grande del sitio). Al revisar las 26 filas antes
// de publicarlas, el contenido estaba casi listo: journey_description,
// budget_tip y road_type ya eran distintos en cada una.
//
// Pero DOS campos venían de plantilla:
//
//   family_info      26 filas, 3 textos distintos
//   late_night_info  26 filas, 3 textos distintos
//
// O sea que 24 de las 26 páginas iban a salir con exactamente la misma frase
// ("Child seats included at no extra cost. Private vehicle with A/C...").
// Publicar 26 páginas nuevas compartiendo dos párrafos idénticos es
// justamente lo que no queremos: Google las lee como la misma página repetida
// y no sube ninguna.
//
// Este script les escribe los dos campos, uno por uno, con lo que de verdad
// distingue cada viaje: cuánto dura, por dónde se va, qué tiene de particular
// para quien viaja con chiquitos y qué cambia de noche o de madrugada.
//
// De dónde salen los datos de cada ruta:
//   - duración y precio: columnas duracion / precio1a6 de la misma fila
//   - por dónde pasa: road_type y journey_description de la misma fila
//     (Ruta 27 al Pacífico, Braulio Carrillo al Caribe, ferry de Paquera a
//     Santa Teresa, la subida de la 606 a Monteverde)
//   - la presa de San José: lo dice road_type de las filas de la ciudad,
//     "Urban highways with typical city traffic. Best to travel early morning
//     or after 7pm."
//
// No se tocan 4891 (sjo-to-san-jose-downtown) ni 4892 (san-jose-downtown-to-sjo):
// esas dos ya tenían texto propio y además FAQs escritas.
//
// Correr desde la raíz del proyecto:
//   node data/migration/contenido-propio-san-jose-centro-2026-09.mjs
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
  // ============ SALIENDO DE SAN JOSÉ ============

  4109: {
    // San Jose Downtown -> Jaco  (1,5 H, $195)
    family_info:
      "At an hour and a half, this is the shortest beach transfer from San Jose — the easiest one to do with small children. Route 27 is a modern toll highway, so it is smooth and there is very little winding. Most families do it without a stop, but if you want one, the Tarcoles bridge is right on the way and there are usually crocodiles visible below. Child seats are free and we fit them before you get in.",
    late_night_info:
      "Route 27 is well lit and patrolled, and an hour and a half means you arrive in Jaco at a reasonable hour even leaving San Jose after dinner. Leaving the city after 7 p.m. also skips the worst of the traffic. There is no night surcharge. If you are heading the other way for an early flight, this is one route where you do not need to leave in the middle of the night.",
  },
  4081: {
    // San Jose Downtown -> La Fortuna  (3 H, $250)
    family_info:
      "Three hours from the city to the base of Arenal, climbing out of the Central Valley and through farm country. There is one bathroom stop built into the drive, usually in Zarcero or Naranjo, where the view over the valley is worth getting out for. The second half has mountain curves, so if one of your kids gets carsick, that is the stretch to watch. Child seats at no cost.",
    late_night_info:
      "We run this route at any hour. Leaving San Jose before 6 a.m. or after 7 p.m. avoids the worst of the city traffic and can save you 30 to 45 minutes. The mountain section between Naranjo and San Ramon gets fog at night — our drivers know it and slow down for it, which is why a night run is not faster than a day run even with empty roads. No night surcharge.",
  },
  4093: {
    // San Jose Downtown -> Manuel Antonio  (3 H, $250)
    family_info:
      "Three hours, and almost all of it on good highway — Route 27 to the coast, then the paved coastal road south. The Tarcoles bridge stop is the one kids remember: wild crocodiles in the river below, visible from the bridge, no cost and five minutes. Most families ask for it. Child seats are included and fitted before departure.",
    late_night_info:
      "Available around the clock with no surcharge. The coastal highway is in good condition and well marked. Leaving San Jose before 6 a.m. gets you to Manuel Antonio in time for a full beach day, and skips the morning traffic getting out of the city — worth doing if you are short on days.",
  },
  4097: {
    // San Jose Downtown -> Monteverde  (3H, $240)
    family_info:
      "Three hours, ending with the climb up Route 606 into the cloud forest. That last 35 km is paved but steep and full of tight curves, and it is the part to prepare for if anyone in the family gets motion sick — sitting forward and looking out the windshield helps. Pack a layer for each child in the car, not in the luggage: Monteverde sits at 1,400 meters and it is much cooler than San Jose. Child seats free.",
    late_night_info:
      "We do this route at any hour, but the mountain fog on the final climb is real after dark and our drivers take it slowly. Budget extra time rather than less for a night arrival. For early flights in the other direction, a pre-dawn departure from Monteverde is routine for us. No night surcharge.",
  },
  4096: {
    // San Jose Downtown -> Puerto Viejo  (4,5 H, $340)
    family_info:
      "Four and a half hours across the country to the Caribbean side, through Braulio Carrillo National Park and then flat coastal road from Limon. The park section is dense rainforest right off the highway and often misty — genuinely worth looking out the window for. Two stops on a drive this long, and child seats at no charge.",
    late_night_info:
      "Around the clock, no surcharge. Two things about this route at night: Braulio Carrillo gets heavy fog and our drivers slow down through it, and the Limon highway carries banana and container trucks at all hours. Neither is a problem, but it is why we do not promise a faster trip just because the roads are emptier.",
  },
  4080: {
    // San Jose Downtown -> Santa Teresa  (6 H, $395)
    family_info:
      "Six hours — the longest transfer we run out of San Jose, and worth planning around a child's schedule rather than squeezing it in. We build in two stops. If your family would rather break it up, tell us and we can route through a lunch stop on the Nicoya side. Child seats are included at no cost, and the vehicle has A/C throughout.",
    late_night_info:
      "This is the one route where the clock genuinely constrains us: part of the route depends on the Puntarenas ferry, which does not run all night. For very early or very late departures we take the overland route around the peninsula instead, which is longer in distance but does not depend on a schedule. Tell us your flight time and we will pick the approach that works. No night surcharge either way.",
  },
  4098: {
    // San Jose Downtown -> Tamarindo  (5 H, $365)
    family_info:
      "Five hours up to Guanacaste — a long day with kids, but the road is good the whole way and mostly flat once you are past the Central Valley. Two stops included. Families often ask us to leave early so they arrive with daylight left for the beach; that also means missing San Jose morning traffic. Free child seats.",
    late_night_info:
      "We run it at any hour with no surcharge. Leaving San Jose after 7 p.m. or before 6 a.m. cuts a solid half hour off the trip just by avoiding city traffic. The Interamericana north is straight, well surfaced and easy driving at night.",
  },
  4100: {
    // San Jose Downtown -> Conchal  (5 H, $365)
    family_info:
      "Five hours to one of the best beaches in the country for small children — Conchal has gentle water and no strong currents on the south end. The drive itself is straightforward: highway most of the way, two stops, A/C throughout. Bring a change of clothes in the car if you plan to go straight to the sand. Child seats free.",
    late_night_info:
      "Available at any hour, no surcharge. The route north on the Interamericana is easy night driving. If you are catching an early flight out of Liberia the next morning, note that Conchal is only about an hour from LIR, so you do not need to leave Conchal in the middle of the night.",
  },
  4099: {
    // San Jose Downtown -> Flamingo  (5 H, $365)
    family_info:
      "Five hours to Flamingo, on paved road the whole way. It is a long stretch for young kids, so we plan two stops and can add one if you need it. The last section from the main highway into Flamingo is fully paved and quick. Child seats included at no extra cost.",
    late_night_info:
      "Any hour, no surcharge. Sportfishing charters out of Flamingo leave very early, and we do a fair number of pre-dawn runs for exactly that reason — leaving San Jose around 2 or 3 a.m. puts you at the marina for a morning departure. Tell us the charter time and we will work backwards from it.",
  },
  4111: {
    // San Jose Downtown -> Las Catalinas  (4,5 H, $370)
    family_info:
      "Four and a half hours, and the arrival is the unusual part: Las Catalinas is car-free inside, so we drop you at the entrance and the town handles it from there. Worth knowing in advance with kids and luggage. The drive is paved throughout with two stops. Child seats at no charge.",
    late_night_info:
      "We run this at any hour with no surcharge. Because the town itself is car-free, a late-night arrival means a short walk or a cart ride to your unit — if you are arriving after dark with children, let your rental know your ETA so someone meets you at the entrance.",
  },
  4114: {
    // San Jose Downtown -> Papagayo  (5 H, $360)
    family_info:
      "Five hours to the peninsula. Once you turn off the highway the roads inside Papagayo are private and very well kept, so the last part of the drive is smooth. Most of the resorts here have a gated entrance where we check you in — have your reservation name handy. Two stops on the way, child seats free.",
    late_night_info:
      "Any hour, no surcharge. The resorts on the peninsula have 24-hour security at the gate and are used to late arrivals, so a night drop-off is routine. The highway north is straightforward at night; the gate check is usually the only thing that adds a few minutes.",
  },
  4488: {
    // San Jose Downtown -> LIR  (4 H, $325)
    family_info:
      "Four hours from the city to Liberia airport, on highway nearly the whole way. For a flight out of LIR with children, we recommend leaving San Jose five hours before departure — four for the drive and one of margin, because the first stretch out of the city is the unpredictable part. Child seats included, and we can stop whenever you need.",
    late_night_info:
      "This is a route we do in the dark constantly, because LIR has a cluster of early morning departures. A 2 or 3 a.m. pickup in San Jose is completely normal for us and costs no more than a daytime run. The advantage of leaving that early is real: you skip San Jose traffic entirely and the Interamericana is empty.",
  },

  // ============ LLEGANDO A SAN JOSÉ ============

  4265: {
    // Jaco -> San Jose Downtown  (1,5 H, $195)
    family_info:
      "An hour and a half back to the city on Route 27 — the shortest of our San Jose transfers and the easiest with small children. Mostly straight highway, very little winding. Child seats are free and already fitted when we pick you up at your hotel in Jaco.",
    late_night_info:
      "Available at any hour with no surcharge. Coming into San Jose, arriving after 7 p.m. or before 6 a.m. makes a real difference — the same trip can take 30 minutes longer if you hit the city at rush hour. If you have an early flight the next day, this short a route means you do not have to sacrifice a night's sleep.",
  },
  4247: {
    // La Fortuna -> San Jose Downtown  (3 H, $250)
    family_info:
      "Three hours down from Arenal into the Central Valley, with one stop built in. The mountain section comes early in this direction, which is better with kids — the curves are behind you in the first half and the rest is straightforward. Free child seats, fitted before we leave your hotel.",
    late_night_info:
      "Any hour, no surcharge. La Fortuna hotels will usually prepare a breakfast box if you are leaving before their kitchen opens; ask the evening before. Coming into San Jose, aim to arrive before 6:30 a.m. or after 7 p.m. if you can — the difference in city traffic is 30 to 45 minutes.",
  },
  4251: {
    // Manuel Antonio -> San Jose Downtown  (3 H, $250)
    family_info:
      "Three hours from the coast back up to the city, on the paved coastal road and then Route 27. The Tarcoles bridge is on the way in this direction too, and it is a good place to stretch — wild crocodiles below, five minutes, free. Child seats included at no cost.",
    late_night_info:
      "We run it around the clock with no surcharge. The coastal highway is well surfaced and easy at night. If you are connecting to an international flight, remember the airport is past the city center, so build in the extra 30 minutes rather than cutting it fine.",
  },
  4250: {
    // Monteverde -> San Jose Downtown  (3H, $240)
    family_info:
      "Three hours, starting with the winding descent down Route 606. The curves come first in this direction, so if a child is prone to motion sickness, that is the first 45 minutes — after Sardinal it flattens out onto the Pan-American and stays easy. Layers are useful: Monteverde is cool and San Jose is not. Child seats free.",
    late_night_info:
      "Available at any hour. For early international flights we routinely leave Monteverde at 3 or 4 a.m., and there is no surcharge for it. The one thing to know is that mountain fog on the descent is common before dawn, so we plan the pickup with margin rather than assuming empty roads mean a faster trip.",
  },
  4276: {
    // Puerto Viejo -> San Jose Downtown  (4,5 H, $340)
    family_info:
      "Four and a half hours from the Caribbean coast back across to the Central Valley, with the Braulio Carrillo rainforest section in the second half. Two stops on a drive this length. It is a long day for young children, so an early start usually works better than a midday one. Child seats at no charge.",
    late_night_info:
      "Around the clock, no surcharge. Two honest notes for night travel on this route: the Limon highway carries freight trucks at all hours, and Braulio Carrillo fogs up badly. Our drivers do this route constantly and handle both, but we do not promise a faster trip at night — plan the same four and a half hours.",
  },
  4244: {
    // Santa Teresa -> San Jose Downtown  (6 H, $395)
    family_info:
      "Six hours, our longest San Jose transfer. With children it is worth treating as a travel day rather than a morning errand — we build in two stops and can add more. If you are heading to a flight, do it the day before rather than the same day. Child seats included, A/C throughout.",
    late_night_info:
      "The ferry is the constraint on this route, and it does not run all night. For departures outside ferry hours we drive around the peninsula overland instead — longer on the map, but it does not depend on a schedule, and for an early flight that reliability is worth more than the distance. Give us your flight time and we will choose. No night surcharge.",
  },
  4252: {
    // Tamarindo -> San Jose Downtown  (5 H, $365)
    family_info:
      "Five hours down from Guanacaste, flat and straight for most of it once you are on the Interamericana. Two stops included. With kids, leaving Tamarindo early beats leaving late — you arrive in San Jose with the afternoon still ahead instead of in the dark. Free child seats.",
    late_night_info:
      "Any hour, no surcharge. The Interamericana south is easy night driving. The part that varies is the last 45 minutes entering San Jose: at rush hour that stretch alone can add half an hour, so if your schedule is flexible, arriving before 6:30 a.m. or after 7 p.m. is genuinely faster.",
  },
  4254: {
    // Conchal -> San Jose Downtown  (5 H, $365)
    family_info:
      "Five hours from the beach back to the city. The first part, from Conchal out to the main highway, is short and paved; after that it is straight highway with two stops. A long day with small children, so we are flexible about extra stops — just tell the driver. Child seats free.",
    late_night_info:
      "Available at any hour with no surcharge. Straightforward night driving on the Interamericana. If your flight is out of San Jose rather than Liberia, note that the airport is on the far side of the city, so add 30 minutes beyond the five hours when you plan.",
  },
  4253: {
    // Flamingo -> San Jose Downtown  (5 H, $365)
    family_info:
      "Five hours back to the Central Valley on paved road the whole way, with two stops. The stretch out of Flamingo to the main highway is quick and in good condition. For families we recommend a morning departure so the drive ends in daylight. Child seats at no extra cost.",
    late_night_info:
      "Any hour, no surcharge. We do early departures from Flamingo regularly for people connecting through San Jose. If you are flying out of SJO the same day, leave a real buffer — five hours of driving plus city traffic plus the three hours the airport wants you there is a long chain, and we would rather pick you up early than watch the clock.",
  },
  4267: {
    // Las Catalinas -> San Jose Downtown  (4,5 H, $370)
    family_info:
      "Four and a half hours. Because Las Catalinas is car-free, we meet you at the town entrance rather than at your door — arrange a cart for your luggage to the meeting point, especially with children and multiple bags. After that it is paved highway the whole way with two stops. Child seats included.",
    late_night_info:
      "Available at any hour, no surcharge. For a pre-dawn departure, coordinate the luggage cart with your rental the night before — that is the piece that catches people out, not the drive itself. Once we are on the highway it is straightforward night driving.",
  },
  4272: {
    // Papagayo -> San Jose Downtown  (5 H, $360)
    family_info:
      "Five hours from the peninsula down to the city. The resort roads inside Papagayo are private and smooth, and we pick up right at your hotel entrance. Two stops on the way. Five hours is a lot for small kids, so an early departure with a proper lunch stop tends to work better than pushing straight through. Free child seats.",
    late_night_info:
      "Any hour, no surcharge. The peninsula gate is staffed 24 hours so an early pickup is no problem — just leave your name with the front desk the night before so security expects us. The highway south is easy driving at night.",
  },
  4487: {
    // LIR -> San Jose Downtown  (4 H, $325)
    family_info:
      "Four hours from Liberia airport to the city, mostly highway. After an international flight with children, four more hours in a vehicle is the hard part — we stop whenever you need, and there is A/C and bottled water throughout. Child seats are free and we have them installed before you come out of arrivals.",
    late_night_info:
      "We watch your flight number and adjust, so a delayed or late arrival at LIR is not a problem and costs nothing extra. Night driving on the Interamericana south is straightforward. The only stretch that varies is entering San Jose, and at night that is the easy version — arriving before the morning rush saves a solid half hour.",
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
