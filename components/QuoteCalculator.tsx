"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Calendar, ArrowRight, Check, Sparkles, Crown, Plus, Minus, Clock, ShoppingBag, CheckCircle2 } from "lucide-react";
import { locations, calculateAllPrices, getLocationById, vehicles, VIP_EXTRA_USD, ServiceType } from "@/data/routes";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";

const EXTRA_STOP_PRICE_PER_HOUR = 35;
const MAX_EXTRA_STOP_HOURS = 3;

export default function QuoteCalculator() {
  const { t } = useLanguage();
  const { addItem, setCartOpen } = useCart();

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [date, setDate] = useState<string>("");
  const [serviceType, setServiceType] = useState<ServiceType>("standard");
  const [extraStopHours, setExtraStopHours] = useState<number>(0);
  const [showQuote, setShowQuote] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const handleSetService = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "standard" || customEvent.detail === "vip") {
        setServiceType(customEvent.detail);
      }
    };
    window.addEventListener("set-service-type", handleSetService);
    return () => window.removeEventListener("set-service-type", handleSetService);
  }, []);

  useEffect(() => {
    if (serviceType === "vip") {
      setExtraStopHours(0);
    }
  }, [serviceType]);

  const quote = useMemo(() => {
    if (!from || !to || from === to) return null;
    return calculateAllPrices(from, to);
  }, [from, to]);

  const recommendedVehicle = passengers <= 5 ? "staria" : "hiace";

  const extraStopsCost = extraStopHours * EXTRA_STOP_PRICE_PER_HOUR;

  const handleCalculate = () => {
    if (quote) {
      setShowQuote(true);
    }
  };

  const getPriceForVehicle = (vehicleId: string): number => {
    if (!quote) return 0;
    const basePrice =
      vehicleId === "staria"
        ? serviceType === "vip" ? quote.stariaVip : quote.stariaStandard
        : serviceType === "vip" ? quote.hiaceVip : quote.hiaceStandard;
    return basePrice + (serviceType === "standard" ? extraStopsCost : 0);
  };

  const getBasePriceForVehicle = (vehicleId: string): number => {
    if (!quote) return 0;
    return vehicleId === "staria"
      ? serviceType === "vip" ? quote.stariaVip : quote.stariaStandard
      : serviceType === "vip" ? quote.hiaceVip : quote.hiaceStandard;
  };

  const handleAddHour = () => {
    if (extraStopHours < MAX_EXTRA_STOP_HOURS) {
      setExtraStopHours((h) => h + 1);
    }
  };

  const handleRemoveHour = () => {
    if (extraStopHours > 0) {
      setExtraStopHours((h) => h - 1);
    }
  };

  const isValidForBooking = !!quote && !!date && !!from && !!to && from !== to;

  const handleAddToCart = () => {
    if (!quote || !date) return;

    const fromName = getLocationById(from)?.nameEn || getLocationById(from)?.name || "";
    const toName = getLocationById(to)?.nameEn || getLocationById(to)?.name || "";
    const vehicleName = recommendedVehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace";
    const basePrice = getBasePriceForVehicle(recommendedVehicle);
    const totalPrice = basePrice + (serviceType === "standard" ? extraStopsCost : 0);

    addItem({
      fromId: from,
      fromName,
      toId: to,
      toName,
      passengers,
      date,
      serviceType,
      vehicleId: recommendedVehicle,
      vehicleName,
      basePrice,
      extraStopHours: serviceType === "standard" ? extraStopHours : 0,
      extraStopsCost: serviceType === "standard" ? extraStopsCost : 0,
      totalPrice,
    });

    // Mostrar feedback visual
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    // Reset del cotizador para nueva entrada
    setFrom("");
    setTo("");
    setDate("");
    setServiceType("standard");
    setExtraStopHours(0);
    setShowQuote(false);
  };

  const handleWhatsApp = () => {
    const fromName = getLocationById(from)?.name || "";
    const toName = getLocationById(to)?.name || "";
    const vehicleName = recommendedVehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace";
    const price = getPriceForVehicle(recommendedVehicle);

    let serviceTxt = serviceType === "vip" ? "VIP (stops + drinks + snacks)" : "Standard";
    if (serviceType === "standard" && extraStopHours > 0) {
      serviceTxt = `Standard + ${extraStopHours}h tourist stop${extraStopHours > 1 ? "s" : ""} (+$${extraStopsCost})`;
    }

    const messageText =
      `Hello! I want to book a private shuttle:\n\n` +
      `*From:* ${fromName}\n` +
      `*To:* ${toName}\n` +
      `*Passengers:* ${passengers}\n` +
      `*Date:* ${date}\n` +
      `*Vehicle:* ${vehicleName}\n` +
      `*Service:* ${serviceTxt}\n` +
      `*Price:* $${price} USD\n\n` +
      `Is it available? Thanks!`;

    const message = encodeURIComponent(messageText);
    window.open(`https://wa.me/50686334133?text=${message}`, "_blank");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-amber-500/20 bg-black/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-amber-500/10">
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          <span className="text-amber-400">✦</span>
          {t.quote.title}
        </CardTitle>
        <p className="text-sm text-gray-400">{t.quote.subtitle}</p>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-400 flex items-center gap-1.5">
              <MapPin size={14} />
              {t.quote.origin}
            </Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="bg-black/50 border-amber-500/30 text-white h-12">
                <SelectValue placeholder={t.quote.originPlaceholder} />
              </SelectTrigger>
              <SelectContent className="bg-black border-amber-500/30">
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id} className="text-white hover:bg-amber-500/10">
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-400 flex items-center gap-1.5">
              <MapPin size={14} />
              {t.quote.destination}
            </Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="bg-black/50 border-amber-500/30 text-white h-12">
                <SelectValue placeholder={t.quote.destinationPlaceholder} />
              </SelectTrigger>
              <SelectContent className="bg-black border-amber-500/30">
                {locations.filter((loc) => loc.id !== from).map((loc) => (
                  <SelectItem key={loc.id} value={loc.id} className="text-white hover:bg-amber-500/10">
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-amber-400 flex items-center gap-1.5">
              <Users size={14} />
              {t.quote.passengers}
            </Label>
            <Input
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="bg-black/50 border-amber-500/30 text-white h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-amber-400 flex items-center gap-1.5">
              <Calendar size={14} />
              {t.quote.date}
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-black/50 border-amber-500/30 text-white h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            {t.quote.serviceType}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setServiceType("standard")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                serviceType === "standard"
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-700 bg-black/40 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold">{t.quote.standardLabel}</span>
                {serviceType === "standard" && (
                  <Check size={18} className="text-amber-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">{t.quote.standardDesc}</p>
            </button>

            <button
              type="button"
              onClick={() => setServiceType("vip")}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                serviceType === "vip"
                  ? "border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/10"
                  : "border-gray-700 bg-black/40 hover:border-gray-600"
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t.quote.vipPremium}
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Crown size={16} className="text-amber-400" />
                  {t.quote.vipLabel}
                </span>
                {serviceType === "vip" && (
                  <Check size={18} className="text-amber-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">{t.quote.vipDesc} · +${VIP_EXTRA_USD}</p>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {serviceType === "standard" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-amber-500/5 to-transparent p-5 rounded-xl border border-amber-500/20">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-amber-400 flex items-center gap-1.5 mb-1">
                      <Clock size={14} />
                      {t.quote.extraStops.title}
                    </Label>
                    <p className="text-xs text-gray-400">
                      {t.quote.extraStops.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRemoveHour}
                      disabled={extraStopHours === 0}
                      aria-label={t.quote.extraStops.decrease}
                      className="w-10 h-10 rounded-full border-2 border-amber-500/40 bg-black/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500 transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/40 disabled:hover:border-amber-500/40"
                    >
                      <Minus size={16} />
                    </button>

                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-white">
                        {extraStopHours}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {extraStopHours === 1 ? t.quote.extraStops.hour : t.quote.extraStops.hours}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddHour}
                      disabled={extraStopHours >= MAX_EXTRA_STOP_HOURS}
                      aria-label={t.quote.extraStops.increase}
                      className="w-10 h-10 rounded-full border-2 border-amber-500/40 bg-black/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500 transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/40 disabled:hover:border-amber-500/40"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-500/10 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-400">
                    ${EXTRA_STOP_PRICE_PER_HOUR} {t.quote.extraStops.perHour} · {t.quote.extraStops.maxNote}
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    {extraStopHours === 0
                      ? t.quote.extraStops.noStops
                      : `+$${extraStopsCost} USD`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleCalculate}
          disabled={!from || !to || from === to}
          className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg disabled:opacity-40"
        >
          {t.quote.calculate}
          <ArrowRight className="ml-2" />
        </Button>

        {from && to && from !== to && !quote && (
          <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {t.quote.notAvailable}
          </div>
        )}

        <AnimatePresence>
          {showQuote && quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pt-4 border-t border-amber-500/20"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                  <span className="text-amber-400">✦</span>
                  {t.quote.chooseVehicle}
                </h3>
                {serviceType === "vip" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                    <Crown size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold">{t.quote.vipSelected}</span>
                  </div>
                )}
                {serviceType === "standard" && extraStopHours > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold">
                      +{extraStopHours}h {extraStopHours === 1 ? t.quote.extraStops.shortLabel : t.quote.extraStops.shortLabelPlural}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicles.map((v) => {
                  const price = getPriceForVehicle(v.id);
                  const isRecommended = v.id === recommendedVehicle;
                  const isDisabled = passengers < v.minPax || passengers > v.maxPax;

                  return (
                    <div
                      key={v.id}
                      className={`relative p-5 rounded-xl border-2 transition-all ${
                        isRecommended && !isDisabled
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-700 bg-black/40"
                      } ${isDisabled ? "opacity-40" : ""}`}
                    >
                      {isRecommended && !isDisabled && (
                        <div className="absolute -top-3 right-4 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                          {t.quote.recommended}
                        </div>
                      )}
                      <h4 className="text-white font-bold text-lg">{v.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{v.minPax}-{v.maxPax} {t.quote.passengersRange}</p>
                      <div className="text-amber-400 text-3xl font-bold">
                        ${price}
                        <span className="text-sm text-gray-400 font-normal"> {t.quote.priceUSD}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {serviceType === "vip"
                          ? t.quote.vipIncluded
                          : extraStopHours > 0
                            ? `${t.quote.priceTotal} (+${extraStopHours}h)`
                            : t.quote.priceTotal}
                      </p>
                      {isDisabled && (
                        <p className="text-xs text-red-400 mt-2">{t.quote.notForPax} {passengers} {t.quote.passengersRange}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-black/40 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>{t.quote.estimatedDuration}</span>
                  <span className="text-white font-medium">
                    ~{Math.floor(quote.route.durationMinutes / 60)}h {quote.route.durationMinutes % 60}min
                    {serviceType === "vip" && <span className="text-amber-400">{t.quote.vipStop}</span>}
                    {serviceType === "standard" && extraStopHours > 0 && (
                      <span className="text-amber-400"> + {extraStopHours}h {extraStopHours === 1 ? t.quote.extraStops.shortLabel : t.quote.extraStops.shortLabelPlural}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t.quote.distance}</span>
                  <span className="text-white font-medium">{quote.route.distanceKm} km</span>
                </div>
              </div>

              {serviceType === "standard" && (
                <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/20">
                  <p className="text-amber-400 font-semibold mb-2 text-sm">{t.quote.standardIncluded}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    {t.quote.standardFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Check size={12} className="text-amber-400" />
                        {feature}
                      </div>
                    ))}
                    {extraStopHours > 0 && (
                      <div className="flex items-center gap-1 col-span-2 mt-1 pt-2 border-t border-amber-500/10">
                        <Clock size={12} className="text-amber-400" />
                        <strong className="text-amber-400">
                          +{extraStopHours}h {t.quote.extraStops.includedLabel} (+${extraStopsCost})
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {serviceType === "vip" && (
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-lg border border-amber-500/40">
                  <p className="text-amber-400 font-bold mb-3 text-sm flex items-center gap-1.5">
                    <Crown size={14} />
                    {t.quote.vipIncludedTitle}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                    {t.quote.vipFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong className="text-white">{feature.strong}</strong>
                          {feature.normal && <> {feature.normal}</>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs: Add to Cart + Reserve via WhatsApp */}
              <div className="space-y-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isValidForBooking || addedToCart}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base disabled:opacity-40"
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center"
                      >
                        <CheckCircle2 size={18} className="mr-2" />
                        {t.quote.addedToCart}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center"
                      >
                        <ShoppingBag size={18} className="mr-2" />
                        {t.quote.addToCart}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>

                {!date && from && to && (
                  <p className="text-xs text-amber-400/80 text-center">
                    {t.quote.selectDateForCart}
                  </p>
                )}

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-amber-500/10" />
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">{t.quote.or}</span>
                  <div className="flex-1 h-px bg-amber-500/10" />
                </div>

                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full h-12 bg-transparent border-green-600/50 hover:bg-green-600/10 hover:border-green-600 text-green-500 hover:text-green-400 font-semibold"
                >
                  {t.quote.reserveWhatsapp}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
