import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingEmails } from "@/lib/email";
import type { CartItem } from "@/lib/CartContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: marcar una reserva como pagada cuando el cliente pagó por
 * WeTravel (plataforma externa — nuestro sistema no se entera solo).
 *
 * Flujo semiautomático acordado con Diego (2026-10-30): él crea el link
 * en WeTravel y, cuando llega el aviso de pago, llamamos este endpoint.
 * Marca la reserva "approved" y dispara los MISMOS correos de
 * confirmación que un pago por Tilopay (cliente + copia interna a
 * info@). Sin datos de tarjeta/auth porque el cobro vive en WeTravel.
 *
 * Uso:
 *   POST /api/admin/mark-paid-wetravel
 *   Body JSON: { "secret": "<ADMIN_SECRET>", "orderNumber": "PTCR-XXXX" }
 *
 * Idempotente: el update usa .neq(status, approved) como "claim" atómico
 * (mismo patrón que /api/payment/callback) — llamarlo dos veces no
 * duplica correos.
 */
export async function POST(req: NextRequest) {
  // Acepta ADMIN_SECRET o la service-role key de Supabase: quien tenga
  // esta última ya controla la base entera, así que usarla como
  // credencial aquí no amplía privilegios — y es la que tenemos a mano
  // en local para el flujo semiautomático.
  const accepted = [
    process.env.ADMIN_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ].filter((s): s is string => Boolean(s));
  if (accepted.length === 0) {
    return NextResponse.json(
      { error: "No admin secret configured" },
      { status: 500 },
    );
  }

  let body: { secret?: string; orderNumber?: string };
  try {
    body = (await req.json()) as { secret?: string; orderNumber?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.secret || !accepted.includes(body.secret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderNumber = String(body.orderNumber || "").trim();
  if (!orderNumber) {
    return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
  }

  // Claim atómico: solo la PRIMERA llamada encuentra la fila sin aprobar.
  const paidNote = ` | PAGADO via WeTravel ${new Date().toISOString().slice(0, 10)}`;
  const { data: claimed, error: updErr } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "approved",
      tilopay_response: "paid_via_wetravel",
      consulted_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .neq("status", "approved")
    .select("order_number, notes");

  if (updErr) {
    console.error("[admin/mark-paid-wetravel] update failed:", updErr);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if ((claimed ?? []).length === 0) {
    // O no existe, o ya estaba aprobada (correos ya enviados).
    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("order_number, status")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({
      orderNumber,
      status: existing.status,
      alreadyApproved: true,
      emailsSent: false,
    });
  }

  // Anotar el medio de pago en las notas (best-effort, no bloquea).
  try {
    await supabaseAdmin
      .from("bookings")
      .update({ notes: (claimed![0].notes ?? "") + paidNote })
      .eq("order_number", orderNumber);
  } catch (e) {
    console.error("[admin/mark-paid-wetravel] note append failed:", e);
  }

  // Mismos correos que el callback de Tilopay (sin auth/last4 — el cobro
  // fue en WeTravel). Fallos de correo no revierten el estado pagado.
  let emailsSent = false;
  try {
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select(
        "order_number, customer_name, customer_email, customer_phone, total_usd, items, notes",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (booking) {
      await sendBookingEmails({
        orderNumber: booking.order_number,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        totalUsd: Number(booking.total_usd),
        authCode: null,
        cardLast4: null,
        items: (booking.items as CartItem[]) || [],
        notes: booking.notes,
      });
      emailsSent = true;
    }
  } catch (mailErr) {
    console.error("[admin/mark-paid-wetravel] email send failed:", mailErr);
  }

  return NextResponse.json({ orderNumber, status: "approved", emailsSent });
}
