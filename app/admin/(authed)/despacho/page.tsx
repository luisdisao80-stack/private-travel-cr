import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Plane, Baby, Star, CalendarDays } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem } from "@/lib/CartContext";
import { hora12, sillasTexto, vueloValido } from "@/lib/hoja-servicio";
import DispatchRow, { type ProviderOption } from "@/components/admin/DispatchRow";
import { saveDispatchAction, setDispatchEstadoAction } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ fecha?: string }>;

type BookingRow = {
  order_number: string;
  customer_name: string | null;
  status: string | null;
  items: CartItem[] | null;
  tilopay_id: string | null;
  tilopay_response: string | null;
};

type DispatchDb = {
  order_number: string;
  tramo: number;
  provider_id: number | null;
  neto_usd: number | string | null;
  nota: string | null;
  estado: "asignado" | "hoja_enviada";
};

type Tramo = {
  key: string;
  orden: string;
  tramo: number;
  cliente: string;
  status: string;
  pago: "Web" | "WeTravel" | "Pendiente";
  it: CartItem;
  d: DispatchDb | null;
};

// Hoy en Costa Rica (UTC-6, sin horario de verano) como YYYY-MM-DD.
function hoyCR(): string {
  return new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10);
}
function sumarDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DIAS[dt.getUTCDay()]} ${d} ${MESES[m - 1]} ${y}`;
}

export default async function DespachoPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(sp.fecha || "") ? (sp.fecha as string) : sumarDias(hoyCR(), 1);

  const [bookingsRes, providersRes, dispatchRes] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("order_number,customer_name,status,items,tilopay_id,tilopay_response")
      .in("status", ["approved", "pending"])
      .filter("items", "cs", JSON.stringify([{ date: fecha }])),
    supabaseAdmin
      .from("providers")
      .select("id,nombre,es_planta,vehiculo")
      .eq("activo", true)
      .order("es_planta", { ascending: false })
      .order("nombre"),
    supabaseAdmin
      .from("dispatch")
      .select("order_number,tramo,provider_id,neto_usd,nota,estado")
      .eq("fecha", fecha),
  ]);

  const providers = (providersRes.data as ProviderOption[] | null) || [];
  const dispatchRows = (dispatchRes.data as DispatchDb[] | null) || [];
  const dmap = new Map(dispatchRows.map((d) => [`${d.order_number}#${d.tramo}`, d]));

  const tramos: Tramo[] = [];
  for (const b of (bookingsRes.data as BookingRow[] | null) || []) {
    let idx = 0;
    for (const it of b.items || []) {
      if (it.date !== fecha) continue;
      idx += 1;
      const pago: Tramo["pago"] =
        b.status !== "approved" ? "Pendiente" : b.tilopay_response === "paid_via_wetravel" ? "WeTravel" : b.tilopay_id ? "Web" : "WeTravel";
      tramos.push({
        key: `${b.order_number}#${idx}`,
        orden: b.order_number,
        tramo: idx,
        cliente: b.customer_name || "—",
        status: b.status || "",
        pago,
        it,
        d: dmap.get(`${b.order_number}#${idx}`) || null,
      });
    }
  }
  tramos.sort((a, b) => (a.it.pickupTime || "").localeCompare(b.it.pickupTime || "") || a.orden.localeCompare(b.orden));

  const sinAsignar = tramos.filter((t) => !t.d?.provider_id).length;
  const enviadas = tramos.filter((t) => t.d?.estado === "hoja_enviada").length;
  const errores = [bookingsRes.error, providersRes.error, dispatchRes.error].filter(Boolean);
  const faltanTablas = errores.some((e) => /relation .* does not exist|schema cache/i.test(e!.message));

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Despacho</h1>
          <p className="text-xs text-adm-faint mt-1">
            {tramos.length} tramo{tramos.length === 1 ? "" : "s"} · {sinAsignar} sin chofer · {enviadas} hoja{enviadas === 1 ? "" : "s"} enviada{enviadas === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/despacho/proveedores"
            className="inline-flex items-center gap-1.5 text-xs text-adm-muted hover:text-adm-accent border border-adm-border-strong rounded-md px-3 py-2"
          >
            <Users size={13} /> Proveedores ({providers.length})
          </Link>
        </div>
      </div>

      {/* Selector de fecha */}
      <form method="GET" className="bg-adm-surface border border-adm-border rounded-xl p-3 mb-6 flex items-center gap-2 flex-wrap">
        <Link
          href={`/admin/despacho?fecha=${sumarDias(fecha, -1)}`}
          className="p-2 rounded-md border border-adm-border-strong hover:border-adm-accent/60 text-adm-muted hover:text-adm-text"
          aria-label="Día anterior"
        >
          <ChevronLeft size={14} />
        </Link>
        <div className="relative">
          <CalendarDays size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-adm-faint pointer-events-none" />
          <input
            type="date"
            name="fecha"
            defaultValue={fecha}
            className="bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md pl-8 pr-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-xs px-4 py-2 rounded-md transition-colors"
        >
          Ver
        </button>
        <Link
          href={`/admin/despacho?fecha=${sumarDias(fecha, 1)}`}
          className="p-2 rounded-md border border-adm-border-strong hover:border-adm-accent/60 text-adm-muted hover:text-adm-text"
          aria-label="Día siguiente"
        >
          <ChevronRight size={14} />
        </Link>
        <span className="text-sm font-semibold capitalize ml-2">{fechaCorta(fecha)}</span>
        <span className="text-xs text-adm-faint ml-auto flex gap-3">
          <Link href={`/admin/despacho?fecha=${hoyCR()}`} className="hover:text-adm-accent">
            Hoy
          </Link>
          <Link href={`/admin/despacho?fecha=${sumarDias(hoyCR(), 1)}`} className="hover:text-adm-accent">
            Mañana
          </Link>
        </span>
      </form>

      {errores.length > 0 && (
        <div className="bg-adm-danger/10 border border-adm-danger/30 text-adm-danger text-sm rounded-md px-3 py-2 mb-4">
          {faltanTablas ? (
            <>
              Faltan las tablas <code>providers</code> / <code>dispatch</code> en Supabase. Pegá el SQL de{" "}
              <code>scripts/sql-despacho-providers.sql</code> en el editor SQL y recargá.
            </>
          ) : (
            errores.map((e, i) => <div key={i}>{e!.message}</div>)
          )}
        </div>
      )}

      <div className="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-adm-surface-2/70 text-xs uppercase tracking-wider text-adm-muted">
              <tr>
                <th className="text-left font-medium px-4 py-3">Hora</th>
                <th className="text-left font-medium px-4 py-3">Reserva · Cliente</th>
                <th className="text-left font-medium px-4 py-3">Tramo</th>
                <th className="text-left font-medium px-4 py-3">Pago</th>
                <th className="text-left font-medium px-4 py-3 min-w-[420px]">Chofer / proveedor</th>
              </tr>
            </thead>
            <tbody>
              {tramos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-adm-faint py-12 text-sm">
                    No hay tramos para este día.
                  </td>
                </tr>
              )}
              {tramos.map((t) => {
                const it = t.it;
                const sillas = sillasTexto(it);
                const vuelo = vueloValido(it.flightNumber);
                const pendiente = t.status !== "approved";
                return (
                  <tr
                    key={t.key}
                    className={`border-t border-adm-border align-top ${pendiente ? "bg-adm-accent/5" : ""}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-base font-bold">{hora12(it.pickupTime || "") || "—"}</div>
                      {pendiente && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-adm-accent/15 text-adm-accent border border-adm-accent/40">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${encodeURIComponent(t.orden)}`}
                        className="text-adm-accent hover:text-adm-accent-hover font-mono text-xs"
                      >
                        {t.orden}
                        {t.tramo > 1 ? ` · tramo ${t.tramo}` : ""}
                      </Link>
                      <div className="font-medium">{t.cliente}</div>
                      <div className="text-xs text-adm-faint flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                        <span>
                          {it.passengers} pax{it.children ? ` (${it.children} niños)` : ""}
                        </span>
                        <span>· {it.vehicleName}</span>
                        {it.serviceType === "vip" && (
                          <span className="inline-flex items-center gap-0.5 text-adm-accent font-bold">
                            <Star size={10} /> VIP
                          </span>
                        )}
                        {!!it.extraStopHours && <span>· parada {it.extraStopHours} h</span>}
                        {sillas.length > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Baby size={10} /> {sillas.join(", ")}
                          </span>
                        )}
                        {vuelo && (
                          <span className="inline-flex items-center gap-0.5">
                            <Plane size={10} /> {it.flightNumber}
                            {(it as { flightTime?: string }).flightTime ? ` ${hora12((it as { flightTime?: string }).flightTime!)}` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[260px]">
                      <div className="text-[10px] uppercase tracking-wider text-adm-faint">Recoger en</div>
                      <div className="text-adm-text">{it.pickupPlace || it.fromName}</div>
                      <div className="text-adm-faint">{it.fromName}</div>
                      <div className="text-[10px] uppercase tracking-wider text-adm-faint mt-1.5">Llevar a</div>
                      <div className="text-adm-text">{it.dropoffPlace || it.toName}</div>
                      <div className="text-adm-faint">
                        {it.toName}
                        {it.duration ? ` · ${it.duration}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          t.pago === "Pendiente"
                            ? "bg-adm-danger/10 text-adm-danger border-adm-danger/30"
                            : t.pago === "Web"
                              ? "bg-adm-info/15 text-adm-info border-adm-info/40"
                              : "bg-adm-ok/15 text-adm-ok border-adm-ok/40"
                        }`}
                      >
                        {t.pago}
                      </span>
                      <div className="font-mono text-sm mt-1">${Number(it.totalPrice || 0).toFixed(0)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <DispatchRow
                        orden={t.orden}
                        fecha={fecha}
                        tramo={t.tramo}
                        providers={providers}
                        initial={{
                          provider_id: t.d?.provider_id ?? null,
                          neto_usd: t.d?.neto_usd != null ? Number(t.d.neto_usd) : null,
                          nota: t.d?.nota || "",
                          estado: t.d?.estado ?? null,
                        }}
                        saveAction={saveDispatchAction}
                        estadoAction={setDispatchEstadoAction}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-adm-faint mt-3">
        Solo reservas aprobadas o pendientes. Las hojas de servicio nunca muestran el teléfono del cliente ni el precio que pagó.
      </p>
    </div>
  );
}
