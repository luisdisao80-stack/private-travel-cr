import { NextRequest, NextResponse } from "next/server";
import { sendBookingEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only endpoint to send a preview of the tour booking email
 * (both the customer copy and the internal copy) without going
 * through a real Tilopay transaction.
 *
 * Usage:
 *   GET /api/admin/preview-tour-email?secret=<ADMIN_SECRET>&to=<email>
 *
 * - `secret` must match the ADMIN_SECRET env var (set in Vercel).
 * - `to` is optional; defaults to the BUSINESS_EMAIL recipient.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured" },
      { status: 500 }
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customerEmail =
    req.nextUrl.searchParams.get("to") ||
    process.env.BUSINESS_EMAIL ||
    "info@privatetravelcr.com";

  // Sample tour booking — covers every field the template renders so
  // Diego can eyeball the layout in his inbox without paying anything.
  await sendBookingEmails({
    orderNumber: "PTCR-PREVIEW",
    customerName: "Diego Salas",
    customerEmail,
    customerPhone: "+506 8633-4133",
    totalUsd: 396,
    authCode: "PREVIEW-AUTH",
    cardLast4: "0089",
    items: [
      {
        type: "tour",
        tourSlug: "la-fortuna-full-day-combo",
        tourName:
          "Arenal Full Day — Volcano Hike, La Fortuna Waterfall & Hanging Bridges",
        date: "2026-06-15",
        pickupTime: "07:50",
        adults: 2,
        children: 0,
        durationLabel: "Full day · 7:50 AM – 6:30 PM",
        durationHours: 10.5,
        pickupHotel: "Hotel Tabacón",
        totalPrice: 396,
      },
    ],
  });

  return NextResponse.json({
    ok: true,
    sent_to: customerEmail,
    note: "Preview email sent. Check inbox + spam folder.",
  });
}
