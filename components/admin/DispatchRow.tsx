"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, AlertCircle, Image as ImageIcon, Download, Save } from "lucide-react";
import type { ActionResult } from "@/app/admin/(authed)/despacho/actions";

export type ProviderOption = {
  id: number;
  nombre: string;
  es_planta: boolean;
  vehiculo: string | null;
};

type Props = {
  orden: string;
  fecha: string;
  tramo: number;
  providers: ProviderOption[];
  initial: {
    provider_id: number | null;
    neto_usd: number | null;
    nota: string;
    estado: "asignado" | "hoja_enviada" | null;
  };
  saveAction: (fd: FormData) => Promise<ActionResult>;
  estadoAction: (fd: FormData) => Promise<ActionResult>;
};

// Controles de asignación de UN tramo: proveedor + neto + nota + hoja.
// Cliente para dar feedback inmediato (guardando → listo) y para ocultar el
// neto cuando el proveedor elegido es de planta.
export default function DispatchRow({ orden, fecha, tramo, providers, initial, saveAction, estadoAction }: Props) {
  const [providerId, setProviderId] = useState<string>(initial.provider_id ? String(initial.provider_id) : "");
  const [neto, setNeto] = useState<string>(initial.neto_usd != null ? String(initial.neto_usd) : "");
  const [nota, setNota] = useState<string>(initial.nota);
  const [estado, setEstado] = useState<"asignado" | "hoja_enviada" | null>(initial.estado);
  const [saved, setSaved] = useState<boolean>(!!initial.provider_id);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const prov = providers.find((p) => String(p.id) === providerId) || null;
  const esPlanta = !!prov?.es_planta;

  const hojaHref = `/api/admin/hoja?orden=${encodeURIComponent(orden)}&fecha=${fecha}&tramo=${tramo}`;
  const puedeHoja = saved && !dirty && !!providerId;

  function mark<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setDirty(true);
      setMsg(null);
    };
  }

  function guardar() {
    setMsg(null);
    start(async () => {
      const fd = new FormData();
      fd.set("orden", orden);
      fd.set("fecha", fecha);
      fd.set("tramo", String(tramo));
      fd.set("provider_id", providerId);
      fd.set("neto", esPlanta ? "" : neto);
      fd.set("nota", nota);
      fd.set("estado", estado ?? "asignado");
      const r = await saveAction(fd);
      if (r.ok) {
        setSaved(!!providerId);
        setDirty(false);
        if (!providerId) setEstado(null);
        else if (!estado) setEstado("asignado");
        setMsg({ kind: "ok", text: providerId ? "Guardado" : "Asignación quitada" });
      } else {
        setMsg({ kind: "error", text: r.error });
      }
    });
  }

  function toggleEnviada() {
    const next = estado === "hoja_enviada" ? "asignado" : "hoja_enviada";
    start(async () => {
      const fd = new FormData();
      fd.set("orden", orden);
      fd.set("fecha", fecha);
      fd.set("tramo", String(tramo));
      fd.set("estado", next);
      const r = await estadoAction(fd);
      if (r.ok) setEstado(next);
      else setMsg({ kind: "error", text: r.error });
    });
  }

  const input =
    "bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-2.5 py-1.5 text-sm text-adm-text";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={providerId}
          onChange={(e) => mark(setProviderId)(e.target.value)}
          className={`${input} min-w-[190px]`}
          aria-label="Chofer / proveedor"
        >
          <option value="">— Sin asignar —</option>
          <optgroup label="De planta">
            {providers.filter((p) => p.es_planta).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </optgroup>
          <optgroup label="Externos">
            {providers.filter((p) => !p.es_planta).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </optgroup>
        </select>

        {providerId && !esPlanta && (
          <label className="flex items-center gap-1 text-sm">
            <span className="text-adm-faint">Neto $</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={5}
              value={neto}
              onChange={(e) => mark(setNeto)(e.target.value)}
              placeholder="0"
              className={`${input} w-24 font-mono`}
              aria-label="Neto en dólares"
            />
          </label>
        )}
        {providerId && esPlanta && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-adm-faint border border-adm-border-strong rounded-md px-2 py-1">
            Planta · sin neto
          </span>
        )}

        <button
          type="button"
          onClick={guardar}
          disabled={pending || (!dirty && saved)}
          className="inline-flex items-center gap-1.5 bg-adm-accent hover:bg-adm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-adm-on-accent font-bold text-xs px-3 py-1.5 rounded-md transition-colors"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Guardar
        </button>

        {msg && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${msg.kind === "ok" ? "text-adm-ok" : "text-adm-danger"}`}
          >
            {msg.kind === "ok" ? <Check size={12} /> : <AlertCircle size={12} />}
            {msg.text}
          </span>
        )}
      </div>

      <textarea
        value={nota}
        onChange={(e) => mark(setNota)(e.target.value)}
        rows={1}
        placeholder="Nota para el chofer (sale en el bloque Importante de la hoja)"
        className={`${input} w-full resize-y min-h-[34px]`}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <a
          href={puedeHoja ? hojaHref : undefined}
          target="_blank"
          rel="noopener"
          aria-disabled={!puedeHoja}
          title={puedeHoja ? "Abrir la hoja de servicio (PNG)" : "Asigná un chofer y guardá primero"}
          className={`inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 font-semibold transition-colors ${
            puedeHoja
              ? "border-adm-accent/40 text-adm-accent hover:bg-adm-accent/10"
              : "border-adm-border text-adm-faint cursor-not-allowed"
          }`}
        >
          <ImageIcon size={12} /> Hoja de servicio
        </a>
        <a
          href={puedeHoja ? `${hojaHref}&download=1` : undefined}
          aria-disabled={!puedeHoja}
          title="Descargar PNG para reenviar por WhatsApp"
          className={`inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 transition-colors ${
            puedeHoja
              ? "border-adm-border-strong text-adm-text-2 hover:border-adm-accent/60"
              : "border-adm-border text-adm-faint cursor-not-allowed"
          }`}
        >
          <Download size={12} /> Descargar
        </a>
        {saved && providerId && (
          <button
            type="button"
            onClick={toggleEnviada}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 font-semibold transition-colors ${
              estado === "hoja_enviada"
                ? "bg-adm-ok/15 border-adm-ok/40 text-adm-ok"
                : "border-adm-border-strong text-adm-muted hover:text-adm-text"
            }`}
          >
            <Check size={12} /> {estado === "hoja_enviada" ? "Hoja enviada" : "Marcar hoja enviada"}
          </button>
        )}
        {dirty && <span className="text-adm-accent">Cambios sin guardar</span>}
      </div>
    </div>
  );
}
