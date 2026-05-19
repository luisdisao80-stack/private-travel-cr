-- =============================================================
-- Agrega columna `priority` para que "Top hotels in <area>" ordene
-- por relevancia real (no por orden alfabético).
--
-- Valores:
--   100 = flagship / luxury (los REALMENTE top de cada zona)
--    50 = mid-tier popular (segundo nivel)
--     0 = default (no aparece en "Top hotels" si la zona tiene
--         flagships, pero sigue accesible vía /hotels)
-- =============================================================

ALTER TABLE hotels ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;

-- ==================== FLAGSHIP — priority 100 ====================
-- Los hoteles que vos querés que aparezcan primero en cada área
UPDATE hotels SET priority = 100 WHERE slug IN (
  -- La Fortuna
  'tabacon-thermal-resort',
  'nayara-springs',
  'nayara-tented-camp',
  'the-springs-resort',
  'amor-arenal',
  'arenal-kioro',
  'arenal-springs-resort',
  'mountain-paradise',

  -- Papagayo
  'nekajui-ritz-carlton',
  'four-seasons-papagayo',
  'andaz-papagayo',
  'el-mangroove-papagayo',
  'secrets-papagayo',

  -- Conchal
  'westin-reserva-conchal',
  'w-reserva-conchal',

  -- Manuel Antonio
  'tulemar-resort',
  'si-como-no-resort',
  'arenas-del-mar',
  'makanda-by-the-sea',
  'gaia-hotel-reserve',
  'parador-resort',

  -- Tamarindo
  'capitan-suizo',
  'cala-luna-tamarindo',
  'tamarindo-diria',
  'jardin-del-eden',

  -- Monteverde
  'hotel-belmar',
  'senda-monteverde',
  'monteverde-lodge',
  'koora-monteverde',
  'hidden-canopy-treehouses',

  -- Nosara
  'lagarta-lodge',
  'the-gilded-iguana',
  'bodhi-tree-nosara',

  -- Santa Teresa
  'florblanca-resort',
  'hotel-nantipa',
  'pranamar-villas',
  'mint-santa-teresa',

  -- Puerto Viejo
  'aguas-claras-puerto-viejo',
  'le-cameleon',
  'banana-azul',
  'cariblue-puerto-viejo',

  -- Uvita / Dominical
  'kura-design-villas',
  'rancho-pacifico',
  'oxygen-jungle-villas',
  'cristal-ballena',

  -- Hacienda Pinilla / JW Marriott / RIU
  'jw-marriott-guanacaste',
  'hacienda-pinilla',
  'riu-guanacaste',

  -- Las Catalinas
  'casa-chameleon-las-catalinas',
  'santarena-las-catalinas',

  -- Flamingo
  'margaritaville-flamingo',
  'flamingo-beach-resort',

  -- Playa Hermosa
  'waldorf-astoria-punta-cacique',
  'bosque-del-mar-hermosa',

  -- SJO area airport hotels
  'marriott-hacienda-belen',
  'hilton-city-mall',

  -- LIR area
  'hilton-garden-inn-liberia'
);

-- ==================== MID-TIER — priority 50 ====================
-- Hoteles populares pero no flagship — aparecen después que los top
UPDATE hotels SET priority = 50 WHERE slug IN (
  -- La Fortuna
  'arenal-observatory-lodge',
  'arenal-manoa',
  'volcano-lodge-arenal',
  'baldi-hot-springs',
  'the-royal-corin',
  'los-lagos-arenal',
  'nayara-gardens',

  -- Papagayo
  'planet-hollywood-papagayo',
  'occidental-papagayo',

  -- Manuel Antonio
  'shana-by-the-beach',
  'la-mariposa-manuel-antonio',
  'costa-verde-manuel-antonio',
  'hotel-san-bada',

  -- Tamarindo
  'occidental-tamarindo',
  'wyndham-tamarindo',
  'sueno-del-mar',

  -- Monteverde
  'el-establo-monteverde',
  'hotel-fonda-vela',
  'hotel-con-corazon-monteverde',

  -- Santa Teresa
  'tropico-latino-santa-teresa',
  'vista-del-alma-santa-teresa',

  -- Uvita
  'tiki-villas-rainforest',
  'cuna-del-angel',

  -- Herradura
  'los-suenos-marriott',

  -- Coco
  'pacifico-beach-club-coco',

  -- Potrero
  'bahia-del-sol-potrero',

  -- Jaco / Punta Leona / Punta Islita
  'crocs-casino-jaco',
  'hotel-punta-leona',
  'hotel-punta-islita',

  -- SJO downtown
  'gran-hotel-curio',
  'grano-de-oro',
  'hyatt-centric-escazu',
  'courtyard-sjo-airport',
  'hampton-inn-sjo-airport',

  -- LIR
  'hampton-inn-liberia'
);

-- Verificá los flagship de La Fortuna:
-- SELECT slug, name, priority FROM hotels
-- WHERE area_origen = 'La Fortuna (Arenal)' ORDER BY priority DESC, name LIMIT 10;
