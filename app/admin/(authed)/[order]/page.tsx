import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MessageCircle, Phone, Plane, MapPin, Calendar, Users, Hotel, FileText } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem } from "@/lib/CartContext";
import {
  STATUSES,
  statusBadgeClass,
  formatCRDateTime,
  pickupAt,
} from "@/components/admin/booking-helpers";
import { updateBookingStatusAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ order: string }>;
};

export default async function AdminBookingDetailPage({ params }: Props) {
  const { order } = await params;
  const orderNumber = decodeURIComponent(order);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "order_number, customer_name, customer_email, customer_phone, customer_hotel, flight_number, flight_time, notes, items, total_usd, currency, status, created_at, reminder_sent_at, tilopay_auth, tilopay_last4"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-4 py-3">
        Failed to load booking: {error.message}
      </div>
    );
  }
  if (!data) notFound();

  const items = (data.items as CartItem[]) || [];
  const phone = data.customer_phone || "";
  const phoneDigits = phone.replace(/[^0-9]/g, "");
  const whatsappHref = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith("00") ? phoneDigits.slice(2) : phoneDigits}`
    : "";

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-400 mb-4"
      >
        <ChevronLeft size={14} /> All bookings
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">
            Order number
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono">
            {data.order_number}
          </h1>
          <div className="text-xs text-gray-500 mt-1">
            Created {formatCRDateTime(new Date(data.created_at))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ${statusBadgeClass(data.status)}`}
          >
            {data.status || "—"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
            Customer
          </h2>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={data.customer_name || "—"} />
            <Row
              label="Email"
              value={
                data.customer_email ? (
                  <a
                    href={`mailto:${data.customer_email}`}
                    className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5"
                  >
                    <Mail size={12} /> {data.customer_email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Phone"
              value={
                phone ? (
                  <span className="inline-flex items-center gap-3">
                    <a
                      href={`tel:${phone}`}
                      className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5"
                    >
                      <Phone size={12} /> {phone}
                    </a>
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 inline-flex items-center gap-1.5"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    )}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            {data.customer_hotel && (
              <Row
                label="Hotel"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Hotel size={12} className="text-gray-500" />
                    {data.customer_hotel}
                  </span>
                }
              />
            )}
            {data.flight_number && (
              <Row
                label="Flight"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Plane size={12} className="text-gray-500" />
                    {data.flight_number}
                    {data.flight_time ? ` · ${data.flight_time}` : ""}
                  </span>
                }
              />
            )}
            {data.notes && (
              <Row
                label="Notes"
                value={
                  <span className="inline-flex items-start gap-1.5">
                    <FileText
                      size={12}
                      className="text-gray-500 mt-0.5 shrink-0"
                    />
                    <span className="whitespace-pre-wrap">{data.notes}</span>
                  </span>
                }
              />
            )}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
            Payment
          </h2>
          <div className="space-y-3 text-sm">
            <Row
              label="Total"
              value={
                <span className="text-lg font-bold text-amber-400">
                  ${Number(data.total_usd || 0).toFixed(2)} {data.currency || "USD"}
                </span>
              }
            />
            {data.tilopay_auth && (
              <Row label="Tilopay auth" value={<span className="font-mono text-xs">{data.tilopay_auth}</span>} />
            )}
            {data.tilopay_last4 && (
              <Row label="Card last 4" value={<span className="font-mono">**** {data.tilopay_last4}</span>} />
            )}
            <Row
              label="Reminder sent"
              value={
                data.reminder_sent_at
                  ? formatCRDateTime(new Date(data.reminder_sent_at))
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Trips ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No trip items found.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => {
              const pu = pickupAt(it);
              return (
                <div
                  key={it.id || idx}
                  className="border border-zinc-900 rounded-lg p-4 bg-black/40"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="font-bold text-sm">
                      {it.fromName} → {it.toName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {it.vehicleName} ·{" "}
                      <span className="uppercase">{it.serviceType}</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-500" />
                      {pu ? formatCRDateTime(pu) : `${it.date} ${it.pickupTime}`}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Users size={12} className="text-gray-500" />
                      {it.passengers} adult{it.passengers === 1 ? "" : "s"}
                      {it.children
                        ? ` · ${it.children} child${it.children === 1 ? "" : "ren"}`
                        : ""}
                    </div>
                    {it.pickupPlace && (
                      <div className="inline-flex items-center gap-1.5 sm:col-span-2">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-gray-500">Pickup:</span>{" "}
                        {it.pickupPlace}
                      </div>
                    )}
                    {it.dropoffPlace && (
                      <div className="inline-flex items-center gap-1.5 sm:col-span-2">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-gray-500">Drop-off:</span>{" "}
                        {it.dropoffPlace}
                      </div>
                    )}
                    {it.flightNumber && (
                      <div className="inline-flex items-center gap-1.5">
                        <Plane size={12} className="text-gray-500" />
                        Flight {it.flightNumber}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Change status
        </h2>
        <form
          action={updateBookingStatusAction}
          className="flex items-center gap-3 flex-wrap"
        >
          <input
            type="hidden"
            name="orderNumber"
            value={data.order_number}
          />
          <select
            name="status"
            defaultValue={data.status || ""}
            className="bg-black border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-md px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-md transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-20 shrink-0 text-[11px] uppercase tracking-wider text-gray-500 pt-0.5">
        {label}
      </div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  );
}
