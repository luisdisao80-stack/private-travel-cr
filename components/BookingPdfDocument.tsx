/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { CartItem } from "@/lib/CartContext";

// PDF booking confirmation. Generated server-side from a booking row
// and streamed to the customer's browser as a download.
//
// Why a PDF (not just the HTML receipt): some customers' inboxes
// classify the Resend email as spam (especially Hotmail / Bellsouth).
// The PDF means they always walk away from the success page with a
// printable confirmation, regardless of email deliverability.

// Tour items have a slightly different shape than shuttle CartItems.
// The booking row stores them in the same `items` jsonb column.
type TourBookingItem = {
  type: "tour";
  tourSlug: string;
  tourName: string;
  date: string;
  pickupTime: string;
  adults: number;
  children: number;
  durationLabel?: string;
  totalPrice: number;
  pickupHotel?: string;
};

type Item = CartItem | TourBookingItem;

function isTourItem(it: Item): it is TourBookingItem {
  return (it as TourBookingItem).type === "tour";
}

// Register a free Inter-like fallback font so the PDF renders cross-platform
// without relying on the host OS having Inter installed.
Font.register({
  family: "Helvetica",
  src: "Helvetica",
});

// Palette — 2026-07-05 repaint to match the transactional email
// (PR #18 + #26). Navy for eyebrows / order # / brand, orange for
// prices, green box for PICKUP address, blue box for DROP OFF address,
// amber pill for the meta line (date · time · pax · flight). Same
// visual language across the confirmation email, the payment-request
// email, and the PDF so all three feel like the same product.
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#1e3a8a",
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 56,
    objectFit: "contain",
  },
  brandBlock: {
    textAlign: "right",
  },
  brandName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1e3a8a",
    marginBottom: 2,
  },
  brandLine: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 20,
  },
  orderBox: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  orderLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  orderValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#ea580c",
  },
  orderValueMono: {
    fontSize: 10,
    fontFamily: "Courier",
    fontWeight: 700,
    color: "#1e3a8a",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1e3a8a",
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  customerBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  customerLine: {
    fontSize: 10,
    color: "#111827",
    marginBottom: 2,
  },
  tripCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tripEyebrow: {
    fontSize: 8,
    color: "#1e3a8a",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  tripRoute: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 1,
  },
  tripArrow: {
    fontSize: 10,
    color: "#9ca3af",
    marginVertical: 1,
  },
  tripPrice: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ea580c",
  },
  // PICKUP address box — green pill, matches the email's green
  // pickup box exactly (bg + border-left). Diego wants the driver's
  // starting address to jump off the page.
  pickupBox: {
    backgroundColor: "#dcfce7",
    borderLeftWidth: 3,
    borderLeftColor: "#16a34a",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  pickupEyebrow: {
    fontSize: 7,
    color: "#15803d",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  pickupText: {
    fontSize: 10,
    color: "#14532d",
    fontWeight: 700,
  },
  // DROPOFF address box — blue pill mirroring the email's blue
  // dropoff box (bg + border-left).
  dropoffBox: {
    backgroundColor: "#dbeafe",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  dropoffEyebrow: {
    fontSize: 7,
    color: "#1e40af",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  dropoffText: {
    fontSize: 10,
    color: "#1e3a8a",
    fontWeight: 700,
  },
  // Meta pill — date/time/pax/flight in a bright amber pill so the
  // driver spots it at a glance, matching the email meta pill.
  tripMeta: {
    fontSize: 10,
    color: "#b45309",
    fontWeight: 700,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  tripDetail: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },
  // Extra wait / Child seats — orange pill so it stays visually
  // distinct from the amber meta pill above it.
  tripExtra: {
    fontSize: 9,
    color: "#c2410c",
    fontWeight: 700,
    backgroundColor: "#ffedd5",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  totalsBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: "#111827",
    fontWeight: 700,
  },
  totalAmount: {
    fontSize: 18,
    color: "#ea580c",
    fontWeight: 700,
  },
  taxLine: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  contactBox: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 3,
    borderLeftColor: "#1e3a8a",
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  contactHeader: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1e3a8a",
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: "#111827",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
  // Post-trip review block — QR + caption. Sits below the totals/contact
  // and above the fixed page footer. Customer variant only; driver sheet
  // stays clean. Thin gray rule above so the block doesn't feel bolted
  // on. No wording about star count / rating anywhere — Google prohibits
  // directed reviews.
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  reviewQr: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  reviewCaption: {
    flexDirection: "column",
    justifyContent: "center",
  },
  reviewCaptionLine1: {
    fontSize: 11,
    color: "#1e3a8a",
    fontWeight: 700,
    marginBottom: 2,
  },
  reviewCaptionLine2: {
    fontSize: 10,
    color: "#1e3a8a",
  },
  // Customer-note callout — new 2026-07-17. Sits at the BOTTOM of the
  // reservation (Diego's placement request), above the review QR
  // block on the customer variant, and above the contact box on the
  // driver variant. Driver variant renders red (impossible to miss —
  // drivers need to know about stops / requests before they leave);
  // customer variant renders amber (soft, informative, matching the
  // amber meta pill already used on the trip card). Same border-left
  // accent pattern as pickupBox / dropoffBox.
  requestBoxDriver: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
    borderRadius: 6,
    padding: 10,
    marginTop: 16,
  },
  requestEyebrowDriver: {
    fontSize: 8,
    color: "#991b1b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  requestTextDriver: {
    fontSize: 11,
    color: "#7f1d1d",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  requestBoxCustomer: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    borderRadius: 6,
    padding: 10,
    marginTop: 16,
  },
  requestEyebrowCustomer: {
    fontSize: 8,
    color: "#b45309",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  requestTextCustomer: {
    fontSize: 11,
    color: "#78350f",
    fontWeight: 700,
    lineHeight: 1.4,
  },
});

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function format12h(time: string): string {
  if (!time || !time.includes(":")) return time || "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${period}`;
}

export type BookingPdfProps = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalUsd: number;
  authCode?: string | null;
  cardLast4?: string | null;
  items: Item[];
  /** Absolute URL to the logo PNG. Required because react-pdf can't
   *  resolve `/public` relative paths the way Next.js can. */
  logoUrl: string;
  /** When true, render a driver-only trip sheet: same trip info, but
   *  every pricing element (total paid, per-trip prices, tax line,
   *  auth code, card last-4) is stripped. Diego forwards these
   *  sheets to his drivers over WhatsApp without revealing revenue. */
  driverVariant?: boolean;
  /** Optional base64 data-URL for the "Leave a Google review" QR code.
   *  Generated in the PDF route handler (synchronous render-time on the
   *  server) and passed in as a prop so this component stays sync. If
   *  omitted (or on the driver variant) the block is skipped. */
  reviewQrDataUrl?: string;
  /** Customer-submitted note captured on the booking form (special
   *  requests, allergies, extra stops, etc.). Rendered as a callout at
   *  the BOTTOM of the reservation on both variants — RED on the driver
   *  sheet (impossible to miss — operational info drivers need before
   *  leaving) and AMBER on the customer receipt (soft confirmation
   *  that we saw the request). Empty / null / whitespace = no block.
   *  Diego 2026-07-17: closes the loop from the missed-stop incident. */
  notes?: string | null;
};

export default function BookingPdfDocument({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  totalUsd,
  authCode,
  cardLast4,
  items,
  logoUrl,
  driverVariant = false,
  reviewQrDataUrl,
  notes,
}: BookingPdfProps) {
  const trimmedNote = notes && notes.trim() ? notes.trim() : "";
  return (
    <Document
      title={
        driverVariant
          ? `Driver Trip Sheet ${orderNumber}`
          : `Booking Confirmation ${orderNumber}`
      }
      author="Private Travel Costa Rica"
      subject={
        driverVariant
          ? `Driver trip sheet for order ${orderNumber}`
          : `Booking confirmation for order ${orderNumber}`
      }
    >
      <Page size="A4" style={styles.page}>
        {/* Header with logo + brand block */}
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>Private Travel Costa Rica</Text>
            <Text style={styles.brandLine}>La Fortuna, San Carlos</Text>
            <Text style={styles.brandLine}>WhatsApp: +506 8633-4133</Text>
            <Text style={styles.brandLine}>info@privatetravelcr.com</Text>
            <Text style={styles.brandLine}>ICT #3205-2022</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {driverVariant ? "Driver Trip Sheet" : "Booking Confirmation"}
        </Text>
        <Text style={styles.subtitle}>
          {driverVariant
            ? `Trip details for order ${orderNumber}. Contact the customer 24h before pickup to confirm.`
            : `Thank you, ${
                customerName.split(" ")[0] || "friend"
              }. Your payment has been received. Keep this confirmation handy — your driver will text you the day before your trip.`}
        </Text>

        {/* Order summary — driver variant only shows the order number
            (no total, no auth code, no card). */}
        <View style={styles.orderBox}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order number</Text>
            <Text style={styles.orderValueMono}>{orderNumber}</Text>
          </View>
          {!driverVariant ? (
            <>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Total paid</Text>
                <Text style={styles.orderValue}>
                  ${totalUsd.toFixed(2)} USD
                </Text>
              </View>
              {authCode ? (
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Authorization</Text>
                  <Text style={styles.orderValueMono}>{authCode}</Text>
                </View>
              ) : null}
              {cardLast4 ? (
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Card</Text>
                  <Text style={styles.orderValueMono}>•••• {cardLast4}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        {/* Customer */}
        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.customerBox}>
          <Text style={styles.customerLine}>{customerName}</Text>
          <Text style={styles.customerLine}>{customerEmail}</Text>
          {customerPhone ? (
            <Text style={styles.customerLine}>{customerPhone}</Text>
          ) : null}
        </View>

        {/* Trips / tours */}
        <Text style={styles.sectionTitle}>
          {items.length > 1 ? "Your Trips" : "Your Trip"}
        </Text>
        {items.map((it, idx) => {
          if (isTourItem(it)) {
            const paxLabel =
              it.children > 0
                ? `${it.adults} adult${it.adults !== 1 ? "s" : ""} + ${it.children} child${it.children !== 1 ? "ren" : ""}`
                : `${it.adults} adult${it.adults !== 1 ? "s" : ""}`;
            return (
              <View key={idx} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <View>
                    <Text style={styles.tripEyebrow}>
                      Tour #{idx + 1}
                      {it.durationLabel ? ` · ${it.durationLabel}` : ""}
                    </Text>
                    <Text style={styles.tripRoute}>{it.tourName}</Text>
                  </View>
                  {!driverVariant ? (
                    <Text style={styles.tripPrice}>
                      ${it.totalPrice.toFixed(2)}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.tripMeta}>
                  {formatDate(it.date)} · Departure {format12h(it.pickupTime)} ·{" "}
                  {paxLabel}
                </Text>
                {it.pickupHotel ? (
                  <View style={styles.pickupBox}>
                    <Text style={styles.pickupEyebrow}>Pickup at</Text>
                    <Text style={styles.pickupText}>{it.pickupHotel}</Text>
                  </View>
                ) : null}
              </View>
            );
          }

          // Shuttle item — trip card now mirrors the email layout:
          // origin city → green PICKUP box → arrow → destination city
          // → blue DROPOFF box → amber META pill (date/time/pax/flight).
          const service = it.serviceType === "vip" ? "VIP" : "Standard";
          const showPickupBox =
            it.pickupPlace && it.pickupPlace !== it.fromName;
          const showDropoffBox =
            it.dropoffPlace && it.dropoffPlace !== it.toName;
          return (
            <View key={idx} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripEyebrow}>
                    Trip #{idx + 1} · {service} · {it.vehicleName}
                  </Text>
                  <Text style={styles.tripRoute}>{it.fromName}</Text>
                  {showPickupBox ? (
                    <View style={styles.pickupBox}>
                      <Text style={styles.pickupEyebrow}>Pickup at</Text>
                      <Text style={styles.pickupText}>{it.pickupPlace}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.tripArrow}>↓</Text>
                  <Text style={styles.tripRoute}>{it.toName}</Text>
                  {showDropoffBox ? (
                    <View style={styles.dropoffBox}>
                      <Text style={styles.dropoffEyebrow}>Drop off at</Text>
                      <Text style={styles.dropoffText}>{it.dropoffPlace}</Text>
                    </View>
                  ) : null}
                </View>
                {!driverVariant ? (
                  <Text style={styles.tripPrice}>
                    ${it.totalPrice.toFixed(2)}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.tripMeta}>
                {formatDate(it.date)} · {format12h(it.pickupTime)} ·{" "}
                {it.passengers} pax
                {it.flightNumber ? ` · Flight ${it.flightNumber}` : ""}
              </Text>
              {it.extraStopHours && it.extraStopHours > 0 ? (
                <Text style={styles.tripExtra}>
                  Extra wait: {it.extraStopHours}h paid
                </Text>
              ) : null}
              {/* Child-seat request line. Reuses tripExtra style (amber,
                  bold) so a parent skimming the PDF on their phone the
                  morning of pickup can quickly confirm we know about the
                  seats they asked for. */}
              {(() => {
                const parts: string[] = [];
                if (it.infantSeats)
                  parts.push(`${it.infantSeats} infant`);
                if (it.convertibleSeats)
                  parts.push(`${it.convertibleSeats} convertible`);
                if (it.boosterSeats)
                  parts.push(`${it.boosterSeats} booster`);
                if (parts.length === 0) return null;
                return (
                  <Text style={styles.tripExtra}>
                    Child seats: {parts.join(" + ")}
                  </Text>
                );
              })()}
            </View>
          );
        })}

        {/* Totals — customer receipt only. Driver sheet skips this entirely. */}
        {!driverVariant ? (
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>${totalUsd.toFixed(2)} USD</Text>
            </View>
            <Text style={styles.taxLine}>Taxes included · Final price</Text>
          </View>
        ) : null}

        {/* Customer-request callout — BOTTOM of the reservation, per
            Diego's placement request (2026-07-17: "pon la nota abajo
            en la reserva no arriba"). Red on the driver sheet so
            stops / special requests are impossible to miss before
            leaving; amber on the customer receipt as a soft
            confirmation that the request was received. Rendered on
            both variants — pricing stays hidden on the driver sheet,
            but operational notes are exactly what drivers need. */}
        {trimmedNote ? (
          <View
            style={
              driverVariant
                ? styles.requestBoxDriver
                : styles.requestBoxCustomer
            }
          >
            <Text
              style={
                driverVariant
                  ? styles.requestEyebrowDriver
                  : styles.requestEyebrowCustomer
              }
            >
              {driverVariant ? "⚠️ CUSTOMER REQUEST" : "SPECIAL REQUEST"}
            </Text>
            <Text
              style={
                driverVariant
                  ? styles.requestTextDriver
                  : styles.requestTextCustomer
              }
            >
              {trimmedNote}
            </Text>
          </View>
        ) : null}

        {/* Contact */}
        <View style={styles.contactBox}>
          <Text style={styles.contactHeader}>Questions before your trip?</Text>
          <Text style={styles.contactLine}>
            WhatsApp: +506 8633-4133 (fastest)
          </Text>
          <Text style={styles.contactLine}>Email: info@privatetravelcr.com</Text>
          <Text style={styles.contactLine}>Web: www.privatetravelcr.com</Text>
        </View>

        {/* Post-trip Google review QR — customer variant only. The
            driver sheet stays free of pricing AND of the review CTA
            (drivers hand the sheet back, they don't leave the review). */}
        {!driverVariant && reviewQrDataUrl ? (
          <View style={styles.reviewRow}>
            <Image src={reviewQrDataUrl} style={styles.reviewQr} />
            <View style={styles.reviewCaption}>
              <Text style={styles.reviewCaptionLine1}>After your trip:</Text>
              <Text style={styles.reviewCaptionLine2}>
                Scan to share your experience
              </Text>
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Private Travel Costa Rica · Operator license ICT #3205-2022 ·
            Issued for order {orderNumber}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
