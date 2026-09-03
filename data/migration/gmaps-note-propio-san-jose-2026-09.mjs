// Último campo de plantilla en las 26 páginas de San José centro:
// google_maps_note, 14 textos distintos para 26 filas.
//
// El texto viejo se armaba metiendo la duración en una plantilla fija, así
// que todas las rutas que duran lo mismo salían idénticas:
//
//   "Google Maps may show a shorter time, but real driving conditions in
//    Costa Rica are different. Plan for 5 H for this route. (...) Our drivers
//    know Costa Rica's roads and always get you there safely and comfortably."
//
// Cuatro rutas de 5 H = cuatro páginas con el mismo párrafo. Y aparte no
// dice nada: "los caminos son distintos" no le sirve a nadie para decidir.
//
// Este campo debería ser el más útil de la página. La pregunta real del
// cliente es "Google me dice 3 horas y ustedes me cobran por 5, ¿por qué?".
// Así que cada nota dice QUÉ es lo que Google no cuenta en ESE tramo:
// la presa de San José, el ferry, el portón de Papagayo, la bajada de la
// 606, la neblina de Braulio Carrillo, los camiones de la Interamericana.
//
// Las 21 filas que estaban repetidas. Las 5 que ya tenían nota propia
// (4109 Jaco, 4093 Manuel Antonio, 4080 Santa Teresa, 4265 Jaco->SJ, 4244
// Santa Teresa->SJ) no se tocan.
//
// Duraciones y precios salen de duracion / precio1a6 de la misma fila.
//
// No se toca road_type de 4891/4892 (SJO <-> San José centro): comparten
// texto porque es literalmente la misma autopista en los dos sentidos, son
// 20 minutos por la General Cañas, y no hay nada distinto que decir. Forzar
// una diferencia ahí sería inventar.
//
// Correr desde la raíz del proyecto:
//   node data/migration/gmaps-note-propio-san-jose-2026-09.mjs
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

const NOTAS = {
  // ---- 3 H ----
  4081:
    // SJ -> La Fortuna
    "Plan for 3 hours. Google Maps does not know when you are leaving, and that is the whole difference on this route: getting out of San José between 7-9am or 4-7pm can add 45 minutes before you have really started. Outside those windows the estimate is close to right.",
  4247:
    // La Fortuna -> SJ
    "Plan for 3 hours. The drive itself runs close to what the map says; what it cannot see is the entry into San José at the other end. Arriving mid-morning or late afternoon is what turns 3 hours into nearly 4.",
  4097:
    // SJ -> Monteverde
    "Plan for 3 hours. The final 35 km up Route 606 is paved but steep and full of tight curves, and no map estimate reflects how much that slows a vehicle down. The highway portion before it is genuinely fast.",
  4250:
    // Monteverde -> SJ
    "Plan for 3 hours. The first hour is the descent off the mountain, which is slower than the distance suggests, and the last stretch is the entry into San José. The easy, fast part is the middle.",
  4251:
    // Manuel Antonio -> SJ
    "Plan for 3 hours. The coastal road north through the palm plantations is single-lane, so a slow truck ahead sets your pace for a while — that is the part Google Maps cannot predict. Allow 4 hours if you are catching an international flight.",

  // ---- 4 H ----
  4488:
    // SJ -> LIR
    "Plan for 4 hours to cover the 215 km. The Pan-American Highway carries heavy truck traffic and has single-lane stretches where passing takes patience. Leaving the city outside rush hour saves the most time.",
  4487:
    // LIR -> SJ
    "Plan for 4 hours. The highway portion is predictable; the last hour into San José is not, and it is where the estimate usually breaks. We track your flight, so a delayed landing does not cost you the driver.",

  // ---- 4,5 H ----
  4096:
    // SJ -> Puerto Viejo
    "Plan for 4.5 hours. The mountain crossing through Braulio Carrillo fogs in regularly and our drivers slow down through the tunnels — that stretch alone can run well over the map estimate. The flat coastal road after Limón makes some of it back.",
  4276:
    // Puerto Viejo -> SJ
    "Plan for 4.5 hours. The climb into Braulio Carrillo is the variable: fog by mid-afternoon most days, plus container and banana trucks working the Limón highway at every hour. A morning departure is the reliably faster version.",
  4111:
    // SJ -> Las Catalinas
    "Plan for 4.5 hours. Google Maps routes you to the edge of Las Catalinas, but the town is built to be walked rather than driven, so the last few minutes depend on where you are staying — tell us and we will sort the drop-off point beforehand.",
  4267:
    // Las Catalinas -> SJ
    "Plan for 4.5 hours. The first stretch is the small road out through Potrero before you reach the highway, which is slower than the map assumes, and the last hour is the entry into San José.",

  // ---- 5 H ----
  4098:
    // SJ -> Tamarindo
    "Plan for 5 hours. Most of it is straightforward Pan-American Highway; the time is lost at the two ends, leaving San José and on the beach roads through Guanacaste. Worth knowing that Liberia airport is only an hour and a half from Tamarindo.",
  4252:
    // Tamarindo -> SJ
    "Plan for 5 hours. Slow truck traffic on the Pan-American is the main variable, and the entry into San José is the other. Allow 5.5 to 6 hours if you are connecting to an international flight out of SJO.",
  4100:
    // SJ -> Conchal
    "Plan for 5 hours. The highway is fast, but the last stretch is the paved road to Brasilito and then in to Conchal, which the map times optimistically. If Conchal is your main stop, note that LIR is an hour and a half away versus these 5 hours.",
  4254:
    // Conchal -> SJ
    "Plan for 5 hours. The beach roads at the start and the San José entry at the end are where the map estimate slips; the Pan-American in between runs close to schedule apart from truck traffic.",
  4099:
    // SJ -> Flamingo
    "Plan for 5 hours. The final approach goes through Huacas and Brasilito on smaller roads, which is slower than the highway average the map assumes. Leaving San José outside rush hour is the single biggest saving.",
  4253:
    // Flamingo -> SJ
    "Plan for 5 hours. The first half hour is the small road out through Brasilito and Huacas before the highway, which the map underestimates — worth building in when you are timing a flight.",
  4114:
    // SJ -> Papagayo
    "Plan for 5 hours. Google Maps measures to the peninsula entrance, not to your hotel: Papagayo has a controlled gate and the resorts are spread well past it, so give us the hotel name and we will take you to the door.",
  4272:
    // Papagayo -> SJ
    "Plan for 5 hours from your hotel door, not from the peninsula gate — the difference between those two is real and it is where the map estimate falls short. Add the San José entry at the other end.",
};

const base = env.NEXT_PUBLIC_SUPABASE_URL;
let ok = 0;
const total = Object.keys(NOTAS).length;

for (const [id, google_maps_note] of Object.entries(NOTAS)) {
  const res = await fetch(`${base}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ google_maps_note }),
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
