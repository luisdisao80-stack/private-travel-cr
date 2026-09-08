import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem } from "@/lib/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PayButton from "@/components/PayButton";
import { siteConfig } from "@/lib/site-config";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plane,
  Crown,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

// Public "complete your booking" page. Reached via the pay link Diego
// sends from the admin /admin/create-quote flow (2026-06-30 feature).
// The token in the URL is unguessable (24-char base64url = ~144 bits of
// entropy), so knowing it is proof enough that the visitor is the person
// Diego intended to reach. We never render or expose the token in HTML —
// it's only used for the server lookup and passed to the payment API
// via the PayButton client component.

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

// SEO: do NOT let Google or any bot index this page. It's per-customer,
// contains their payment amount, and only makes sense to the one recipient.
export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PayPage({ params }: Props) {
  const { token } = await params;

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, total_usd, items, status, token_expires_at",
    )
    .eq("payment_token", token)
    .maybeSingle();

  if (!booking) notFound();

  const items = (booking.items as CartItem[]) || [];

  const now = new Date();
  const expiresAt = booking.token_expires_at
    ? new Date(booking.token_expires_at)
    : null;
  const isExpired = expiresAt ? expiresAt < now : false;
  const isAlreadyPaid = booking.status === "approved";

  const totalUsd = Number(booking.total_usd || 0);

  return (
    <main className="min-h-screen bg-white text-slate-600">
      <Navbar />

      <section className="pt-28 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-orange-50 border border-slate-200 text-orange-600 text-[11px] tracking-widest uppercase font-bold">
              Complete your booking
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
              Hi {booking.customer_name?.split(" ")[0] || "friend"},
            </h1>
            <p className="text-slate-600">
              Diego prepared this booking for you. Review the details and
              tap the button below to pay.
            </p>
          </div>

          {/* Expired / already paid states */}
          {isAlreadyPaid && (
            <div className="rounded-2xl border border-green-600 bg-green-50 p-6 text-center mb-6">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-lg font-bold text-green-700 mb-1">
                Already paid
              </div>
              <p className="text-sm text-slate-600">
                This booking (<span className="font-mono">{booking.order_number}</span>) is already confirmed. Check your inbox for the confirmation email.
              </p>
            </div>
          )}

          {isExpired && !isAlreadyPaid && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center mb-6">
              <div className="text-2xl mb-2">⏰</div>
              <div className="text-lg font-bold text-red-700 mb-1">
                This link has expired
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Payment links are valid for 48 hours. Message Diego on
                WhatsApp and he&apos;ll send you a new one.
              </p>
              <a
                href="https://wa.me/50686334133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-3 rounded-lg"
              >
                <MessageCircle size={16} />
                WhatsApp Diego
              </a>
            </div>
          )}

          {/* Order card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden mb-6">
            {/* Order number + total */}
            <div className="bg-orange-50 border-b border-slate-200 p-5">
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] uppercase tracking-widest text-orange-600 font-bold">
                  Order {booking.order_number}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Total{items.length > 1 ? ` · ${items.length} trips` : ""}
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    ${totalUsd.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-slate-500">USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip details — loops per trip. Multi-trip quotes stack the
                trips vertically with dividers between them; single-trip
                quotes render identical to the pre-multi-trip layout. */}
            <div className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <TripBlock
                  key={idx}
                  item={item}
                  index={idx}
                  total={items.length}
                />
              ))}
            </div>
          </div>

          {/* Pay button */}
          {!isExpired && !isAlreadyPaid && (
            <>
              <PayButton token={token} totalUsd={totalUsd} />
              <div className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} className="text-orange-600" />
                Secure payment via Tilopay · Charged in USD
              </div>
              {expiresAt && (
                <div className="text-[11px] text-slate-500 text-center mt-1">
                  Link expires{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }).format(expiresAt)}
                </div>
              )}
            </>
          )}

          {/* Questions? */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-3">
              Questions before you pay?
            </p>
            <a
              href="https://wa.me/50686334133"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-green-50 text-green-700 border border-green-600/50 font-bold text-sm px-5 py-2.5 rounded-lg"
            >
              <MessageCircle size={16} />
              WhatsApp Diego directly
            </a>
          </div>

          {/* Trust footer */}
          <div className="mt-8 text-center text-[11px] text-slate-400">
            <p>
              ⭐ 5.0 on Google · 200+ reviews · ICT Licensed · Fully
              insured through INS
            </p>
            <p className="mt-1">
              <Link
                href={siteConfig.siteUrl}
                className="hover:text-orange-600"
              >
                privatetravelcr.com
              </Link>{" "}
              · +506 8633-4133
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}

function TripBlock({
  item,
  index,
  total,
}: {
  item: CartItem;
  index: number;
  total: number;
}) {
  const isMultiTrip = total > 1;
  // Per-trip price only shown on multi-trip quotes so single-trip renders
  // identically to the pre-refactor layout (no visual regression).
  const perTripPrice = Number(
    (item as unknown as { totalPrice?: number; tripPrice?: number }).totalPrice ??
      (item as unknown as { totalPrice?: number; tripPrice?: number }).tripPrice ??
      0,
  );

  return (
    <div className="p-5 space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">
            {isMultiTrip ? `Trip ${index + 1} of ${total}` : "Trip"} ·{" "}
            {item.serviceType === "vip" ? "VIP" : "Standard"} ·{" "}
            {item.vehicleName}
          </div>
          {isMultiTrip && perTripPrice > 0 && (
            <div className="text-sm font-bold text-blue-900 whitespace-nowrap">
              ${perTripPrice.toFixed(2)}
              <span className="text-[10px] font-normal text-slate-500 ml-1">
                USD
              </span>
            </div>
          )}
        </div>
        <div className="space-y-2 text-slate-700">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{item.fromName}</div>
              {item.pickupPlace && item.pickupPlace !== item.fromName && (
                <div className="text-xs text-slate-500">
                  {item.pickupPlace}
                </div>
              )}
            </div>
          </div>
          <div className="text-slate-400 pl-6">↓</div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{item.toName}</div>
              {item.dropoffPlace && item.dropoffPlace !== item.toName && (
                <div className="text-xs text-slate-500">
                  {item.dropoffPlace}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
        <MetaRow
          icon={<Calendar size={14} />}
          label="Date"
          value={item.date}
        />
        <MetaRow
          icon={<Clock size={14} />}
          label="Pickup time"
          value={item.pickupTime}
        />
        <MetaRow
          icon={<Users size={14} />}
          label="Passengers"
          value={String(item.passengers)}
        />
        {item.flightNumber && (
          <MetaRow
            icon={<Plane size={14} />}
            label="Flight"
            value={item.flightNumber}
          />
        )}
        {item.serviceType === "vip" && (
          <MetaRow
            icon={<Crown size={14} />}
            label="Service"
            value="VIP"
          />
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-0.5">
        <span className="text-orange-600">{icon}</span>
        {label}
      </div>
      <div className="text-sm text-slate-900 font-medium">{value}</div>
    </div>
  );
}
