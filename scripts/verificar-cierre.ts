// Verifica la matematica del cierre semanal con datos de prueba, sin tocar
// Supabase ni la red. Son pagos a proveedores: si una suma se rompe, alguien
// cobra de menos o de mas, asi que conviene correr esto despues de cambiar
// lib/cierre-semanal.ts o lib/cierre-xlsx.ts.
//
//   npx tsx scripts/verificar-cierre.ts
//
// Imprime una linea por bloque y "TODO BIEN" al final. Si algo falla, revienta
// con el assert que no cuadro.
import { strict as assert } from "node:assert";
import ExcelJS from "exceljs";
import { armarCierre, lunesDeLaSemana, origenPago, requiereFactura, type BookingRow, type DispatchRow } from "../lib/cierre-semanal";
import { construirCierreXlsx } from "../lib/cierre-xlsx";

// --- semana lunes a domingo -------------------------------------------
assert.equal(lunesDeLaSemana("2026-11-23"), "2026-11-23", "un lunes es su propio lunes");
assert.equal(lunesDeLaSemana("2026-11-25"), "2026-11-23", "miercoles -> lunes anterior");
assert.equal(lunesDeLaSemana("2026-11-29"), "2026-11-23", "DOMINGO cuenta en la semana que arranco el lunes");
assert.equal(lunesDeLaSemana("2026-11-30"), "2026-11-30", "el lunes siguiente ya es otra semana");
console.log("ok  semana lunes-domingo");

// --- origen del pago --------------------------------------------------
const web = { status: "approved", tilopay_id: "tp_1", tilopay_response: "approved" };
const wet = { status: "approved", tilopay_id: null, tilopay_response: "paid_via_wetravel" };
const wet2 = { status: "approved", tilopay_id: null, tilopay_response: null };
const pend = { status: "pending", tilopay_id: null, tilopay_response: null };
assert.equal(origenPago(web), "Web");
assert.equal(origenPago(wet), "WeTravel");
assert.equal(origenPago(wet2), "WeTravel", "aprobada sin tilopay se cobro fuera del sitio");
assert.equal(origenPago(pend), "Pendiente");
assert.equal(requiereFactura(origenPago(web)), true, "web lleva factura");
assert.equal(requiereFactura(origenPago(wet)), false, "wetravel no lleva factura");
console.log("ok  origen del pago y factura");

// --- agregacion -------------------------------------------------------
const item = (date: string, from: string, to: string) => ({
  id: "x", fromName: from, toName: to, date, pickupTime: "10:00",
  passengers: 2, children: 0, vehicleId: "staria" as const, vehicleName: "Hyundai Staria",
  serviceType: "standard" as const, extraStopHours: 0,
});

const bookings = [
  { order_number: "PTCR-1", customer_name: "Ana Web", ...web,
    items: [item("2026-11-24", "SJO", "La Fortuna"), item("2026-11-27", "La Fortuna", "SJO")] },
  { order_number: "PTCR-2", customer_name: "Bob WeTravel", ...wet,
    items: [item("2026-11-25", "LIR", "Tamarindo")] },
  { order_number: "PTCR-3", customer_name: "Cris Pendiente", ...pend,
    items: [item("2026-11-26", "SJO", "Jaco")] },
] as unknown as BookingRow[];

const dispatch = [
  { order_number: "PTCR-1", fecha: "2026-11-24", tramo: 1, provider_id: 1, neto_usd: "190.00", nota: "",
    provider: { nombre: "Tito", es_planta: false } },
  { order_number: "PTCR-1", fecha: "2026-11-27", tramo: 1, provider_id: 1, neto_usd: 190, nota: "",
    provider: { nombre: "Tito", es_planta: false } },
  { order_number: "PTCR-2", fecha: "2026-11-25", tramo: 1, provider_id: 2, neto_usd: "120.50", nota: "ida",
    provider: { nombre: "Churra", es_planta: false } },
  { order_number: "PTCR-3", fecha: "2026-11-26", tramo: 1, provider_id: 3, neto_usd: null, nota: "",
    provider: { nombre: "Potro", es_planta: true } },
] as unknown as DispatchRow[];

const c = armarCierre("2026-11-23", dispatch, bookings);

assert.equal(c.domingo, "2026-11-29");
assert.equal(c.totalViajes, 4);
assert.equal(c.totalUsd, 500.5, `total esperado 500.50, dio ${c.totalUsd}`);

const tito = c.porProveedor.find((r) => r.proveedor === "Tito")!;
assert.equal(tito.viajes, 2);
assert.equal(tito.montoUsd, 380, "los dos tramos de Tito suman 380");
assert.equal(tito.viajesConFactura, 2, "ambos son web: llevan factura");
assert.equal(tito.viajesSinFactura, 0);

const churra = c.porProveedor.find((r) => r.proveedor === "Churra")!;
assert.equal(churra.viajesConFactura, 0, "wetravel no lleva factura");
assert.equal(churra.viajesSinFactura, 1);
assert.equal(churra.montoUsd, 120.5, "numeric de postgres llega como string y se suma bien");

const potro = c.porProveedor.find((r) => r.proveedor === "Potro")!;
assert.equal(potro.esPlanta, true);
assert.equal(potro.montoUsd, 0, "de planta no suma plata");
assert.equal(potro.viajes, 1, "pero si cuenta el viaje");

assert.equal(c.porProveedor[0].proveedor, "Tito", "ordenado por monto desc");
assert.deepEqual(c.viajes.map((v) => v.fecha), ["2026-11-24","2026-11-25","2026-11-26","2026-11-27"], "detalle en orden de fecha");
console.log("ok  agregacion por proveedor");

// --- el Excel ---------------------------------------------------------
async function main() {
  const buf = await construirCierreXlsx(c, { cerrado: true, pagados: { "1": true } });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);

  const res = wb.getWorksheet("Resumen")!;
  const det = wb.getWorksheet("Detalle")!;
  assert.ok(res && det, "tiene las dos hojas");
  assert.equal(String(res.getCell("A4").value), "Proveedor", "encabezado del resumen en la fila 4");
  assert.equal(String(res.getCell("A5").value), "Tito", "primera fila: el de mayor monto");
  assert.equal(res.getCell("E5").value, 380, "monto de Tito en la celda");
  assert.equal(String(res.getCell("F5").value), "SI", "Tito quedo marcado como pagado");
  assert.equal(String(res.getCell("C5").value), "2", "dos viajes con factura");

  // la fila TOTAL va despues de los 3 proveedores
  assert.equal(String(res.getCell("A8").value), "TOTAL A PAGAR");
  assert.equal(res.getCell("E8").value, 500.5, "el total del Excel cuadra");

  assert.equal(String(det.getCell("I2").value), "SI", "el primer viaje (web) lleva factura");
  assert.equal(String(det.getCell("H4").value), "Pendiente", "el de PTCR-3 sigue pendiente de pago del cliente");
  console.log(`ok  Excel valido (${buf.byteLength} bytes), numeros cuadran`);

  console.log("\nTODO BIEN");
}

main();
