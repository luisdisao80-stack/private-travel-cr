// El Excel del cierre semanal de proveedores.
//
//   GET /api/admin/cierre?semana=2026-11-24
//
// `semana` es el lunes de la semana; si no viene, o cae en otro día, se usa
// el lunes de la semana de esa fecha. Requiere la cookie de sesión del admin.
import { isAdminAuthed } from "@/lib/admin-auth";
import { cargarSemana, cierreAPagar, pagadosDe } from "@/lib/cierre-datos";
import { construirCierreXlsx, nombreArchivoCierre } from "@/lib/cierre-xlsx";
import { esFechaIso, hoyCR, lunesDeLaSemana } from "@/lib/cierre-semanal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthed())) {
    return new Response("No autorizado", { status: 401 });
  }

  const pedida = new URL(request.url).searchParams.get("semana") || "";
  const lunes = lunesDeLaSemana(esFechaIso(pedida) ? pedida : hoyCR());

  const semana = await cargarSemana(lunes);
  const xlsx = await construirCierreXlsx(cierreAPagar(semana), {
    cerrado: semana.cerrado,
    pagados: pagadosDe(semana),
  });

  return new Response(new Uint8Array(xlsx), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${nombreArchivoCierre(lunes)}"`,
      "cache-control": "no-store",
    },
  });
}
