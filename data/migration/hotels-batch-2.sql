-- =============================================================
-- Segundo batch: 35 hoteles famosos para llegar a ~53 total.
-- Pega-y-corre en Supabase SQL Editor. El ON CONFLICT DO NOTHING
-- ignora cualquier slug ya existente, así que es safe reejecutar.
-- =============================================================

INSERT INTO hotels (slug, name, area_origen, city, description, amenities) VALUES

-- ==================== PAPAGAYO PENINSULA ====================
('nekajui-ritz-carlton', 'Nekajui, A Ritz-Carlton Reserve', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'The first Ritz-Carlton Reserve in Central America, opened 2025. Ultra-luxury sanctuary on the northern tip of Papagayo Peninsula with private beach access, cliffside villas, and a 22,000 sq ft spa carved into the hillside.',
 ARRAY['Ultra-luxury','Cliffside villas','Private beach','Hillside spa','Adults sanctuary']),

('el-mangroove-papagayo', 'El Mangroove, Autograph Collection', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Adults-preferred boutique resort on Bahía Papagayo with a sleek modern design, beachfront infinity pool, and a wellness-focused vibe. Part of Marriott''s Autograph Collection.',
 ARRAY['Boutique','Adults-preferred','Infinity pool','Beachfront','Wellness']),

('secrets-papagayo', 'Secrets Papagayo Resort & Spa', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Adults-only all-inclusive resort overlooking Culebra Bay. Multiple pools, eight restaurants, and the signature Unlimited-Luxury concept by AMR Collection.',
 ARRAY['Adults only','All-inclusive','Multiple pools','8 restaurants','Spa']),

-- ==================== LA FORTUNA / ARENAL ====================
('the-royal-corin', 'The Royal Corin Thermal Water Spa & Resort', 'La Fortuna (Arenal)', 'La Fortuna',
 'Modern adults-only resort with five thermal water pools, a swim-up bar, and panoramic Arenal Volcano views from every room.',
 ARRAY['Adults only','5 thermal pools','Swim-up bar','Volcano view','Spa']),

('arenal-kioro', 'Arenal Kioro Suites & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Luxury suite-only resort with direct Arenal Volcano views, a private hot springs river, and Titokú thermal pools spread across landscaped gardens.',
 ARRAY['Suites only','Hot springs river','Volcano view','Spa','Landscaped gardens']),

('mountain-paradise', 'Hotel Mountain Paradise', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-friendly mountain lodge in the rainforest near La Fortuna, with thermal pools, on-site activities, and Arenal Volcano views.',
 ARRAY['Family-friendly','Thermal pools','Rainforest setting','Volcano view','On-site activities']),

-- ==================== MONTEVERDE ====================
('monteverde-lodge', 'Monteverde Lodge & Gardens', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Pioneer eco-lodge in Monteverde, operated by Costa Rica Expeditions since 1989. Set in 15 acres of private cloud forest gardens with a heated pool and a renowned bird-watching program.',
 ARRAY['Eco-lodge','Private gardens','Heated pool','Bird-watching','Cloud forest']),

('senda-monteverde', 'Senda Monteverde', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Boutique luxury cloud forest hotel with rainforest-immersed casitas, farm-to-table dining at Sendero restaurant, and direct access to private nature trails.',
 ARRAY['Boutique luxury','Casitas','Farm-to-table','Private trails','Cloud forest']),

('el-establo-monteverde', 'El Establo Mountain Hotel', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Family-owned resort spanning 162 acres of private cloud forest reserve. Multiple buildings with restaurant, spa, horse stables, and one of the best Gulf of Nicoya viewpoints in Monteverde.',
 ARRAY['Family-owned','Private reserve','Spa','Horse stables','Gulf views']),

('hotel-fonda-vela', 'Hotel Fonda Vela', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Mountain hotel set on 35 acres adjacent to the Monteverde Cloud Forest Reserve. Walking distance to the reserve entrance — one of the closest hotels to the park.',
 ARRAY['Adjacent to reserve','Mountain hotel','Walking to park','Restaurant','Trails']),

-- ==================== MANUEL ANTONIO ====================
('parador-resort', 'Parador Resort & Spa', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Cliff-top resort with sweeping Pacific Ocean views, multiple infinity pools, spa, and direct access to Manuel Antonio National Park trails.',
 ARRAY['Cliff-top','Ocean views','Infinity pools','Spa','Park access']),

('costa-verde-manuel-antonio', 'Hotel Costa Verde', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Quirky boutique resort famous for its 727 Fuselage Home — a converted Boeing 727 turned into a luxury suite perched on a cliffside. Multiple pools and direct beach access.',
 ARRAY['Boutique','727 Fuselage suite','Cliffside','Multiple pools','Beach access']),

('makanda-by-the-sea', 'Makanda by the Sea', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Adults-only boutique resort with private villas and studios cascading down to a secluded beach. Famous Sunspot Bar & Grill with panoramic ocean views.',
 ARRAY['Adults only','Boutique','Private villas','Secluded beach','Ocean-view dining']),

('gaia-hotel-reserve', 'Gaia Hotel & Reserve', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Luxury boutique hotel and private nature reserve in Manuel Antonio with three infinity pools, on-site naturalist guides, and a spa nestled in the rainforest.',
 ARRAY['Boutique luxury','Private reserve','3 infinity pools','Naturalist guides','Rainforest spa']),

-- ==================== TAMARINDO ====================
('capitan-suizo', 'Capitán Suizo Beachfront Boutique Hotel', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Iconic beachfront boutique hotel on the quiet south end of Tamarindo Beach. Tropical gardens, free-form pool, and arguably the best location for sunset views in town.',
 ARRAY['Beachfront','Boutique','Tropical gardens','Free-form pool','Sunset views']),

('sueno-del-mar', 'Sueño del Mar Beachfront Boutique B&B', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Romantic boutique B&B on Playa Langosta, just south of Tamarindo. Casitas with outdoor showers, salt-water pool, and direct beach access.',
 ARRAY['Boutique B&B','Beachfront','Adults vibe','Salt-water pool','Casitas']),

('jardin-del-eden', 'Hotel Jardín del Edén', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Mediterranean-style hilltop boutique hotel above Tamarindo with two infinity pools, lush gardens, and panoramic Pacific Ocean views from every room.',
 ARRAY['Mediterranean style','Hilltop','2 infinity pools','Ocean views','Gardens']),

-- ==================== NOSARA ====================
('lagarta-lodge', 'Lagarta Lodge', 'Nosara (Playa Guiones Area)', 'Nosara',
 'Luxury cliff-top eco-lodge above the Nosara River Wildlife Reserve. Award-winning architecture, infinity pool overlooking the Pacific, and farm-to-table restaurant.',
 ARRAY['Luxury eco-lodge','Cliff-top','Award-winning design','Infinity pool','Farm-to-table']),

('the-gilded-iguana', 'The Gilded Iguana Surf Hotel', 'Nosara (Playa Guiones Area)', 'Nosara',
 'Iconic surf-and-yoga hotel in Nosara walking distance from Playa Guiones. Pool with swim-up bar, restaurant, and an on-site surf and yoga school.',
 ARRAY['Surf hotel','Walking to Guiones','Swim-up bar','Surf school','Yoga school']),

('bodhi-tree-nosara', 'Bodhi Tree Yoga Resort', 'Nosara (Playa Guiones Area)', 'Nosara',
 'Wellness retreat in the hills above Nosara with daily yoga classes, plant-based dining, infinity pool, and a healing spa. A top destination for yoga retreats in CR.',
 ARRAY['Yoga retreat','Wellness','Plant-based dining','Infinity pool','Healing spa']),

-- ==================== SANTA TERESA ====================
('florblanca-resort', 'Florblanca Resort', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Beachfront luxury resort on Playa Santa Teresa with 11 private villas, spa, surf and yoga, and a world-class restaurant (Nectar). One of the most romantic stays in CR.',
 ARRAY['Beachfront luxury','11 private villas','Spa','Surf + yoga','Award-winning restaurant']),

('hotel-nantipa', 'Hotel Nantipa, A Tico Beach Experience', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Beachfront boutique hotel in Santa Teresa with bohemian-luxe design, oceanfront pool, and the signature Manzanillo restaurant by chef Andrés Madrigal.',
 ARRAY['Beachfront boutique','Oceanfront pool','Signature restaurant','Bohemian luxe','Yoga']),

('pranamar-villas', 'Pranamar Villas & Yoga Retreat', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Beachfront yoga retreat in Santa Teresa with hand-crafted villas, a salt-water lagoon pool, and daily yoga classes overlooking the ocean.',
 ARRAY['Beachfront','Yoga retreat','Salt-water lagoon pool','Hand-crafted villas','Daily yoga']),

-- ==================== PUERTO VIEJO / CARIBBEAN ====================
('le-cameleon', 'Le Cameleon Boutique Hotel', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Design-forward boutique hotel on Playa Cocles, just south of Puerto Viejo. Modern white aesthetic, beach access, and an on-site restaurant overlooking the pool.',
 ARRAY['Boutique','Design-forward','Beach access','Pool','On-site restaurant']),

('banana-azul', 'Hotel Banana Azul', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Adults-only beachfront eco-lodge in Puerto Viejo with rustic-chic rooms, swim-up pool, and a friendly Caribbean vibe.',
 ARRAY['Adults only','Beachfront','Eco-lodge','Swim-up pool','Caribbean vibe']),

('cariblue-puerto-viejo', 'Cariblue Beach & Jungle Resort', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Bungalow resort on Playa Cocles surrounded by tropical jungle. Italian-Tico ownership reflected in the on-site Cariblue Restaurant. Family-friendly with sloths often spotted in the trees.',
 ARRAY['Bungalow resort','Jungle setting','Family-friendly','Italian-Tico cuisine','Wildlife on property']),

-- ==================== DOMINICAL / UVITA ====================
('kura-design-villas', 'Kura Design Villas', 'Uvita', 'Uvita',
 'Adults-only ultra-luxury boutique with eight infinity-edge villas overlooking the Pacific in the Ballena Coast. Award-winning architecture and a single panoramic ocean-view dining experience.',
 ARRAY['Adults only','Ultra-luxury','8 villas','Infinity-edge','Ocean panorama']),

('cristal-ballena', 'Hotel Cristal Ballena', 'Uvita', 'Uvita',
 'Hillside resort above Marino Ballena National Park (whale tail beach), with infinity pool, on-site biological reserve, and ocean views from every room.',
 ARRAY['Hillside','Above whale tail beach','Infinity pool','Biological reserve','Ocean views']),

('cuna-del-angel', 'Hotel Cuna del Angel', 'Dominical (Beach Town)', 'Dominical',
 'Tranquil boutique resort halfway between Dominical and Uvita on the Costa Ballena. Pool with mountain views, on-site spa, and signature angel-themed décor.',
 ARRAY['Boutique','Costa Ballena','Mountain-view pool','Spa','Tranquil']),

-- ==================== HERRADURA / LOS SUEÑOS ====================
('los-suenos-marriott', 'Los Sueños Marriott Ocean & Golf Resort', 'Herradura (Los Sueños)', 'Herradura',
 'Beachfront Marriott resort within the Los Sueños community at Playa Herradura. Marina with sport-fishing fleet, 18-hole jungle golf course, and tropical Spanish colonial architecture.',
 ARRAY['Beachfront Marriott','Marina','18-hole golf','Sport fishing','Multiple pools']),

-- ==================== LAS CATALINAS ====================
('santarena-las-catalinas', 'Santarena Hotel', 'Las Catalinas, Guanacaste', 'Las Catalinas',
 'Boutique hotel in the car-free pedestrian town of Las Catalinas. Mediterranean-Costa Rican design with two pools, rooftop bar, and walking access to Playa Danta.',
 ARRAY['Boutique','Car-free town','2 pools','Rooftop bar','Walking to beach']),

-- ==================== FLAMINGO ====================
('margaritaville-flamingo', 'Margaritaville Beach Resort Playa Flamingo', 'Flamingo (Guanacaste)', 'Playa Flamingo',
 'Beachfront resort on Playa Flamingo with multiple pools, swim-up bars, on-site dive shop, and the only marina on the central Pacific coast of Guanacaste.',
 ARRAY['Beachfront','Multiple pools','Swim-up bars','Marina','Dive shop']),

-- ==================== PUNTA LEONA ====================
('hotel-punta-leona', 'Hotel Punta Leona', 'Punta Leona (Resort)', 'Punta Leona',
 'All-inclusive beach and rainforest resort with two Blue Flag beaches (Playa Mantas, Playa Blanca), multiple pools, and a 750-acre private nature reserve with a macaw breeding program.',
 ARRAY['All-inclusive','2 Blue Flag beaches','Private nature reserve','Macaw program','Multiple pools']),

-- ==================== PUNTA ISLITA ====================
('hotel-punta-islita', 'Hotel Punta Islita, Autograph Collection', 'Punta Islita (Hotel & Beach)', 'Punta Islita',
 'Hilltop boutique resort on a secluded Pacific beach, part of Marriott''s Autograph Collection. Famous for community-supported art programs and crescent-moon-shaped beach.',
 ARRAY['Boutique','Hilltop','Secluded beach','Autograph Collection','Community art programs']),

-- ==================== JACO ====================
('crocs-casino-jaco', 'Croc''s Casino Resort', 'Jaco', 'Jaco',
 'Beachfront full-service resort in the heart of Jaco with a casino, multiple pools, swim-up bars, and walking distance to the surf and restaurants.',
 ARRAY['Beachfront','Casino','Multiple pools','Swim-up bars','Walking to town'])
ON CONFLICT (slug) DO NOTHING;

-- Verificá total:
-- SELECT city, COUNT(*) FROM hotels GROUP BY city ORDER BY city;
