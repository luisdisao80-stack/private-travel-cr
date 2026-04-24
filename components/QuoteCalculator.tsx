"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Calendar, ArrowRight, Check, Sparkles, Crown } from "lucide-react";
import { locations, calculateAllPrices, getLocationById, vehicles, VIP_EXTRA_USD, ServiceType } from "@/data/routes";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

export default function QuoteCalculator() {
  const { t } = useLanguage();

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [date, setDate] = useState<string>("");
  const [serviceType, setServiceType] = useState<ServiceType>("standard");
  const [showQuote, setShowQuote] = useState(false);

  // Escuchar evento para cambiar tipo de servicio desde otra seccion
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

  const quote = useMemo(() => {
    if (!from || !to || from === to) return null;
    return calculateAllPrices(from, to);
  }, [from, to]);

  const recommendedVehicle = passengers <= 5 ? "staria" : "hiace";

  const handleCalculate = () => {
    if (quote) {
      setShowQuote(true);
    }
  };

  const getPriceForVehicle = (vehicleId: string): number => {
    if (!quote) return 0;
    if (vehicleId === "staria") {
      return serviceType === "vip" ? quote.stariaVip : quote.stariaStandard;
    }
    return serviceType === "vip" ? quote.hiaceVip : quote.hiaceStandard;
  };

  // Mensaje de WhatsApp SIEMPRE EN INGLES (decisi\u00f3n del cliente)
  const handleWhatsApp = () => {
    const fromName = getLocationById(from)?.name || "";
    const toName = getLocationById(to)?.name || "";
    const vehicleName = recommendedVehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace";
    const price = getPriceForVehicle(recommendedVehicle);
    const serviceTxt = serviceType === "vip" ? "VIP (stops + drinks + snacks)" : "Standard";

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
                        {serviceType === "vip" ? t.quote.vipIncluded : t.quote.priceTotal}
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

              <Button onClick={handleWhatsApp} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg">
                {t.quote.reserveWhatsapp}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
