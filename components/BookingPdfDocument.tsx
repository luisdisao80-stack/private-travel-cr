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

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f59e0b",
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
    color: "#1a1a1a",
    marginBottom: 2,
  },
  brandLine: {
    fontSize: 8,
    color: "#666",
    marginBottom: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#666",
    marginBottom: 20,
  },
  orderBox: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
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
    color: "#666",
  },
  orderValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  orderValueMono: {
    fontSize: 10,
    fontFamily: "Courier",
    fontWeight: 700,
    color: "#92400e",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
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
    color: "#1a1a1a",
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
    color: "#92400e",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  tripRoute: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 1,
  },
  tripArrow: {
    fontSize: 10,
    color: "#999",
    marginVertical: 1,
  },
  tripPrice: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  tripMeta: {
    fontSize: 9,
    color: "#555",
    marginTop: 6,
  },
  tripDetail: {
    fontSize: 9,
    color: "#666",
    marginTop: 3,
  },
  tripExtra: {
    fontSize: 9,
    color: "#92400e",
    fontWeight: 700,
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
    color: "#1a1a1a",
    fontWeight: 700,
  },
  totalAmount: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: 700,
  },
  taxLine: {
    fontSize: 8,
    color: "#16a34a",
    marginTop: 2,
  },
  contactBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  contactHeader: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: "#1a1a1a",
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
}: BookingPdfProps) {
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
                  <Text style={styles.tripDetail}>
                    Pickup: {it.pickupHotel}
                  </Text>
                ) : null}
              </View>
            );
          }

          // Shuttle item
          const service = it.serviceType === "vip" ? "VIP" : "Standard";
          const pickup =
            it.pickupPlace && it.pickupPlace !== it.fromName
              ? ` · ${it.pickupPlace}`
              : "";
          const dropoff =
            it.dropoffPlace && it.dropoffPlace !== it.toName
              ? ` · ${it.dropoffPlace}`
              : "";
          return (
            <View key={idx} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.tripEyebrow}>
                    Trip #{idx + 1} · {service} · {it.vehicleName}
                  </Text>
                  <Text style={styles.tripRoute}>
                    {it.fromName}
                    {pickup}
                  </Text>
                  <Text style={styles.tripArrow}>↓</Text>
                  <Text style={styles.tripRoute}>
                    {it.toName}
                    {dropoff}
                  </Text>
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

        {/* Contact */}
        <View style={styles.contactBox}>
          <Text style={styles.contactHeader}>Questions before your trip?</Text>
          <Text style={styles.contactLine}>
            WhatsApp: +506 8633-4133 (fastest)
          </Text>
          <Text style={styles.contactLine}>Email: info@privatetravelcr.com</Text>
          <Text style={styles.contactLine}>Web: www.privatetravelcr.com</Text>
        </View>

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
