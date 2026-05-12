// Hourly cron: send a reminder email for every approved booking whose
// earliest upcoming trip is ~24h away. Run by Vercel Cron (see vercel.json).
//
// Idempotency: each booking row carries a `reminder_sent_at` timestamptz.
// Once it's set, the booking is skipped. Add the column in Supabase with:
//   alter table bookings add column reminder_sent_at timestamptz;
//
// Security: Vercel Cron sends a Bearer token equal to CRON_SECRET when set.
// We accept either that header or the Vercel-internal cron header.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem } from "@/lib/CartContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDER_WINDOW_MIN = 60; // Cron runs hourly, so each cron handles a 60-min window.
const REMINDER_TARGET_HOURS = 24;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Vercel Cron sends this header on every cron invocation.
  if (req.headers.get("x-vercel-cron") === "1") return true;
  if (!secret) return true; // No secret configured → permissive (dev/test).
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
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

function buildReminderHtml(opts: {
  customerName: string;
  orderNumber: string;
  trip: CartItem;
  pickupAt: Date;
}): string {
  const it = opts.trip;
  const pickup =
    it.pickupPlace && it.pickupPlace !== it.fromName ? it.pickupPlace : it.fromName;
  const dropoff =
    it.dropoffPlace && it.dropoffPlace !== it.toName ? it.dropoffPlace : it.toName;
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#000;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#0a0a0a,#000);border:1px solid rgba(245,158,11,0.25);border-radius:18px;overflow:hidden;">
  <tr><td style="padding:24px;text-align:center;border-bottom:1px solid #1f2937;">
    <div style="font-size:11px;color:#fbbf24;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Private Travel CR</div>
    <h1 style="margin:8px 0 0 0;font-size:22px;font-weight:800;">Your shuttle is tomorrow</h1>
    <p style="margin:6px 0 0 0;font-size:13px;color:#d1d5db;">
      Hi ${opts.customerName.split(" ")[0] || "there"} — a quick reminder of your pickup.
    </p>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="color:#9ca3af;padding:4px 0;">Order</td>
          <td style="color:#fbbf24;text-align:right;font-family:Menlo,monospace;font-size:12px;">${opts.orderNumber}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">Pickup</td>
          <td style="text-align:right;font-weight:600;">${formatLocal(opts.pickupAt)} (Costa Rica)</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">From</td>
          <td style="text-align:right;font-weight:600;">${pickup}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">To</td>
          <td style="text-align:right;font-weight:600;">${dropoff}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">Passengers</td>
          <td style="text-align:right;font-weight:600;">${it.passengers}</td></tr>
      ${it.flightNumber ? `<tr><td style="color:#9ca3af;padding:4px 0;">Flight</td><td style="text-align:right;font-weight:600;">${it.flightNumber}</td></tr>` : ""}
    </table>
    <p style="margin:18px 0 4px 0;font-size:13px;color:#d1d5db;line-height:1.5;">
      Please have your bags ready 5 minutes before pickup. Your driver will message you when they're a few minutes away.
    </p>
    <p style="margin:16px 0 0 0;text-align:center;">
      <a href="https://wa.me/50686334133" style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:11px 22px;border-radius:10px;">Chat on WhatsApp</a>
    </p>
  </td></tr>
  <tr><td style="padding:14px 24px;background:rgba(255,255,255,0.02);border-top:1px solid #1f2937;text-align:center;font-size:11px;color:#6b7280;">
    Private Travel Costa Rica · La Fortuna · +506 8633-4133
  </td></tr>
</table></body></html>`;
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
