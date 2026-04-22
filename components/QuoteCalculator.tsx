"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Calendar, ArrowRight, Check, Sparkles, Crown } from "lucide-react";
import { locations, calculateAllPrices, getLocationById, vehicles, VIP_EXTRA_USD, ServiceType } from "@/data/routes";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteCalculator() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [date, setDate] = useState<string>("");
  const [serviceType, setServiceType] = useState<ServiceType>("standard");
  const [showQuote, setShowQuote] = useState(false);

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

  const handleWhatsApp = () => {
    const fromName = getLocationById(from)?.name || "";
    const toName = getLocationById(to)?.name || "";
    const vehicleName = recommendedVehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace";
    const price = getPriceForVehicle(recommendedVehicle);
    const servicioTxt = serviceType === "vip" ? "VIP (con paradas + bebidas + snacks)" : "Standard";

    const message = encodeURIComponent(
      `¡Hola! Quiero reservar un shuttle privado:\n\n` +
      `📍 Desde: ${fromName}\n` +
      `📍 Hasta: ${toName}\n` +
      `👥 Pasajeros: ${passengers}\n` +
      `📅 Fecha: ${date}\n` +
      `🚐 Vehículo: ${vehicleName}\n` +
      `✨ Servicio: ${servicioTxt}\n` +
      `💰 Precio: $${price} USD\n\n` +
      `¿Está disponible?`
    );

    window.open(`https://wa.me/50686334133?text=${message}`, "_blank");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-amber-500/20 bg-black/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-amber-500/10">
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          <span className="text-amber-400">✦</span>
          Cotización Instantánea
        </CardTitle>
        <p className="text-sm text-gray-400">Obtén tu precio al instante, sin esperas</p>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-400 flex items-center gap-1.5">
              <MapPin size={14} />
              Origen
            </Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="bg-black/50 border-amber-500/30 text-white h-12">
                <SelectValue placeholder="¿Desde dónde sales?" />
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
              Destino
            </Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="bg-black/50 border-amber-500/30 text-white h-12">
                <SelectValue placeholder="¿A dónde vas?" />
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
              Pasajeros
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
              Fecha de viaje
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
            Tipo de servicio
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
                <span className="text-white font-bold">Standard</span>
                {serviceType === "standard" && (
                  <Check size={18} className="text-amber-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">Directo · Rápido · Puerta a puerta</p>
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
                PREMIUM
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Crown size={16} className="text-amber-400" />
                  VIP
                </span>
                {serviceType === "vip" && (
                  <Check size={18} className="text-amber-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">+1-2h parada · Bebidas · Snacks · +${VIP_EXTRA_USD}</p>
            </button>
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!from || !to || from === to}
          className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg disabled:opacity-40"
        >
          Calcular Precio
          <ArrowRight className="ml-2" />
        </Button>

        {from && to && from !== to && !quote && (
          <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            Esta ruta no está disponible. Contáctanos por WhatsApp para cotización personalizada.
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
                  Elige tu vehículo
                </h3>
                {serviceType === "vip" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                    <Crown size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold">VIP SELECCIONADO</span>
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
                          RECOMENDADO
                        </div>
                      )}
                      <h4 className="text-white font-bold text-lg">{v.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{v.minPax}-{v.maxPax} pasajeros</p>
                      <div className="text-amber-400 text-3xl font-bold">
                        ${price}
                        <span className="text-sm text-gray-400 font-normal"> USD</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {serviceType === "vip" ? "Incluye servicio VIP" : "Precio total del viaje"}
                      </p>
                      {isDisabled && (
                        <p className="text-xs text-red-400 mt-2">No apto para {passengers} pasajeros</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-black/40 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Duración estimada:</span>
                  <span className="text-white font-medium">
                    ~{Math.floor(quote.route.durationMinutes / 60)}h {quote.route.durationMinutes % 60}min
                    {serviceType === "vip" && <span className="text-amber-400"> + parada VIP</span>}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Distancia:</span>
                  <span className="text-white font-medium">{quote.route.distanceKm} km</span>
                </div>
              </div>

              {serviceType === "standard" && (
                <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/20">
                  <p className="text-amber-400 font-semibold mb-2 text-sm">✓ Incluido en tu reserva:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-amber-400" />
                      Chofer bilingüe
                    </div>
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-amber-400" />
                      Servicio puerta a puerta
                    </div>
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-amber-400" />
                      Agua gratis
                    </div>
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-amber-400" />
                      WiFi a bordo
                    </div>
                  </div>
                </div>
              )}

              {serviceType === "vip" && (
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-lg border border-amber-500/40">
                  <p className="text-amber-400 font-bold mb-3 text-sm flex items-center gap-1.5">
                    <Crown size={14} />
                    INCLUIDO EN TU EXPERIENCIA VIP:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">1-2h de parada turistica</strong> flexible</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-white">Servicio Concierge</strong> personalizado</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Cervezas locales</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Sodas & aguas premium</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Snacks locales</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>WiFi premium + cargadores</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Chofer bilingue experto</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Check size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>Servicio puerta a puerta</span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleWhatsApp} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg">
                Reservar por WhatsApp
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
