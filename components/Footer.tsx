"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Star } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Inicio", href: "#inicio" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Servicios", href: "#servicios" },
    { label: "Cotizador", href: "#cotizador" },
    { label: "Flota", href: "#flota" },
    { label: "Reseñas", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-950 to-black border-t border-amber-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* COLUMNA 1: BRANDING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://privatecr2.imgix.net/logos/logo-ptcr.svg"
              alt="Private Travel CR"
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Transporte privado premium en Costa Rica. Cotización instantánea, chofer bilingüe y servicio puerta a puerta.
            </p>

            {/* Badge de rating */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs">
                <div className="text-white font-bold">5.0 ★</div>
                <div className="text-gray-400">190+ reseñas</div>
              </div>
            </div>
          </motion.div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-1.5 group"
                  >
                    <span className="text-amber-500/0 group-hover:text-amber-500 transition-colors">
                      →
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* COLUMNA 3: CONTACTO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/50686334133"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div
                    style={{ width: "32px", height: "32px" }}
                    className="rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors"
                  >
                    <MessageCircle size={14} className="text-amber-400" />
                  </div>
                  <div className="pt-1">
                    <div className="text-xs text-gray-500">WhatsApp</div>
                    <div className="text-sm">+506 8633-4133</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+50686334133"
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div
                    style={{ width: "32px", height: "32px" }}
                    className="rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors"
                  >
                    <Phone size={14} className="text-amber-400" />
                  </div>
                  <div className="pt-1">
                    <div className="text-xs text-gray-500">Teléfono</div>
                    <div className="text-sm">+506 8633-4133</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@privatetravelcr.com"
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div
                    style={{ width: "32px", height: "32px" }}
                    className="rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors"
                  >
                    <Mail size={14} className="text-amber-400" />
                  </div>
                  <div className="pt-1">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm">info@privatetravelcr.com</div>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <div
                  style={{ width: "32px", height: "32px" }}
                  className="rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0"
                >
                  <MapPin size={14} className="text-amber-400" />
                </div>
                <div className="pt-1">
                  <div className="text-xs text-gray-500">Ubicación</div>
                  <div className="text-sm">La Fortuna, San Carlos</div>
                  <div className="text-sm">Costa Rica 🇨🇷</div>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* COLUMNA 4: SÍGUENOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">
              Síguenos
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Mira nuestras aventuras y reseñas reales de clientes.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Instagram */}
              <a
                href="https://instagram.com/private_travel_costa_rica"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-900/50 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all group"
              >
                <svg
                  className="w-[18px] h-[18px] text-gray-400 group-hover:text-amber-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="text-xs text-gray-300">Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1Cg29AqugH/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-900/50 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all group"
              >
                <svg
                  className="w-[18px] h-[18px] text-gray-400 group-hover:text-amber-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs text-gray-300">Facebook</span>
              </a>

              {/* Google */}
              <a
                href="https://www.google.com/maps/place/?q=place_id:ChIJl0aOiIQNoI8R6KcwnmmDEw8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-900/50 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all group"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.860-1.977,13.409-5.192l-6.190-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.003-0.002,0.002-0.001,0.003-0.002l6.190,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                <span className="text-xs text-gray-300">Google</span>
              </a>

              {/* TripAdvisor */}
              <a
                href="https://www.tripadvisor.es/Attraction_Review-g309226-d25394648-Reviews-Private_Travel_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-900/50 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#34E0A1">
                  <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 004.04 10.43 5.976 5.976 0 004.075-1.6L12 19.753l1.922-2.14a5.972 5.972 0 004.072 1.596 6 6 0 004.041-10.432L24 6.648h-4.36a13.528 13.528 0 00-7.634-2.353zM6.003 17.502a4.503 4.503 0 11.001-9.005 4.503 4.503 0 01-.001 9.005zm5.998-4.577c0-2.98-2.164-5.536-5.02-6.623a12.03 12.03 0 0110.041 0c-2.857 1.087-5.02 3.643-5.02 6.623zm6.002 4.577a4.503 4.503 0 11-.002-9.005 4.503 4.503 0 01.002 9.005zm0-6.86a2.357 2.357 0 00-2.358 2.358 2.357 2.357 0 002.358 2.357 2.357 2.357 0 002.356-2.358 2.357 2.357 0 00-2.356-2.356zm-12.003 0a2.357 2.357 0 00-2.358 2.358 2.357 2.357 0 002.358 2.357 2.357 2.357 0 002.357-2.358 2.357 2.357 0 00-2.357-2.356Z" />
                </svg>
                <span className="text-xs text-gray-300">TripAdvisor</span>
              </a>
            </div>

            {/* Badge TripAdvisor */}
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div className="text-xs">
                  <div className="text-white font-bold">Travellers&apos; Choice</div>
                  <div className="text-gray-400">TripAdvisor 2025</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Private Travel CR · Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm text-center md:text-right">
              Hecho con ❤️ en Costa Rica 🇨🇷
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
