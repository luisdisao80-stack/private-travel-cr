"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartIcon from "@/components/CartIcon";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openWhatsApp = () => {
    const greetingMsg =
      lang === "en"
        ? "Hello! I'm interested in your private transportation service."
        : "¡Hola! Me interesa su servicio de transporte privado.";
    const msg = encodeURIComponent(greetingMsg);
    window.open(`https://wa.me/50686334133?text=${msg}`, "_blank");
  };

  type NavLink = { label: string; id: string; href: string };

  const navLinks: NavLink[] = [
    { label: t.nav.home, id: "inicio", href: "/#inicio" },
    { label: t.nav.routes, id: "routes", href: "/routes" },
    { label: t.nav.about, id: "about", href: "/about" },
    { label: t.nav.blog, id: "blog", href: "/blog" },
    { label: t.nav.contact, id: "contacto", href: "/contact" },
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
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <img
              src="https://privatecr2.imgix.net/logos/logo-ptcr.svg"
              alt="Private Travel Costa Rica"
              className="h-14 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="px-4 py-2 text-gray-300 hover:text-amber-400 transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <CartIcon />
            <LanguageSwitcher />

            <a href="tel:+50686334133" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium">
              <Phone size={16} />
              +506 8633-4133
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <CartIcon />
            <LanguageSwitcher />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500/10 hover:text-amber-400">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-amber-500/20 text-white w-[300px] sm:w-[400px]">
                <SheetTitle className="text-amber-400 text-xl mb-8 mt-4">
                  {lang === "en" ? "Menu" : "Menú"}
                </SheetTitle>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-left px-4 py-3 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-amber-500/20 space-y-4">
                  <a href="tel:+50686334133" className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-colors">
                    <Phone size={18} />
                    +506 8633-4133
                  </a>

                  <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12">
                    <MessageCircle size={18} className="mr-2" />
                    {lang === "en" ? "Chat on WhatsApp" : "Chatear por WhatsApp"}
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
