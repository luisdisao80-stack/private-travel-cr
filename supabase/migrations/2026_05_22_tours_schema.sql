-- ============================================================================
-- TOURS — La Fortuna reseller catalog
-- ----------------------------------------------------------------------------
-- We sell tours from third-party operators (initially Canoa Aventura) under
-- the Private Travel CR brand. Customer pays via Tilopay on our site at the
-- RACK price (already includes 13% IVA per the operator's rate sheet); we
-- pay the operator at NETO and keep the 25-35% commission.
--
-- Pricing model: per-person, with separate adult and child rates and a
-- per-tour kid age policy (some tours have min age, some have 0-3 free).
--
-- Bookings reuse the existing `bookings` table with `kind = 'tour'` so we
-- get a single PTCR-1450 numbering, single admin dashboard, single email
-- template.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Operator catalog
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tour_operators (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_whatsapp TEXT,
  contact_phone TEXT,
  reservations_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tour_operators (slug, name, contact_email, contact_whatsapp, contact_phone, reservations_email)
VALUES (
  'canoa-aventura',
  'Canoa Aventura',
  'reservas@canoa-aventura.com',
  '+50688271225',
  '+50624798200',
  'reservas@canoa-aventura.com'
) ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2) Tours catalog
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tours (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_es TEXT,
  category TEXT NOT NULL,  -- 'combo' | 'caminata' | 'rio' | 'wildlife' | 'nocturno'
  region TEXT NOT NULL DEFAULT 'la-fortuna',
  short_description TEXT,
  description TEXT,
  description_es TEXT,

  -- Pricing (USD, RACK, includes 13% IVA per operator rate sheet)
  adult_price NUMERIC(10,2) NOT NULL,
  child_price NUMERIC(10,2),                -- NULL when no kid rate
  child_age_min INT,                         -- e.g. 3, 4, 5
  child_age_max INT DEFAULT 11,
  child_discount_pct INT,                    -- e.g. 50, 40, 30, 25
  min_age INT,                               -- min age allowed at all
  child_policy_note TEXT,                    -- short marketing line

  -- Logistics
  duration_label TEXT NOT NULL,              -- "Full day · 7:50am–6:30pm"
  duration_hours NUMERIC(4,2),
  schedule_times JSONB DEFAULT '[]'::jsonb,  -- [{"departure":"07:50","return":"12:30"}]
  min_pax INT DEFAULT 2,
  max_pax INT,
  pickup_zone TEXT DEFAULT 'La Fortuna - Zone 1 (hotels Jardines del Arenal to Tabacón)',

  -- What's included / what to bring (bilingual JSON)
  includes JSONB DEFAULT '[]'::jsonb,        -- ["Transport","Bilingual guide","Lunch", ...]
  what_to_bring JSONB DEFAULT '[]'::jsonb,   -- ["Water bottle","Hiking shoes", ...]
  highlights JSONB DEFAULT '[]'::jsonb,      -- 3-5 selling points

  -- Media
  hero_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Operator
  operator_id BIGINT REFERENCES tour_operators(id),
  operator_tour_name TEXT,                   -- internal: "Tour Combinado | Full Day (sin termales)"
  operator_net_adult NUMERIC(10,2),          -- our cost — for margin reporting
  operator_net_child NUMERIC(10,2),

  -- Flags
  is_active BOOLEAN DEFAULT true,
  is_indexable BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  priority INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tours_active_idx ON tours(is_active);
CREATE INDEX IF NOT EXISTS tours_region_idx ON tours(region);
CREATE INDEX IF NOT EXISTS tours_priority_idx ON tours(priority DESC);
CREATE INDEX IF NOT EXISTS tours_category_idx ON tours(category);

-- ----------------------------------------------------------------------------
-- 3) Bookings table — add tour support
-- ----------------------------------------------------------------------------
-- We discriminate shuttle vs tour with `kind`. Shuttle bookings keep their
-- existing `items` cart JSON. Tour bookings populate the new columns below
-- and leave `items` as a single-element array describing the tour for the
-- email template's benefit.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'shuttle' CHECK (kind IN ('shuttle', 'tour')),
  ADD COLUMN IF NOT EXISTS tour_id BIGINT REFERENCES tours(id),
  ADD COLUMN IF NOT EXISTS tour_date DATE,
  ADD COLUMN IF NOT EXISTS tour_time TEXT,           -- "07:50"
  ADD COLUMN IF NOT EXISTS adults INT,
  ADD COLUMN IF NOT EXISTS children INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS children_ages JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS bookings_kind_idx ON bookings(kind);
CREATE INDEX IF NOT EXISTS bookings_tour_id_idx ON bookings(tour_id) WHERE tour_id IS NOT NULL;

-- ============================================================================
-- 4) SEED — 10 MVP tours for La Fortuna (2026 rates, Canoa Aventura)
-- ============================================================================

INSERT INTO tours (
  slug, name, name_es, category, region,
  short_description, description, description_es,
  adult_price, child_price, child_age_min, child_age_max, child_discount_pct, min_age, child_policy_note,
  duration_label, duration_hours, schedule_times, min_pax,
  includes, what_to_bring, highlights,
  hero_image,
  meta_title, meta_description,
  operator_id, operator_tour_name, operator_net_adult, operator_net_child,
  priority, is_featured
) VALUES

-- 1. Combination Full Day — flagship
(
  'la-fortuna-full-day-combo',
  'Arenal Full Day — Volcano Hike, La Fortuna Waterfall & Hanging Bridges',
  'Full Day La Fortuna — Volcán, Catarata y Puentes Colgantes',
  'combo', 'la-fortuna',
  'The ultimate La Fortuna day: walk ancient lava flows at Arenal Volcano, swim at the foot of the 70-meter La Fortuna Waterfall, and cross hanging bridges through the rainforest canopy — all in one guided day.',
  'Our most complete La Fortuna experience. Start at 7:50 AM with a guided hike on the El Silencio Trail (4 km / 2.5 mi) at the base of Arenal Volcano, walking through primary rainforest and ancient volcanic lava flows from the historic 1968 eruption. Visit La Fortuna Waterfall — descend to the base of the 70-meter cascade and swim in its crystal-clear pool. Enjoy a traditional Costa Rican lunch at a local restaurant. In the afternoon, walk the Mistico Hanging Bridges (3.5 km / 2 mi), crossing 6 hanging bridges and 10 metal-structure bridges at different rainforest canopy heights, where monkeys, toucans, and sloths are common sightings.',
  'Nuestra experiencia más completa de La Fortuna. Iniciamos a las 7:50 AM con una caminata guiada por el Sendero El Silencio (4 km) en la base del Volcán Arenal, atravesando bosque primario y antiguos flujos de lava de la erupción histórica de 1968. Visitamos la Catarata La Fortuna — desciende hasta la base de la cascada de 70 metros y nada en su poza cristalina. Disfruta de un almuerzo típico costarricense. En la tarde caminamos los Puentes Colgantes de Mistico (3.5 km), cruzando 6 puentes colgantes y 10 puentes metálicos a distintas alturas del dosel del bosque, donde es común avistar monos, tucanes y perezosos.',
  198, 99, 4, 11, 50, NULL, 'Children 0–3 free · 4–11 years 50% off',
  'Full day · 7:50 AM – 6:30 PM',
  10.5, '[{"departure":"07:50","return":"18:30"}]'::jsonb, 2,
  '["Round-trip transportation from your La Fortuna hotel","Bilingual naturalist guide","All park entrance fees (El Silencio, La Fortuna Waterfall, Mistico Hanging Bridges)","Traditional Costa Rican lunch","Fresh tropical fruits","Water refill","Towel"]'::jsonb,
  '["Closed hiking shoes","Comfortable clothing","Swimsuit & change of clothes","Sunscreen","Insect repellent","Water bottle","Camera"]'::jsonb,
  '["The single best way to see the 3 must-do La Fortuna attractions in one day","Includes ALL park entrance fees — no hidden costs","Local guide who tells you the story behind each place","Hotel pickup & drop-off in Zone 1"]'::jsonb,
  '/tours/arenal-full-day-combo.jpg',
  'Arenal Full Day Tour — Volcano, Waterfall & Bridges | Private Travel CR',
  'Book the ultimate La Fortuna day tour: Arenal Volcano hike, La Fortuna Waterfall swim, and Mistico Hanging Bridges. All-inclusive with lunch, transport, and bilingual guide. From $198/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Tour Combinado | Full Day (sin termales)',
  139.22, 69.61,  -- estimated net at 30% commission
  100, true
),

-- 2. Mini Combo #1
(
  'arenal-volcano-waterfall-half-day',
  'Arenal Volcano Hike + La Fortuna Waterfall + Lunch',
  'Caminata al Volcán Arenal + Catarata + Almuerzo',
  'combo', 'la-fortuna',
  'A balanced La Fortuna half-day: hike the lava trails at Arenal Volcano in the morning, swim at the base of the 70-meter La Fortuna Waterfall, then enjoy a traditional Costa Rican lunch.',
  'A 7-hour combo that hits the two most iconic La Fortuna spots without the longer Hanging Bridges add-on. Start with a 4 km guided hike on the El Silencio Trail at the base of Arenal Volcano, walking through primary rainforest and ancient volcanic lava flows. After the hike, descend the 530 steps to the base of La Fortuna Waterfall — a 70-meter cascade you can swim in. Wrap up with a traditional Costa Rican lunch at a local restaurant before your hotel drop-off.',
  'Un combo de 7 horas que cubre los dos lugares más icónicos de La Fortuna sin la caminata más larga de Puentes Colgantes. Inicia con una caminata guiada de 4 km por el Sendero El Silencio en la base del Volcán Arenal, atravesando bosque primario y antiguos flujos de lava. Después de la caminata, desciende los 530 escalones hasta la base de la Catarata La Fortuna — una cascada de 70 metros donde puedes nadar. Cierra con un almuerzo típico costarricense.',
  152, 76, 4, 11, 50, NULL, 'Children 0–3 free · 4–11 years 50% off',
  'Half day · 7:50 AM – 2:30 PM',
  6.5, '[{"departure":"07:50","return":"14:30"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","El Silencio trail entrance","La Fortuna Waterfall entrance","Traditional Costa Rican lunch","Fresh tropical fruits","Water refill","Towel"]'::jsonb,
  '["Closed hiking shoes","Comfortable clothing","Swimsuit","Sunscreen","Insect repellent","Water bottle"]'::jsonb,
  '["The 2 La Fortuna must-dos in half a day — perfect for tight schedules","Includes the 530-step waterfall descent (cardio bonus)","Lunch + entrance fees + transport, no extras","Free for kids under 4"]'::jsonb,
  '/tours/arenal-volcano-waterfall.jpg',
  'Arenal Volcano + La Fortuna Waterfall Tour with Lunch | Private Travel CR',
  'Hike Arenal Volcano lava trails, swim at La Fortuna Waterfall, and enjoy a Costa Rican lunch — all in one half-day. Free hotel pickup. From $152/adult, kids 50% off.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Mini Combo #1',
  106.79, 53.40,
  90, true
),

-- 3. Mini Combo #2
(
  'arenal-hanging-bridges-waterfall-combo',
  'Mistico Hanging Bridges + La Fortuna Waterfall + Lunch',
  'Puentes Colgantes + Catarata + Almuerzo',
  'combo', 'la-fortuna',
  'A softer alternative to the volcano hike: walk the Mistico Hanging Bridges through the canopy, then swim at La Fortuna Waterfall, with lunch included.',
  'Perfect for travelers who want the rainforest experience without the volcano hike. Walk the 3.5 km Mistico Hanging Bridges trail crossing 6 hanging bridges and 10 metal-structure bridges at different canopy heights, where you can spot monkeys, toucans, sloths, and tree frogs. Then visit La Fortuna Waterfall — descend the 530 steps to the base and swim in its 70-meter cascade pool. Finish with a traditional Costa Rican lunch.',
  'Perfecto para viajeros que quieren la experiencia del bosque sin la caminata del volcán. Recorre 3.5 km en los Puentes Colgantes de Mistico, cruzando 6 puentes colgantes y 10 metálicos a distintas alturas del dosel, donde puedes ver monos, tucanes, perezosos y ranas. Luego visita la Catarata La Fortuna — baja los 530 escalones y nada en la poza de 70 metros. Cierra con almuerzo típico.',
  159, 79, 4, 11, 50, NULL, 'Children 0–3 free · 4–11 years 50% off',
  'Half day · 7:50 AM – 3:00 PM',
  7, '[{"departure":"07:50","return":"15:00"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","Mistico Hanging Bridges entrance","La Fortuna Waterfall entrance","Traditional Costa Rican lunch","Fresh tropical fruits","Water refill","Towel"]'::jsonb,
  '["Closed hiking shoes","Comfortable clothing","Swimsuit","Sunscreen","Insect repellent","Water bottle","Camera"]'::jsonb,
  '["Easier than the volcano hike — great for families & casual hikers","Best wildlife viewing in La Fortuna (monkeys, sloths, frogs)","Includes the iconic 70m waterfall swim","Free for kids under 4"]'::jsonb,
  '/tours/hanging-bridges-waterfall.jpg',
  'Hanging Bridges + La Fortuna Waterfall + Lunch | Private Travel CR',
  'Walk the Mistico Hanging Bridges through the rainforest canopy, swim at La Fortuna Waterfall, and enjoy lunch — perfect family-friendly combo. From $159/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Mini Combo #2',
  111.53, 55.77,
  85, true
),

-- 4. Río Celeste Hike
(
  'rio-celeste-hike-tenorio',
  'Río Celeste Waterfall Hike — Tenorio Volcano National Park',
  'Caminata al Río Celeste — Parque Nacional Volcán Tenorio',
  'caminata', 'la-fortuna',
  'Hike to the legendary turquoise-blue Río Celeste waterfall inside Tenorio Volcano National Park — the most photographed natural wonder in Costa Rica.',
  'A 6 km (3.7 mi) guided hike through Tenorio Volcano National Park to the impossibly turquoise-blue Río Celeste Waterfall — the most photographed natural wonder in Costa Rica. The blue color is the result of a unique mineral reaction where two crystalline streams meet. Along the trail you''ll see "Los Borbollones" (sulfur bubbles rising from the riverbed), "Los Teñideros" (the exact point where the two streams join and turn turquoise), and the lookout over the waterfall. Lunch at a local restaurant included.',
  'Caminata guiada de 6 km por el Parque Nacional Volcán Tenorio hasta la imposiblemente turquesa Catarata Río Celeste — la maravilla natural más fotografiada de Costa Rica. El color azul es producto de una reacción mineral única donde se unen dos arroyos cristalinos. En el sendero verás "Los Borbollones" (burbujas de azufre saliendo del río), "Los Teñideros" (el punto exacto donde los dos ríos se unen y se vuelven turquesas), y el mirador sobre la catarata. Almuerzo en restaurante local incluido.',
  140, 105, 5, 11, 25, 5, 'Minimum age 5 · 5–11 years 25% off',
  'Full day · 7:50 AM – 3:30 PM',
  7.5, '[{"departure":"07:50","return":"15:30"}]'::jsonb, 2,
  '["Round-trip transportation (2.5h each way)","Bilingual naturalist guide","Tenorio Volcano National Park entrance","Traditional Costa Rican lunch","Water refill"]'::jsonb,
  '["Hiking shoes (essential — trail can be muddy)","Long pants","Insect repellent","Sunscreen","Rain jacket","Change of clothes","Water bottle","Camera"]'::jsonb,
  '["The most photographed waterfall in Costa Rica","Visit Los Borbollones (sulfur bubbles) and Los Teñideros (the exact point the river turns blue)","Hike inside a national park with virtually guaranteed wildlife sightings","Pack a small backpack — there are no shops inside the park"]'::jsonb,
  '/tours/rio-celeste-waterfall.jpg',
  'Río Celeste Waterfall Tour from La Fortuna | Private Travel CR',
  'Hike to the turquoise-blue Río Celeste Waterfall in Tenorio Volcano National Park. Full-day guided tour from La Fortuna with lunch & transport. From $140/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Río Celeste Hike',
  98.08, 73.56,
  95, true
),

-- 5. Hanging Bridges (standalone)
(
  'mistico-hanging-bridges',
  'Mistico Arenal Hanging Bridges',
  'Puentes Colgantes Mistico',
  'caminata', 'la-fortuna',
  'Walk through the rainforest canopy on 6 hanging bridges and 10 metal bridges at different heights, with stunning views of Arenal Volcano.',
  'A 3.5 km (2 mi) guided trail through the primary rainforest at Mistico Arenal Hanging Bridges Park. You''ll cross 6 spectacular hanging bridges and 10 metal-structure bridges at different heights — from ground level all the way up to the rainforest canopy. The constant elevation changes give you unique perspectives on Arenal Volcano and the chance to spot mammals, birds, snakes, insects, and spiders that inhabit different forest layers. The tour ends with a tropical fruit tasting.',
  'Sendero guiado de 3.5 km por el bosque primario en Mistico Arenal Hanging Bridges Park. Cruzarás 6 espectaculares puentes colgantes y 10 puentes de estructura metálica a distintas alturas — desde el nivel del suelo hasta el dosel del bosque. Los cambios constantes de altura te dan perspectivas únicas del Volcán Arenal y oportunidades de avistar mamíferos, aves, serpientes, insectos y arañas que habitan en distintas capas del bosque. El tour termina con una degustación de frutas tropicales.',
  85, 42, 4, 11, 50, NULL, 'Children 0–3 free · 4–11 years 50% off',
  'Half day · multiple departures',
  3.5, '[{"departure":"07:50","return":"11:20"},{"departure":"12:30","return":"16:00"},{"departure":"14:30","return":"18:00"},{"departure":"06:00","return":"09:30"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","Mistico Hanging Bridges entrance","Fresh tropical fruits","Water refill"]'::jsonb,
  '["Closed hiking shoes","Hat","Comfortable clothing","Sunscreen","Binoculars","Insect repellent"]'::jsonb,
  '["The most family-friendly trail in La Fortuna","Stunning Arenal Volcano views from the canopy","High chance of seeing sloths, monkeys, and tree frogs","Choose morning, midday, afternoon, or sunrise departure"]'::jsonb,
  '/tours/mistico-hanging-bridges.jpg',
  'Mistico Hanging Bridges Tour from La Fortuna | Private Travel CR',
  'Walk through Costa Rican rainforest on 16 bridges with stunning Arenal Volcano views. 3.5 km guided trail. Free hotel pickup. From $85/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Puentes Colgantes',
  59.50, 29.40,
  80, false
),

-- 6. Arenal Volcano El Silencio
(
  'arenal-volcano-el-silencio',
  'Arenal Volcano Hike — El Silencio Trail',
  'Caminata al Volcán Arenal — Sendero El Silencio',
  'caminata', 'la-fortuna',
  'Walk ancient volcanic lava flows from the 1968 Arenal eruption on a 4 km guided trail through primary rainforest with stunning volcano views.',
  'The El Silencio Trail is the best way to get up close to Arenal Volcano. This 4 km (2.5 mi) guided hike starts in primary rainforest filled with giant trees and abundant wildlife, then opens out onto ancient volcanic lava flows from the historic 1968 eruption that completely transformed life in the region. Your bilingual naturalist guide will share the story of the volcano''s geological formation, its different stages of activity, and details of the 1968 disaster. The trail ends with stunning views of a green lagoon and Lake Arenal, and a tropical fruit tasting.',
  'El Sendero El Silencio es la mejor forma de acercarse al Volcán Arenal. Esta caminata guiada de 4 km inicia en bosque primario lleno de árboles gigantes y fauna abundante, luego se abre hacia antiguos flujos de lava volcánica de la erupción histórica de 1968. Tu guía naturalista bilingüe compartirá la historia geológica del volcán, las distintas etapas de su actividad, y detalles del desastre de 1968. El sendero termina con vistas espectaculares de una laguna verde y el Lago Arenal, y una degustación de frutas tropicales.',
  77, 38, 4, 11, 50, NULL, 'Children 0–3 free · 4–11 years 50% off',
  'Half day · multiple departures',
  3.5, '[{"departure":"07:50","return":"11:30"},{"departure":"14:30","return":"18:00"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","El Silencio trail entrance","Fresh tropical fruits","Water refill"]'::jsonb,
  '["Closed hiking shoes","Hat","Comfortable clothing","Sunscreen","Binoculars","Insect repellent"]'::jsonb,
  '["Walk on real 1968 lava flows — geological history under your feet","The best Arenal Volcano viewpoint in the area","Easy 4 km trail — accessible to most fitness levels","Morning or afternoon departure"]'::jsonb,
  '/tours/arenal-volcano-hike.jpg',
  'Arenal Volcano Hike Tour — El Silencio Trail | Private Travel CR',
  'Hike 4 km on ancient lava flows from the 1968 Arenal eruption. Bilingual guide, transport, and park entrance included. From $77/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Volcán Arenal - El Silencio',
  53.90, 26.95,
  75, false
),

-- 7. Safari Float Peñas Blancas (raft)
(
  'safari-float-penas-blancas',
  'Safari Float — Peñas Blancas River by Raft',
  'Safari Float — Río Peñas Blancas en Balsa',
  'rio', 'la-fortuna',
  'A peaceful half-day float down the Peñas Blancas River spotting sloths, monkeys, toucans, and crocodiles — ending with a homemade Costa Rican snack at "Tita Yolanda".',
  'A relaxing half-day wildlife float guided by a bilingual naturalist. Just 25 minutes from La Fortuna, you''ll embark on a peaceful 10 km (6.2 mi) journey down the Peñas Blancas River, where lush tropical flora and diverse wildlife take center stage. You''ll have the chance to spot sloths, howler monkeys, white-faced monkeys, toucans, crocodiles, iguanas, turtles, and many tropical birds. At the end of the tour, enjoy a homemade traditional Costa Rican snack at "Tita Yolanda" — tortillas, ripe plantain, fresh cheese, freshly brewed coffee — plus a brief look at traditional chocolate-making and sugarcane juice preparation with tastings.',
  'Float relajante de medio día guiado por un naturalista bilingüe. A solo 25 minutos de La Fortuna, te embarcarás en una tranquila travesía de 10 km por el río Peñas Blancas, donde la exuberante flora y fauna tropical son las protagonistas. Podrás avistar perezosos, monos congos, monos cariblancos, tucanes, cocodrilos, iguanas, tortugas y muchas aves tropicales. Al finalizar, disfruta de un refrigerio típico costarricense en casa de "Tita Yolanda" — tortillas, plátano maduro, queso fresco, café recién hecho — más un recorrido por el proceso artesanal del chocolate y la caña de azúcar con degustación.',
  83, 49, 3, 11, 40, 3, 'Minimum age 3 · 3–11 years 40% off',
  'Half day · multiple departures',
  4, '[{"departure":"07:50","return":"11:50"},{"departure":"12:30","return":"16:30"},{"departure":"13:50","return":"17:50"},{"departure":"06:30","return":"10:30"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","Inflatable raft & life jacket","Homemade Costa Rican snack","Coffee, chocolate & sugarcane tasting","Water refill"]'::jsonb,
  '["Water shoes or sandals","Sunscreen","Insect repellent","Change of clothes","Hat","Binoculars","Camera"]'::jsonb,
  '["The most kid-friendly wildlife tour in La Fortuna","Almost guaranteed sloth sightings (60+ live in the area)","Authentic Tita Yolanda farmhouse snack — real local culture","Inflatable raft, no paddling experience required"]'::jsonb,
  '/tours/safari-float-penas-blancas.jpg',
  'Safari Float Wildlife Tour — Peñas Blancas River | Private Travel CR',
  'Spot sloths, monkeys, and tropical birds on a peaceful 4-hour float down the Peñas Blancas River. Snack at Tita Yolanda''s farmhouse included. From $83/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Safari float en Balsa',
  53.95, 31.85,
  70, false
),

-- 8. Caño Negro
(
  'cano-negro-wildlife-refuge',
  'Caño Negro Wildlife Refuge Boat Tour',
  'Refugio de Vida Silvestre Caño Negro',
  'wildlife', 'la-fortuna',
  'Boat tour through the Caño Negro Wildlife Refuge on the Río Frío — exotic birds, howler monkeys, iguanas, and caimans guaranteed. Includes traditional lunch and chocolate tasting.',
  'A full-day wildlife adventure to one of Costa Rica''s most biodiverse spots. The journey begins with a scenic drive through rural San Carlos and Los Chiles landscapes, leading to the ''El Caimán'' restaurant where the adventure starts with a refreshing snack and a 2-hour boat tour along the Río Frío inside the Caño Negro Wildlife Refuge. Nature will amaze you at every turn: exotic birds flying overhead, howler and white-faced monkeys moving through the trees, iguanas basking in the sun, and caimans resting along the shore. If you''re lucky, you''ll spot the rare orange howler monkey, a hidden gem of Caño Negro. Lunch and a brief sugarcane and cacao cultural lesson included.',
  'Aventura de día completo en uno de los lugares más biodiversos de Costa Rica. El recorrido inicia con un drive escénico por los paisajes rurales de San Carlos y Los Chiles, hasta llegar al restaurante ''El Caimán'' donde la aventura empieza con un refrigerio y un tour en bote de 2 horas por el Río Frío dentro del Refugio de Vida Silvestre Caño Negro. La naturaleza te sorprenderá a cada momento: aves exóticas, monos congos y cariblancos en los árboles, iguanas al sol, y caimanes descansando en la orilla. Con suerte verás el raro mono congo naranja, una joya escondida de Caño Negro. Almuerzo y breve experiencia cultural de caña de azúcar y cacao incluida.',
  96, 67, 4, 11, 30, NULL, 'Children 0–3 free · 4–11 years 30% off',
  'Full day · 7:15 AM – 3:00 PM',
  7.75, '[{"departure":"07:15","return":"15:00"}]'::jsonb, 2,
  '["Round-trip transportation (1.5h each way)","Bilingual naturalist guide","Coffee break","2-hour boat tour through the wildlife refuge","Traditional Costa Rican lunch","Chocolate & sugarcane tasting","Water refill"]'::jsonb,
  '["Hat","Sunscreen","Insect repellent","Binoculars","Comfortable clothing","Camera"]'::jsonb,
  '["Costa Rica''s second-most biodiverse spot (after Corcovado)","Best chance to see the rare orange howler monkey","Calm boat ride — perfect for seniors and kids","Lunch + cultural experience included"]'::jsonb,
  '/tours/cano-negro-wildlife.jpg',
  'Caño Negro Wildlife Refuge Tour from La Fortuna | Private Travel CR',
  'Boat through Caño Negro Wildlife Refuge spotting monkeys, caimans, iguanas, and 300+ bird species. Full day with lunch from La Fortuna. From $96/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Unique Caño Negro | Opcion 1',
  67.20, 47.04,
  78, false
),

-- 9. Combo Twilight (Sloth + Night Walk)
(
  'twilight-sloth-night-walk',
  'Twilight Tour — Sloth Watching + Night Wildlife Walk',
  'Tour Twilight — Observación de Perezosos + Caminata Nocturna',
  'nocturno', 'la-fortuna',
  'Sunset sloth-watching hike followed by a guided night walk to spot frogs, snakes, and other nocturnal wildlife — the perfect afternoon-into-evening combo.',
  'Discover the magic of La Fortuna wildlife at sunset. The tour begins at 3:40 PM with a guided hike through natural trails to find one of Costa Rica''s most charismatic animals — the sloth — in the golden light of late afternoon. Enjoy a snack to recharge. Then we continue with a night walk through a natural environment specially designed for the observation of frogs, insects, reptiles, and other nocturnal creatures. With flashlight in hand and expert guides, you''ll discover the incredible biodiversity that comes to life when night falls. Perfect for travelers looking for a different La Fortuna experience.',
  'Descubre la magia de la fauna de La Fortuna al atardecer. El tour inicia a las 3:40 PM con una caminata guiada por senderos naturales para buscar uno de los animales más carismáticos de Costa Rica — el perezoso — bajo la luz dorada de la tarde. Disfruta un snack para recargar. Luego continuamos con una caminata nocturna en un entorno natural especialmente diseñado para observar ranas, insectos, reptiles y otras criaturas nocturnas. Con linterna en mano y guías expertos descubrirás la increíble biodiversidad que cobra vida cuando cae la noche. Perfecto para viajeros buscando una experiencia distinta en La Fortuna.',
  139, 83, 6, 11, 40, 5, 'Minimum age 5 · 6–11 years 40% off',
  'Sunset-to-night · 3:40 PM – 7:40 PM',
  4, '[{"departure":"15:40","return":"19:40"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist guide","Snack","Beverages","Flashlight (provided)","Water refill"]'::jsonb,
  '["Long pants","Comfortable closed shoes","Insect repellent","Binoculars","Light jacket","Water bottle"]'::jsonb,
  '["Two distinct experiences (day + night) in one tour","Best time of day for sloth photography (golden hour)","Spot wildlife you''d never see during the day — red-eyed tree frogs, snakes, kinkajous","Flashlights provided"]'::jsonb,
  '/tours/twilight-sloth-night-walk.jpg',
  'Twilight Tour — Sloth & Night Wildlife Walk | Private Travel CR',
  'Sunset sloth hike + guided night walk to see frogs, snakes, and nocturnal wildlife in La Fortuna. Flashlights provided. From $139/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Combo Twilight',
  97.30, 58.10,
  65, false
),

-- 10. Rafting Sarapiquí II-III
(
  'rafting-sarapiqui-class-ii-iii',
  'White Water Rafting — Sarapiquí River (Class II–III)',
  'Rafting Río Sarapiquí (Clase II–III)',
  'rio', 'la-fortuna',
  'A 13 km white-water rafting descent down the crystal-clear Sarapiquí River with Class II–III rapids — adventure for the whole family aged 7+.',
  'Get ready for an unforgettable experience full of excitement, nature, and fun as you paddle through the crystal-clear waters of the majestic Sarapiquí River. From La Fortuna we''ll head to this tropical paradise. Upon arrival, expert guides provide a complete safety briefing and equipment instructions. The descent covers 13 km (8 mi) navigating thrilling Class II–III rapids and calm stretches that let you admire the lush flora and wildlife surrounding you. We''ll make a special stop to taste delicious tropical fruits from the region. The aquatic adventure ends with a traditional Costa Rican lunch at a local restaurant. Perfect for the whole family aged 7 and up.',
  'Prepárate para vivir una experiencia llena de emociones, naturaleza y diversión mientras recorres las cristalinas aguas del majestuoso río Sarapiquí. Desde La Fortuna nos dirigiremos a este paraíso tropical. Al llegar, guías expertos te darán una completa charla de seguridad e instrucciones del equipo. El descenso cubre 13 km navegando emocionantes rápidos Clase II–III y tramos de aguas tranquilas que te permiten admirar la flora y fauna del lugar. Haremos una parada para degustar frutas tropicales de la zona. La aventura acuática termina con un almuerzo tradicional costarricense. Perfecto para toda la familia desde 7 años.',
  105, NULL, NULL, NULL, NULL, 7, 'Minimum age 7 · no kids discount',
  'Full day · 8:30 AM – 3:30 PM',
  7, '[{"departure":"08:30","return":"15:30"},{"departure":"07:50","return":"14:45"}]'::jsonb, 2,
  '["Round-trip transportation","Bilingual naturalist & adventure guide","All rafting equipment (raft, life jacket, paddle, helmet)","Towel","Fresh tropical fruits","Traditional Costa Rican lunch","Juice or beer","Water refill"]'::jsonb,
  '["Water shoes or sandals with strap","Swimsuit under comfortable clothing","Sunscreen","Change of clothes","Towel","Insect repellent","No phones/cameras in the raft (waterproof bag recommended)"]'::jsonb,
  '["13 km of Class II–III white water — exciting but not extreme","Family-friendly from age 7","All equipment + safety briefing included","Lunch + tropical fruit stop included"]'::jsonb,
  '/tours/rafting-sarapiqui.jpg',
  'White Water Rafting Sarapiquí Class II-III | Private Travel CR',
  'Family-friendly 13 km Class II-III white water rafting on the Sarapiquí River. From La Fortuna. All equipment & lunch included. From $105/adult.',
  (SELECT id FROM tour_operators WHERE slug = 'canoa-aventura'),
  'Rafting II-III Sarapiquí',
  68.25, NULL,
  60, false
)

ON CONFLICT (slug) DO NOTHING;
