// Hoja de servicio para choferes: genera un PNG (1080px, listo para WhatsApp) con el logo,
// los datos del tramo y el NETO del chofer. Nunca incluye teléfonos ni precio al cliente.
// El diseño vive en lib/hoja-servicio.ts (compartido con /api/admin/hoja en el admin).
//
// Uso:
//   npx tsx scripts/hoja-servicio.ts --orden PTCR-2209 --fecha 2026-11-27 --chofer Tito --neto 190 [--nota "texto"] [--tramo 2]
//
// Salida: ~/Desktop/hoja-servicio-<orden>-<fecha>.png
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";
import type { HojaBooking, HojaItem } from "../lib/hoja-servicio";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const [k, ...rest] = t.split("=");
  const v = rest.join("=").replace(/^"|"$/g, "");
  if (!(k in process.env)) process.env[k] = v;
}

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// La fila de Supabase trae los tramos en `items`, cada uno con su fecha.
type ItemConFecha = HojaItem & { date?: string };
type ReservaRow = HojaBooking & { items?: ItemConFecha[] | null };

type Hoja = { orden: string; fecha: string; chofer: string; neto?: string | number; nota?: string; tramo?: number };

async function main() {
  // Modo lote: --lote scripts/hojas/2026-11-27.json  (array de {orden, fecha, chofer, neto, nota?, tramo?})
  const lote = arg("lote");
  if (lote) {
    const hojas: Hoja[] = JSON.parse(readFileSync(lote, "utf8"));
    for (const h of hojas) {
      if (!h.chofer) {
        console.log(`SALTO ${h.orden}: falta chofer`);
        continue;
      }
      await generar(h);
    }
    return;
  }

  const orden = arg("orden");
  const fecha = arg("fecha");
  const chofer = arg("chofer");
  const neto = arg("neto");
  const nota = arg("nota", "");
  const tramoIdx = arg("tramo");
  if (!orden || !fecha || !chofer) {
    console.error("Faltan argumentos: --orden --fecha --chofer [--neto N | sin neto = chofer de planta] (o --lote archivo.json)");
    process.exit(1);
  }
  const manualRaw = arg("manual");
  await generar({ orden, fecha, chofer, neto, nota, tramo: tramoIdx ? Number(tramoIdx) : undefined, manual: manualRaw ? JSON.parse(manualRaw) : undefined });
}

// Reserva de la otra plataforma (PT0xxxx, no está en Supabase): se pasa todo a mano.
//   --manual '{"cliente":"Chris Brown","pax":2,"vehiculo":"Hyundai Staria","hora":"12:30","recoger":"Hotel Parador","zonaOrigen":"Manuel Antonio","llevar":"SJO Airport","zonaDestino":"Alajuela","duracion":"3,5 H","pagado":true}'
type Manual = { cliente: string; pax: number; vehiculo?: string; hora: string; recoger: string; zonaOrigen?: string; llevar: string; zonaDestino?: string; duracion?: string; pagado?: boolean; vuelo?: string };

async function generar({ orden, fecha, chofer, neto, nota = "", tramo, manual }: Hoja & { manual?: Manual }) {
  const tramoIdx = tramo ? String(tramo) : undefined;
  let b: ReservaRow;
  let it: HojaItem;
  if (manual) {
    b = { order_number: orden, customer_name: manual.cliente, status: manual.pagado === false ? "pending" : "approved" };
    it = {
      passengers: manual.pax,
      vehicleName: manual.vehiculo || "Hyundai Staria",
      pickupTime: manual.hora,
      pickupPlace: manual.recoger,
      fromName: manual.zonaOrigen || "",
      dropoffPlace: manual.llevar,
      toName: manual.zonaDestino || "",
      duration: manual.duracion || "",
      flightNumber: manual.vuelo || "",
      serviceType: "standard",
    };
  } else {
    const { supabaseAdmin } = await import("../lib/supabase-admin");
    const res = await supabaseAdmin
      .from("bookings")
      .select("order_number,customer_name,status,items")
      .eq("order_number", orden)
      .single();
    const row: ReservaRow | null = res.data;
    if (res.error || !row) {
      console.error("No encontré la reserva", orden, res.error?.message);
      process.exit(1);
    }
    b = row;
    const items = (b.items || []).filter((i) => (i.date || "").startsWith(fecha));
    if (!items.length) {
      console.error(`La reserva ${orden} no tiene tramos el ${fecha}. Fechas:`, (b.items || []).map((i) => i.date));
      process.exit(1);
    }
    it = tramoIdx ? items[Number(tramoIdx) - 1] : items[0];
    if (!it) {
      console.error("Índice de tramo inválido");
      process.exit(1);
    }
  }

  const { buildHoja, renderHojaHtml, hojaAlto } = await import("../lib/hoja-servicio");
  const model = buildHoja(b, it, { fecha, chofer, neto, nota });
  const html = renderHojaHtml(model, "file://" + resolve("public/logo-ptcr.png"));

  const dir = mkdtempSync(join(tmpdir(), "hoja-"));
  const htmlPath = join(dir, "hoja.html");
  writeFileSync(htmlPath, html);

  const out = join(homedir(), "Desktop", `hoja-servicio-${orden}-${fecha}.png`);
  const alto = hojaAlto(model);
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    `--window-size=1080,${alto}`,
    `--screenshot=${out}`,
    "file://" + htmlPath,
  ], { stdio: "ignore" });

  console.log("OK", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
