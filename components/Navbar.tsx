"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openWhatsApp = () => {
    const msg = encodeURIComponent("¡Hola! Me interesa su servicio de transporte privado.");
    window.open(`https://wa.me/50686334133?text=${msg}`, "_blank");
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: "Inicio", id: "inicio" },
    { label: "Cotizador", id: "cotizador" },
    { label: "Flota", id: "flota" },
    { label: "Rutas", id: "rutas" },
    { label: "Contacto", id: "contacto" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-amber-500/20 py-3" : "bg-transparent py-5"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 group">
            <img
              src="https://privatecr2.imgix.net/logos/logo-ptcr.svg"
              alt="Private Travel Costa Rica"
              className="h-14 w-auto group-hover:scale-105 transition-transform"
            />
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} className="px-4 py-2 text-gray-300 hover:text-amber-400 transition-colors font-medium text-sm">
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+50686334133" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium">
              <Phone size={16} />
              +506 8633-4133
            </a>
            <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
              <MessageCircle size={16} className="mr-2" />
              WhatsApp
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <Button onClick={openWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle size={16} />
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500/10 hover:text-amber-400">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-amber-500/20 text-white w-[300px] sm:w-[400px]">
                <SheetTitle className="text-amber-400 text-xl mb-8 mt-4">Menú</SheetTitle>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-left px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all font-medium">
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-amber-500/20 space-y-4">
                  <a href="tel:+50686334133" className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-colors">
                    <Phone size={18} />
                    +506 8633-4133
                  </a>

                  <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12">
                    <MessageCircle size={18} className="mr-2" />
                    Chatear por WhatsApp
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
