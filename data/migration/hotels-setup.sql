-- =============================================================
-- Hotels table + 18 seed hotels for /hotels/[slug] landing pages.
-- Each hotel maps to an area_origen that exactly matches a routes.origen
-- value, so the page can pull shuttle prices from existing route rows.
-- =============================================================

CREATE TABLE IF NOT EXISTS hotels (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  area_origen TEXT NOT NULL,  -- must match routes.origen exactly
  city TEXT NOT NULL,         -- friendly display label
  description TEXT,           -- 1-3 sentences for SEO + hero
  image_url TEXT,             -- optional hero photo
  amenities TEXT[],           -- e.g., {'Hot springs','Spa','All-inclusive'}
  is_indexable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_area ON hotels(area_origen);

-- Seed: 18 well-known CR hotels across the popular areas. More can be
-- added by running additional INSERTs — the page template auto-builds.
INSERT INTO hotels (slug, name, area_origen, city, description, amenities) VALUES

-- La Fortuna / Arenal
('tabacon-thermal-resort', 'Tabacón Thermal Resort & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Luxury resort built around natural hot springs flowing from Arenal Volcano. One of Costa Rica''s most iconic stays, with five-star spa, gourmet dining, and direct volcano views.',
 ARRAY['Natural hot springs','Spa','Volcano view','Fine dining']),

('nayara-springs', 'Nayara Springs', 'La Fortuna (Arenal)', 'La Fortuna',
 'Adults-only luxury resort in the Arenal rainforest with private plunge pools fed by mineral hot springs. Consistently ranked among the world''s top hotels.',
 ARRAY['Adults only','Private plunge pools','Rainforest setting','5-star service']),

('arenal-springs-resort', 'Arenal Springs Resort & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Family-friendly resort with direct Arenal Volcano views, multiple thermal pools, and private bungalows scattered across landscaped gardens.',
 ARRAY['Thermal pools','Volcano view','Family-friendly','Bungalow rooms']),

('the-springs-resort', 'The Springs Resort & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'Sprawling luxury resort with 28 hot springs pools, a wildlife rescue center, and panoramic volcano views from every room.',
 ARRAY['28 hot springs pools','Wildlife center','Volcano view','Multiple restaurants']),

('arenal-observatory-lodge', 'Arenal Observatory Lodge & Spa', 'La Fortuna (Arenal)', 'La Fortuna',
 'The only lodge inside Arenal Volcano National Park. Originally built as a scientific observation site — closest you can sleep to the volcano.',
 ARRAY['Inside national park','Closest to volcano','Hiking trails','Birdwatching']),

-- Papagayo Peninsula
('four-seasons-papagayo', 'Four Seasons Resort Peninsula Papagayo', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Five-star luxury resort on the Papagayo Peninsula with two private beaches, an Arnold Palmer signature golf course, and award-winning Coyul Spa.',
 ARRAY['Two private beaches','Arnold Palmer golf','Spa','Fine dining','Adults area + family wing']),

('andaz-papagayo', 'Andaz Costa Rica Resort at Peninsula Papagayo', 'Papagayo Peninsula, Guanacaste', 'Peninsula Papagayo',
 'Modern luxury resort with sweeping bay views, three pools cascading toward the beach, and design by Costa Rican architect Ronald Zürcher.',
 ARRAY['Bay views','Cascading pools','Modern design','Spa','Beach access']),

-- Conchal
('westin-reserva-conchal', 'The Westin Reserva Conchal', 'Conchal (Guanacaste)', 'Playa Conchal',
 'All-inclusive beachfront resort on the famous shell-strewn Playa Conchal. Largest pool in Central America, world-class golf course, and family programs.',
 ARRAY['All-inclusive','Beachfront','Largest pool in Central America','Golf','Family programs']),

('w-reserva-conchal', 'W Costa Rica Reserva Conchal', 'Conchal (Guanacaste)', 'Playa Conchal',
 'Lifestyle luxury hotel on Playa Conchal with bold contemporary design, beach club, and signature W amenities. Adults welcome to the energetic vibe.',
 ARRAY['Beach club','Contemporary design','Adults vibe','Multiple bars','Spa']),

-- Manuel Antonio
('tulemar-resort', 'Tulemar Resort', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Award-winning private community in Manuel Antonio with seven small beaches, lush rainforest, and accommodations ranging from bungalows to villas.',
 ARRAY['Seven private beaches','Rainforest','Bungalows + villas','Wildlife on property']),

('si-como-no-resort', 'Si Como No Resort', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Eco-friendly boutique resort overlooking the Pacific with a butterfly garden, wildlife refuge, and on-site cinema. Iconic Manuel Antonio stay since 1992.',
 ARRAY['Eco-friendly','Butterfly garden','Pacific views','Boutique']),

('arenas-del-mar', 'Arenas del Mar Beachfront Rainforest Resort', 'Manuel Antonio / Quepos', 'Manuel Antonio',
 'Boutique beachfront resort with direct access to two beaches, sustainable design, and resident sloths on the property.',
 ARRAY['Beachfront','Resident sloths','Sustainable','Boutique']),

-- Tamarindo
('tamarindo-diria', 'Tamarindo Diria Beach Resort', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Iconic beachfront resort at the center of Tamarindo, with three pools, beach club, and walking distance to surf breaks and restaurants.',
 ARRAY['Beachfront','Center of Tamarindo','Three pools','Beach club']),

('cala-luna-tamarindo', 'Cala Luna Boutique Hotel', 'Tamarindo (Guanacaste)', 'Tamarindo',
 'Boutique hotel and villas in Playa Langosta, just south of Tamarindo. Tropical luxury with private villas, infinity pool, and award-winning restaurant.',
 ARRAY['Boutique','Private villas','Infinity pool','Award-winning restaurant']),

-- Monteverde
('hotel-belmar', 'Hotel Belmar', 'Monteverde (Cloud Forest)', 'Monteverde',
 'Tyrolean-inspired mountain lodge in the Monteverde cloud forest. Sustainable luxury with farm-to-table dining and panoramic Nicoya Gulf views.',
 ARRAY['Cloud forest','Mountain lodge','Sustainable','Farm-to-table dining','Gulf views']),

-- Hotels that ARE their own area (1:1 with routes.origen)
('jw-marriott-guanacaste', 'JW Marriott Guanacaste Resort & Spa', 'JW Marriott (Guanacaste)', 'Hacienda Pinilla',
 'Luxury beachfront resort within the Hacienda Pinilla community. Largest pool in Central America at the time of opening, 18-hole golf course, and signature spa.',
 ARRAY['Beachfront','Mile-long pool','Golf course','Spa','Adults pool']),

('riu-guanacaste', 'RIU Guanacaste Hotel / RIU Palace', 'RIU Guanacaste Hotel / RIU Palace Hotel (Guanacaste)', 'Playa Matapalo',
 'All-inclusive beachfront resorts on Playa Matapalo. Two adjacent properties (Guanacaste + Palace) sharing facilities — 700+ rooms, multiple pools and restaurants.',
 ARRAY['All-inclusive','Beachfront','Multiple pools','24-hour bars','Family-friendly']),

('hacienda-pinilla', 'Hacienda Pinilla Community Hotels', 'Hacienda Pinilla (Guanacaste)', 'Hacienda Pinilla',
 'Master-planned beachfront community in Guanacaste hosting multiple hotels (JW Marriott, La Posada), three beaches, and an 18-hole Mike Young golf course.',
 ARRAY['Beachfront community','Three beaches','Mike Young golf','Polo','Multiple hotels'])
ON CONFLICT (slug) DO NOTHING;

-- Verify:
-- SELECT slug, name, city, area_origen FROM hotels ORDER BY city, name;
