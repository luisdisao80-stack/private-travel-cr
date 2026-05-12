import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processPayment, isSandboxMode } from "@/lib/tilopay";
import type { CartItem } from "@/lib/CartContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StartPaymentBody = {
  customer: {
    name: string;
    email: string;
    phone: string;
    hotel?: string;
    flightNumber?: string;
    flightTime?: string;
    notes?: string;
  };
  items: CartItem[];
  totalUsd: number;
};

function generateOrderNumber(): string {
  // PTCR-<base36 timestamp>-<5 chars random>. Short, unique, human-readable.
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
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }
  if (!(body.totalUsd > 0)) {
    return NextResponse.json({ error: "Total must be > 0" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();

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
    items: body.items,
    total_usd: body.totalUsd,
    currency: "USD",
    status: "pending",
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
    `[payment/start] order=${orderNumber} mode=${isSandboxMode() ? "sandbox" : "production"} total=${body.totalUsd}`
  );

  try {
    const result = await processPayment({
      amount: body.totalUsd,
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
