-- =============================================================
-- Add JW Marriott Costa Elena (La Cruz, Guanacaste norte) as a new
-- shuttle destination with 7 origin pairs (14 rows — both directions).
--
-- Prices confirmed by Diego 2026-05-29:
--   LIR              ↔ JW Costa Elena   $160   1.5h
--   SJO              ↔ JW Costa Elena   $340   5.5h
--   La Fortuna       ↔ JW Costa Elena   $330   4h
--   Tamarindo        ↔ JW Costa Elena   $240   3h
--   Monteverde       ↔ JW Costa Elena   $290   4h
--   Playas del Coco  ↔ JW Costa Elena   $240   3h
--   Papagayo Pen.    ↔ JW Costa Elena   $240   3h
--
-- Tier markup: 7-9 pax +$35, 10-12 pax +$80
-- Paste-and-run in Supabase SQL Editor. ON CONFLICT DO NOTHING
-- makes it safe to re-run.
-- =============================================================

-- ==================== ROUTES ====================
INSERT INTO routes (origen, destino, slug, precio1a6, precio7a9, precio10a12, duracion, is_indexable) VALUES

-- LIR ↔ JW Costa Elena (most popular — short hop)
('Liberia Airport', 'JW Marriott Costa Elena (La Cruz)',
 'lir-to-jw-marriott-costa-elena', 160, 195, 240, '1h 30min', true),
('JW Marriott Costa Elena (La Cruz)', 'Liberia Airport',
 'jw-marriott-costa-elena-to-lir', 160, 195, 240, '1h 30min', true),

-- SJO ↔ JW Costa Elena (long transfer)
('San Jose Airport', 'JW Marriott Costa Elena (La Cruz)',
 'sjo-to-jw-marriott-costa-elena', 340, 375, 420, '5h 30min', true),
('JW Marriott Costa Elena (La Cruz)', 'San Jose Airport',
 'jw-marriott-costa-elena-to-sjo', 340, 375, 420, '5h 30min', true),

-- La Fortuna ↔ JW Costa Elena
('La Fortuna (Arenal)', 'JW Marriott Costa Elena (La Cruz)',
 'la-fortuna-to-jw-marriott-costa-elena', 330, 365, 410, '4h', true),
('JW Marriott Costa Elena (La Cruz)', 'La Fortuna (Arenal)',
 'jw-marriott-costa-elena-to-la-fortuna', 330, 365, 410, '4h', true),

-- Tamarindo ↔ JW Costa Elena
('Tamarindo (Guanacaste)', 'JW Marriott Costa Elena (La Cruz)',
 'tamarindo-to-jw-marriott-costa-elena', 240, 275, 320, '3h', true),
('JW Marriott Costa Elena (La Cruz)', 'Tamarindo (Guanacaste)',
 'jw-marriott-costa-elena-to-tamarindo', 240, 275, 320, '3h', true),

-- Monteverde ↔ JW Costa Elena
('Monteverde (Cloud Forest)', 'JW Marriott Costa Elena (La Cruz)',
 'monteverde-to-jw-marriott-costa-elena', 290, 325, 370, '4h', true),
('JW Marriott Costa Elena (La Cruz)', 'Monteverde (Cloud Forest)',
 'jw-marriott-costa-elena-to-monteverde', 290, 325, 370, '4h', true),

-- Playas del Coco ↔ JW Costa Elena
('Playas del Coco (Guanacaste)', 'JW Marriott Costa Elena (La Cruz)',
 'playas-del-coco-to-jw-marriott-costa-elena', 240, 275, 320, '3h', true),
('JW Marriott Costa Elena (La Cruz)', 'Playas del Coco (Guanacaste)',
 'jw-marriott-costa-elena-to-playas-del-coco', 240, 275, 320, '3h', true),

-- Papagayo Peninsula ↔ JW Costa Elena
('Papagayo Peninsula, Guanacaste', 'JW Marriott Costa Elena (La Cruz)',
 'papagayo-to-jw-marriott-costa-elena', 240, 275, 320, '3h', true),
('JW Marriott Costa Elena (La Cruz)', 'Papagayo Peninsula, Guanacaste',
 'jw-marriott-costa-elena-to-papagayo', 240, 275, 320, '3h', true)

ON CONFLICT (slug) DO NOTHING;


-- ==================== HOTEL ENTRY ====================
-- This makes the hotel searchable in the home/routes/book search box.
-- area_origen points to the new location string so when a customer
-- picks the hotel, pickup auto-fills as the hotel itself.
INSERT INTO hotels (slug, name, area_origen, city, description, amenities, is_indexable, priority) VALUES
('jw-marriott-costa-elena',
 'JW Marriott Costa Elena',
 'JW Marriott Costa Elena (La Cruz)',
 'La Cruz, Guanacaste',
 'Luxury beachfront resort on Costa Elena Beach in the far north of Guanacaste. JW Marriott''s newest Costa Rica property with sweeping Pacific views, multiple pools, and direct access to a quiet undeveloped beach. Closer to Liberia (LIR) than to San Jose.',
 ARRAY['Beachfront luxury','Pacific views','Multiple pools','Spa','New JW Marriott property'],
 true,
 100)
ON CONFLICT (slug) DO NOTHING;
