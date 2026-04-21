"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Calendar, ArrowRight, Check } from "lucide-react";
import { locations, calculateAllPrices, getLocationById, vehicles } from "@/data/routes";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteCalculator() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [date, setDate] = useState<string>("");
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

  const handleWhatsApp = () => {
    const fromName = getLocationById(from)?.name || "";
    const toName = getLocationById(to)?.name || "";
    const vehicleName = recommendedVehicle === "staria" ? "Hyundai Staria" : "Toyota Hiace";
    const price = recommendedVehicle === "staria" ? quote?.staria : quote?.hiace;

    const message = encodeURIComponent(
      `¡Hola! Quiero reservar un shuttle privado:\n\n` +
      `📍 Desde: ${fromName}\n` +
      `📍 Hasta: ${toName}\n` +
      `👥 Pasajeros: ${passengers}\n` +
      `📅 Fecha: ${date}\n` +
      `🚐 Vehículo: ${vehicleName}\n` +
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
              <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                <span className="text-amber-400">✦</span>
                Elige tu vehículo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicles.map((v) => {
                  const price = v.id === "staria" ? quote.staria : quote.hiace;
                  const isRecommended = v.id === recommendedVehicle;
                  const isDisabled = passengers < v.minPax || passengers > v.maxPax;

                  return (
                    <div
                      key={v.id}
                      className={`relative p-5 rounded-xl border-2 transition-all ${isRecommended && !isDisabled ? "border-amber-500 bg-amber-500/10" : "border-gray-700 bg-black/40"} ${isDisabled ? "opacity-40" : ""}`}
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
                      <p className="text-xs text-gray-500 mt-1">Precio total del viaje</p>
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
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Distancia:</span>
                  <span className="text-white font-medium">{quote.route.distanceKm} km</span>
                </div>
              </div>

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
