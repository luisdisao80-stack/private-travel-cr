// Corrección: las FAQs de Monteverde que escribí decían "gravel".
//
// Me guié por routes.road_type / journey_description, que describen los
// últimos 30-40 km como lastre. Pero el blog dice lo contrario en cuatro
// lugares distintos y con fecha: "Route 606 from Sardinal is now fully
// paved" desde 2020 (monteverde-travel-guide.md líneas 26, 29, 54, 163).
//
// Le hago caso al blog: es contenido escrito para el sitio, es específico
// y es más nuevo que el texto de la tabla routes, que se ve autogenerado
// de antes. Los campos road_type de esas filas siguen desactualizados y
// se muestran en vivo en la página de la ruta — eso queda pendiente de
// que Diego confirme antes de tocarlo.

import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };

const FAQS = {
  3375: [
    {
      question: "Is the road from San Jose to Monteverde paved?",
      answer:
        "Yes. Route 606 from Sardinal up to Santa Elena was for decades a punishing gravel track, and a lot of older guidebooks and blog posts still describe it that way — but it was fully paved in 2020. The final 35 km is steep and winding with sharp curves, and a normal sedan handles it without trouble.",
    },
    {
      question: "Do I need a 4x4 to get to Monteverde?",
      answer:
        "No, not since the road was paved in 2020. Any standard vehicle makes the climb. What the road still demands is a driver comfortable with 35 km of steep switchbacks, which is the actual reason most of our guests would rather not do it themselves after a long flight.",
    },
    {
      question: "How long does the drive from SJO to Monteverde really take?",
      answer:
        "Three and a half to four hours. Google says three, but it underestimates the final climb — the last 35 km are slow regardless of the surface, and afternoon fog on the mountain slows things further. Our drivers pick between the Sardinal and Tilarán approaches based on conditions that day.",
    },
    {
      question: "Is the drive to Monteverde bad for motion sickness?",
      answer:
        "The final 35 km of switchbacks are the part to plan for. If anyone in your group is prone to motion sickness, take something preventively before the climb starts rather than partway up. Sitting in the front and keeping a window cracked helps.",
    },
    {
      question: "What should I pack for the drive from San Jose to Monteverde?",
      answer:
        "A sweater, in your day bag rather than your checked luggage. Monteverde sits at 1,400 m and evenings can drop to 15°C. Coming straight off a hot arrival at SJO, the change catches almost everyone off guard.",
    },
    {
      question: "Can we stop at the Tárcoles crocodile bridge on the way?",
      answer:
        "Yes, and it costs nothing. There are usually 20 or more wild crocodiles in the river below, visible right from the bridge. It's a five-minute stop and one of the best free things on the route — just tell your driver.",
    },
  ],

  3117: [
    {
      question: "How long is the drive from Liberia airport to Monteverde?",
      answer:
        "Three to three and a half hours. You leave the hot Guanacaste coast, run south past Cañas, then climb Route 606 into the cloud forest. It's shorter than the same trip from San Jose, which is why travellers combining Monteverde with the Guanacaste beaches usually fly into LIR.",
    },
    {
      question: "Is the road from LIR to Monteverde paved?",
      answer:
        "Yes, the whole way. Route 606 from Sardinal to Santa Elena was gravel for decades and many older guides still say so, but it was fully paved in 2020. The last stretch is steep and winding rather than rough, and any standard vehicle manages it.",
    },
    {
      question: "Should I fly into Liberia or San Jose for Monteverde?",
      answer:
        "The drives are close — about 3 to 3.5 hours from LIR and 3.5 to 4 from SJO. Choose based on the rest of your itinerary rather than on Monteverde: LIR if you're pairing it with the Guanacaste beaches, SJO if you're continuing to Manuel Antonio or the Pacific south.",
    },
    {
      question: "How cold does it get in Monteverde?",
      answer:
        "It can drop to around 15°C, and it will feel colder because you've just come from 32°C in Liberia. Keep a sweater within reach. When the road starts climbing, roll the windows down — the temperature falls roughly 10°C in twenty minutes and the mist arrives. That's the cloud forest beginning.",
    },
  ],
};

for (const [id, faqs] of Object.entries(FAQS)) {
  const res = await fetch(`${url}/rest/v1/routes?id=eq.${id}`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({ faqs }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error("FALLO", id, res.status, JSON.stringify(body));
    continue;
  }
  console.log(`${res.status} ${id} ${body[0].slug} — ${body[0].faqs.length} FAQs`);
  const t = JSON.stringify(body[0].faqs);
  console.log(`     menciona gravel: ${/gravel/i.test(t)} | dice paved 2020: ${/paved in 2020|fully paved in 2020/i.test(t)}`);
}
