"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!tooltipDismissed) {
      const timer = setTimeout(() => setTooltipVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [tooltipDismissed]);

  const openWhatsApp = () => {
    const msg = encodeURIComponent("¡Hola! Me interesa su servicio de transporte privado en Costa Rica.");
    window.open(`https://wa.me/50686334133?text=${msg}`, "_blank");
    setTooltipVisible(false);
    setTooltipDismissed(true);
  };

  const dismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTooltipVisible(false);
    setTooltipDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
          <AnimatePresence>
            {tooltipVisible && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl rounded-br-none shadow-2xl p-4 max-w-xs relative mb-2"
                style={{ transformOrigin: "bottom right" }}
              >
                <button
                  onClick={dismissTooltip}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>

                <div className="flex items-start gap-2 pr-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-xs font-bold">PT</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">¡Hola! 👋</p>
                    <p className="text-xs text-gray-600 mt-1">¿Necesitas ayuda con tu transporte? Estamos aquí para ti.</p>
                    <button onClick={openWhatsApp} className="text-xs text-green-600 font-semibold mt-2 hover:text-green-700 transition-colors">
                      Chatear ahora →
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 translate-x-[1px] translate-y-[1px]">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={openWhatsApp}
            className="relative w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-600/50 flex items-center justify-center transition-colors group"
            aria-label="Chatear por WhatsApp"
          >
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" style={{ animationDelay: "1s" }} />

            <svg viewBox="0 0 32 32" className="w-8 h-8 text-white relative z-10" fill="currentColor">
              <path d="M16.003 0C7.17 0 .008 7.162.008 15.995c0 2.822.738 5.576 2.14 7.997L0 32l8.23-2.158a15.97 15.97 0 0 0 7.773 1.98h.007c8.833 0 15.995-7.162 15.995-15.995S24.843 0 16.003 0zm0 29.338h-.006a13.27 13.27 0 0 1-6.77-1.855l-.485-.288-5.03 1.32 1.344-4.903-.315-.503A13.266 13.266 0 0 1 2.68 15.995C2.68 8.637 8.642 2.675 16.01 2.675c3.556 0 6.898 1.384 9.41 3.898a13.22 13.22 0 0 1 3.89 9.422c-.003 7.358-5.965 13.343-13.307 13.343z" />
              <path d="M23.32 19.29c-.4-.2-2.37-1.17-2.74-1.3-.37-.14-.64-.2-.9.2-.27.4-1.04 1.3-1.27 1.57-.23.27-.47.3-.87.1-.4-.2-1.69-.62-3.22-1.99-1.19-1.06-1.99-2.37-2.22-2.77-.23-.4-.02-.61.18-.81.18-.18.4-.47.6-.7.2-.23.27-.4.4-.67.13-.27.07-.5-.03-.7-.1-.2-.9-2.17-1.23-2.97-.32-.78-.65-.67-.9-.68-.23-.01-.5-.01-.77-.01-.27 0-.7.1-1.07.5-.37.4-1.4 1.37-1.4 3.34s1.44 3.87 1.64 4.14c.2.27 2.83 4.33 6.87 6.07.96.41 1.71.66 2.29.85.96.31 1.84.26 2.53.16.77-.11 2.37-.97 2.7-1.9.33-.94.33-1.74.23-1.91-.1-.17-.37-.27-.77-.47z" />
            </svg>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
