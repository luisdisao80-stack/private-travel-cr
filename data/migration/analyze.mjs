// Analiza la cobertura de redirects legacy→nuevo y reporta:
//  - Cuántas URLs legacy mappean limpio a una ruta existente
//  - Cuáles caen al 404 (necesitan crear ruta o redirigir a fallback)
//  - El mapeo final listo para meter en middleware.ts
//
// Uso: node data/migration/analyze.mjs

import fs from "fs";
import path from "path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const legacyUrls = fs.readFileSync(path.join(DIR, "indexed-urls.txt"), "utf8").trim().split("\n");
const newSlugs = new Set(
  fs.readFileSync(path.join(DIR, "new-route-slugs.txt"), "utf8").trim().split("\n")
);

// Mapeo legacy origin slug → posibles slugs nuevos. Orden importa: el primero
// se prueba primero, así preferimos forma corta (popular) sobre larga.
const LEGACY_TO_NEW = {
  "alajuela": ["alajuela-city"],
  "bajos-del-toro": ["bajos-del-toro"],
  "cahuita": ["puerto-viejo"],
  "carrillo": ["samara", "samara-playa-carrillo"],
  "dominical": ["dominical"],
  "dream-las-mareas-resort": ["las-catalinas-guanacaste"],
  "golfito": ["puerto-jimenez"],
  "hotel-riu-guanacaste": ["riu-guanacaste-hotel-riu-palace-hotel"],
  "jaco": ["jaco"],
  "la-fortuna-arenal": ["la-fortuna"],
  "la-paz-waterfalls": ["la-paz-waterfall-gardens"],
  "las-catalinas": ["las-catalinas-guanacaste"],
  "liberia-lir-international-airport": ["lir", "lir-liberia-int-airport"],
  "liberia-town": ["lir", "lir-liberia-int-airport"],
  "lir-airport": ["lir", "lir-liberia-int-airport"],
  "mal-pais-santa-teresa": ["santa-teresa"],
  "manuel-antonio": ["manuel-antonio", "manuel-antonio-quepos"],
  "monteverde": ["monteverde"],
  "ojochal": ["ojochal"],
  "papagayo": ["papagayo", "papagayo-peninsula-guanacaste"],
  "playa-avellanas": ["playa-avellanas"],
  "playa-brasilito": ["brasilito"],
  "playa-conchal": ["conchal"],
  "playa-del-coco": ["playas-del-coco"],
  "playa-flamingo": ["flamingo"],
  "playa-grande": ["playa-grande"],
  "playa-hermosa-guanacaste": ["playa-hermosa"],
  "playa-langosta": ["tamarindo"],
  "playa-ocotal": ["ocotal"],
  "playa-panama": ["papagayo", "papagayo-peninsula-guanacaste"],
  "playa-potrero": ["playa-potrero"],
  "puerto-jimenez": ["puerto-jimenez"],
  "puerto-viejo-limon": ["puerto-viejo"],
  "rio-celeste": ["rio-celeste"],
  "samara": ["samara", "samara-playa-carrillo"],
  "san-jose-sjo-international-airport": ["sjo", "sjo-juan-santamaria-int-airport"],
  "san-jose-town": ["san-jose-downtown"],
  "sarapiqui": ["sarapiqui-heredia"],
  "sierpe": ["puerto-jimenez"],
  "sjo-airport": ["sjo", "sjo-juan-santamaria-int-airport"],
  "tamarindo": ["tamarindo"],
  "tortuguero-pavona-dock": ["la-pavona"],
  "uvita": ["uvita"],

  // Destination-only slugs (legacy URLs use these in /from/to position)
  // Categorías:
  //   a) Lugares que SÍ existen en DB nueva con el mismo o similar nombre
  "esterillos": ["esterillos"],
  "herradura": ["herradura"],
  "los-chiles": ["los-chiles"],
  "montezuma": ["montezuma"],
  "nosara": ["nosara"],
  "penas-blancas": ["penas-blancas"],
  "punta-islita": ["punta-islita"],
  "punta-leona": ["punta-leona"],
  "rincon-de-la-vieja": ["rincon-de-la-vieja"],
  "san-gerardo-de-dota": ["san-gerardo-de-dota"],
  "quepos": ["manuel-antonio", "manuel-antonio-quepos"], // misma zona

  //   b) Lugares que NO existen en DB nueva — mapeo al más cercano geográficamente
  "canas": ["rincon-de-la-vieja"],
  "cuidad-quesada": ["la-fortuna"],
  "fortuna-local-airport-tanque": ["la-fortuna"],
  "guapiles": ["puerto-viejo"],
  "heredia": ["san-jose-downtown"],
  "limon": ["puerto-viejo"],
  "manzanillo": ["puerto-viejo"],
  "matapalo-guanacaste": ["tamarindo"],
  "nicoya": ["samara", "samara-playa-carrillo"],
  "nuevo-arenal": ["la-fortuna"],
  "poas": ["alajuela-city"],
  "punta-cocles": ["puerto-viejo"],
  "puntarenas": ["jaco"],
  "san-jose-sjo-international-airport-nicoya": ["sjo", "sjo-juan-santamaria-int-airport"],
  "san-ramon": ["la-fortuna"],
  "siquirres": ["puerto-viejo"],
  "tambor": ["montezuma"],
  "tilaran": ["la-fortuna"],
  "tortuguero": ["la-pavona"],
  "turrialba": ["san-jose-downtown"],
};

function mapLegacyRoute(from, to) {
  const fromCands = LEGACY_TO_NEW[from];
  const toCands = LEGACY_TO_NEW[to];
  if (!fromCands || !toCands) return { found: false, reason: "unmapped-slug", from, to };

  for (const f of fromCands) {
    for (const t of toCands) {
      const slug = `${f}-to-${t}`;
      if (newSlugs.has(slug)) return { found: true, slug, from, to };
    }
  }
  return { found: false, reason: "route-not-in-new-db", from, to, tried: fromCands.flatMap(f => toCands.map(t => `${f}-to-${t}`)) };
}

const stats = {
  total: 0,
  fromTo: 0,
  fromToMatched: 0,
  fromToUnmapped: 0,
  fromToMissingRoute: 0,
  origin: 0,
  bookNow: 0,
  blog: 0,
  home: 0,
  other: 0,
};

const matches = [];
const missing = [];
const unmapped = [];
const other = [];

for (const url of legacyUrls) {
  stats.total++;
  let u;
  try {
    u = new URL(url);
  } catch {
    stats.other++;
    other.push({ legacy: url, type: "invalid-url" });
    continue;
  }
  const p = u.pathname.replace(/\/$/, "");

  // /costa-rica/transportation/X/Y
  const fromTo = p.match(/^\/costa-rica\/transportation\/([^/]+)\/([^/]+)$/);
  if (fromTo) {
    stats.fromTo++;
    const result = mapLegacyRoute(fromTo[1], fromTo[2]);
    if (result.found) {
      stats.fromToMatched++;
      matches.push({ legacy: u.pathname, target: `/routes/${result.slug}` });
    } else if (result.reason === "unmapped-slug") {
      stats.fromToUnmapped++;
      unmapped.push({ legacy: u.pathname, from: result.from, to: result.to });
    } else {
      stats.fromToMissingRoute++;
      missing.push({ legacy: u.pathname, tried: result.tried });
    }
    continue;
  }

  // /costa-rica/transportation/X/  (origin page)
  const origin = p.match(/^\/costa-rica\/transportation\/([^/]+)$/);
  if (origin) {
    stats.origin++;
    other.push({ legacy: u.pathname, type: "origin", suggestedTarget: "/routes" });
    continue;
  }

  if (p.startsWith("/book-now.php")) {
    stats.bookNow++;
    other.push({ legacy: u.pathname + u.search, type: "book-now", suggestedTarget: "/book" });
    continue;
  }

  if (p.startsWith("/blog/post/")) {
    stats.blog++;
    other.push({ legacy: u.pathname, type: "blog-post", suggestedTarget: "/blog (manual mapping needed)" });
    continue;
  }

  if (p === "" || p === "/") {
    stats.home++;
    continue;
  }

  stats.other++;
  other.push({ legacy: u.pathname + u.search, type: "other" });
}

console.log("=== COBERTURA ===");
console.log(JSON.stringify(stats, null, 2));

console.log("\n=== from→to URLs SIN ruta equivalente en DB nueva (route-not-in-new-db) ===");
console.log(`Total: ${missing.length}\n`);
missing.slice(0, 20).forEach((m) => {
  console.log(`  ${m.legacy}`);
  console.log(`    probó: ${m.tried.join(", ")}`);
});
if (missing.length > 20) console.log(`  ... y ${missing.length - 20} más`);

console.log("\n=== from→to URLs con slug legacy desconocido (unmapped-slug) ===");
console.log(`Total: ${unmapped.length}\n`);
unmapped.slice(0, 10).forEach((m) => console.log(`  ${m.legacy} (from=${m.from} to=${m.to})`));

console.log("\n=== Top 20 destinos faltantes (rutas legacy que no existen en DB nueva) ===");
const missingByPair = {};
missing.forEach((m) => {
  const key = m.legacy;
  missingByPair[key] = (missingByPair[key] || 0) + 1;
});

// Guardar el resultado completo
fs.writeFileSync(path.join(DIR, "redirect-matches.json"), JSON.stringify(matches, null, 2));
fs.writeFileSync(path.join(DIR, "redirect-missing.json"), JSON.stringify(missing, null, 2));
fs.writeFileSync(path.join(DIR, "redirect-unmapped.json"), JSON.stringify(unmapped, null, 2));
fs.writeFileSync(path.join(DIR, "redirect-other.json"), JSON.stringify(other, null, 2));

console.log("\n=== ARCHIVOS GENERADOS ===");
console.log("data/migration/redirect-matches.json   (URLs con redirect 1:1)");
console.log("data/migration/redirect-missing.json   (rutas que necesitan crearse en DB nueva)");
console.log("data/migration/redirect-unmapped.json  (slugs legacy raros)");
console.log("data/migration/redirect-other.json     (book-now, blog, etc.)");
