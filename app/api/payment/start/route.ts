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

// Marketing attribution payload sent by the client (lib/attribution.ts).
// Every field is optional — we merge with server-side geo data and store
// whatever we have. Never trust the client UA / referrer for security
// decisions, this is for analytics only.
type ClientAttribution = {
  referrer?: string;
  referrer_domain?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_seen_at?: string;
  user_agent?: string;
};

// Shuttle bookings carry the full cart items array (existing behavior).
type ShuttleBody = {
  kind?: "shuttle";
  customer: Customer;
  items: CartItem[];
  totalUsd: number;
  attribution?: ClientAttribution;
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
  attribution?: ClientAttribution;
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

// Merge the client-provided attribution payload with server-side geo
// data and infer a coarse device class. Returns `null` if there's no
// useful info to store (keeps the JSONB column tidy).
//
// Vercel adds these headers to every request:
//   x-vercel-ip-country  → "US", "CR", etc. (ISO 3166-1 alpha-2)
//   x-vercel-ip-city     → e.g. "Dallas"
//   x-vercel-ip-country-region → e.g. "TX"
//
// We trust these implicitly because they come from Vercel's edge, not
// the client. The user-agent string is best-effort device classification.
function buildAttribution(
  req: NextRequest,
  client?: ClientAttribution,
): Record<string, unknown> | null {
  const country = req.headers.get("x-vercel-ip-country") || undefined;
  const city = req.headers.get("x-vercel-ip-city") || undefined;
  const region = req.headers.get("x-vercel-ip-country-region") || undefined;

  // Coarse device classification from the UA string. We don't need
  // perfect accuracy — "mobile vs desktop" is what matters for Diego's
  // analysis. Tablets get bucketed as tablet via iPad-specific check.
  const ua = client?.user_agent || req.headers.get("user-agent") || "";
  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = "tablet";
  else if (/Mobi|iPhone|Android.*Mobile/i.test(ua)) device = "mobile";

  const merged: Record<string, unknown> = {
    ...(client ?? {}),
    country,
    city,
    region,
    device,
  };

  // Strip out keys with no value so we don't clutter the JSONB with
  // a bunch of `null`/`undefined` entries.
  for (const k of Object.keys(merged)) {
    const v = merged[k];
    if (v === undefined || v === null || v === "") delete merged[k];
  }

  return Object.keys(merged).length > 0 ? merged : null;
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

    // Synthetic single-item array consumed by the email template, which
    // branches on `type === 'tour'` to render the tour-specific HTML +
    // ICS event (vs the multi-trip shuttle layout). Order-related tour
    // columns below are still the source of truth for the bookings row.
    bookingItems = [
      {
        type: "tour",
        tourSlug: t.slug,
        tourName: t.name,
        date: t.date,
        pickupTime: t.time,
        adults: t.adults,
        children: t.children || 0,
        durationLabel: tourRow.duration_label,
        durationHours:
          tourRow.duration_hours != null ? Number(tourRow.duration_hours) : undefined,
        pickupHotel: body.customer.hotel || undefined,
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
  const attribution = buildAttribution(req, body.attribution);

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
    attribution,
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
