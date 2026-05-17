-- Batch 4: hoteles cerca de aeropuertos (SJO + LIR).
-- ON CONFLICT DO NOTHING — safe to re-run.

INSERT INTO hotels (slug, name, area_origen, city, description, amenities) VALUES

-- Cerca de SJO (Juan Santamaria Int. Airport)
('hilton-city-mall', 'Hilton San José City Mall', 'SJO - Juan Santamaria Int. Airport', 'Alajuela',
 'Modern Hilton next to City Mall in Alajuela, just 15 minutes from SJO airport. Convenient pre/post-flight stay with restaurant, fitness center, and easy shopping access.',
 ARRAY['Near airport','Next to City Mall','Modern','Restaurant','Fitness center']),

('fairfield-inn-sjo', 'Fairfield Inn & Suites San José Alajuela', 'SJO - Juan Santamaria Int. Airport', 'Alajuela',
 'Marriott Fairfield Inn just minutes from SJO airport. Free breakfast, fitness center, outdoor pool, and complimentary airport shuttle.',
 ARRAY['Near airport','Free breakfast','Pool','Fitness center','Airport shuttle']),

('courtyard-sjo-airport', 'Courtyard by Marriott San José Airport Alajuela', 'SJO - Juan Santamaria Int. Airport', 'Alajuela',
 'Modern Courtyard next to SJO airport with full-service restaurant, outdoor pool, business center, and easy airport access for both arrivals and departures.',
 ARRAY['Next to airport','Restaurant','Pool','Business center','Modern']),

('holiday-inn-express-forum', 'Holiday Inn Express San José Forum', 'SJO - Juan Santamaria Int. Airport', 'Santa Ana',
 'Holiday Inn Express in the Forum business district between SJO airport and Escazú. Free breakfast, pool, and convenient access to highways heading to Pacific beaches.',
 ARRAY['Near airport','Free breakfast','Pool','Business district','Highway access']),

('hampton-inn-sjo-airport', 'Hampton Inn & Suites San José Airport Costa Rica', 'SJO - Juan Santamaria Int. Airport', 'Alajuela',
 'Hilton-brand Hampton Inn directly across from SJO airport. Free hot breakfast, free WiFi, pool, and complimentary airport shuttle.',
 ARRAY['Across from airport','Free breakfast','Pool','Airport shuttle','Free WiFi']),

-- Cerca de LIR (Liberia Int. Airport)
('hilton-garden-inn-liberia', 'Hilton Garden Inn Liberia Airport', 'LIR - Liberia Int. Airport', 'Liberia',
 'Hilton Garden Inn directly across from LIR airport. Restaurant, outdoor pool, fitness center, and the most convenient airport stay for early flights or late arrivals to Guanacaste.',
 ARRAY['Across from LIR airport','Restaurant','Pool','Fitness center','Early flights']),

('hampton-inn-liberia', 'Hampton Inn by Hilton Liberia Airport', 'LIR - Liberia Int. Airport', 'Liberia',
 'Hampton Inn next to LIR airport with free hot breakfast, outdoor pool, fitness center, and free WiFi. Walking distance to the LIR terminal — ideal for early Guanacaste flights.',
 ARRAY['Next to LIR airport','Free breakfast','Pool','Free WiFi','Walking distance to terminal'])

ON CONFLICT (slug) DO NOTHING;

-- Verificá:
-- SELECT slug, name, area_origen FROM hotels WHERE city IN ('Alajuela','Santa Ana','Liberia') ORDER BY city, name;
