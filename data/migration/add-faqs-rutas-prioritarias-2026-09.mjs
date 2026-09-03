// FAQs propias para las rutas que Diego marcó como las que más se venden.
//
// De las 116 páginas /private-shuttle/ solo 12 tenían FAQs propias. Las
// otras 104 mostraban únicamente las genéricas que arma buildAutoFAQs()
// en components/RouteDetail.tsx — el mismo texto palabra por palabra en
// todas, cambiando nada más el nombre del lugar. Google eso lo lee como
// contenido duplicado, y es parte de por qué estas páginas andan en
// posición 19-35.
//
// Cada respuesta sale de los datos que ya están en la fila de `routes`
// (journey_description, road_type, traveler_tip, google_maps_note,
// local_recommendation). No hay nada inventado: si el dato no estaba,
// no lo puse.
//
// Se escribe por la API REST con la service role key, NO pegando SQL en
// el dashboard — así los acentos y las tildes viajan en UTF-8 limpio y
// no hay que andar con escapes Unicode.
//
// Correr desde la raíz del proyecto, que es donde está .env.local:
//   node data/migration/add-faqs-rutas-prioritarias-2026-09.mjs
//
// Ojo al desplegar después de correr esto: las páginas de ruta son
// estáticas y Next cachea el fetch a Supabase durante el build. Con el
// build cache prendido, Vercel vuelve a publicar la versión vieja sin
// estas FAQs. Hay que destildar "Use existing Build Cache" en el
// redeploy (local: rm -rf .next/cache).
//
// OJO 2: las FAQs de Monteverde que quedaron acá abajo (3375 y 3117)
// dicen que el camino final es de lastre, y eso está MAL. Ya se corrigió
// con fix-faqs-monteverde-camino-pavimentado-2026-09.mjs. Si algún día
// volvés a correr este script, corré el de la corrección después, o
// vas a devolver el error a producción.

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
  // ---------- Desde SJO ----------
  3375: [
    {
      question: "Is the road from San Jose to Monteverde paved?",
      answer:
        "Mostly. The first 2.5 hours are paved Pan-American Highway. The final 30-40 km, from Sardinal up through Guacimal into Monteverde, is gravel road — well maintained, but slow. That unpaved stretch is the single reason the drive takes 3.5 to 4 hours instead of the 3 hours Google Maps predicts.",
    },
    {
      question: "Do I need a 4x4 to get to Monteverde?",
      answer:
        "Not with us — our vehicles run this route daily and the gravel road is graded and passable year-round. If you're renting a car instead, high clearance is genuinely worth it in the September-October rains, when the gravel section develops potholes.",
    },
    {
      question: "How long does the drive from SJO to Monteverde really take?",
      answer:
        "Plan for 3.5 to 4 hours door to door. Google says 3, but it doesn't account for the 40 km of gravel at the end, which adds a minimum of 45 minutes. In heavy rain our drivers sometimes take the Tilarán approach instead — they decide based on conditions that morning.",
    },
    {
      question: "What should I pack for the drive from San Jose to Monteverde?",
      answer:
        "A sweater, in your day bag and not in your checked luggage. Monteverde sits at 1,400 m and can drop to 15°C in the evenings. Coming straight off a hot arrival at SJO, the change catches almost everyone off guard.",
    },
    {
      question: "Can we stop at the Tárcoles crocodile bridge on the way?",
      answer:
        "Yes, and it costs nothing. There are usually 20 or more wild crocodiles in the river below, visible right from the bridge. It's a five-minute stop and one of the best free things on the route — just tell your driver.",
    },
  ],

  3527: [
    {
      question: "Is it better to fly into Liberia (LIR) instead of San Jose for Playa Conchal?",
      answer:
        "Honestly, yes. Playa Conchal is about 1 hour from Liberia airport and 5 hours from San Jose. If Conchal or the northern Guanacaste beaches are your main destination, flying into LIR saves you the better part of a travel day in each direction. We run the SJO route often — usually for travelers whose international flight only connects through San Jose, or who are combining Conchal with La Fortuna or Manuel Antonio.",
    },
    {
      question: "How long is the drive from San Jose Airport to Playa Conchal?",
      answer:
        "About 5 hours. The route crosses the Central Valley and its coffee country, then runs northwest into Guanacaste, ending on paved road through Brasilito. It's one of the longer transfers we do from SJO, so we build in a proper stop rather than pushing straight through.",
    },
    {
      question: "Where exactly do you drop off at Playa Conchal?",
      answer:
        "Door to door, wherever you're staying — the Westin Reserva Conchal, the Reserva Conchal residences, or any hotel in neighbouring Brasilito. Conchal beach itself has no road running onto it; the paved road ends at Brasilito and the beach is a short walk or drive from there.",
    },
    {
      question: "What is Playa Conchal actually like?",
      answer:
        "It's made of millions of crushed shells instead of sand, which is why the water is so unusually clear — it's some of the best snorkelling in Guanacaste. Bring water shoes: the shells are beautiful but rough on bare feet, and they get hot at midday. Try to arrive in time for sunset.",
    },
  ],

  // ---------- Desde LIR ----------
  3117: [
    {
      question: "How long is the drive from Liberia airport to Monteverde?",
      answer:
        "Three to three and a half hours. You leave the hot Guanacaste coast, cross through Cañas and Tilarán with Lake Arenal and the wind farms on your right, then climb the last stretch into the cloud forest.",
    },
    {
      question: "Is the road from LIR to Monteverde paved?",
      answer:
        "Paved highway as far as Cañas and Tilarán, then 30 to 40 km of unpaved gravel road for the final climb into Monteverde. It's well maintained and our drivers cover it daily, including after dark — fog is the real variable up there, not the surface.",
    },
    {
      question: "Should I fly into Liberia or San Jose for Monteverde?",
      answer:
        "The drive times are close — about 3 to 3.5 hours from LIR and 3.5 to 4 hours from SJO. Pick based on the rest of your itinerary rather than on Monteverde itself: LIR if you're pairing it with the Guanacaste beaches, SJO if you're heading on to Manuel Antonio or the Pacific south.",
    },
    {
      question: "How cold does it get in Monteverde?",
      answer:
        "It can drop to around 15°C, and it will feel colder than that because you've just come from 32°C in Liberia. Keep a sweater where you can reach it. When the road starts climbing, roll the windows down — the temperature falls about 10°C in twenty minutes and the mist arrives. That's the cloud forest starting.",
    },
  ],

  3529: [
    {
      question: "How long is the transfer from Liberia airport to Playa Conchal?",
      answer:
        "About one hour, or roughly 70 minutes door to door if you're staying at one of the larger resorts. The route runs through Huacas — the same road as Flamingo — and is paved the entire way.",
    },
    {
      question: "Do you drop off at the Westin Reserva Conchal?",
      answer:
        "Yes, right at the entrance, along with the Reserva Conchal residences and any hotel in Brasilito. Public beach access to Conchal is through Brasilito, and it's every bit as beautiful as the resort side.",
    },
    {
      question: "What is the best way to get from LIR to Playa Conchal?",
      answer:
        "A private shuttle is the straightforward option at $135 per vehicle, door to door, with a fixed price and no waiting. There's no direct public bus — you'd transfer in Santa Cruz or Huacas and still need a taxi at the end. Rental cars work, but the parking situation near the beach access is awkward in high season.",
    },
    {
      question: "Why is the sand at Playa Conchal different?",
      answer:
        "Because it isn't sand. Conchal is made of tiny crushed shells, which is why the water sitting over it is so clear — it's among the best snorkelling spots in Guanacaste. Bring water shoes; walking barefoot on shells at midday is genuinely uncomfortable. Children tend to spend the entire visit collecting them.",
    },
  ],

  3120: [
    {
      question: "How long does it take to get from Liberia airport to Papagayo?",
      answer:
        "Twenty-five to forty-five minutes depending on traffic leaving the airport. It's the shortest airport transfer in Costa Rica, on smooth paved highway the whole way, which is a large part of why the Papagayo resorts are so popular with families landing tired.",
    },
    {
      question: "Can you drop off inside the Papagayo Peninsula gates at Four Seasons or Andaz?",
      answer:
        "Yes, but tell us the specific resort when you book. The peninsula is gated and private, and Four Seasons, Andaz, El Mangroove and the others each have their own access protocol. Some also run an internal shuttle from the gate — worth checking with your concierge so we know whether to go to the lobby or the gate.",
    },
    {
      question: "Is a private shuttle worth it for such a short trip from LIR?",
      answer:
        "For $110 per vehicle, door to door, with the driver already holding a sign when you clear customs — yes, particularly with luggage or children. Airport taxis to the peninsula run in a similar range but are metered, priced per car rather than per group, and you queue for them after a long flight.",
    },
    {
      question: "Can we stop at a beach before checking in at Papagayo?",
      answer:
        "Yes, and it's a good idea if you land before your room is ready. Playa Hermosa and Playa Panamá are both public beaches just before the Papagayo Peninsula entrance — a few minutes off the route and a much better way to spend an hour than sitting in a lobby.",
    },
  ],

  3814: [
    {
      question: "How long is the drive from Liberia airport to Santa Teresa?",
      answer:
        "Four and a half to five hours. Google says four, but that doesn't account for the final gravel stretch. It's one of the longest beach transfers in the country — Santa Teresa's remoteness is exactly why it still feels the way it does.",
    },
    {
      question: "Do I need to take a ferry from Liberia to Santa Teresa?",
      answer:
        "No. From LIR the route runs entirely overland down the Nicoya Peninsula, through Nicoya town and Cóbano. The ferry crossing people read about applies to the route from San Jose and Puntarenas, not from Liberia.",
    },
    {
      question: "Is the road to Santa Teresa paved?",
      answer:
        "Paved for most of the way, then unpaved coastal road for roughly the last hour into Santa Teresa. Scenic but slow. It's the section that makes the difference between Google's estimate and the real arrival time.",
    },
    {
      question: "Should I bring cash to Santa Teresa?",
      answer:
        "Yes. Plenty of beach restaurants and small shops don't take cards, and there are no chain stores or full pharmacies in town. Pull cash before you leave the airport and pack anything you specifically need — resupplying in Santa Teresa is harder than people expect.",
    },
  ],

  // ---------- Desde La Fortuna ----------
  3136: [
    {
      question: "How long is the drive from La Fortuna to Liberia airport?",
      answer:
        "Two and a half to three hours on paved highway the whole way, crossing the Guanacaste plains past Lake Arenal and the Tilarán wind farms. It's one of the easiest departure drives in the country — flat, direct, and with none of the traffic you hit going into San Jose.",
    },
    {
      question: "What time should I leave La Fortuna for a flight out of LIR?",
      answer:
        "Roughly six hours before an international departure: three for the drive, three at the airport. That's a more relaxed morning than the SJO run, because there's no metropolitan traffic to absorb. We operate around the clock at the same rate, so an early pickup costs no more.",
    },
    {
      question: "Is it faster to fly home from Liberia or San Jose after La Fortuna?",
      answer:
        "The two drives are about the same length — three hours either way — but the Liberia one is easier. It's flat highway with no city traffic at the end, whereas the San Jose approach can add 30 to 45 minutes in the morning. If your fares are comparable, LIR makes for the calmer departure day.",
    },
    {
      question: "Can we stop somewhere on the way from La Fortuna to Liberia?",
      answer:
        "Llanos de Cortés waterfall is the one to ask for — about a 15-minute detour off the route and a good last stop before flying home. Just tell the driver at pickup so the timing works around your flight.",
    },
  ],

  3530: [
    {
      question: "How long is the drive from La Fortuna to Playa Conchal?",
      answer:
        "About four and a half hours, paved the entire way. You cross the Guanacaste countryside with Lake Arenal behind you and finish on the coastal road through Brasilito. It's the classic volcano-to-beach travel day.",
    },
    {
      question: "Is the road from La Fortuna to Conchal paved?",
      answer:
        "Yes, fully paved from start to finish — mountain road at the beginning, then flat plains highway. No gravel sections and no 4x4 needed.",
    },
    {
      question: "What time should we leave La Fortuna to reach Conchal for sunset?",
      answer:
        "Leave by about 1 p.m. Sunset at Conchal is one of the better ones on the Pacific coast, and arriving with light left is worth planning around — the beach looks completely different at that hour.",
    },
    {
      question: "What should I know before arriving at Playa Conchal?",
      answer:
        "The beach is crushed shell rather than sand, so it gets hot underfoot at midday and is rough on bare feet. Bring water shoes, or plan on early morning and late afternoon. The upside is the water clarity, which is the best in this part of Guanacaste.",
    },
  ],

  3145: [
    {
      question: "How long is the drive from La Fortuna to the Papagayo Peninsula?",
      answer:
        "About four to four and a half hours, on paved highway throughout. The route runs past Lake Arenal, down through Cañas, around Liberia and out to Papagayo Bay — no gravel and no ferry.",
    },
    {
      question: "Can you drop off at Four Seasons, Andaz or El Mangroove in Papagayo?",
      answer:
        "Yes. Confirm which resort when you book, though — the peninsula is gated and each property has a different access arrangement. Knowing the name in advance is what keeps the arrival from turning into a twenty-minute conversation at the gate.",
    },
    {
      question: "Is it better to go La Fortuna to Papagayo direct, or through Liberia?",
      answer:
        "Direct. Breaking the trip at Liberia airport means paying for two transfers and adding a stop for no benefit — the direct route already passes the Liberia outskirts. Book it as one leg unless you're actually collecting someone from the airport en route.",
    },
    {
      question: "Is there anything worth stopping for between Arenal and Papagayo?",
      answer:
        "The Lake Arenal viewpoints, early in the drive, if you haven't already seen the lake with the volcano behind it. Ask your driver to pause at the best one. After that the route flattens into Guanacaste plains and there's little reason to stop.",
    },
  ],

  3155: [
    {
      question: "What time should I leave La Fortuna to catch a flight from San Jose airport?",
      answer:
        "Four hours before an international departure. The drive is three hours, and morning traffic entering the San Jose metro area routinely adds 30 to 45 minutes that Google Maps won't show you. For a flight before 10 a.m. that means a 4 or 5 a.m. pickup — normal for us, and there's no night surcharge. Most La Fortuna hotels will prepare a breakfast box if you ask the evening before.",
    },
    {
      question: "How long is the drive from La Fortuna to SJO airport?",
      answer:
        "Three hours in practice. Google says 2 hours 45 minutes, and that's accurate for the road itself, but it assumes you arrive in San Jose outside of rush hour. Our drivers plan for three and recommend leaving four hours before an international flight.",
    },
    {
      question: "Can we stop on the way from La Fortuna to the airport?",
      answer:
        "Yes, and it's the best use of a departure day if your flight is in the afternoon. The Doka Estate coffee tour is about 30 minutes from SJO and makes a good breakfast stop. La Paz Waterfall Gardens, Poás Volcano, the Zarcero topiary garden and Sarchí are all on or near the route. Tell us at booking so we can time it against your flight.",
    },
    {
      question: "Is there an early morning shuttle from La Fortuna to San Jose airport?",
      answer:
        "Yes. Pre-dawn pickups are one of the most common things we do on this route — 4 a.m. and 5 a.m. departures are routine, the rate is the same as any other hour, and most passengers sleep through the first stretch. Bring a layer; the mountain sections are cool at sunrise.",
    },
  ],
};

let ok = 0;
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
  console.log(`${res.status} ${String(id).padEnd(5)} ${body[0].slug.padEnd(45)} ${body[0].faqs.length} FAQs`);
  ok++;
}
console.log(`\n${ok}/${Object.keys(FAQS).length} rutas actualizadas`);
