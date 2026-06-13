-- =============================================================
-- Add Lomas del Volcán as a hotel landing page in La Fortuna.
--
-- No new routes needed — Lomas del Volcán sits inside the
-- La Fortuna (Arenal) area, so it reuses every existing route
-- whose origen = 'La Fortuna (Arenal)' (SJO/LIR/Monteverde/etc.
-- transfers). The /hotels/lomas-del-volcan page derives prices
-- from those automatically.
--
-- Priority = 50 (mid-tier): it'll surface above default-0 hotels
-- in "Top hotels in La Fortuna" lists but below the flagship
-- luxury properties (Nayara, Tabacón, The Springs).
--
-- Safe to re-run — ON CONFLICT (slug) DO NOTHING.
-- =============================================================

INSERT INTO hotels (slug, name, area_origen, city, description, amenities, priority) VALUES
(
  'lomas-del-volcan',
  'Lomas del Volcán',
  'La Fortuna (Arenal)',
  'La Fortuna',
  'Family-run eco-lodge of stand-alone wooden bungalows on a hillside with direct Arenal Volcano views. Tropical gardens, outdoor pool, on-site restaurant — a quieter, more authentic stay than the big resorts on the main road.',
  ARRAY['Volcano view','Private bungalows','Outdoor pool','Tropical gardens','On-site restaurant','Free WiFi'],
  50
)
ON CONFLICT (slug) DO NOTHING;

-- Verify:
-- SELECT slug, name, area_origen, city, priority FROM hotels WHERE slug = 'lomas-del-volcan';
