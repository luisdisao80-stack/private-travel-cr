-- =============================================================
-- Add 8 flagship hotel landing pages — 2026-06 batch.
--
-- Strategy: targets famous hotels people Google by name. The /hotels/[slug]
-- pages converted at $545 (peace-lodge) today, so more hotel-specific
-- landing pages = more long-tail entry points → more bookings.
--
-- All 8 hotels map to area_origen values that ALREADY exist in the routes
-- table, so no new routes need to be added — these hotels will inherit
-- pricing from existing area routes automatically.
--
-- Paste-and-run in Supabase SQL Editor. ON CONFLICT DO NOTHING makes
-- it safe to re-run.
-- =============================================================

INSERT INTO hotels (slug, name, area_origen, city, description, amenities, is_indexable, priority) VALUES

-- ============= 1. Kasiiya Papagayo =============
-- Ultra-luxury tented camp on a private 123-acre peninsula. Glamping
-- meets 5-star service — high search volume from luxury travel media.
('kasiiya-papagayo',
 'Kasiiya Papagayo',
 'Papagayo Peninsula, Guanacaste',
 'Peninsula Papagayo, Guanacaste',
 'Ultra-luxury tented camp on a private 123-acre peninsula in Papagayo. Eight low-impact luxury tents with ocean views, private beaches, and farm-to-table dining. One of the most exclusive stays in Costa Rica.',
 ARRAY['Ultra-luxury glamping','Private peninsula','Adults-only','Farm-to-table','Beachfront tents'],
 true,
 95),

-- ============= 2. Hotel Casa Luna La Fortuna =============
-- Popular family-friendly resort at the foot of Arenal. Strong organic
-- search volume from family travel forums.
('casa-luna-arenal',
 'Hotel Casa Luna La Fortuna',
 'La Fortuna (Arenal)',
 'La Fortuna',
 'Family-friendly hotel & spa in La Fortuna with volcano views, two thermal pools, on-site spa, and the popular Casa Luna restaurant. Easy walking distance to downtown.',
 ARRAY['Family-friendly','Thermal pools','Volcano view','Spa','Walking distance to town'],
 true,
 70),

-- ============= 3. Issimo Suites Manuel Antonio =============
-- Adults-only luxury boutique with panoramic Pacific views. Frequently
-- featured in honeymoon and Costa Rica luxury rankings.
('issimo-suites-manuel-antonio',
 'Issimo Suites Boutique Hotel',
 'Manuel Antonio / Quepos',
 'Manuel Antonio',
 'Adults-only luxury suites in Manuel Antonio with panoramic Pacific Ocean views, private infinity pools in select rooms, and gourmet on-site dining. Designed for romantic getaways and honeymoons.',
 ARRAY['Adults-only','Ocean views','Private infinity pools','Honeymoon-friendly','Boutique luxury'],
 true,
 80),

-- ============= 4. Harmony Hotel Nosara =============
-- Famous yoga retreat hotel in Nosara, frequently mentioned in
-- wellness travel content and ChatGPT/Perplexity recommendations.
('harmony-hotel-nosara',
 'Harmony Hotel Nosara',
 'Nosara (Nicoya)',
 'Nosara',
 'Iconic eco-luxury hotel in Nosara with daily yoga, organic farm-to-table restaurant, and bohemian-chic rooms steps from Playa Guiones. A hub of the Costa Rica yoga scene.',
 ARRAY['Yoga retreat','Eco-luxury','Beachfront','Organic cuisine','Wellness focus'],
 true,
 85),

-- ============= 5. Tamarindo Bay Boutique Hotel =============
-- Adults-only boutique in central Tamarindo with rooftop pool.
('tamarindo-bay-boutique',
 'Tamarindo Bay Boutique Hotel',
 'Tamarindo (Guanacaste)',
 'Tamarindo',
 'Adults-only boutique hotel in the heart of Tamarindo with a rooftop infinity pool, ocean views, and walking distance to the surf breaks, restaurants and nightlife.',
 ARRAY['Adults-only','Rooftop pool','Central Tamarindo','Ocean views','Walking to beach'],
 true,
 70),

-- ============= 6. Rancho Pacifico Uvita =============
-- Adults-only luxury cliffside villas with ocean views. Frequently
-- cited as one of Costa Rica's most romantic stays.
('rancho-pacifico-uvita',
 'Rancho Pacifico',
 'Uvita',
 'Uvita, Costa Ballena',
 'Adults-only luxury cliffside villas in Uvita with floor-to-ceiling windows, private hot tubs, and panoramic Pacific Ocean views. One of the most romantic stays on the Costa Ballena.',
 ARRAY['Adults-only','Ocean view villas','Private hot tubs','Cliffside','Honeymoon-friendly'],
 true,
 80),

-- ============= 7. Hotel Tropico Latino Santa Teresa =============
-- Beachfront boutique with on-site yoga shala, popular among yoga
-- and surf travelers.
('tropico-latino-santa-teresa',
 'Hotel Tropico Latino',
 'Santa Teresa (Nicoya)',
 'Santa Teresa',
 'Beachfront boutique hotel in Santa Teresa with tropical garden bungalows, oceanfront pool, on-site spa, and daily yoga classes at the beachside shala. A favorite among yoga and surf travelers.',
 ARRAY['Beachfront','Yoga shala','Garden bungalows','Spa','Surf-friendly'],
 true,
 75),

-- ============= 8. Trapp Family Lodge Monteverde =============
-- Long-established eco-lodge at the entrance to the Monteverde Cloud
-- Forest Reserve — closest hotel to the reserve trailhead.
('trapp-family-lodge-monteverde',
 'Trapp Family Lodge Monteverde',
 'Monteverde (Cloud Forest)',
 'Monteverde',
 'Family-run eco-lodge at the entrance to the Monteverde Cloud Forest Biological Reserve — closest hotel to the reserve trailhead. Spacious wooden rooms with forest views and an on-site restaurant.',
 ARRAY['Closest to reserve','Family-run','Wood cabins','Forest views','Eco-friendly'],
 true,
 70)

ON CONFLICT (slug) DO NOTHING;


-- =============================================================
-- After running this SQL:
--   1. Go to Vercel → your project → Deployments → "Redeploy"
--      (UNCHECK "Use existing Build Cache" — generateStaticParams
--       needs to re-run to pick up the new hotel slugs)
--   2. Wait ~3 min for the deploy to finish.
--   3. New pages will be live at:
--        - /hotels/kasiiya-papagayo
--        - /hotels/casa-luna-arenal
--        - /hotels/issimo-suites-manuel-antonio
--        - /hotels/harmony-hotel-nosara
--        - /hotels/tamarindo-bay-boutique
--        - /hotels/rancho-pacifico-uvita
--        - /hotels/tropico-latino-santa-teresa
--        - /hotels/trapp-family-lodge-monteverde
--   4. Submit the 8 new URLs to Google Search Console "URL Inspection"
--      → "Request indexing" to speed up discovery.
-- =============================================================
