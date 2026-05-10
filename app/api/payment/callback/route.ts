import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { consultTransaction, isApproved } from "@/lib/tilopay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tilopay redirects the customer here after they finish (or cancel) on the
// checkout page. We consult the transaction by orderNumber, update the booking,
// then forward to the success / error page.
export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber");
  const origin = req.nextUrl.origin;

  if (!orderNumber) {
    return NextResponse.redirect(`${origin}/booking/error?reason=missing_order`);
  }

  try {
    const result = await consultTransaction(orderNumber);
    const txn = Array.isArray(result.response) ? result.response[0] : undefined;

    if (txn && isApproved(txn)) {
      await supabaseAdmin
        .from("bookings")
        .update({
          status: "approved",
          tilopay_id: String(txn.id_tilopay),
          tilopay_auth: txn.auth || null,
          tilopay_response: txn.response || null,
          tilopay_card: txn.card || null,
          tilopay_last4: txn.last || null,
          consulted_at: new Date().toISOString(),
        })
        .eq("order_number", orderNumber);
      return NextResponse.redirect(
        `${origin}/booking/success?orderNumber=${encodeURIComponent(orderNumber)}`
      );
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "rejected",
        tilopay_id: txn ? String(txn.id_tilopay) : null,
        tilopay_response: txn?.response || result.message || "rejected",
        consulted_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);
    return NextResponse.redirect(
      `${origin}/booking/error?orderNumber=${encodeURIComponent(orderNumber)}&reason=rejected`
    );
  } catch (e) {
    console.error("[payment/callback] consult failed:", e);
    return NextResponse.redirect(
      `${origin}/booking/error?orderNumber=${encodeURIComponent(orderNumber)}&reason=consult_error`
    );
  }
}

// Some payment processors also POST to the callback URL. Mirror the GET behavior.
export async function POST(req: NextRequest) {
  return GET(req);
}
