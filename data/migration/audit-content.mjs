// Audita el contenido de las 1240 rutas en Supabase y reporta cuáles tienen
// huecos (sin precio, sin descripción, etc.). El objetivo es que cuando
// migremos el dominio, ninguna ruta indexable rendere una página flaca.
//
// Uso (desde el repo root):
//   node --env-file=/Users/diegosalasoviedo/Documents/shuttle-costa-rica/.env.local data/migration/audit-content.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(url, key);

// Campos que el rendering de RouteDetail.tsx usa. Si están NULL, la página
// se ve rota o cae a fallbacks genéricos.
const CRITICAL = ["origen", "destino", "slug", "precio1a6"];
// Campos de contenido — no son fatales si faltan (hay fallbacks) pero la
// página queda "thin" (mal para SEO).
const CONTENT = [
  "journey_description",
  "points_of_interest",
  "road_type",
  "traveler_tip",
  "duracion",
  "kilometros",
];

async function fetchAllRoutes() {
  const all = [];
  let page = 0;
  const SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .order("slug")
      .range(page * SIZE, (page + 1) * SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < SIZE) break;
    page++;
  }
  return all;
}

function isEmpty(v) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

const routes = await fetchAllRoutes();
console.log(`Total rutas: ${routes.length}\n`);

const broken = []; // crítico faltante — render rompe
const thin = []; // crítico OK pero contenido < 2 campos llenos
const okish = []; // entre 2-4 campos de contenido
const rich = []; // 5+ campos de contenido llenos

for (const r of routes) {
  const missingCrit = CRITICAL.filter((c) => isEmpty(r[c]));
  if (missingCrit.length > 0) {
    broken.push({ slug: r.slug ?? `id-${r.id}`, missing: missingCrit, indexable: r.is_indexable });
    continue;
  }
  const filledContent = CONTENT.filter((c) => !isEmpty(r[c])).length;
  if (filledContent < 2) thin.push({ slug: r.slug, filled: filledContent, indexable: r.is_indexable });
  else if (filledContent < 5) okish.push({ slug: r.slug, filled: filledContent, indexable: r.is_indexable });
  else rich.push({ slug: r.slug, filled: filledContent, indexable: r.is_indexable });
}

console.log("=== COBERTURA DE CONTENIDO ===");
console.log(`🟢 Rich     (5+ campos contenido):     ${rich.length}`);
console.log(`🟡 OK       (2-4 campos contenido):    ${okish.length}`);
console.log(`🟠 Thin     (0-1 campos contenido):    ${thin.length}`);
console.log(`🔴 Broken   (critical fields missing): ${broken.length}`);

const indexableCount = (arr) => arr.filter((r) => r.indexable).length;
console.log("\n=== De las indexables (las que SEO ve) ===");
console.log(`🟢 Rich:   ${indexableCount(rich)}`);
console.log(`🟡 OK:     ${indexableCount(okish)}`);
console.log(`🟠 Thin:   ${indexableCount(thin)}`);
console.log(`🔴 Broken: ${indexableCount(broken)}`);

if (broken.length > 0) {
  console.log("\n=== 🔴 RUTAS ROTAS (críticas faltantes) ===");
  broken.slice(0, 20).forEach((r) => {
    console.log(`  ${r.indexable ? "[IDX]" : "[-- ]"} ${r.slug} — falta: ${r.missing.join(", ")}`);
  });
  if (broken.length > 20) console.log(`  ... y ${broken.length - 20} más`);
}

if (thin.length > 0) {
  console.log("\n=== 🟠 RUTAS THIN (sin contenido sustancial) ===");
  console.log(`Total: ${thin.length}`);
  console.log("Top 15 (las indexables primero):");
  [...thin].sort((a, b) => Number(b.indexable) - Number(a.indexable)).slice(0, 15).forEach((r) => {
    console.log(`  ${r.indexable ? "[IDX]" : "[-- ]"} ${r.slug} (${r.filled} campos)`);
  });
}

const DIR = path.dirname(new URL(import.meta.url).pathname);
fs.writeFileSync(path.join(DIR, "audit-broken.json"), JSON.stringify(broken, null, 2));
fs.writeFileSync(path.join(DIR, "audit-thin.json"), JSON.stringify(thin, null, 2));
fs.writeFileSync(path.join(DIR, "audit-okish.json"), JSON.stringify(okish, null, 2));
fs.writeFileSync(path.join(DIR, "audit-rich.json"), JSON.stringify(rich, null, 2));
console.log("\nArchivos guardados en data/migration/audit-*.json");
