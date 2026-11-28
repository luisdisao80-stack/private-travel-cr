import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Save } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { upsertProviderAction, deleteProviderAction } from "../actions";

export const dynamic = "force-dynamic";

type Provider = {
  id: number;
  nombre: string;
  chat_whatsapp: string | null;
  telefono: string | null;
  es_planta: boolean;
  vehiculo: string | null;
  activo: boolean;
  notas: string | null;
};

type SearchParams = Promise<{ saved?: string; error?: string }>;

const input =
  "w-full bg-adm-bg border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-md px-2.5 py-1.5 text-sm text-adm-text";

export default async function ProveedoresPage({ searchParams }: { searchParams: SearchParams }) {
  const { saved, error } = await searchParams;
  const { data, error: dbError } = await supabaseAdmin
    .from("providers")
    .select("id,nombre,chat_whatsapp,telefono,es_planta,vehiculo,activo,notas")
    .order("activo", { ascending: false })
    .order("es_planta", { ascending: false })
    .order("nombre");
  const rows = (data as Provider[] | null) || [];

  return (
    <div className="max-w-5xl">
      <Link href="/admin/despacho" className="inline-flex items-center gap-1 text-xs text-adm-muted hover:text-adm-accent-hover mb-4">
        <ChevronLeft size={14} /> Despacho
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Proveedores y choferes</h1>
        <p className="text-xs text-adm-faint mt-1">
          Los <b>de planta</b> no llevan neto en la hoja de servicio; a los externos siempre se les pone el neto.
          &ldquo;Chat&rdquo; es el nombre tal cual aparece en WhatsApp.
        </p>
      </div>

      {saved && (
        <div className="bg-adm-ok/10 border border-adm-ok/30 text-adm-ok text-sm rounded-md px-3 py-2 mb-4">
          {saved === "borrado" ? "Proveedor borrado." : saved === "desactivado" ? "Tenía tramos asignados: se desactivó en lugar de borrarlo." : "Guardado."}
        </div>
      )}
      {(error || dbError) && (
        <div className="bg-adm-danger/10 border border-adm-danger/30 text-adm-danger text-sm rounded-md px-3 py-2 mb-4">
          {error === "nombre" ? "El nombre es obligatorio." : error || dbError?.message}
        </div>
      )}

      {/* Nuevo */}
      <form action={upsertProviderAction} className="bg-adm-surface border border-adm-border rounded-xl p-4 mb-6">
        <div className="text-sm font-semibold text-adm-text mb-3 inline-flex items-center gap-1.5">
          <Plus size={14} className="text-adm-accent" /> Agregar proveedor
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input name="nombre" required placeholder="Nombre *" className={input} />
          <input name="chat_whatsapp" placeholder="Chat de WhatsApp" className={input} />
          <input name="telefono" placeholder="Teléfono" className={input} />
          <input name="vehiculo" placeholder="Vehículo habitual" className={input} />
          <label className="inline-flex items-center gap-2 text-sm text-adm-text-2">
            <input type="checkbox" name="es_planta" className="accent-[var(--adm-accent)]" /> De planta
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-xs px-4 py-2 rounded-md transition-colors"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Lista */}
      <div className="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-adm-surface-2/70 text-xs uppercase tracking-wider text-adm-muted">
              <tr>
                <th className="text-left font-medium px-3 py-3">Nombre</th>
                <th className="text-left font-medium px-3 py-3">Chat WhatsApp</th>
                <th className="text-left font-medium px-3 py-3">Teléfono</th>
                <th className="text-left font-medium px-3 py-3">Vehículo</th>
                <th className="text-left font-medium px-3 py-3">Planta</th>
                <th className="text-left font-medium px-3 py-3">Activo</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-adm-faint py-10">
                    Sin proveedores todavía. Pegá la semilla de <code>scripts/sql-despacho-providers.sql</code> o agregá uno arriba.
                  </td>
                </tr>
              )}
              {rows.map((p) => {
                const fid = `prov-${p.id}`;
                return (
                  <tr key={p.id} className={`border-t border-adm-border ${p.activo ? "" : "opacity-50"}`}>
                    <td className="px-3 py-2">
                      <form id={fid} action={upsertProviderAction}>
                        <input type="hidden" name="id" value={p.id} />
                      </form>
                      <input form={fid} name="nombre" defaultValue={p.nombre} required className={input} />
                    </td>
                    <td className="px-3 py-2">
                      <input form={fid} name="chat_whatsapp" defaultValue={p.chat_whatsapp || ""} className={input} />
                    </td>
                    <td className="px-3 py-2">
                      <input form={fid} name="telefono" defaultValue={p.telefono || ""} className={input} />
                    </td>
                    <td className="px-3 py-2">
                      <input form={fid} name="vehiculo" defaultValue={p.vehiculo || ""} className={input} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input form={fid} type="checkbox" name="es_planta" defaultChecked={p.es_planta} className="accent-[var(--adm-accent)]" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input form={fid} type="checkbox" name="activo" defaultChecked={p.activo} className="accent-[var(--adm-accent)]" />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          form={fid}
                          type="submit"
                          title="Guardar cambios"
                          className="inline-flex items-center gap-1 bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-xs px-2.5 py-1.5 rounded-md"
                        >
                          <Save size={12} />
                        </button>
                        <form action={deleteProviderAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            title="Borrar (si tiene tramos asignados, solo se desactiva)"
                            className="text-adm-faint hover:text-adm-danger p-1.5 rounded hover:bg-adm-surface-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
