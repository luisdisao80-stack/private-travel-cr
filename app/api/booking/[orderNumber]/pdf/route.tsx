import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BookingPdfDocument from "@/components/BookingPdfDocument";
import { siteConfig } from "@/lib/site-config";
import type { CartItem } from "@/lib/CartContext";

// Streams a PDF receipt for a single booking. Customers hit this from
// the "Download confirmation (PDF)" button on /booking/success and from
// links in the confirmation email. We don't gate on session because
// the order number is a sufficient secret (10-digit random) and the
// booking page already shows the same data unauthenticated.
//
// Uses the Node runtime — @react-pdf/renderer needs Node APIs and
// won't run on the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ orderNumber: string }> };

export async function GET(_req: NextRequest, ctx: Context) {
  const { orderNumber } = await ctx.params;

  if (!orderNumber) {
    return NextResponse.json({ error: "missing order number" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, customer_phone, total_usd, items, status, tilopay_auth, tilopay_last4"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[booking/pdf] supabase error:", error);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }

  if (!booking) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Only render PDFs for approved bookings — pending/rejected don't have
  // a receipt to show yet.
  if (booking.status !== "approved") {
    return NextResponse.json(
      { error: "booking not yet approved" },
      { status: 409 }
    );
  }

  const logoUrl = `${siteConfig.siteUrl}/logo-ptcr.png`;

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
    />
  );

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
      "Content-Disposition": `inline; filename="private-travel-cr-${booking.order_number}.pdf"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
