// PNG de la hoja de servicio de un tramo, generado en el servidor (Vercel)
// con next/og (satori). Mismo diseño que scripts/hoja-servicio.ts.
//
//   GET /api/admin/hoja?orden=PTCR-2209&fecha=2026-11-27&tramo=1[&download=1]
//
// Toma chofer, neto y nota de la tabla `dispatch` (lo que se guardó en
// /admin/despacho). Requiere la cookie de sesión del admin.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildHoja, hojaAlto, HOJA_WIDTH, type HojaItem } from "@/lib/hoja-servicio";
import { HojaServicioImage } from "@/components/admin/HojaServicioImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Assets = { logo: string; fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 | 800; style: "normal" }[] };
let assetsPromise: Promise<Assets> | null = null;

function toArrayBuffer(b: Buffer): ArrayBuffer {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

async function loadAssets(): Promise<Assets> {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      const root = process.cwd();
      const [logo, r, b, xb] = await Promise.all([
        readFile(join(root, "public/logo-ptcr.png")),
        readFile(join(root, "lib/fonts/Inter-Regular.ttf")),
        readFile(join(root, "lib/fonts/Inter-Bold.ttf")),
        readFile(join(root, "lib/fonts/Inter-ExtraBold.ttf")),
      ]);
      return {
        logo: `data:image/png;base64,${logo.toString("base64")}`,
        fonts: [
          { name: "Inter", data: toArrayBuffer(r), weight: 400, style: "normal" },
          { name: "Inter", data: toArrayBuffer(b), weight: 700, style: "normal" },
          { name: "Inter", data: toArrayBuffer(xb), weight: 800, style: "normal" },
        ],
      };
    })();
  }
  return assetsPromise;
}

export async function GET(req: Request) {
  if (!(await isAdminAuthed())) {
    return new Response("No autorizado", { status: 401 });
  }
  const url = new URL(req.url);
  const orden = (url.searchParams.get("orden") || "").trim();
  const fecha = (url.searchParams.get("fecha") || "").trim();
  const tramo = Math.max(1, parseInt(url.searchParams.get("tramo") || "1", 10) || 1);
  const download = url.searchParams.get("download") === "1";
  if (!orden || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Response("Faltan orden o fecha", { status: 400 });
  }

  const [{ data: b, error }, { data: d }] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("order_number,customer_name,status,items")
      .eq("order_number", orden)
      .maybeSingle(),
    supabaseAdmin
      .from("dispatch")
      .select("neto_usd,nota,provider:providers(nombre,es_planta)")
      .eq("order_number", orden)
      .eq("fecha", fecha)
      .eq("tramo", tramo)
      .maybeSingle(),
  ]);
  if (error || !b) return new Response(`No encontré la reserva ${orden}`, { status: 404 });

  const items = ((b.items as HojaItem[] | null) || []).filter((i) => (i as { date?: string }).date === fecha);
  const it = items[tramo - 1];
  if (!it) return new Response(`La reserva ${orden} no tiene tramo ${tramo} el ${fecha}`, { status: 404 });

  // Sin asignación guardada se aceptan ?chofer=&neto=&nota= para una hoja al vuelo.
  const provider = (d?.provider as unknown as { nombre: string; es_planta: boolean } | null) ?? null;
  const choferParam = (url.searchParams.get("chofer") || "").trim();
  if (!provider && !choferParam) {
    return new Response("Este tramo todavía no tiene chofer asignado. Asignalo en Despacho y guardá.", {
      status: 409,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const model = provider
    ? buildHoja(b, it, {
        fecha,
        chofer: provider.nombre,
        neto: provider.es_planta ? null : d?.neto_usd,
        nota: d?.nota,
      })
    : buildHoja(b, it, {
        fecha,
        chofer: choferParam,
        neto: url.searchParams.get("neto"),
        nota: url.searchParams.get("nota"),
      });

  const assets = await loadAssets();
  const filename = `hoja-servicio-${orden}-${fecha}${tramo > 1 ? `-${tramo}` : ""}.png`;
  return new ImageResponse(<HojaServicioImage m={model} logoSrc={assets.logo} />, {
    width: HOJA_WIDTH,
    height: hojaAlto(model),
    fonts: assets.fonts,
    headers: {
      "cache-control": "private, no-store",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
    },
  });
}
