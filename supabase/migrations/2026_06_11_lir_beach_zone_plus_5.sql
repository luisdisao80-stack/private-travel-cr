-- +$5 across all passenger tiers for every route between LIR (Liberia
-- airport) and the Guanacaste beach zone Diego works most:
--   Tamarindo, Flamingo, Avellanas, Conchal, Brasilito,
--   Las Catalinas, Potrero, Playa Grande.
--
-- Applies in BOTH directions (LIR -> beach AND beach -> LIR).
--
-- Safe to re-run? No. Each run adds +$5. Run ONCE. If you accidentally
-- run twice, undo with the same WHERE clause and -5.
--
-- Static pages: the route detail pages are pre-rendered at build time
-- via generateStaticParams(), so after this SQL succeeds you also need
-- to redeploy on Vercel with "Use existing build cache" UNCHECKED,
-- otherwise visitors will keep seeing the old prices.
--
-- NULL handling: in Postgres `NULL + 5 = NULL`, so tiers that aren't
-- offered on a given route (e.g. some routes only quote 1-6 pax) keep
-- their NULL and don't get phantom $5 prices.

UPDATE routes
SET
  precio1a6    = precio1a6 + 5,
  precio7a9    = precio7a9 + 5,
  precio10a12  = precio10a12 + 5,
  precio13a18  = precio13a18 + 5
WHERE
  (
    (origen ILIKE '%liberia%' OR origen ILIKE '%LIR%')
    AND (
      destino ILIKE '%tamarindo%'    OR
      destino ILIKE '%flamingo%'     OR
      destino ILIKE '%avellanas%'    OR
      destino ILIKE '%conchal%'      OR
      destino ILIKE '%brasilito%'    OR
      destino ILIKE '%catalinas%'    OR
      destino ILIKE '%potrero%'      OR
      destino ILIKE '%playa grande%'
    )
  )
  OR
  (
    (destino ILIKE '%liberia%' OR destino ILIKE '%LIR%')
    AND (
      origen ILIKE '%tamarindo%'    OR
      origen ILIKE '%flamingo%'     OR
      origen ILIKE '%avellanas%'    OR
      origen ILIKE '%conchal%'      OR
      origen ILIKE '%brasilito%'    OR
      origen ILIKE '%catalinas%'    OR
      origen ILIKE '%potrero%'      OR
      origen ILIKE '%playa grande%'
    )
  );
