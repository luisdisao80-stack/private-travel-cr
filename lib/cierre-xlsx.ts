// El archivo del cierre semanal, en Excel.
//
// Dos hojas: "Resumen" es con la que se paga (una fila por proveedor, su
// monto y cuantos viajes le exigen factura) y "Detalle" es el respaldo,
// viaje por viaje, para cuando un proveedor reclama.
//
// Los colores son los del sitio y de los correos de reserva: naranja de
// encabezado, azul para los subtotales, verde para lo que ya se pago.
import ExcelJS from "exceljs";
import {
  rotuloSemana,
  fechaCorta,
  type Cierre,
  type ResumenProveedor,
} from "@/lib/cierre-semanal";

const NARANJA = "FFEA580C";
const AZUL = "FF1E3A8A";
const VERDE = "FF16A34A";
const GRIS = "FFF3F4F6";
const BLANCO = "FFFFFFFF";

const MONEDA = '"$"#,##0.00';

function encabezado(ws: ExcelJS.Worksheet, fila: number, color: string) {
  const r = ws.getRow(fila);
  r.font = { bold: true, color: { argb: BLANCO }, size: 11 };
  r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  r.alignment = { vertical: "middle" };
  r.height = 22;
}

/** true si a ese proveedor ya se le pago esta semana. */
export type Pagados = Record<string, boolean>;

function clave(r: ResumenProveedor): string {
  return String(r.providerId ?? r.proveedor);
}

export async function construirCierreXlsx(
  c: Cierre,
  opts: { cerrado?: boolean; pagados?: Pagados } = {}
): Promise<Buffer> {
  const { cerrado = false, pagados = {} } = opts;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Private Travel CR";
  wb.created = new Date();

  // ------------------------------------------------------------ Resumen
  const res = wb.addWorksheet("Resumen", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  res.mergeCells("A1:G1");
  res.getCell("A1").value = `Cierre semanal de proveedores · ${rotuloSemana(c.lunes)}`;
  res.getCell("A1").font = { bold: true, size: 14, color: { argb: AZUL } };
  res.getRow(1).height = 26;

  res.mergeCells("A2:G2");
  res.getCell("A2").value =
    `${c.totalViajes} viajes · ${c.porProveedor.length} proveedores · ` +
    (cerrado ? "semana CERRADA" : "semana abierta, los montos pueden cambiar");
  res.getCell("A2").font = { size: 10, color: { argb: "FF6B7280" } };

  res.addRow([]);
  res.addRow([
    "Proveedor",
    "Viajes",
    "Con factura",
    "Sin factura",
    "Monto USD",
    "Pagado",
    "Notas",
  ]);
  encabezado(res, 4, NARANJA);

  for (const r of c.porProveedor) {
    const fila = res.addRow([
      r.proveedor,
      r.viajes,
      r.viajesConFactura,
      r.viajesSinFactura,
      r.esPlanta ? null : r.montoUsd,
      pagados[clave(r)] ? "SI" : "",
      r.esPlanta ? "De planta: no se le paga por servicio" : "",
    ]);
    fila.getCell(5).numFmt = MONEDA;
    if (pagados[clave(r)]) {
      fila.getCell(6).font = { bold: true, color: { argb: VERDE } };
    }
    if (r.esPlanta) {
      fila.font = { color: { argb: "FF6B7280" }, italic: true };
    }
    if (r.viajesConFactura > 0) {
      fila.getCell(3).font = { bold: true, color: { argb: AZUL } };
    }
  }

  const totalFila = res.addRow([
    "TOTAL A PAGAR",
    c.totalViajes,
    c.porProveedor.reduce((s, r) => s + r.viajesConFactura, 0),
    c.porProveedor.reduce((s, r) => s + r.viajesSinFactura, 0),
    c.totalUsd,
    "",
    "",
  ]);
  totalFila.font = { bold: true, color: { argb: BLANCO } };
  totalFila.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL } };
  totalFila.getCell(5).numFmt = MONEDA;

  res.columns = [
    { width: 26 },
    { width: 9 },
    { width: 13 },
    { width: 13 },
    { width: 13 },
    { width: 10 },
    { width: 40 },
  ];

  // ------------------------------------------------------------ Detalle
  const det = wb.addWorksheet("Detalle", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  det.addRow([
    "Fecha",
    "Orden",
    "Cliente",
    "Ruta",
    "Hora",
    "Pax",
    "Proveedor",
    "Entro por",
    "Lleva factura",
    "Neto USD",
    "Nota",
  ]);
  encabezado(det, 1, NARANJA);

  for (const v of c.viajes) {
    const fila = det.addRow([
      fechaCorta(v.fecha),
      v.orden,
      v.cliente,
      v.ruta,
      v.hora,
      v.pax,
      v.proveedor,
      v.origen,
      v.factura ? "SI" : "no",
      v.esPlanta ? null : v.netoUsd,
      v.nota,
    ]);
    fila.getCell(10).numFmt = MONEDA;
    if (v.factura) {
      fila.getCell(9).font = { bold: true, color: { argb: AZUL } };
    }
    if (v.origen === "Pendiente") {
      fila.getCell(8).font = { bold: true, color: { argb: "FFDC2626" } };
    }
    if (v.esPlanta) {
      fila.getCell(7).font = { color: { argb: "FF6B7280" }, italic: true };
    }
  }

  // Bandas grises por dia, para poder seguir una fila larga con el ojo.
  let fila = 2;
  let anterior = "";
  let gris = false;
  for (const v of c.viajes) {
    if (v.fecha !== anterior) {
      gris = !gris;
      anterior = v.fecha;
    }
    if (gris) {
      det.getRow(fila).fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRIS } };
    }
    fila += 1;
  }

  det.columns = [
    { width: 20 },
    { width: 12 },
    { width: 22 },
    { width: 38 },
    { width: 8 },
    { width: 6 },
    { width: 20 },
    { width: 11 },
    { width: 13 },
    { width: 11 },
    { width: 34 },
  ];

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

/** cierre-proveedores-2026-11-24.xlsx */
export function nombreArchivoCierre(lunes: string): string {
  return `cierre-proveedores-${lunes}.xlsx`;
}
