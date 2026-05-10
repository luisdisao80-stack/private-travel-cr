"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";

type BookingFormProps = {
  onBack: () => void;
};

export default function BookingForm({ onBack }: BookingFormProps) {
  const { items, totalPrice } = useCart();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    try {
      const resp = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            hotel: form.hotel || undefined,
            flightNumber: form.flightNumber || undefined,
            flightTime: form.flightTime || undefined,
            notes: form.notes || undefined,
          },
          items,
          totalUsd: totalPrice,
        }),
      });

      const data = (await resp.json()) as { checkoutUrl?: string; error?: string };

      if (!resp.ok || !data.checkoutUrl) {
        throw new Error(data.error || `Server returned ${resp.status}`);
      }

      // Cart is kept until payment confirms via /booking/success, so users can retry on failure.
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error("Payment start failed:", e);
      setError(e instanceof Error ? e.message : "Could not start payment. Please try again.");
      setLoading(false);
    }
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

      {error ? (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      ) : null}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black font-bold text-base disabled:opacity-40 mt-4"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <CreditCard size={18} className="mr-2" />
            Pay ${totalPrice} USD
          </>
        )}
      </Button>

      <p className="text-[10px] text-center text-gray-500">{t.cart.privacyNote}</p>
    </motion.div>
  );
}
