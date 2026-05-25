import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processPayment, isSandboxMode } from "@/lib/tilopay";
import { getTourBySlug, quoteTour } from "@/lib/tours-db";
import type { CartItem } from "@/lib/CartContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Customer = {
  name: string;
  email: string;
  phone: string;
  hotel?: string;
  flightNumber?: string;
  flightTime?: string;
  notes?: string;
};

// Shuttle bookings carry the full cart items array (existing behavior).
type ShuttleBody = {
  kind?: "shuttle";
  customer: Customer;
  items: CartItem[];
  totalUsd: number;
};

// Tour bookings carry a single tour reference + pax counts; the server
// re-resolves the price from the DB so the client can't tamper with it.
type TourBody = {
  kind: "tour";
  customer: Customer;
  tour: {
    id: number;
    slug: string;
    name: string;
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:MM"
    adults: number;
    children: number;
  };
  totalUsd: number;
};

type StartPaymentBody = ShuttleBody | TourBody;

async function generateOrderNumber(): Promise<string> {
  // Sequential numbering via Postgres sequence — atomic, no race conditions.
  // Returns "PTCR-1450", "PTCR-1451", etc. Starting value defined by the
  // booking_number_seq sequence in Supabase.
  const { data, error } = await supabaseAdmin.rpc("next_booking_number");
  if (!error && typeof data === "string" && data.startsWith("PTCR-")) {
    return data;
  }
  // Fallback: if the RPC ever fails (network blip, function dropped, etc.)
  // we still want a unique order number so the booking can proceed. The old
  // base36-timestamp format is collision-resistant and obviously different
  // from the sequential format, so the admin can tell them apart.
  console.error("[order-number] sequence RPC failed, falling back:", error);
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return `PTCR-${ts}-${rand}`;
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function siteOrigin(req: NextRequest): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, "");
  // Fallback: use the request origin so dev/preview still works.
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let body: StartPaymentBody;
  try {
    body = (await req.json()) as StartPaymentBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
    return NextResponse.json(
      { error: "Missing customer name, email, or phone" },
      { status: 400 }
    );
  }
  if (!(body.totalUsd > 0)) {
    return NextResponse.json({ error: "Total must be > 0" }, { status: 400 });
  }

  // Tour vs shuttle branch — both end up in the same bookings table but
  // populate different columns. For tours we re-quote the price server-side
  // against the live tour row to defeat any price tampering from the client.
  const isTour = body.kind === "tour";

  let bookingRow: Record<string, unknown>;
  let totalUsd = body.totalUsd;
  let bookingItems: CartItem[] | unknown[];

  if (isTour) {
    const t = (body as TourBody).tour;
    if (!t?.slug || !t?.date || !t?.time || !(t.adults > 0)) {
      return NextResponse.json(
        { error: "Missing tour slug, date, time, or adults" },
        { status: 400 }
      );
    }

    const tourRow = await getTourBySlug(t.slug);
    if (!tourRow) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const quote = quoteTour(tourRow, {
      adults: t.adults,
      children: t.children || 0,
    });
    // Trust the server-side quote, not the body. If they diverge, log it.
    if (Math.abs(quote.total - body.totalUsd) > 0.01) {
      console.warn(
        `[payment/start] tour price mismatch: client=${body.totalUsd} server=${quote.total} slug=${t.slug}`
      );
    }
    totalUsd = quote.total;

    // Synthetic single-item array so the existing email template (which
    // iterates over `items[]`) still has something to render. Order-related
    // tour columns below are the source of truth.
    bookingItems = [
      {
        type: "tour",
        tourSlug: t.slug,
        tourName: t.name,
        date: t.date,
        pickupTime: t.time,
        adults: t.adults,
        children: t.children || 0,
        totalPrice: quote.total,
      },
    ];

    bookingRow = {
      kind: "tour",
      tour_id: tourRow.id,
      tour_date: t.date,
      tour_time: t.time,
      adults: t.adults,
      children: t.children || 0,
    };
  } else {
    const items = (body as ShuttleBody).items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }
    bookingItems = items;
    bookingRow = { kind: "shuttle" };
  }

  const orderNumber = await generateOrderNumber();

  // Persist the pending booking first. If Tilopay later confirms via redirect,
  // we update this row by orderNumber.
  const { error: insertErr } = await supabaseAdmin.from("bookings").insert({
    order_number: orderNumber,
    customer_name: body.customer.name,
    customer_email: body.customer.email,
    customer_phone: body.customer.phone,
    customer_hotel: body.customer.hotel || null,
    flight_number: body.customer.flightNumber || null,
    flight_time: body.customer.flightTime || null,
    notes: body.customer.notes || null,
    items: bookingItems,
    total_usd: totalUsd,
    currency: "USD",
    status: "pending",
    ...bookingRow,
  });
  if (insertErr) {
    console.error("[payment/start] insert booking failed:", insertErr);
    return NextResponse.json(
      { error: "Could not create booking" },
      { status: 500 }
    );
  }

  const origin = siteOrigin(req);
  const { first, last } = splitName(body.customer.name);

  console.log(
    `[payment/start] order=${orderNumber} kind=${isTour ? "tour" : "shuttle"} mode=${isSandboxMode() ? "sandbox" : "production"} total=${totalUsd}`
  );

  try {
    const result = await processPayment({
      amount: totalUsd,
      currency: "USD",
      orderNumber,
      redirect: `${origin}/api/payment/callback?orderNumber=${encodeURIComponent(orderNumber)}`,
      customer: {
        firstName: first,
        lastName: last,
        email: body.customer.email,
        phone: body.customer.phone.replace(/\D/g, "").slice(-12) || "00000000",
      },
    });

    if (!result.url) {
      throw new Error(`Tilopay did not return a checkout URL: ${JSON.stringify(result)}`);
    }

    return NextResponse.json({ orderNumber, checkoutUrl: result.url });
  } catch (e) {
    console.error("[payment/start] Tilopay processPayment failed:", e);
    // Mark booking failed so the row reflects reality.
    await supabaseAdmin
      .from("bookings")
      .update({ status: "failed" })
      .eq("order_number", orderNumber);
    return NextResponse.json(
      { error: "Payment provider error" },
      { status: 502 }
    );
  }
}
