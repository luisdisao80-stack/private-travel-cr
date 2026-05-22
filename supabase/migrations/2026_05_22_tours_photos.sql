-- Update tour hero images to point at the Unsplash photos we just
-- downloaded into /public/tours/. These are temporary placeholders
-- until the operator (Canoa Aventura) sends high-resolution branded
-- photography we can use without attribution.

UPDATE tours SET hero_image = '/tours/arenal-full-day-combo.jpg'        WHERE slug = 'la-fortuna-full-day-combo';
UPDATE tours SET hero_image = '/tours/arenal-volcano-waterfall.jpg'      WHERE slug = 'arenal-volcano-waterfall-half-day';
UPDATE tours SET hero_image = '/tours/hanging-bridges-waterfall.jpg'     WHERE slug = 'arenal-hanging-bridges-waterfall-combo';
UPDATE tours SET hero_image = '/tours/rio-celeste-waterfall.jpg'         WHERE slug = 'rio-celeste-hike-tenorio';
UPDATE tours SET hero_image = '/tours/mistico-hanging-bridges.jpg'       WHERE slug = 'mistico-hanging-bridges';
UPDATE tours SET hero_image = '/tours/arenal-volcano-hike.jpg'           WHERE slug = 'arenal-volcano-el-silencio';
UPDATE tours SET hero_image = '/tours/safari-float-penas-blancas.jpg'    WHERE slug = 'safari-float-penas-blancas';
UPDATE tours SET hero_image = '/tours/cano-negro-wildlife.jpg'           WHERE slug = 'cano-negro-wildlife-refuge';
UPDATE tours SET hero_image = '/tours/twilight-sloth-night-walk.jpg'     WHERE slug = 'twilight-sloth-night-walk';
UPDATE tours SET hero_image = '/tours/rafting-sarapiqui.jpg'             WHERE slug = 'rafting-sarapiqui-class-ii-iii';
