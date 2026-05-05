import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);

const routes = [
  { from: "SJO - Juan Santamaria Int. Airport", to: "La Fortuna (Arenal)" },
  { from: "LIR - Liberia Int. Airport", to: "La Fortuna (Arenal)" },
  { from: "La Fortuna (Arenal)", to: "Monteverde (Cloud Forest)" },
  { from: "La Fortuna (Arenal)", to: "Tamarindo (Guanacaste)" },
  { from: "La Fortuna (Arenal)", to: "Manuel Antonio / Quepos" },
  { from: "SJO - Juan Santamaria Int. Airport", to: "Manuel Antonio / Quepos" },
];

for (const r of routes) {
  const { data } = await supabase
    .from("routes")
    .select("origen, destino, precio1a6, duracion")
    .eq("origen", r.from)
    .eq("destino", r.to)
    .maybeSingle();
  
  if (data) {
    console.log(`✅ ${data.origen}`);
    console.log(`   -> ${data.destino}`);
    console.log(`   Precio: $${data.precio1a6}  |  Duracion: ${data.duracion || "N/A"}`);
    console.log("");
  } else {
    console.log(`❌ NO encontrado: ${r.from} -> ${r.to}`);
    console.log("");
  }
}
