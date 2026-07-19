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
import { escapeHtml } from "@/lib/email";
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
  // Every user-supplied field goes through escapeHtml before landing
  // in this template. Without it, a hotel name like `Hotel & Spa "Best"`
  // rendered as `Hotel  Spa Best` in Gmail (& swallowed as an entity
  // start, quotes broke attributes), and a hostile string like `<script>`
  // in the passenger note would have executed in whichever preview
  // client didn't sandbox it. The single-name-split for the greeting
  // is escaped after the split so any punctuation in the first name
  // still gets treated safely.
  const firstName = escapeHtml(opts.customerName.split(" ")[0] || "there");
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#000;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#0a0a0a,#000);border:1px solid rgba(245,158,11,0.25);border-radius:18px;overflow:hidden;">
  <tr><td style="padding:24px;text-align:center;border-bottom:1px solid #1f2937;">
    <a href="https://www.privatetravelcr.com" style="display:inline-block;text-decoration:none;">
      <img
        src="https://www.privatetravelcr.com/logo-ptcr.svg"
        alt="Private Travel Costa Rica"
        width="180"
        height="78"
        style="display:block;margin:0 auto 4px auto;width:180px;height:auto;border:0;"
      />
    </a>
    <div style="font-size:11px;color:#fbbf24;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Private Travel CR</div>
    <h1 style="margin:12px 0 0 0;font-size:22px;font-weight:800;">Your shuttle is tomorrow</h1>
    <p style="margin:6px 0 0 0;font-size:13px;color:#d1d5db;">
      Hi ${firstName} — a quick reminder of your pickup.
    </p>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="color:#9ca3af;padding:4px 0;">Order</td>
          <td style="color:#fbbf24;text-align:right;font-family:Menlo,monospace;font-size:12px;">${escapeHtml(opts.orderNumber)}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">Pickup</td>
          <td style="text-align:right;font-weight:600;">${escapeHtml(formatLocal(opts.pickupAt))} (Costa Rica)</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">From</td>
          <td style="text-align:right;font-weight:600;">${escapeHtml(pickup)}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">To</td>
          <td style="text-align:right;font-weight:600;">${escapeHtml(dropoff)}</td></tr>
      <tr><td style="color:#9ca3af;padding:4px 0;">Passengers</td>
          <td style="text-align:right;font-weight:600;">${it.passengers}</td></tr>
      ${it.flightNumber ? `<tr><td style="color:#9ca3af;padding:4px 0;">Flight</td><td style="text-align:right;font-weight:600;">${escapeHtml(it.flightNumber)}</td></tr>` : ""}
      ${it.extraStopHours && it.extraStopHours > 0 ? `<tr><td style="color:#9ca3af;padding:4px 0;">Extra wait</td><td style="text-align:right;font-weight:600;color:#fbbf24;">${it.extraStopHours}h paid</td></tr>` : ""}
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
