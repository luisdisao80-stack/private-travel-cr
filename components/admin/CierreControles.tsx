"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, AlertCircle, Lock, LockOpen } from "lucide-react";
import type { ActionResult } from "@/app/admin/(authed)/cierre/actions";

type Accion = (fd: FormData) => Promise<ActionResult>;

function Error_({ texto }: { texto: string }) {
  return (
    <span className="inline-flex items-start gap-1.5 text-xs font-medium text-adm-danger">
      <AlertCircle size={14} className="mt-px shrink-0" />
      {texto}
    </span>
  );
}

/** Cerrar la semana (congelar montos) o reabrirla. */
export function CerrarSemana({
  semana,
  cerrado,
  cerrarAction,
  reabrirAction,
}: {
  semana: string;
  cerrado: boolean;
  cerrarAction: Accion;
  reabrirAction: Accion;
}) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function run(accion: Accion) {
    setError("");
    start(async () => {
      const fd = new FormData();
      fd.set("semana", semana);
      const r = await accion(fd);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-1.5 items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(cerrado ? reabrirAction : cerrarAction)}
        className={`inline-flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-md transition-colors disabled:opacity-60 ${
          cerrado
            ? "bg-adm-surface-2 text-adm-text-2 hover:bg-adm-border border border-adm-border"
            : "bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent"
        }`}
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : cerrado ? (
          <LockOpen size={14} />
        ) : (
          <Lock size={14} />
        )}
        {cerrado ? "Reabrir la semana" : "Cerrar la semana"}
      </button>
      {error && <Error_ texto={error} />}
    </div>
  );
}

/** Marca que a ese proveedor ya se le pagó la semana. */
export function MarcarPagado({
  semana,
  providerId,
  pagado,
  accion,
}: {
  semana: string;
  providerId: number | null;
  pagado: boolean;
  accion: Accion;
}) {
  const [listo, setListo] = useState(pagado);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function toggle() {
    setError("");
    const siguiente = !listo;
    start(async () => {
      const fd = new FormData();
      fd.set("semana", semana);
      if (providerId != null) fd.set("provider_id", String(providerId));
      fd.set("pagado", siguiente ? "1" : "0");
      const r = await accion(fd);
      if (r.ok) setListo(siguiente);
      else setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        aria-pressed={listo}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border transition-colors disabled:opacity-60 ${
          listo
            ? "bg-adm-ok/10 border-adm-ok text-adm-ok"
            : "bg-adm-surface-2 border-adm-border text-adm-muted hover:text-adm-text"
        }`}
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        {listo ? "Pagado" : "Marcar pagado"}
      </button>
      {error && <Error_ texto={error} />}
    </div>
  );
}
