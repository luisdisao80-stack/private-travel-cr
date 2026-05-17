-- =============================================================
-- Batch 3: 83 hoteles populares por zona (lista del cliente).
-- Llega a 136 hoteles totales tras este insert.
-- ON CONFLICT DO NOTHING — safe to re-run.
-- =============================================================

INSERT INTO hotels (slug, name, area_origen, city, description, amenities) VALUES

-- ==================== LA FORTUNA / ARENAL (17) ====================
('casa-del-rio-arenal', 'Hotel Casa del Río', 'La Fortuna (Arenal)', 'La Fortuna',
 'Boutique riverside hotel in La Fortuna with cozy rooms, garden pool, and easy access to Arenal Volcano attractions.',
 ARRAY['Boutique','Riverside','Pool','Garden','Volcano area']),

('noahs-forest', 'Noah''s Forest Hotel', 'La Fortuna (Arenal)', 'La Fortuna',
 'Rainforest hotel near La Fortuna surrounded by native trees and wildlife. Private balconies, on-site nature trails, and proximity to Arenal Volcano.',
 ARRAY['Rainforest','Wildlife','Nature trails','Balconies','Volcano area']),

('tifakara-boutique', 'Tifakara Boutique Hotel & Birding Oasis', 'La Fortuna (Arenal)', 'La Fortuna',
 'Small boutique hotel and birding oasis in La Fortuna with lagoon views, pool, and on-site birdwatching trails for nature enthusiasts.',
 ARRAY['Boutique','Birding','Lagoon views','Pool','Nature']),

('magic-mountain-arenal', 'Hotel Magic Mountain La Fortuna', 'La Fortuna (Arenal)', 'La Fortuna',
 'Hilltop hotel above La Fortuna with panoramic Arenal Volcano views from every room, infinity pool, and on-site restaurant.',
 ARRAY['Hilltop','Volcano panorama','Infinity pool','Restaurant','Family-friendly']),

('la-pradera-arenal', 'Hotel La Pradera del Arenal', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-friendly mid-range hotel in La Fortuna with pool, gardens, and easy walking distance to the town center.',
 ARRAY['Family-friendly','Pool','Gardens','Walk to town','Restaurant']),

('baldi-hot-springs', 'Baldi Hot Springs Hotel Resort & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Costa Rica''s largest hot springs resort with 25 thermal pools, multiple water slides, spa, and on-site restaurants.',
 ARRAY['25 hot springs pools','Water slides','Spa','All-inclusive available','Family-friendly']),

('los-lagos-arenal', 'Hotel Los Lagos Resort', 'La Fortuna (Arenal)', 'La Fortuna',
 'Resort with thermal hot springs, on-site frog and butterfly gardens, water slides, and direct Arenal Volcano views.',
 ARRAY['Hot springs','Water slides','Frog & butterfly gardens','Volcano view','Family-friendly']),

('volcano-inn', 'Hotel Volcano Inn', 'La Fortuna (Arenal)', 'La Fortuna',
 'Boutique inn at the foot of Arenal Volcano with private bungalows, pool, and personalized service.',
 ARRAY['Boutique','Bungalows','Pool','Personalized service','Volcano area']),

('volcano-lodge-arenal', 'Volcano Lodge Hotel & Thermal Experience', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-owned resort with thermal pools, spa, panoramic volcano views from rooms, and on-site wildlife observation areas.',
 ARRAY['Thermal pools','Spa','Volcano view','Family-owned','Wildlife']),

('arenal-manoa', 'Arenal Manoa Hotel & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Adults-friendly resort with hot springs, spa, infinity pool, and unobstructed Arenal Volcano views from every villa.',
 ARRAY['Hot springs','Spa','Infinity pool','Volcano view','Villas']),

('nayara-gardens', 'Nayara Gardens', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-friendly sister property of Nayara Springs, in the same rainforest setting. Casitas with outdoor showers, multiple pools, and access to all Nayara amenities.',
 ARRAY['Family-friendly','Casitas','Multiple pools','Nayara amenities','Rainforest']),

('nayara-tented-camp', 'Nayara Tented Camp', 'La Fortuna (Arenal)', 'La Fortuna',
 'Africa-meets-Costa-Rica adults-only safari-style luxury tented camp at Nayara Resort. Private hot springs plunge pools and panoramic volcano views.',
 ARRAY['Luxury safari tents','Adults only','Private plunge pools','Volcano view','Nayara amenities']),

('roca-negra-arenal', 'Roca Negra del Arenal Hotel', 'La Fortuna (Arenal)', 'La Fortuna',
 'Mid-range hotel in La Fortuna surrounded by volcanic black rock formations, with pool, restaurant, and Arenal Volcano vistas.',
 ARRAY['Black rock setting','Pool','Restaurant','Volcano view','Family-friendly']),

('lavas-tacotal', 'Hotel Lavas Tacotal', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-run hotel on the lava flow plains of Arenal with bungalow accommodations, pool, and direct volcano views.',
 ARRAY['Family-run','Bungalows','Pool','Volcano view','Lava flow plains']),

('montana-de-fuego', 'Hotel Montaña de Fuego Resort & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Classic Arenal resort with hot springs spa, multiple pools, on-site restaurants, and bungalow-style rooms with volcano views.',
 ARRAY['Hot springs spa','Multiple pools','Bungalows','Volcano view','Restaurants']),

('arenal-paraiso', 'Arenal Paraíso Resort Spa & Thermo Mineral Hot Springs', 'La Fortuna (Arenal)', 'La Fortuna',
 'Sprawling resort with 13 thermal mineral hot springs pools, spa, multiple restaurants, and unobstructed Arenal Volcano views.',
 ARRAY['13 thermal pools','Spa','Multiple restaurants','Volcano view','All-inclusive available']),

('amor-arenal', 'Amor Arenal Hotel', 'La Fortuna (Arenal)', 'La Fortuna',
 'Adults-only luxury boutique resort with private hot springs plunge pools in each villa, spa, and gourmet dining surrounded by rainforest.',
 ARRAY['Adults only','Luxury','Private plunge pools','Spa','Gourmet dining']),

-- ==================== PAPAGAYO (3) ====================
('planet-hollywood-papagayo', 'Planet Hollywood Costa Rica by Royalton', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Large all-inclusive resort at Papagayo with movie-memorabilia theme, multiple pools, kids and teen clubs, swim-up bars, and beachfront access.',
 ARRAY['All-inclusive','Themed resort','Multiple pools','Kids & teen clubs','Beachfront']),

('occidental-papagayo', 'Occidental Papagayo', 'Papagayo Peninsula, Guanacaste', 'Playa Panamá',
 'Adults-only all-inclusive resort at Playa Panamá by Barceló. Pools, swim-up bars, multiple restaurants, and private beach access.',
 ARRAY['Adults only','All-inclusive','Swim-up bars','Multiple restaurants','Private beach']),

('papagayo-golden-palms', 'Papagayo Golden Palms', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Beachfront resort overlooking the Gulf of Papagayo with multiple pools, on-site spa, and family-friendly amenities.',
 ARRAY['Beachfront','Multiple pools','Spa','Family-friendly','All-inclusive available']),

-- ==================== PLAYA HERMOSA (4) ====================
('waldorf-astoria-punta-cacique', 'Waldorf Astoria Costa Rica Punta Cacique', 'Playa Hermosa (Guanacaste)', 'Punta Cacique',
 'Ultra-luxury resort opened 2025 on the Punta Cacique peninsula between Hermosa and Panamá beaches. Private cliffside villas, multiple infinity pools, and a signature spa.',
 ARRAY['Ultra-luxury','Cliffside villas','Multiple infinity pools','Spa','New 2025']),

('bosque-del-mar-hermosa', 'Hotel Bosque del Mar', 'Playa Hermosa (Guanacaste)', 'Playa Hermosa',
 'Boutique beachfront hotel at the quiet south end of Playa Hermosa with adults-only Eco-Hostel concept, pool, and oceanfront restaurant.',
 ARRAY['Boutique','Beachfront','Adults-friendly','Pool','Oceanfront restaurant']),

('casa-conde-hermosa', 'Casa Conde Beach Front Hotel', 'Playa Hermosa (Guanacaste)', 'Playa Hermosa',
 'Family-friendly beachfront hotel on Playa Hermosa with multiple pools, kids area, and oceanfront restaurant.',
 ARRAY['Beachfront','Family-friendly','Multiple pools','Kids area','Restaurant']),

('villas-sol-hermosa', 'Villas Sol Beach Resort', 'Playa Hermosa (Guanacaste)', 'Playa Hermosa',
 'Hillside all-inclusive resort above Playa Hermosa with bay views, multiple pools, and private villa accommodations.',
 ARRAY['All-inclusive','Hillside','Bay views','Multiple pools','Villas']),

-- ==================== PLAYAS DEL COCO (1) ====================
('pacifico-beach-club-coco', 'Pacifico Beach Club', 'Playas del Coco (Guanacaste)', 'Playas del Coco',
 'Private beach club and residential community at Playas del Coco with beachfront pool, restaurant, and luxury condo rentals available.',
 ARRAY['Beach club','Beachfront pool','Restaurant','Luxury condos','Private community']),

-- ==================== LAS CATALINAS (1) ====================
('casa-chameleon-las-catalinas', 'Casa Chameleon at Las Catalinas', 'Las Catalinas, Guanacaste', 'Las Catalinas',
 'Adults-only boutique resort within the car-free pedestrian town of Las Catalinas. Private plunge pools in every villa, panoramic ocean views, and chef-driven dining at Sentido Norte.',
 ARRAY['Adults only','Boutique','Private plunge pools','Ocean views','Chef dining']),

-- ==================== PLAYA POTRERO (1) ====================
('bahia-del-sol-potrero', 'Hotel Bahía del Sol', 'Playa Potrero (Guanacaste)', 'Playa Potrero',
 'Beachfront boutique hotel at Playa Potrero with tropical gardens, oceanfront pool, and on-site restaurant. Quiet alternative to busier Flamingo.',
 ARRAY['Beachfront','Boutique','Tropical gardens','Oceanfront pool','Restaurant']),

-- ==================== FLAMINGO (3) ====================
('flamingo-beach-resort', 'Flamingo Beach Resort & Spa', 'Flamingo (Guanacaste)', 'Playa Flamingo',
 'Beachfront resort directly on Playa Flamingo with multiple pools, swim-up bar, spa, and walking distance to the marina and restaurants.',
 ARRAY['Beachfront','Multiple pools','Swim-up bar','Spa','Marina area']),

('360-splendor-flamingo', '360 Splendor Ocean View', 'Flamingo (Guanacaste)', 'Playa Flamingo',
 'Hilltop boutique B&B above Flamingo with 360-degree panoramic ocean views, infinity pool, and personalized hospitality.',
 ARRAY['Boutique B&B','Hilltop','360 ocean views','Infinity pool','Personalized service']),

('the-palms-flamingo', 'The Palms Private Residence Club', 'Flamingo (Guanacaste)', 'Playa Flamingo',
 'Private residence club at Flamingo with luxury condo accommodations, beach club access, multiple pools, and concierge service.',
 ARRAY['Private residence club','Luxury condos','Beach club','Multiple pools','Concierge']),

-- ==================== MANUEL ANTONIO (4) ====================
('shana-by-the-beach', 'Shana By The Beach', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Resort steps from Manuel Antonio National Park entrance with three pools, spa, multiple restaurants, and access to the beach.',
 ARRAY['Near park entrance','3 pools','Spa','Multiple restaurants','Beach access']),

('hotel-san-bada', 'Hotel San Bada Resort & Spa', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Resort directly across from Manuel Antonio National Park entrance with rooftop pool, spa, and Pacific Ocean views.',
 ARRAY['Across from park','Rooftop pool','Spa','Ocean views','Restaurant']),

('la-mariposa-manuel-antonio', 'La Mariposa Hotel', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Iconic hilltop hotel with arguably the best Pacific Ocean views in Manuel Antonio. Multiple pools, sunset cocktail bar, and ocean-view dining.',
 ARRAY['Hilltop','Iconic views','Multiple pools','Sunset bar','Ocean-view dining']),

('the-falls-manuel-antonio', 'The Falls Resort at Manuel Antonio', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Boutique resort centrally located between Manuel Antonio town and the national park, with multiple pools and on-site spa.',
 ARRAY['Boutique','Central location','Multiple pools','Spa','Restaurant']),

-- ==================== MONTEVERDE (7) ====================
('poco-a-poco-monteverde', 'Hotel Poco a Poco', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Family-owned hotel in Santa Elena with heated pool, on-site spa, kids playroom, and warm Costa Rican hospitality.',
 ARRAY['Family-owned','Heated pool','Spa','Kids playroom','Family-friendly']),

('koora-monteverde', 'Koora Hotel', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Modern luxury boutique cloud forest hotel with sleek design, on-site nature trails, and floor-to-ceiling windows looking into the forest.',
 ARRAY['Modern luxury','Boutique','Cloud forest','Nature trails','Forest windows']),

('tropico-monteverde', 'Hotel Trópico Monteverde', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Boutique mountain hotel in Monteverde with panoramic Gulf of Nicoya views from each room, restaurant, and tranquil garden setting.',
 ARRAY['Boutique','Mountain hotel','Gulf views','Restaurant','Gardens']),

('hidden-canopy-treehouses', 'Hidden Canopy Treehouses', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Unique luxury treehouses suspended in the Monteverde cloud forest canopy. Adults-only, with hand-crafted wood construction and elevated forest views.',
 ARRAY['Treehouses','Adults only','Cloud forest canopy','Hand-crafted','Unique stay']),

('hotel-con-corazon-monteverde', 'Hotel con Corazón', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Social-impact boutique hotel that reinvests profits into local Monteverde youth education. Comfortable rooms, on-site restaurant, walking distance to town.',
 ARRAY['Social impact','Boutique','Education project','Restaurant','Walk to town']),

('monteverde-forest-houses', 'Monteverde Forest Houses', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Private cabin-style houses set in the cloud forest, ideal for couples or small families seeking a quiet immersive nature stay.',
 ARRAY['Private cabins','Cloud forest','Couples','Family-friendly','Nature immersion']),

('monteverde-country-lodge', 'Monteverde Country Lodge', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Budget-friendly lodge in Santa Elena with comfortable rooms, on-site restaurant, and convenient access to Monteverde attractions.',
 ARRAY['Budget-friendly','Comfortable rooms','Restaurant','Town location','Family-friendly']),

-- ==================== TAMARINDO (6) ====================
('occidental-tamarindo', 'Occidental Tamarindo', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Large all-inclusive resort at Playa Langosta near Tamarindo with multiple pools, swim-up bars, kids club, and direct beach access.',
 ARRAY['All-inclusive','Multiple pools','Swim-up bars','Kids club','Beach access']),

('wyndham-tamarindo', 'Wyndham Tamarindo', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Beachfront resort in Tamarindo with multiple pools, swim-up bar, spa, and walking distance to surf breaks and restaurants.',
 ARRAY['Beachfront','Multiple pools','Swim-up bar','Spa','Walk to town']),

('the-coast-tamarindo', 'The Coast Beachfront Hotel', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Boutique beachfront hotel in central Tamarindo with rooftop infinity pool, oceanfront rooms, and on-site restaurant.',
 ARRAY['Beachfront','Boutique','Rooftop infinity pool','Oceanfront rooms','Restaurant']),

('ocho-artisan-bungalows', 'Ocho Artisan Bungalows', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Adults-only boutique with eight artisan bungalows in a tropical garden setting, salt-water pool, and personalized hospitality.',
 ARRAY['Adults only','Boutique','8 bungalows','Tropical gardens','Salt-water pool']),

('pacific-kalokairi-tamarindo', 'Pacific Kalokairi Hotel', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Boutique hilltop hotel with panoramic Pacific ocean views, pool, and Mediterranean-inspired design.',
 ARRAY['Boutique','Hilltop','Ocean views','Pool','Mediterranean design']),

('wet-hotel-tamarindo', 'WET Hotel', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Modern boutique hotel in Tamarindo with bold contemporary design, rooftop pool, and a young vibrant social scene.',
 ARRAY['Modern','Boutique','Rooftop pool','Contemporary design','Social vibe']),

-- ==================== PUERTO VIEJO (9) ====================
('aguas-claras-puerto-viejo', 'Hotel Aguas Claras', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Iconic adults-only boutique hotel on Playa Cocles with Victorian-Caribbean pastel-colored bungalows, gardens, and on-site Pacha Mama restaurant.',
 ARRAY['Adults only','Boutique','Victorian Caribbean','Beachfront','Award-winning restaurant']),

('umami-hotel-puerto-viejo', 'Umami Hotel', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Boutique hotel in Puerto Viejo blending Asian-Caribbean design, with pool, on-site restaurant, and tranquil garden setting.',
 ARRAY['Boutique','Asian-Caribbean design','Pool','Restaurant','Gardens']),

('caribe-town-puerto-viejo', 'Caribe Town Bungalows & Suites', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Bungalow accommodations on Playa Cocles with pool, garden setting, and direct beach access via a short walking path.',
 ARRAY['Bungalows','Pool','Beach access','Gardens','Family-friendly']),

('namu-garden-puerto-viejo', 'Namu Garden Hotel & Spa', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Boutique hotel near Puerto Viejo with private pools in select rooms, on-site spa, and tropical garden setting.',
 ARRAY['Boutique','Private pools','Spa','Gardens','Tropical setting']),

('la-prometida-puerto-viejo', 'La Prometida Hotel', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Luxury boutique hotel on Playa Negra with private suites, oceanfront pool, and chef-driven Caribbean-Italian dining.',
 ARRAY['Luxury boutique','Playa Negra','Oceanfront pool','Chef dining','Suites']),

('olinca-puerto-viejo', 'Olinca Boutique Hotel', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Small boutique hotel in central Puerto Viejo with comfortable rooms, garden pool, and walking distance to beaches and town.',
 ARRAY['Boutique','Central location','Garden pool','Walk to town','Walk to beach']),

('conga-puerto-viejo', 'Conga Boutique Hotel', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Tranquil boutique hotel in Puerto Viejo with bohemian design, garden setting, and a relaxed Caribbean atmosphere.',
 ARRAY['Boutique','Bohemian design','Gardens','Tranquil','Caribbean atmosphere']),

('physis-caribbean-bnb', 'Physis Caribbean Bed & Breakfast', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Family-run Caribbean B&B on Playa Cocles with personalized service, home-cooked breakfast, and beach access just steps away.',
 ARRAY['B&B','Family-run','Playa Cocles','Home-cooked breakfast','Beach access']),

('colibri-ecolodge-puerto-viejo', 'Colibrí Ecolodge', 'Puerto Viejo (Caribbean Coast)', 'Puerto Viejo',
 'Small ecolodge near Puerto Viejo with studio-style accommodations, lush garden setting, and a focus on sustainability.',
 ARRAY['Ecolodge','Studios','Lush gardens','Sustainable','Tropical setting']),

-- ==================== SANTA TERESA (8) ====================
('somos-santa-teresa', 'Somos (House of Somos)', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Hostel-boutique hybrid in Santa Teresa with strong community vibe, dorm and private rooms, pool, and on-site café-restaurant.',
 ARRAY['Hostel-boutique','Community vibe','Dorm and private rooms','Pool','Café']),

('tropico-latino-santa-teresa', 'Hotel Tropico Latino', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Beachfront hotel in Santa Teresa with tropical garden bungalows, oceanfront pool, on-site spa, and yoga shala.',
 ARRAY['Beachfront','Tropical bungalows','Oceanfront pool','Spa','Yoga shala']),

('selva-boutique-santa-teresa', 'Selva Boutique Resort', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Adults-only boutique resort in Santa Teresa with design-forward bungalows, jungle pool, and intimate atmosphere.',
 ARRAY['Adults only','Boutique','Design-forward','Jungle pool','Intimate']),

('mint-santa-teresa', 'Mint Santa Teresa', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Luxury boutique hotel in Santa Teresa with contemporary design, private villas, infinity pool, and chef-driven dining.',
 ARRAY['Luxury boutique','Contemporary design','Private villas','Infinity pool','Chef dining']),

('vista-del-alma-santa-teresa', 'Vista del Alma Boutique Resort', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Hilltop boutique resort with panoramic Pacific Ocean views from each villa, infinity pool, and tranquil yoga shala.',
 ARRAY['Hilltop','Panoramic ocean views','Private villas','Infinity pool','Yoga shala']),

('laloon-luxury-suites', 'Laloon Luxury Suites', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Adults-only luxury suites in Santa Teresa with private plunge pools, ocean views, and personalized concierge service.',
 ARRAY['Adults only','Luxury suites','Private plunge pools','Ocean views','Concierge']),

('arjau-boutique-santa-teresa', 'ARjAU Boutique Hotel', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'Centrally located boutique hotel in Santa Teresa with modern design, garden pool, and walking distance to the beach.',
 ARRAY['Boutique','Central location','Modern design','Garden pool','Walk to beach']),

('fermata-luxury-santa-teresa', 'Hotel Fermata Luxury Boutique', 'Santa Teresa (Nicoya Peninsula)', 'Santa Teresa',
 'New luxury boutique hotel in Santa Teresa with beachfront access, modern design, infinity pool, and chef-driven dining.',
 ARRAY['Luxury boutique','Beachfront','Modern design','Infinity pool','Chef dining']),

-- ==================== MALPAÍS (1) ====================
('ocio-villas-malpais', 'OCiO Villas Mal País', 'Malpaís (Nicoya Peninsula)', 'Malpaís',
 'Hilltop boutique villas in Mal País with panoramic Pacific Ocean views, private pools, and tranquil eco-design.',
 ARRAY['Hilltop villas','Ocean views','Private pools','Eco-design','Tranquil']),

-- ==================== UVITA / DOMINICAL / COSTA BALLENA (8) ====================
('oxygen-jungle-villas', 'Oxygen Jungle Villas', 'Uvita', 'Uvita',
 'Adults-only luxury cliffside villas in the Uvita jungle with floor-to-ceiling windows, infinity pool, and Pacific Ocean views.',
 ARRAY['Adults only','Luxury villas','Cliffside','Infinity pool','Ocean views']),

('ballena-rey-hotel', 'Ballena REY Hotel', 'Uvita', 'Uvita',
 'Mid-range family-friendly hotel in Uvita with garden pool, comfortable rooms, and proximity to Marino Ballena National Park.',
 ARRAY['Family-friendly','Garden pool','Mid-range','Near national park','Comfortable rooms']),

('rancho-pacifico', 'Rancho Pacífico', 'Uvita', 'Uvita',
 'Ultra-luxury hilltop adults-only boutique resort above Uvita with private villas, infinity pool, and one of Costa Rica''s top-rated ocean panoramas.',
 ARRAY['Ultra-luxury','Adults only','Hilltop','Infinity pool','Ocean panorama']),

('tiki-villas-rainforest', 'Tiki Villas Rainforest Lodge & Spa', 'Uvita', 'Uvita',
 'Boutique rainforest lodge near Uvita with private villas, on-site spa, and jungle setting. Renovated in 2025.',
 ARRAY['Boutique','Rainforest lodge','Private villas','Spa','Renovated 2025']),

('hotel-uvita-forest', 'Hotel Uvita Forest', 'Uvita', 'Uvita',
 'Modern villa-style hotel in the Uvita forest with private decks, pool, and access to nearby Marino Ballena beaches.',
 ARRAY['Modern villas','Forest setting','Private decks','Pool','Beach access']),

('hotel-faremiti-uvita', 'Hotel Faremiti Uvita', 'Uvita', 'Uvita',
 'Small boutique hotel in Uvita with intimate atmosphere, pool, and proximity to whale-watching beaches.',
 ARRAY['Boutique','Intimate','Pool','Whale watching','Family-friendly']),

('alborada-boutique-uvita', 'Alborada Boutique Stay', 'Uvita', 'Uvita',
 'Boutique family-friendly stay in Uvita with comfortable rooms, garden setting, and Costa Ballena access.',
 ARRAY['Boutique','Family-friendly','Garden','Costa Ballena','Comfortable rooms']),

('bahia-selvatica-uvita', 'Bahía Selvatica Lodge', 'Uvita', 'Uvita',
 'New lodge in Uvita with jungle setting, private cabins, and proximity to Marino Ballena National Park.',
 ARRAY['New lodge','Jungle setting','Private cabins','Near national park','Family-friendly']),

-- ==================== DOMINICAL / COSTA BALLENA (already have Cuna del Angel — no new from this list) ====================

-- ==================== SAN JOSÉ (10) ====================
('barcelo-san-jose', 'Hotel Barceló San José', 'San Jose Downtown', 'San José',
 'Full-service urban resort in San José with multiple restaurants, casino, pool, and spa. Convenient location for business and leisure travelers.',
 ARRAY['Urban resort','Casino','Multiple restaurants','Pool','Spa']),

('marriott-hacienda-belen', 'Costa Rica Marriott Hotel Hacienda Belén', 'SJO - Juan Santamaria Int. Airport', 'Belén',
 'Colonial-style Marriott resort 15 minutes from SJO airport. Coffee plantation setting, 18-hole golf course, multiple restaurants, and spa.',
 ARRAY['Near airport','Colonial style','Golf course','Multiple restaurants','Spa']),

('delta-aurola-san-jose', 'Delta Hotels by Marriott San José Aurola', 'San Jose Downtown', 'San José',
 'Modern tower hotel in downtown San José with panoramic city views, multiple restaurants, fitness center, and proximity to Parque Morazán.',
 ARRAY['Downtown','City views','Multiple restaurants','Fitness center','Tower hotel']),

('hilton-garden-inn-la-sabana', 'Hilton Garden Inn San José La Sabana', 'San Jose Downtown', 'San José',
 'Modern hotel in the La Sabana neighborhood next to San José''s largest urban park. Pool, restaurant, fitness center, and easy access to downtown.',
 ARRAY['La Sabana location','Pool','Restaurant','Fitness center','Modern']),

('gran-hotel-curio', 'Gran Hotel Costa Rica, Curio Collection by Hilton', 'San Jose Downtown', 'San José',
 'Historic landmark hotel on Plaza de la Cultura in downtown San José, dating to 1930. Recently restored, with rooftop bar, museum-quality decor, and central location.',
 ARRAY['Historic landmark','Plaza de la Cultura','Rooftop bar','Restored','Downtown']),

('hotel-presidente-san-jose', 'Hotel Presidente', 'San Jose Downtown', 'San José',
 'Boutique hotel in central downtown San José with rooftop terrace, restaurant, and walking distance to historic plazas and museums.',
 ARRAY['Boutique','Downtown','Rooftop terrace','Restaurant','Walk to museums']),

('grano-de-oro', 'Hotel Grano de Oro', 'San Jose Downtown', 'San José',
 'Restored Victorian mansion turned boutique hotel near La Sabana. Highly rated on-site restaurant, lush courtyard gardens, and rooftop hot tubs.',
 ARRAY['Victorian mansion','Boutique','Award-winning restaurant','Courtyard gardens','Rooftop hot tubs']),

('hotel-taormina-san-jose', 'Hotel and Casino Taormina', 'San Jose Downtown', 'San José',
 'Mid-range hotel and casino in central San José with restaurant, pool, and easy access to downtown attractions.',
 ARRAY['Casino','Mid-range','Restaurant','Pool','Downtown']),

('hilton-san-jose-la-sabana', 'Hilton San José La Sabana', 'San Jose Downtown', 'San José',
 'Executive hotel in the La Sabana business district with full-service restaurant, pool, fitness center, and convenient airport access.',
 ARRAY['Executive','La Sabana','Restaurant','Pool','Fitness center']),

('hyatt-centric-escazu', 'Hyatt Centric San José Escazú', 'San Jose Downtown', 'Escazú',
 'New Hyatt Centric in the upscale Escazú neighborhood with rooftop pool and lounge, multiple restaurants, and modern design.',
 ARRAY['Escazú','Rooftop pool','Multiple restaurants','Modern','Upscale neighborhood'])

ON CONFLICT (slug) DO NOTHING;

-- Verificá total:
-- SELECT city, COUNT(*) AS hotels FROM hotels GROUP BY city ORDER BY hotels DESC;
