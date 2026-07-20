import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processPayment } from "@/lib/tilopay";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts a Tilopay checkout session for an admin-created quote. The
// public /pay/[token] page POSTs to this endpoint when the customer
// clicks "Pay now". We look the booking up by its payment_token
// (indexed + unique in the DB), verify it hasn't expired or been
// used already, then hand off to Tilopay exactly like the normal
// customer-initiated payment/start route does.
//
// Kept separate from /api/payment/start on purpose: that route builds
// the booking row itself from the client cart. Here the booking already
// exists (Diego made it via createQuoteAction) — we just need to open
// the checkout for it. Merging them would require confusing branching
// and expose token semantics to the wider surface.

type StartFromTokenBody = {
  token: string;
};

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function siteOrigin(req: NextRequest): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, "");
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  // Rate limit — same rationale as /api/payment/start. This endpoint
  // reads a booking by token and opens a Tilopay checkout; abuse would
  // spam Tilopay and could enumerate tokens.
  const ip = getClientIp(req);
  const rl = rateLimit(ip, { max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }

  let body: StartFromTokenBody;
  try {
    body = (await req.json()) as StartFromTokenBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token || "").trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: booking, error: readErr } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, customer_phone, total_usd, status, payment_token, token_expires_at",
    )
    .eq("payment_token", token)
    .maybeSingle();

  if (readErr) {
    console.error("[payment/start-from-token] read failed:", readErr);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!booking) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (booking.status === "approved") {
    return NextResponse.json(
      { error: "Booking already paid", orderNumber: booking.order_number },
      { status: 409 },
    );
  }
  if (booking.token_expires_at && new Date(booking.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  const orderNumber = booking.order_number;
  const origin = siteOrigin(req);
  const { first, last } = splitName(booking.customer_name ?? "Customer");

  try {
    const result = await processPayment({
      amount: Number(booking.total_usd),
      currency: "USD",
      orderNumber,
      redirect: `${origin}/api/payment/callback?orderNumber=${encodeURIComponent(orderNumber)}`,
      customer: {
        firstName: first,
        lastName: last,
        email: booking.customer_email ?? "",
        phone: (booking.customer_phone ?? "").replace(/\D/g, "").slice(-12) || "00000000",
      },
    });

    if (!result.url) {
      throw new Error(`Tilopay did not return a checkout URL: ${JSON.stringify(result)}`);
    }

    return NextResponse.json({ orderNumber, checkoutUrl: result.url });
  } catch (e) {
    console.error("[payment/start-from-token] Tilopay processPayment failed:", e);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }
}
