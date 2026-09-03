// Compara los precios y las duraciones que aparecen escritos en los blogs
// contra lo que dice la tabla `routes` en Supabase.
//
// Para qué sirve: el blog es texto escrito a mano y la tabla routes cambia
// con el tiempo. Cuando se sube un precio en la tabla, el blog se queda con
// el viejo y el cliente lee un número y le cobramos otro. Este script ya
// encontró uno así: best-beaches-costa-rica.md decía que LIR → Conchal
// costaba $185 cuando la tabla dice $135. Cincuenta dólares de diferencia
// en la página que más tráfico de playas recibe.
//
// Cómo lee el texto: solo revisa las líneas que tienen UN solo enlace a
// /private-shuttle/. Si la línea tiene dos o más enlaces no se puede saber
// a cuál de las rutas pertenece cada precio, y todo lo que reporte ahí van
// a ser falsos positivos. (Ejemplo real: "shuttle desde SJO ($220) o desde
// LIR ($225)" — los dos números están bien, pero son de rutas distintas.)
//
// La tolerancia de 20 minutos en las duraciones es a propósito: el blog
// escribe "1 h 15" donde la tabla dice "1,5 H" y eso no vale la pena
// reportarlo. Diferencias de media hora o más sí.
//
// Correr desde la raíz del proyecto, que es donde está .env.local:
//   node data/migration/audit-precios-duraciones-blog.mjs
//
// No escribe nada, solo reporta. Sale con código 1 si encuentra algo, para
// poder usarlo en CI algún día.

import fs from "fs";
import path from "path";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const key = env.SUPABASE_SERVICE_ROLE_KEY;
const res = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/routes?select=slug,precio1a6,precio7a9,duracion&limit=5000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
if (!res.ok) {
  console.error(`No se pudo leer routes: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const bySlug = Object.fromEntries((await res.json()).map((r) => [r.slug, r]));

// "4,5 H" / "1,5 H" / "3 H" -> número de horas
const dbHoras = (d) => parseFloat(String(d).replace(",", ".")) || null;

// "~5h" / "5 hours" / "1 h 30 min" / "4.5 hours" -> número de horas
function blogHoras(linea) {
  const m = linea.match(/(?:~|about\s+)?(\d+(?:[.,]\d+)?)\s*(?:h\b|hours?|hrs?)(?:\s*(\d+)\s*min)?/i);
  if (!m) return null;
  return parseFloat(m[1].replace(",", ".")) + (m[2] ? +m[2] / 60 : 0);
}

const TOLERANCIA_HORAS = 0.34; // ~20 min
const dir = "content/blog";
let hallazgos = 0;

for (const archivo of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const lineas = fs.readFileSync(path.join(dir, archivo), "utf8").split("\n");

  lineas.forEach((linea, i) => {
    const enlaces = [...linea.matchAll(/\/private-shuttle\/([a-z0-9-]+)/g)].map((m) => m[1]);
    if (enlaces.length !== 1) return; // ver nota de arriba sobre falsos positivos
    const fila = bySlug[enlaces[0]];
    if (!fila) return;

    const preciosDB = [+fila.precio1a6, +fila.precio7a9];
    const preciosBlog = [...linea.matchAll(/\$(\d[\d,]*)/g)].map((m) => +m[1].replace(/,/g, ""));
    const preciosMalos = preciosBlog.filter((p) => !preciosDB.includes(p));

    const hBlog = blogHoras(linea);
    const hDB = dbHoras(fila.duracion);
    const duracionMala = hBlog !== null && hDB !== null && Math.abs(hBlog - hDB) > TOLERANCIA_HORAS;

    if (!preciosMalos.length && !duracionMala) return;

    hallazgos++;
    console.log(`\n${archivo}:${i + 1}  [${enlaces[0]}]`);
    console.log(`   tabla routes: $${fila.precio1a6} / $${fila.precio7a9} — ${fila.duracion}`);
    if (preciosMalos.length) {
      console.log(`   precio en el blog que no cuadra: ${preciosMalos.map((p) => "$" + p).join(", ")}`);
    }
    if (duracionMala) {
      console.log(`   duración en el blog: ${hBlog} h  (tabla: ${hDB} h)`);
    }
    console.log(`   > ${linea.trim().slice(0, 160)}`);
  });
}

console.log(
  hallazgos
    ? `\n${hallazgos} diferencia(s). Revisá una por una: puede estar mal el blog o puede estar mal la tabla.`
    : "\nTodo cuadra."
);
process.exit(hallazgos ? 1 : 0);
