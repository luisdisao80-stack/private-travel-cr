"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";

type BookingFormProps = {
  onBack: () => void;
};

export default function BookingForm({ onBack }: BookingFormProps) {
  const { items, totalPrice, clearCart, setCartOpen } = useCart();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Convierte "HH:MM" (24h) a formato 12h amigable: "11:30 PM"
  const formatTime = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return timeStr;
    const period = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${mStr} ${period}`;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    hotel: "",
    flightNumber: "",
    flightTime: "",
    notes: "",
  });

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid = form.name && form.email && form.phone;

  const handleSubmit = async () => {
    if (!isValid || items.length === 0) return;
    setLoading(true);

    // Build the WhatsApp message
    const transfersText = items
      .map((item, idx) => {
        const lines = [
          `*${idx + 1}. ${item.fromName} → ${item.toName}*`,
          `   📅 Date: ${item.date}`,
          `   ⏰ Pick up time: ${formatTime(item.pickupTime)}`,
          `   👥 Passengers: ${item.passengers}${item.children > 0 ? ` (incl. ${item.children} child${item.children > 1 ? "ren" : ""} under 12)` : ""}`,
          item.children > 0 ? `   🪑 Car seats needed: ${item.children} (FREE - included)` : null,
          `   📍 Pick up: ${item.pickupPlace}`,
          `   🏁 Drop off: ${item.dropoffPlace}`,
          item.flightNumber ? `   ✈️ Flight: ${item.flightNumber}` : null,
          `   ⭐ Service: ${item.serviceType === "vip" ? "VIP (stops + drinks + snacks)" : "Standard"}${
            item.extraStopHours > 0 ? ` + ${item.extraStopHours}h tourist stop${item.extraStopHours > 1 ? "s" : ""}` : ""
          }`,
          `   🚗 Vehicle: ${item.vehicleName}`,
          `   💰 Price: $${item.totalPrice} USD`,
        ].filter(Boolean);
        return lines.join("\n");
      })
      .join("\n\n");

    const customerInfo = [
      `*CUSTOMER:*`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      form.hotel ? `Hotel: ${form.hotel}` : null,
      form.flightNumber ? `Flight: ${form.flightNumber}` : null,
      form.flightTime ? `Flight time: ${form.flightTime}` : null,
    ].filter(Boolean).join("\n");

    const messageText =
      `Hello! I want to book ${items.length} transfer${items.length > 1 ? "s" : ""}:\n\n` +
      `${customerInfo}\n\n` +
      `*TRANSFERS:*\n\n${transfersText}\n\n` +
      `*TOTAL: $${totalPrice} USD*` +
      (form.notes ? `\n\n*Notes:*\n${form.notes}` : "") +
      `\n\nPlease confirm availability. Thanks!`;

    const message = encodeURIComponent(messageText);
    window.open(`https://wa.me/50686334133?text=${message}`, "_blank");

    // Limpiar carrito y cerrar drawer después de un breve delay
    setTimeout(() => {
      clearCart();
      setCartOpen(false);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors mb-2"
      >
        <ArrowLeft size={14} />
        {t.cart.backToCart}
      </button>

      {/* Summary mini */}
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">
            {items.length} {items.length === 1 ? t.cart.transfer : t.cart.transfers}
          </span>
          <span className="text-amber-400 font-bold">${totalPrice} USD</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">{t.cart.formIntro}</p>

      {/* Form fields */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-amber-400 text-sm">
            {t.cart.fields.name} <span className="text-red-400">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={handleChange("name")}
            placeholder={t.cart.placeholders.name}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-400 text-sm">
            {t.cart.fields.email} <span className="text-red-400">*</span>
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder={t.cart.placeholders.email}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-400 text-sm">
            {t.cart.fields.phone} <span className="text-red-400">*</span>
          </Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder={t.cart.placeholders.phone}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-400 text-sm">
            {t.cart.fields.hotel}
          </Label>
          <Input
            value={form.hotel}
            onChange={handleChange("hotel")}
            placeholder={t.cart.placeholders.hotel}
            className="bg-black/50 border-amber-500/30 text-white h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-amber-400 text-sm">{t.cart.fields.flightNumber}</Label>
            <Input
              value={form.flightNumber}
              onChange={handleChange("flightNumber")}
              placeholder={t.cart.placeholders.flightNumber}
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-amber-400 text-sm">{t.cart.fields.flightTime}</Label>
            <Input
              type="time"
              value={form.flightTime}
              onChange={handleChange("flightTime")}
              className="bg-black/50 border-amber-500/30 text-white h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-amber-400 text-sm">{t.cart.fields.notes}</Label>
          <textarea
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder={t.cart.placeholders.notes}
            rows={3}
            className="w-full rounded-md bg-black/50 border border-amber-500/30 text-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base disabled:opacity-40 mt-4"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <MessageCircle size={18} className="mr-2" />
            {t.cart.sendBooking}
          </>
        )}
      </Button>

      <p className="text-[10px] text-center text-gray-500">{t.cart.privacyNote}</p>
    </motion.div>
  );
}
