"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySelector from "@/components/CurrencySelector";
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

  type NavLink = { label: string; id: string; href: string };

  const navLinks: NavLink[] = [
    { label: t.nav.home, id: "inicio", href: "/#inicio" },
    { label: t.nav.routes, id: "routes", href: "/routes" },
    { label: t.nav.tours, id: "tours", href: "/tours" },
    { label: t.nav.fleet, id: "fleet", href: "/fleet" },
    { label: t.nav.about, id: "about", href: "/about" },
    { label: t.nav.blog, id: "blog", href: "/blog" },
    { label: t.nav.contact, id: "contacto", href: "/contact" },
  ];

  return (
    // `nav-in` es la bajada de entrada en CSS puro; antes era un
    // `motion.nav` y por eso el navbar arrastraba framer-motion al
    // bundle inicial de TODAS las páginas.
    <nav
      className={`nav-in fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-amber-500/20 py-3" : "bg-transparent py-5"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* LCP perf: `prefetch={false}` a proposito. El logo esta SIEMPRE
              en pantalla, asi que Next disparaba el prefetch de "/" apenas
              cargaba la pagina — incluso estando ya EN "/". En el home eso
              eran 24 KB de payload RSC bajando en plena ventana critica,
              compitiendo con el JS que si hace falta, solo para precargar la
              pagina en la que el visitante ya esta.
              No se pierde nada: volver al home desde otra pagina sigue siendo
              una navegacion de cliente normal. */}
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-3 group"
          >
            {/* LCP perf: el logo se pinta a 128x56 pero /logo-ptcr.svg pesa
                183 KB (61 KB comprimido). No es un SVG "de verdad": es un
                trazado automatico de un raster, con miles de <path>, asi que
                SVGO no le baja ni un byte (ya viene con precision 1). Peor
                aun, se descargaba en la ventana critica del FCP compitiendo
                con el CSS que bloquea el render.

                /logo-ptcr.png es el mismo arte a 400x175 (comprobado que se
                ven identicos); servido por next/image sale en AVIF a 12-18 KB
                segun la densidad de pantalla, contra 61 KB del SVG.

                Se queda en eager porque esta sobre el fold, pero sin
                `priority`: no queremos meterlo en la cola de preload por
                delante del CSS, que es lo que bloquea el render.

                El .svg sigue en /public porque los emails, el schema.org y
                el PDF lo referencian por URL absoluta. */}
            <Image
              src="/logo-ptcr.png"
              alt="Private Travel Costa Rica"
              /* Se pinta a 128x56 (lo manda el `h-14 w-auto` de abajo), pero
                 declaramos el doble: next/image arma el srcset a partir de
                 estos numeros, y con 128 la variante 2x se quedaba corta en
                 pantallas de 3x — el logo salia visiblemente suavizado. */
              width={256}
              height={112}
              loading="eager"
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
            <CurrencySelector />
            <LanguageSwitcher />

            <a href="tel:+50686334133" className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium">
              <Phone size={16} />
              +506 8633-4133
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <CartIcon />
            <CurrencySelector />
            <LanguageSwitcher />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={lang === "en" ? "Open menu" : "Abrir menú"}
                  className="text-white hover:bg-amber-500/10 hover:text-amber-400"
                >
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
