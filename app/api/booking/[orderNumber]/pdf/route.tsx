import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BookingPdfDocument from "@/components/BookingPdfDocument";
import { siteConfig } from "@/lib/site-config";
import { REVIEW_URL } from "@/lib/email";
import { verifyPdfToken } from "@/lib/pdf-token";
import type { CartItem } from "@/lib/CartContext";

// Streams a PDF receipt for a single booking. Customers hit this from
// the "Download confirmation (PDF)" button on /booking/success and from
// the admin panel's Driver-sheet download. The endpoint is token-gated:
// callers must pass ?t=<pdfTokenFor(orderNumber)> derived by HMAC-SHA256
// under ADMIN_SESSION_SECRET (see lib/pdf-token.ts for the rationale).
//
// Previously the route was unauthenticated on the (false) assumption
// that the order number was a sufficient secret. It isn't — order
// numbers are sequential from the next_booking_number RPC, so anyone
// could enumerate PTCR-1541, 1542, 1543… and pull every booking's PII.
// Now: missing / wrong token returns 404 (not 401/403) so we don't leak
// whether the order number exists.
//
// Uses the Node runtime — @react-pdf/renderer needs Node APIs and
// won't run on the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ orderNumber: string }> };

// Uniform 404 helper. Any auth failure or "no such booking" case must
// funnel through this so an attacker can't distinguish the two states
// by response body, status, or header set.
function notFound(): NextResponse {
  return NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function GET(req: NextRequest, ctx: Context) {
  const { orderNumber } = await ctx.params;

  if (!orderNumber) return notFound();

  // Token check happens FIRST so we don't even hit the DB for a
  // request that lacks a valid signature. Prevents an unauthenticated
  // caller from using this endpoint to fingerprint valid order numbers
  // via response-time differences.
  const providedToken = req.nextUrl.searchParams.get("t") || "";
  if (!verifyPdfToken(orderNumber, providedToken)) return notFound();

  // ?variant=driver renders a version WITHOUT any pricing info — total,
  // per-trip prices, auth code, and card last-4 are all hidden. Used by
  // Diego to WhatsApp the trip sheet to his drivers without revealing
  // what the customer paid. Any other value falls back to the standard
  // customer receipt.
  const driverVariant = req.nextUrl.searchParams.get("variant") === "driver";

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, customer_phone, total_usd, items, status, tilopay_auth, tilopay_last4, notes"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[booking/pdf] supabase error:", error);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }

  if (!booking) return notFound();

  // Only render PDFs for approved bookings — pending/rejected don't have
  // a receipt to show yet. Returned as 404 (not 409) so the response is
  // indistinguishable from "no such order number" — an attacker who
  // somehow learned a valid token still can't tell approved-vs-pending
  // from outside.
  if (booking.status !== "approved") return notFound();

  const logoUrl = `${siteConfig.siteUrl}/logo-ptcr.png`;

  // Generate the "Leave a Google review" QR only for the customer
  // receipt. Driver sheets skip pricing AND this CTA. Navy dots on
  // white to match the nautical palette; @react-pdf/renderer's Image
  // component accepts a base64 data URL directly.
  let reviewQrDataUrl: string | undefined;
  if (!driverVariant) {
    try {
      reviewQrDataUrl = await QRCode.toDataURL(REVIEW_URL, {
        margin: 0,
        color: { dark: "#1e3a8a", light: "#ffffff" },
        width: 200,
      });
    } catch (e) {
      // QR generation is a soft-fail — the rest of the PDF still
      // renders. Log so we notice if the encoder starts throwing.
      console.error("[booking/pdf] review QR generation failed:", e);
    }
  }

  const stream = await renderToStream(
    <BookingPdfDocument
      orderNumber={booking.order_number}
      customerName={booking.customer_name}
      customerEmail={booking.customer_email}
      customerPhone={booking.customer_phone}
      totalUsd={Number(booking.total_usd)}
      authCode={booking.tilopay_auth}
      cardLast4={booking.tilopay_last4}
      items={(booking.items as CartItem[]) || []}
      logoUrl={logoUrl}
      driverVariant={driverVariant}
      reviewQrDataUrl={reviewQrDataUrl}
      notes={booking.notes}
    />
  );

  const filename = driverVariant
    ? `driver-sheet-${booking.order_number}.pdf`
    : `private-travel-cr-${booking.order_number}.pdf`;

  // Convert the Node Readable stream to a web ReadableStream so it can
  // be passed straight back as the Response body. This keeps memory low
  // for multi-trip bookings.
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
