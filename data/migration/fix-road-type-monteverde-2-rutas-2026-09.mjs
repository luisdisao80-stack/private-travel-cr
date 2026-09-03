// Arregla road_type y journey_description en DOS rutas de Monteverde.
//
// Por qué solo dos: en fix-faqs-monteverde-camino-pavimentado-2026-09.mjs
// reescribí las FAQs de 3375 (sjo-to-monteverde) y 3117 (lir-to-monteverde)
// para decir que la 606 está pavimentada desde 2020. Pero road_type y
// journey_description de esas mismas filas siguen diciendo "gravel", y esos
// campos también salen en la página — uno en el cuerpo y otro dentro de una
// FAQ automática que arma buildAutoFAQs().
//
// Resultado: la página se contradice sola. En sjo-to-monteverde conviven
// hoy estas dos frases:
//
//   "Route 606 ... was fully paved in 2020"           <- FAQ mía
//   "The last 30-40 km ... is unpaved gravel road"    <- journey_description
//
// Eso es peor que estar equivocado de forma consistente: el que lo lee no
// sabe a cuál creerle, y Google tampoco.
//
// De dónde sale el dato: content/blog/monteverde-travel-guide.md lo dice en
// cuatro lugares distintos, con fecha y con el detalle específico ("Route 606
// from Sardinal is now fully paved", líneas 26, 29, 54 y 163). Es contenido
// del sitio, escrito a mano, y más nuevo que el texto de la tabla routes, que
// se ve autogenerado de antes.
//
// PENDIENTE, y es grande: hay 86 filas con "monteverde" en el slug que
// mencionan gravel. Estas dos son las únicas que toco porque son las únicas
// donde yo metí la contradicción. Las otras 84 siguen diciéndole al cliente
// que el camino es de lastre. No las toco de una porque el texto de esas
// filas está armado pegando el road_type del origen con el del destino, y
// varias mencionan lastre de OTROS lugares que sí es cierto (los caminos
// internos de Santa Teresa y de Nosara, por ejemplo). Hay que separarlas a
// mano y quiero que Diego confirme el dato de la 606 antes de mover 84 filas.
//
// Para devolverlo todo atrás: los valores viejos están acá abajo en ANTES.
//
// Correr desde la raíz del proyecto:
//   node data/migration/fix-road-type-monteverde-2-rutas-2026-09.mjs
//
// Después del deploy hay que destildar "Use existing Build Cache" en Vercel,
// si no Next republica la versión vieja desde el cache del fetch a Supabase.

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

// Valores previos, por si hay que revertir.
//
// Ojo: no era solo road_type y journey_description. El texto de "gravel"
// estaba repartido en SEIS campos distintos de la misma fila, y todos se
// muestran en la página. Los fui encontrando de a uno revisando el HTML
// generado, hasta que hice un barrido de todas las columnas de texto.
const ANTES = {
  3117: {
    road_type:
      "Paved highway through Cañas and Tilarán, then unpaved gravel road for the final 30-40 km into Monteverde.",
    journey_description:
      "A transfer from Liberia's coast climbing into the Tilarán mountains and the Monteverde cloud forest. Approximately 3 to 3.5 hours, ending with the famous gravel road into Monteverde.",
    late_night_info:
      "Monteverde is approximately 3 hours from LIR, including the gravel road ascent. Our drivers cover this route at night regularly and are experienced with the unpaved mountain section. Fog is possible at elevation. No surcharges.",
    google_maps_note:
      "Realistic 3 to 3.5 hours. The gravel section adds time but is well-maintained.",
    family_info:
      "Approximately 3 to 3.5 hours. Highway initially, then mountain roads with a gravel road section into Monteverde. Bring light layers for children — the cloud forest is noticeably cooler. Child seats available at no charge.",
  },
  3375: {
    road_type:
      "Mix of highway and mountain road. The first 2.5 hours are paved Pan-American Highway. The final ascent to Monteverde via Sardinal-Guacimal is gravel road, roughly 40 km of slow but scenic driving.",
    journey_description:
      "A route that climbs from sea-level San José up through the Central Valley, across the Pan-American Highway, then up the Tilarán mountains into the cloud forest. Approximately 3.5 to 4 hours. The last 30-40 km from Sardinal up to Monteverde is unpaved gravel road — slow but well-maintained.",
    late_night_info:
      "Monteverde is approximately 3.5 hours from SJO. The last 35 kilometers are on well-maintained gravel road — our drivers cover this stretch daily, including after dark. Fog is possible at higher elevations. No night surcharges.",
    google_maps_note:
      "Google says 3h but the gravel section adds 45 minutes minimum. Realistic time is 3.5 to 4 hours. Avoid the route via Tilarán in heavy rain — our drivers know which approach is best for current conditions.",
    family_info:
      "Approximately 3.5 to 4 hours including the gravel road section into Monteverde. Child seats are available at no charge. The unpaved final stretch is well-maintained and our vehicles are suited for it. Bring light layers for the children — Monteverde sits at 1,400 meters and is noticeably cooler.",
    local_recommendation:
      "Stop at the Tárcoles bridge — there are usually 20+ wild crocodiles below, free to view from the bridge. Five minutes, no cost, great photos. Also: when you start the gravel section, that's the cloud forest entrance. Roll down the window, the air changes completely.",
  },
};

const CAMBIOS = {
  3117: {
    road_type:
      "Paved highway through Cañas and Tilarán, then the climb up Route 606 into Monteverde — paved since 2020, but steep and winding with sharp curves.",
    journey_description:
      "A transfer from Liberia's coast climbing into the Tilarán mountains and the Monteverde cloud forest. Approximately 3 to 3.5 hours. The final climb up Route 606 was gravel for decades and was fully paved in 2020; it is still slow going because of the grade and the curves, not the surface.",
    late_night_info:
      "Monteverde is approximately 3 hours from LIR, including the mountain ascent on Route 606. Our drivers cover this route at night regularly and know the curves well. Fog is common at elevation after dark, which is the real reason the last stretch is slow. No surcharges.",
    google_maps_note:
      "Realistic 3 to 3.5 hours. Route 606 is paved but steep and winding, so the final climb takes longer than the distance suggests.",
    family_info:
      "Approximately 3 to 3.5 hours. Highway initially, then a paved but winding mountain climb into Monteverde. If anyone in the family gets carsick, the last 35 km is the part to be ready for — the surface is good, but there are a lot of curves. Bring light layers for children, the cloud forest is noticeably cooler. Child seats available at no charge.",
  },
  3375: {
    road_type:
      "Mix of highway and mountain road. The first 2.5 hours are paved Pan-American Highway. The final 35 km up Route 606 via Sardinal-Guacimal is paved as of 2020 — steep, winding and scenic, but no longer gravel.",
    journey_description:
      "A route that climbs from sea-level San José up through the Central Valley, across the Pan-American Highway, then up the Tilarán mountains into the cloud forest. Approximately 3.5 to 4 hours. The last 35 km from Sardinal up to Monteverde was a famously rough gravel track until it was fully paved in 2020; expect a slow, winding ascent on good asphalt.",
    late_night_info:
      "Monteverde is approximately 3.5 hours from SJO. The last 35 kilometers climb Route 606, paved since 2020 but steep and full of curves — our drivers cover this stretch daily, including after dark. Fog is common at higher elevations at night. No night surcharges.",
    google_maps_note:
      "Google says 3h but the final climb adds 45 minutes minimum. Realistic time is 3.5 to 4 hours. Route 606 is paved now, though still slow going uphill. Avoid the route via Tilarán in heavy rain — our drivers know which approach is best for current conditions.",
    family_info:
      "Approximately 3.5 to 4 hours on paved road the whole way, including the winding climb into Monteverde. Child seats are available at no charge. The last 35 km has a lot of curves, so if a child gets carsick that is the stretch to prepare for. Bring light layers — Monteverde sits at 1,400 meters and is noticeably cooler.",
    local_recommendation:
      "Stop at the Tárcoles bridge — there are usually 20+ wild crocodiles below, free to view from the bridge. Five minutes, no cost, great photos. Also: when you turn off at Sardinal and start climbing Route 606, that's the cloud forest entrance. Roll down the window, the air changes completely.",
  },
};

let ok = 0;
for (const [id, campos] of Object.entries(CAMBIOS)) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify(campos),
  });
  const cuerpo = await res.text();
  if (res.ok) {
    ok++;
    console.log(`${id} OK`);
  } else {
    console.error(`${id} FALLÓ ${res.status}: ${cuerpo.slice(0, 300)}`);
  }
}
console.log(`\n${ok}/${Object.keys(CAMBIOS).length} filas actualizadas.`);
console.log(`Valores viejos guardados en la constante ANTES de este mismo archivo.`);
