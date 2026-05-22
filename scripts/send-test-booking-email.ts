// One-off script that fires the SAME booking confirmation email the real
// payment callback sends, with fake data, so you can inspect exactly what
// the customer receives — no payment required.
//
// Usage:
//   1. Make sure RESEND_API_KEY and EMAIL_FROM are in .env.local
//      (copy them from Vercel → Settings → Environment Variables → reveal value).
//   2. Optionally tweak the data below (the "to" address defaults to BUSINESS_EMAIL).
//   3. Run:    npx tsx scripts/send-test-booking-email.ts
//
// You should receive 2 emails:
//   - Customer-style confirmation (what your real customers see)
//   - Internal "new booking" notification (to info@privatetravelcr.com)

import { config } from "dotenv";
config({ path: ".env.local" });

import { sendBookingEmails } from "../lib/email";
import type { CartItem } from "../lib/CartContext";

const TEST_TO = process.env.TEST_TO_EMAIL || "info@privatetravelcr.com";

const fakeItems: CartItem[] = [
  {
    id: "test-item-1",
    fromName: "SJO - Juan Santamaria Int. Airport",
    toName: "La Fortuna (Arenal)",
    date: "2026-06-15",
    pickupTime: "14:30",
    passengers: 2,
    children: 1,
    flightNumber: "AA1234",
    pickupPlace: "Terminal 1, Curbside",
    dropoffPlace: "Tabacon Thermal Resort",
    vehicleId: "staria",
    vehicleName: "Hyundai Staria (up to 6 pax)",
    serviceType: "standard",
    extraStopHours: 0,
    basePrice: 190,
    totalPrice: 190,
    duration: "3 h",
    infantSeats: 0,
    convertibleSeats: 1,
    boosterSeats: 0,
  },
];

async function main() {
  console.log("→ Sending TEST booking confirmation email");
  console.log("  From  :", process.env.EMAIL_FROM || "(default: onboarding@resend.dev)");
  console.log("  To    :", TEST_TO);
  console.log("  Order :", "TEST-EMAIL-VERIFICATION");

  await sendBookingEmails({
    orderNumber: "TEST-001",
    customerName: "Diego Test (no es una reserva real)",
    customerEmail: TEST_TO,
    customerPhone: "+506 8633-4133",
    totalUsd: 190,
    authCode: "TEST123",
    cardLast4: "4242",
    items: fakeItems,
  });

  console.log("✓ Done. Check the inbox for", TEST_TO);
  console.log("  If you don't see it in 30s, also check Spam/Promotions and the Resend logs.");
}

main().catch((e) => {
  console.error("✗ Script failed:", e);
  process.exit(1);
});
