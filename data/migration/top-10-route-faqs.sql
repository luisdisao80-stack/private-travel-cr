-- =============================================================
-- FAQs custom para las 10 rutas top (por impresiones del legacy).
-- Cada UPDATE deja 4 Q&As route-specific en routes.faqs.
-- Se renderean en /private-shuttle/<slug> y van al FAQSchema JSON-LD.
--
-- Antes de correr este archivo, asegurate de haber corrido:
--   ALTER TABLE routes ADD COLUMN IF NOT EXISTS faqs JSONB;
-- =============================================================

-- 1. SJO Airport → La Fortuna (Arenal)
UPDATE routes SET faqs = '[
  {
    "question": "What is the route from SJO Airport to La Fortuna?",
    "answer": "From SJO we take Route 1 (Pan-American Highway) north toward Naranjo, then Route 141 through Zarcero, and finally Route 142 into La Fortuna. The drive is approximately 135 km and takes about 3 hours including a brief restroom stop. The road is fully paved and our drivers know the route well — we monitor weather conditions in real time and adjust as needed."
  },
  {
    "question": "Can we stop along the way from San Jose to La Fortuna?",
    "answer": "Yes — popular optional stops include the Sarchí oxcart factory (free, 30 min), the town of Zarcero with its famous topiary church gardens (20 min), or a coffee tour in Naranjo. A lunch stop in Ciudad Quesada is also common. Just let your driver know at pickup; stops add 30–60 minutes to the trip."
  },
  {
    "question": "Is the drive from SJO to La Fortuna safe at night?",
    "answer": "Yes. Our drivers are trained for night driving on this route and the main highway is well-marked. The final stretch through the mountains around Zarcero can have low visibility due to fog, so we drive slower in that section. If your flight lands late, we recommend booking a private shuttle rather than a public bus, which doesn''t run at night."
  },
  {
    "question": "What time should I leave SJO to arrive in La Fortuna before dark?",
    "answer": "Leave SJO by 2:00 PM to comfortably reach La Fortuna by 5:30 PM (before sunset). If you plan stops (Sarchí, lunch, coffee tour), leave by noon. Late afternoon and evening pickups are fine too — many guests arrive after 8 PM, and we get them to La Fortuna by 11 PM with no issues."
  }
]'::jsonb
WHERE slug = 'sjo-to-la-fortuna';


-- 2. LIR Airport → La Fortuna (Arenal)
UPDATE routes SET faqs = '[
  {
    "question": "What is the drive from LIR Airport to La Fortuna like?",
    "answer": "From Liberia airport we take the Pan-American Highway south to Cañas, then turn east on Route 142 through Tilarán and around the north shore of Lake Arenal. The trip is about 145 km and takes 3 hours. The Lake Arenal stretch offers spectacular views of the volcano on a clear day."
  },
  {
    "question": "Can we see Arenal Volcano on the drive from LIR?",
    "answer": "Yes — once you crest the hills near Tilarán, the volcano dominates the horizon for the final 45 minutes. Our drivers know the best photo stops along the lake. Visibility is best in dry season (December–April); during the rainy months the summit is often hidden in clouds, but you''ll still see the lower slopes."
  },
  {
    "question": "Is the road from Liberia airport to La Fortuna paved the whole way?",
    "answer": "Yes, the entire route is paved. The road around Lake Arenal has plenty of curves but is in good condition. The Cañas–Tilarán stretch can be windy (this is a known wind corridor), so the ride is occasionally bumpy in gusty conditions, but never unsafe."
  },
  {
    "question": "Are there restrooms or food stops between LIR and La Fortuna?",
    "answer": "Yes — Cañas has gas stations with restrooms and small restaurants (about 1 hour from LIR), and Tilarán has more options (about 2 hours in). We typically make one stop on this route, but if you''d like more, just tell your driver."
  }
]'::jsonb
WHERE slug = 'lir-to-la-fortuna';


-- 3. La Fortuna → Monteverde
UPDATE routes SET faqs = '[
  {
    "question": "What is the fastest way to get from La Fortuna to Monteverde?",
    "answer": "There are two options: (1) the road around Lake Arenal — approximately 4 hours, fully paved, scenic — or (2) the famous ''jeep-boat-jeep'' across Lake Arenal — about 3 hours total but requires a vehicle change at the lake. Our private shuttle takes the road route by default so you stay in the same vehicle, but we can arrange the boat option on request."
  },
  {
    "question": "Is the road to Monteverde paved now?",
    "answer": "Yes, the main road to Monteverde (Route 606 from Sardinal) has been fully paved since 2020. The final climb is steep with sharp curves, but pavement makes it much easier than the old gravel road. If you''re prone to motion sickness, the boat option avoids the windy climb."
  },
  {
    "question": "Can we stop along the way from La Fortuna to Monteverde?",
    "answer": "Yes — common stops include the Lake Arenal viewpoint, the town of Tilarán for lunch, or a quick visit to El Castillo near the dam. The Sardinal area at the foot of Monteverde also has small soda restaurants. Stops add 30–60 minutes."
  },
  {
    "question": "Is it cold in Monteverde? Should I bring layers?",
    "answer": "Yes — Monteverde sits at 1,400 meters elevation so it''s significantly cooler than La Fortuna (typically 16–22°C / 60–72°F). Bring a fleece or light jacket. It can also drizzle at any time due to the cloud forest microclimate, so a rain shell is useful."
  }
]'::jsonb
WHERE slug = 'la-fortuna-to-monteverde';


-- 4. La Fortuna → Tamarindo
UPDATE routes SET faqs = '[
  {
    "question": "How long does the drive from La Fortuna to Tamarindo take?",
    "answer": "Approximately 4 hours 30 minutes (about 230 km). We take Route 142 around Lake Arenal, then south through Cañas on the Pan-American, and west on Route 21 to Tamarindo. The drive crosses from the volcanic interior to the dry tropical Pacific beaches."
  },
  {
    "question": "Can we stop for lunch between La Fortuna and Tamarindo?",
    "answer": "Yes — Tilarán (about 2 hours in) and Cañas (2.5 hours) both have good local sodas. A popular stop is the Río Tempisque crocodile bridge near Filadelfia, where you can see large crocs from the bridge for free. Lunch + stop adds about an hour total."
  },
  {
    "question": "Will we see different scenery on the way to Tamarindo?",
    "answer": "Yes, dramatically. You leave the lush rainforest of La Fortuna, cross the dry tropical forest of Guanacaste (much sparser, hotter), and arrive at the Pacific coast. In dry season the contrast is striking — green volcanoes behind, golden grasslands ahead."
  },
  {
    "question": "Is there a hotel pickup option in La Fortuna?",
    "answer": "Yes, we pick you up door-to-door from any hotel, lodge, or Airbnb in La Fortuna town, Tabacón, El Castillo, or the surrounding area. Just provide the address at booking and we confirm the exact pickup window 24 hours in advance."
  }
]'::jsonb
WHERE slug = 'la-fortuna-to-tamarindo';


-- 5. La Fortuna → Manuel Antonio
UPDATE routes SET faqs = '[
  {
    "question": "How long is the drive from La Fortuna to Manuel Antonio?",
    "answer": "About 5 hours 30 minutes for the 280 km drive. It''s a full travel day. We take Route 142 to Ciudad Quesada, Route 141 south through Naranjo, the Pan-American to Orotina, then Costanera Sur (Route 34) south along the Pacific coast to Quepos and Manuel Antonio."
  },
  {
    "question": "Where can we stop for lunch between La Fortuna and Manuel Antonio?",
    "answer": "Atenas (famous for its climate and good restaurants) is about 3 hours into the drive — a popular lunch stop. Closer to the coast, the Tárcoles bridge has the famous American crocodile viewing area. Many travelers take both stops; the drive becomes 6.5–7 hours but is much more pleasant."
  },
  {
    "question": "Can we see crocodiles on the way to Manuel Antonio?",
    "answer": "Yes — the Tárcoles bridge (Río Tárcoles) is a free stop where you can walk across the bridge and look down at large American crocodiles in the river below. It''s a famous Costa Rica photo op and takes 10 minutes. Some travelers also book a boat tour from nearby Tárcoles town."
  },
  {
    "question": "Is the road from La Fortuna to Manuel Antonio safe in the rainy season?",
    "answer": "Yes. The route uses major highways and the Costanera coastal road is well maintained. During heavy rains (Sep–Nov) the coastal stretch can have brief flooding near rivers, and our drivers route around any closures. We monitor conditions in real time and have never had to cancel a trip due to road issues."
  }
]'::jsonb
WHERE slug = 'la-fortuna-to-manuel-antonio';


-- 6. SJO Airport → Manuel Antonio
UPDATE routes SET faqs = '[
  {
    "question": "How long does it take to drive from SJO to Manuel Antonio?",
    "answer": "About 3 hours for the 160 km drive. We take Route 27 (the modern toll highway) from San José to the Pacific, then Costanera Sur (Route 34) south to Quepos and Manuel Antonio. It''s the smoothest, fastest route to the Pacific coast from the airport."
  },
  {
    "question": "Can we stop at the Tárcoles crocodile bridge?",
    "answer": "Yes — it''s a popular 10-minute stop on the way. The bridge is free to walk across and you can see 10–20 large American crocodiles in the river below. Just let your driver know at pickup. It adds about 15 minutes to the trip."
  },
  {
    "question": "Is the road from SJO to Manuel Antonio direct?",
    "answer": "Yes, the route is straightforward and fully paved. Route 27 is a modern toll highway with two lanes in each direction for most of the way. The coastal Costanera Sur is a well-maintained two-lane road. Traffic is rarely an issue except during the morning rush leaving San José."
  },
  {
    "question": "What if my flight lands late at SJO — can you still take me to Manuel Antonio?",
    "answer": "Yes. Our drivers operate 24/7 and night driving on Route 27 is straightforward. We track flight arrival times automatically, so even if you''re delayed, your driver waits at no extra cost. Many guests arrive after 10 PM and reach Manuel Antonio around 1 AM."
  }
]'::jsonb
WHERE slug = 'sjo-to-manuel-antonio';


-- 7. SJO Airport → Puerto Viejo
UPDATE routes SET faqs = '[
  {
    "question": "How long is the drive from SJO to Puerto Viejo?",
    "answer": "Approximately 4 hours 30 minutes for the 215 km drive. We take Route 32 northeast through Braulio Carrillo National Park (cloud forest section), descend to the Caribbean lowlands, and continue south through Limón to Puerto Viejo. The route crosses three distinct ecosystems — cloud forest, lowland rainforest, Caribbean coast."
  },
  {
    "question": "What is the route from San José to the Caribbean like?",
    "answer": "The first hour climbs through Braulio Carrillo National Park — a stunning cloud forest section with frequent rain and fog (it''s one of the wettest places in Costa Rica). After descending you enter the warm, humid Caribbean lowlands with banana plantations. The final hour hugs the Caribbean coast through Limón to Puerto Viejo."
  },
  {
    "question": "Is the Braulio Carrillo road safe?",
    "answer": "Yes, it''s a fully paved national highway used by thousands of vehicles daily. The cloud-forest section has reduced visibility due to mist and our drivers slow accordingly. Heavy rain can cause occasional landslides — when this happens authorities close the highway and we re-route via Turrialba. We monitor conditions in real time."
  },
  {
    "question": "Where can we stop on the way to Puerto Viejo?",
    "answer": "Common stops include Guápiles (about 1.5 hours in) for lunch and gas, the Earth University area, and the Caribbean town of Cahuita (about 4 hours in) where you can also visit Cahuita National Park. The Sloth Sanctuary near Cahuita is a popular optional stop."
  }
]'::jsonb
WHERE slug = 'sjo-to-puerto-viejo';


-- 8. SJO Airport → Tamarindo
UPDATE routes SET faqs = '[
  {
    "question": "How long is the drive from SJO to Tamarindo?",
    "answer": "Approximately 5 hours for the 260 km drive. We take Route 27 west to the Pacific coast, then north on the Pan-American Highway through Liberia, and west on Route 21 to Tamarindo. It''s a long but easy drive on modern highways."
  },
  {
    "question": "Why is it cheaper to fly to LIR instead of SJO for Tamarindo?",
    "answer": "LIR (Liberia airport) is only 1 hour 15 minutes from Tamarindo — a much shorter and cheaper transfer than from SJO. If your trip is mostly in the Guanacaste beach region (Tamarindo, Conchal, Flamingo, Papagayo), flying into LIR saves you about 4 hours of road time and roughly $200 in transfer costs."
  },
  {
    "question": "Can we stop for lunch on the way to Tamarindo?",
    "answer": "Yes — Puntarenas (on the coast about 1.5 hours in) is a popular stop for fresh seafood. The town of Liberia (about 4 hours in) has good local restaurants too. A lunch stop adds 45–60 minutes to the trip."
  },
  {
    "question": "What is the road condition like from SJO to Tamarindo?",
    "answer": "Excellent. Route 27 is a modern toll highway (two lanes each way) for the first 80 km. The Pan-American is fully paved and well-maintained. The final stretch on Route 21 to Tamarindo is a quiet two-lane road through Guanacaste cattle country. Total drive time rarely varies more than 15–20 minutes."
  }
]'::jsonb
WHERE slug = 'sjo-to-tamarindo';


-- 9. LIR Airport → Tamarindo
UPDATE routes SET faqs = '[
  {
    "question": "How long is the transfer from LIR to Tamarindo?",
    "answer": "Just 1 hour 15 minutes — about 70 km. It''s the most popular transfer from Liberia airport because Tamarindo is the closest major beach town. The route is fully paved on Route 21, with one short scenic stretch through Guanacaste''s dry tropical forest."
  },
  {
    "question": "What is the best way to get from LIR to Tamarindo?",
    "answer": "A private shuttle is the fastest and easiest option — door-to-door, fixed price, no waiting. Public buses exist but require a transfer in Filadelfia and take 2.5 hours. Rental cars work too but parking in Tamarindo can be a hassle, especially in high season."
  },
  {
    "question": "Is there a direct route from Liberia airport to Tamarindo?",
    "answer": "Yes. Exit LIR onto Route 21 south, pass Filadelfia and Belén, and continue straight to Tamarindo. There are no major detours required — the route is well-signed and we make the trip multiple times per day."
  },
  {
    "question": "What time does the road from LIR to Tamarindo close at night?",
    "answer": "The road never closes — it''s a major highway open 24/7. Late-night arrivals are common and our drivers are experienced on this route after dark. The road is well-paved with adequate signage, and traffic is minimal at night."
  }
]'::jsonb
WHERE slug = 'lir-liberia-int-airport-to-tamarindo';


-- 10. Monteverde → Manuel Antonio
UPDATE routes SET faqs = '[
  {
    "question": "How long is the drive from Monteverde to Manuel Antonio?",
    "answer": "Approximately 4 hours for the 200 km drive. We descend from the Monteverde cloud forest on Route 606, take the Pan-American Highway south to Puntarenas, then the Costanera Sur (Route 34) along the Pacific coast to Manuel Antonio."
  },
  {
    "question": "What is the descent from Monteverde like?",
    "answer": "The first 35 km from Monteverde down to Sardinal is winding and steep, with sharp curves. The road is paved (since 2020) but our drivers take it slowly for both safety and passenger comfort. If you''re prone to motion sickness, take Dramamine before the descent."
  },
  {
    "question": "Can we stop along the way from Monteverde to Manuel Antonio?",
    "answer": "Yes — common stops include Puntarenas (seafood lunch on the malecón), the Tárcoles crocodile bridge, and Jacó if you want to explore another Pacific beach town briefly. The Costanera Sur has several beach viewpoints worth a quick photo stop."
  },
  {
    "question": "Will we leave the cloud forest microclimate?",
    "answer": "Yes — dramatically. Monteverde sits at 1,400m with cool, often misty conditions (16–22°C). Within 90 minutes you''ll be at sea level in the tropical Pacific (28–32°C and humid). Bring layers and switch to beach clothes after the descent."
  }
]'::jsonb
WHERE slug = 'monteverde-to-manuel-antonio';


-- Verificá el resultado:
-- SELECT slug, jsonb_array_length(faqs) AS faq_count FROM routes WHERE faqs IS NOT NULL ORDER BY slug;
