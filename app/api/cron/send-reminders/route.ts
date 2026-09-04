// Hourly cron: send a reminder email for every approved booking whose
// earliest upcoming trip is ~24h away. Run by Vercel Cron (see vercel.json).
//
// Idempotency: each booking row carries a `reminder_sent_at` timestamptz.
// Once it's set, the booking is skipped. Add the column in Supabase with:
//   alter table bookings add column reminder_sent_at timestamptz;
//
// Security: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` on
// every scheduled invocation. isAuthorized() verifies that header in
// constant time. On Vercel deployments a missing CRON_SECRET returns
// 401 — no silent open surface. Local dev without VERCEL set allows
// unauthenticated calls so `curl localhost:3000/api/cron/send-reminders`
// still works while iterating on the template.

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { escapeHtml, emailHeadHtml } from "@/lib/email";
import type { CartItem } from "@/lib/CartContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDER_WINDOW_MIN = 60; // Cron runs hourly, so each cron handles a 60-min window.
const REMINDER_TARGET_HOURS = 24;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` on every
  // scheduled invocation, matching whatever we set in the Vercel
  // dashboard. Compare in constant time so a bulk-guesser can't learn
  // the secret prefix from response-time differences.
  if (secret && auth) {
    const expected = `Bearer ${secret}`;
    if (auth.length === expected.length) {
      const a = Buffer.from(auth);
      const b = Buffer.from(expected);
      try {
        if (timingSafeEqual(a, b)) return true;
      } catch {
        // fall through to the deny below
      }
    }
  }

  // Local-development fallback: permissive only when CRON_SECRET is
  // absent AND we're not running inside a Vercel deployment. Never
  // permissive in prod / preview — a missing secret in Vercel is a
  // misconfiguration we WANT to notice via 401s, not paper over
  // (previous behavior silently allowed any caller through when the
  // env var was blank, defeating the whole point of the header).
  if (!secret && !process.env.VERCEL) return true;

  return false;
}

function pickupAt(item: CartItem): Date | null {
  if (!item.date || !item.pickupTime) return null;
  const [y, m, d] = item.date.split("-").map((s) => parseInt(s, 10));
  const [h, mi] = item.pickupTime.split(":").map((s) => parseInt(s, 10));
  if ([y, m, d, h, mi].some((n) => Number.isNaN(n))) return null;
  // Costa Rica is UTC-6, no DST.
  return new Date(Date.UTC(y, m - 1, d, h + 6, mi, 0));
}

function earliestPickup(items: CartItem[]): Date | null {
  const dates = items.map(pickupAt).filter((d): d is Date => d != null);
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

function formatLocal(d: Date): string {
  return d.toLocaleString("en-US", {
    timeZone: "America/Costa_Rica",
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Modo claro con la paleta náutica del correo de reserva — 2026-09-04
// (Diego: "quiero que el mensaje del reminder tenga los mismos colores del
// booking").
//
// Este era el ÚLTIMO template oscuro que quedaba. El de reserva se pasó a
// claro el 2026-06-30 después de tres intentos fallidos de ganarle al
// Smart-Invert de iOS Mail (PR #4 @media, PR #5 #fefefe, PR #7 text-shadow):
// Apple suaviza cualquier texto casi blanco sobre casi negro, se declare lo
// que se declare en el CSS. O sea que el cliente recibía la reserva clara y
// legible, y al día siguiente el recordatorio negro y lavado — el correo que
// se lee a las 5am antes de un traslado, justo cuando peor se ve la pantalla.
//
// El `<head>` (metas color-scheme + bloque @media que fija la paleta) se
// importa de lib/email para que los dos correos no puedan volver a separarse.
//
// Se aprovecha para traer los bloques de dirección del correo de reserva:
// verde = dónde lo recogen, azul = dónde lo dejan. Antes las direcciones eran
// dos filas de tabla iguales a "Passengers", con el mismo peso visual que el
// número de pasajeros; en un recordatorio la dirección de recogida es el dato
// que se busca a las 5am.
function buildReminderHtml(opts: {
  customerName: string;
  orderNumber: string;
  trip: CartItem;
  pickupAt: Date;
}): string {
  const it = opts.trip;
  // Every user-supplied field goes through escapeHtml before landing
  // in this template. Without it, a hotel name like `Hotel & Spa "Best"`
  // rendered as `Hotel  Spa Best` in Gmail (& swallowed as an entity
  // start, quotes broke attributes), and a hostile string like `<script>`
  // in the passenger note would have executed in whichever preview
  // client didn't sandbox it. The single-name-split for the greeting
  // is escaped after the split so any punctuation in the first name
  // still gets treated safely.
  const firstName = escapeHtml(opts.customerName.split(" ")[0] || "there");

  // Mismo criterio que shuttleRowHtml en lib/email: el bloque solo aparece
  // cuando la dirección exacta difiere del nombre de la ciudad, si no repite
  // el dato de la línea de arriba.
  const pickupBox =
    it.pickupPlace && it.pickupPlace !== it.fromName
      ? `
        <div class="ptcr-pickup-box" style="margin:10px 0 4px 0;padding:12px 14px;background:#dcfce7;border-left:4px solid #16a34a;border-radius:8px;">
          <div class="ptcr-pickup-eyebrow" style="font-size:10px;color:#15803d;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
            📍 Pickup at
          </div>
          <div class="ptcr-pickup-text" style="font-size:14px;color:#14532d;font-weight:700;line-height:1.4;">
            ${escapeHtml(it.pickupPlace)}
          </div>
        </div>
      `
      : "";
  const dropoffBox =
    it.dropoffPlace && it.dropoffPlace !== it.toName
      ? `
        <div class="ptcr-dropoff-box" style="margin:10px 0 4px 0;padding:12px 14px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:8px;">
          <div class="ptcr-dropoff-eyebrow" style="font-size:10px;color:#1e40af;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">
            🏁 Drop off at
          </div>
          <div class="ptcr-dropoff-text" style="font-size:14px;color:#1e3a8a;font-weight:700;line-height:1.4;">
            ${escapeHtml(it.dropoffPlace)}
          </div>
        </div>
      `
      : "";
  // Píldoras naranjas, igual que en el correo de reserva.
  const extraStops =
    it.extraStopHours && it.extraStopHours > 0
      ? `<div style="font-size:12px;color:#c2410c;font-weight:700;margin-top:8px;background:#ffedd5;padding:6px 10px;border-radius:6px;display:inline-block;">⏱ Extra wait: ${it.extraStopHours}h paid${
          it.extraStopNames?.length
            ? ` — ${escapeHtml(it.extraStopNames.join(", "))}`
            : ""
        }</div>`
      : "";

  return `<!doctype html>
<html lang="en">
${emailHeadHtml("Your shuttle is tomorrow")}
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="ptcr-card" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding:32px 24px 24px 24px;text-align:center;background:#eff6ff;border-bottom:3px solid #1e3a8a;">
              <a href="https://www.privatetravelcr.com" style="display:inline-block;text-decoration:none;">
                <img
                  src="https://www.privatetravelcr.com/logo-ptcr.svg"
                  alt="Private Travel Costa Rica"
                  width="180"
                  height="78"
                  style="display:block;margin:0 auto 4px auto;width:180px;height:auto;border:0;"
                />
              </a>
              <div class="ptcr-navy" style="font-size:11px;color:#1e3a8a;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Private Travel CR</div>
              <h1 class="ptcr-heading" style="margin:14px 0 0 0;font-size:24px;color:#111827;font-weight:800;">Your shuttle is tomorrow</h1>
              <p class="ptcr-body" style="margin:10px 0 0 0;font-size:14px;color:#374151;line-height:1.5;">Hi ${firstName} &mdash; a quick reminder of your pickup.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 0 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="ptcr-muted" style="font-size:12px;color:#6b7280;">Order number</td>
                        <td class="ptcr-navy" style="font-size:13px;color:#1e3a8a;font-family:'SFMono-Regular',Menlo,monospace;font-weight:700;text-align:right;">${escapeHtml(opts.orderNumber)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-top:1px solid #e5e7eb;vertical-align:top;">
                    <div class="ptcr-heading" style="font-size:15px;color:#111827;font-weight:700;line-height:1.4;">
                      ${escapeHtml(it.fromName)}
                    </div>
                    ${pickupBox}
                    <div class="ptcr-muted" style="font-size:12px;color:#9ca3af;margin:6px 0 6px 0;">&darr;</div>
                    <div class="ptcr-heading" style="font-size:15px;color:#111827;font-weight:700;line-height:1.4;">
                      ${escapeHtml(it.toName)}
                    </div>
                    ${dropoffBox}
                    <div class="ptcr-trip-meta" style="font-size:14px;color:#b45309;font-weight:700;margin-top:12px;padding:8px 12px;background:#fef3c7;border-radius:6px;display:inline-block;">
                      🕐 ${escapeHtml(formatLocal(opts.pickupAt))} (Costa Rica) · 👥 ${it.passengers} pax${it.flightNumber ? ` · ✈️ Flight ${escapeHtml(it.flightNumber)}` : ""}
                    </div>
                    ${extraStops}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 28px 24px;text-align:center;">
              <p class="ptcr-body" style="margin:0 0 18px 0;font-size:13px;color:#374151;line-height:1.5;">
                Please have your bags ready 5 minutes before pickup. Your driver will message you when they&rsquo;re a few minutes away.
              </p>
              <a href="https://wa.me/50686334133" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;">Chat on WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <div class="ptcr-muted" style="font-size:11px;color:#6b7280;">
                Private Travel Costa Rica · La Fortuna, Alajuela · +506 8633-4133
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not set" }, { status: 200 });
  }
  const resend = new Resend(resendKey);
  const from = process.env.EMAIL_FROM || "Private Travel CR <onboarding@resend.dev>";

  // Pull recent approved bookings that haven't been reminded yet. We
  // over-fetch (next 48h worth) and filter the exact 24h window in JS
  // because pickup time is buried inside the items JSON array.
  const { data: rows, error } = await supabaseAdmin
    .from("bookings")
    .select("order_number, customer_name, customer_email, items, reminder_sent_at, status, created_at")
    .eq("status", "approved")
    .is("reminder_sent_at", null)
    .gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString())
    .limit(200);

  if (error) {
    console.error("[cron/reminders] fetch failed:", error);
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }

  const now = Date.now();
  const lo = now + (REMINDER_TARGET_HOURS * 60 - REMINDER_WINDOW_MIN) * 60_000;
  const hi = now + REMINDER_TARGET_HOURS * 60 * 60_000;

  let sent = 0;
  let skipped = 0;
  const errors: { order: string; error: string }[] = [];

  for (const row of rows ?? []) {
    const items = (row.items as CartItem[]) || [];
    if (items.length === 0) {
      skipped++;
      continue;
    }
    const earliest = earliestPickup(items);
    if (!earliest) {
      skipped++;
      continue;
    }
    const t = earliest.getTime();
    if (t < lo || t > hi) {
      skipped++;
      continue;
    }

    const earliestTrip =
      items.find((it) => {
        const d = pickupAt(it);
        return d != null && d.getTime() === t;
      }) ?? items[0];

    try {
      await resend.emails.send({
        from,
        to: row.customer_email,
        subject: `Reminder: your private shuttle tomorrow · ${row.order_number}`,
        html: buildReminderHtml({
          customerName: row.customer_name,
          orderNumber: row.order_number,
          trip: earliestTrip,
          pickupAt: earliest,
        }),
        replyTo: process.env.BUSINESS_EMAIL || "info@privatetravelcr.com",
      });
      await supabaseAdmin
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("order_number", row.order_number);
      sent++;
    } catch (e) {
      errors.push({
        order: row.order_number,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ checked: rows?.length ?? 0, sent, skipped, errors });
}
