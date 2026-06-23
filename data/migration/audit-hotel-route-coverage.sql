-- =============================================================
-- Hotel SEO audit — cuántas rutas tiene cada hotel asociadas.
-- Más rutas = más cross-links internos = mejor indexación.
--
-- Hoteles con <5 rutas son "huérfanos SEO" — Google los descubre
-- pero no los considera valiosos porque no hay señal interna.
-- =============================================================

SELECT
  h.slug,
  h.name,
  h.city,
  h.area_origen,
  h.priority,
  h.is_indexable,
  COUNT(r.id) AS rutas_asociadas,
  CASE
    WHEN COUNT(r.id) >= 10 THEN '🟢 FUERTE (10+ rutas)'
    WHEN COUNT(r.id) >= 5  THEN '🟡 OK (5-9 rutas)'
    WHEN COUNT(r.id) >= 1  THEN '🟠 DÉBIL (1-4 rutas)'
    ELSE '🔴 HUÉRFANO (0 rutas)'
  END AS estado_seo
FROM hotels h
LEFT JOIN routes r ON r.origen = h.area_origen OR r.destino = h.area_origen
WHERE h.is_indexable = true
GROUP BY h.slug, h.name, h.city, h.area_origen, h.priority, h.is_indexable
ORDER BY rutas_asociadas DESC, h.priority DESC NULLS LAST;
