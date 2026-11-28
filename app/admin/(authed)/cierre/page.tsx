import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, AlertTriangle, Lock, FileText } from "lucide-react";
import { cargarMes, cargarSemana, cierreAPagar, pagadosDe } from "@/lib/cierre-datos";
import { CerrarSemana, MarcarPagado } from "@/components/admin/CierreControles";
import { cerrarSemanaAction, marcarPagadoAction, reabrirSemanaAction } from "./actions";
import { hora12 } from "@/lib/hoja-servicio";
import {
  domingoDeLaSemana,
  esFechaIso,
  fechaCorta,
  hoyCR,
  lunesDeLaSemana,
  rotuloMes,
  rotuloSemana,
  sumarDias,
} from "@/lib/cierre-semanal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cierre semanal · Admin · Private Travel CR",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ semana?: string }>;

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function CierrePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const lunes = lunesDeLaSemana(esFechaIso(sp.semana) ? (sp.semana as string) : hoyCR());
  const domingo = domingoDeLaSemana(lunes);

  const semana = await cargarSemana(lunes);
  const cierre = cierreAPagar(semana);
  const pagados = pagadosDe(semana);
  const mes = await cargarMes(lunes.slice(0, 7));

  const terminada = domingo <= hoyCR();
  const conFactura = cierre.porProveedor.reduce((t, r) => t + r.viajesConFactura, 0);
  const aPagar = cierre.porProveedor.filter((r) => !r.esPlanta);
  const pendientesDePago = semana.cerrado
    ? aPagar.filter((r) => !pagados[String(r.providerId ?? r.proveedor)])
    : aPagar;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ------------------------------------------------ cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText size={18} className="text-adm-accent" />
            Cierre semanal de proveedores
          </h1>
          <p className="text-sm text-adm-muted mt-1">
            Lunes a domingo · {rotuloSemana(lunes)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/cierre?semana=${sumarDias(lunes, -7)}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-adm-border text-adm-text-2 hover:bg-adm-surface-2"
          >
            <ChevronLeft size={14} /> Anterior
          </Link>
          <Link
            href="/admin/cierre"
            className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-adm-border text-adm-text-2 hover:bg-adm-surface-2"
          >
            Esta semana
          </Link>
          <Link
            href={`/admin/cierre?semana=${sumarDias(lunes, 7)}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-adm-border text-adm-text-2 hover:bg-adm-surface-2"
          >
            Siguiente <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------ estado */}
      <div className="rounded-lg border border-adm-border bg-adm-surface p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-adm-faint">Viajes</div>
              <div className="text-2xl font-bold">{cierre.totalViajes}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-adm-faint">A pagar</div>
              <div className="text-2xl font-bold text-adm-accent">{usd(cierre.totalUsd)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-adm-faint">Con factura</div>
              <div className="text-2xl font-bold text-adm-info">{conFactura}</div>
              <div className="text-[11px] text-adm-faint">entraron por la web</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-adm-faint">Estado</div>
              <div className="text-sm font-bold mt-1.5">
                {semana.cerrado ? (
                  <span className="inline-flex items-center gap-1 text-adm-ok">
                    <Lock size={13} /> Cerrada
                  </span>
                ) : terminada ? (
                  <span className="text-adm-accent">Lista para cerrar</span>
                ) : (
                  <span className="text-adm-muted">En curso</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/admin/cierre?semana=${lunes}`}
              className="inline-flex items-center gap-2 bg-adm-info hover:bg-adm-info/85 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors"
            >
              <Download size={14} /> Bajar el Excel
            </a>
            <CerrarSemana
              semana={lunes}
              cerrado={semana.cerrado}
              cerrarAction={cerrarSemanaAction}
              reabrirAction={reabrirSemanaAction}
            />
          </div>
        </div>

        {semana.cerrado && semana.descuadrado && (
          <p className="mt-3 flex items-start gap-2 text-xs font-medium text-adm-danger">
            <AlertTriangle size={14} className="mt-px shrink-0" />
            Esta semana se cerró con {usd(cierre.totalUsd)} en {cierre.totalViajes} viajes, pero el
            despacho ahora dice {usd(semana.cierre.totalUsd)} en {semana.cierre.totalViajes}. Alguien
            movió un neto después de cerrar. Lo que se paga es lo cerrado; el detalle de abajo es el
            actual.
          </p>
        )}
        {semana.cerrado && pendientesDePago.length === 0 && aPagar.length > 0 && (
          <p className="mt-3 text-xs font-medium text-adm-ok">
            Semana liquidada: a los {aPagar.length} proveedores ya se les pagó.
          </p>
        )}
      </div>

      {/* ------------------------------------------------ por proveedor */}
      <div className="rounded-lg border border-adm-border bg-adm-surface overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-adm-border">
          <h2 className="text-sm font-bold">Por proveedor</h2>
          <p className="text-xs text-adm-muted mt-0.5">
            Los viajes que entraron por la web se pagan contra factura del proveedor; los de WeTravel, sin factura.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-adm-surface-2 text-adm-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Proveedor</th>
                <th className="px-4 py-2 text-right font-semibold">Viajes</th>
                <th className="px-4 py-2 text-right font-semibold">Con factura</th>
                <th className="px-4 py-2 text-right font-semibold">Sin factura</th>
                <th className="px-4 py-2 text-right font-semibold">Monto</th>
                <th className="px-4 py-2 text-left font-semibold">Pago</th>
              </tr>
            </thead>
            <tbody>
              {cierre.porProveedor.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-adm-faint py-12 text-sm">
                    No hay viajes despachados en esta semana.
                  </td>
                </tr>
              )}
              {cierre.porProveedor.map((r) => (
                <tr key={String(r.providerId ?? r.proveedor)} className="border-t border-adm-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.proveedor}</div>
                    {r.esPlanta && (
                      <div className="text-[11px] text-adm-faint">
                        De planta · no se le paga por servicio
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{r.viajes}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {r.viajesConFactura > 0 ? (
                      <span className="font-bold text-adm-info">{r.viajesConFactura}</span>
                    ) : (
                      <span className="text-adm-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-adm-muted">
                    {r.viajesSinFactura || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {r.esPlanta ? <span className="text-adm-faint">—</span> : usd(r.montoUsd)}
                  </td>
                  <td className="px-4 py-3">
                    {r.esPlanta ? (
                      <span className="text-xs text-adm-faint">—</span>
                    ) : semana.cerrado ? (
                      <MarcarPagado
                        semana={lunes}
                        providerId={r.providerId}
                        pagado={Boolean(pagados[String(r.providerId ?? r.proveedor)])}
                        accion={marcarPagadoAction}
                      />
                    ) : (
                      <span className="text-xs text-adm-faint">Cerrá la semana primero</span>
                    )}
                  </td>
                </tr>
              ))}
              {cierre.porProveedor.length > 0 && (
                <tr className="border-t-2 border-adm-border-strong bg-adm-surface-2 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right font-mono">{cierre.totalViajes}</td>
                  <td className="px-4 py-3 text-right font-mono text-adm-info">{conFactura}</td>
                  <td className="px-4 py-3 text-right font-mono text-adm-muted">
                    {cierre.totalViajes - conFactura}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-adm-accent">{usd(cierre.totalUsd)}</td>
                  <td className="px-4 py-3" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------ acumulado del mes */}
      {mes.length > 0 && (
        <div className="rounded-lg border border-adm-border bg-adm-surface overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-adm-border">
            <h2 className="text-sm font-bold">Acumulado de {rotuloMes(lunes)}</h2>
            <p className="text-xs text-adm-muted mt-0.5">
              Suma de las semanas ya cerradas. Cada semana cuenta entera en el mes de su lunes.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-adm-surface-2 text-adm-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Proveedor</th>
                  <th className="px-4 py-2 text-right font-semibold">Viajes</th>
                  <th className="px-4 py-2 text-right font-semibold">Con factura</th>
                  <th className="px-4 py-2 text-right font-semibold">Monto del mes</th>
                  <th className="px-4 py-2 text-right font-semibold">Semanas</th>
                </tr>
              </thead>
              <tbody>
                {mes.map((r) => (
                  <tr key={String(r.provider_id ?? r.proveedor)} className="border-t border-adm-border">
                    <td className="px-4 py-2.5 font-medium">{r.proveedor}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{r.viajes}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-adm-info">
                      {r.viajes_con_factura || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">{usd(r.monto_usd)}</td>
                    <td className="px-4 py-2.5 text-right text-xs">
                      <span className="text-adm-ok font-bold">{r.semanas_pagadas} pagada(s)</span>
                      {r.semanas_pendientes > 0 && (
                        <span className="text-adm-danger font-bold">
                          {" · "}
                          {r.semanas_pendientes} pendiente(s)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-adm-border-strong bg-adm-surface-2 font-bold">
                  <td className="px-4 py-3">Total del mes</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {mes.reduce((t, r) => t + r.viajes, 0)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-mono text-adm-accent">
                    {usd(mes.reduce((t, r) => t + r.monto_usd, 0))}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ detalle */}
      <div className="rounded-lg border border-adm-border bg-adm-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-adm-border">
          <h2 className="text-sm font-bold">Detalle de la semana</h2>
          <p className="text-xs text-adm-muted mt-0.5">
            El respaldo, viaje por viaje, para cuando un proveedor reclama.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-adm-surface-2 text-adm-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Día</th>
                <th className="px-4 py-2 text-left font-semibold">Reserva</th>
                <th className="px-4 py-2 text-left font-semibold">Ruta</th>
                <th className="px-4 py-2 text-left font-semibold">Proveedor</th>
                <th className="px-4 py-2 text-left font-semibold">Entró por</th>
                <th className="px-4 py-2 text-right font-semibold">Neto</th>
              </tr>
            </thead>
            <tbody>
              {semana.cierre.viajes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-adm-faint py-12 text-sm">
                    Sin viajes despachados.
                  </td>
                </tr>
              )}
              {semana.cierre.viajes.map((v) => (
                <tr key={`${v.orden}#${v.fecha}#${v.tramo}`} className="border-t border-adm-border align-top">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="text-xs">{fechaCorta(v.fecha)}</div>
                    <div className="font-mono text-xs text-adm-faint">{hora12(v.hora) || "—"}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/${encodeURIComponent(v.orden)}`}
                      className="text-adm-accent hover:text-adm-accent-hover font-mono text-xs"
                    >
                      {v.orden}
                      {v.tramo > 1 ? ` · tramo ${v.tramo}` : ""}
                    </Link>
                    <div className="text-xs">{v.cliente}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {v.ruta}
                    <div className="text-adm-faint">{v.pax} pax</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {v.proveedor}
                    {v.esPlanta && <div className="text-adm-faint">de planta</div>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        v.origen === "Pendiente"
                          ? "bg-adm-danger/10 text-adm-danger border-adm-danger/40"
                          : v.origen === "Web"
                            ? "bg-adm-info/10 text-adm-info border-adm-info/40"
                            : "bg-adm-surface-2 text-adm-muted border-adm-border"
                      }`}
                    >
                      {v.origen}
                    </span>
                    <div className="text-[11px] text-adm-faint mt-0.5">
                      {v.factura ? "lleva factura" : "sin factura"}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {v.esPlanta || v.netoUsd == null ? (
                      <span className="text-adm-faint">—</span>
                    ) : (
                      usd(v.netoUsd)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
