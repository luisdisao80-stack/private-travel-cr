"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsDocument from "@/components/legal/TermsDocument";
import PrivacyDocument from "@/components/legal/PrivacyDocument";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * Documento legal unico: Terminos y Condiciones + Politica de Privacidad.
 *
 * El Banco Nacional pidio el 25-nov-2026, como requisito para aprobar el
 * procesamiento de pagos, que ambos textos estuvieran en UN SOLO DOCUMENTO
 * al llegar al checkout. El checkbox de BookingForm apunta aqui.
 *
 * No se duplica contenido: esta pagina reutiliza los mismos componentes que
 * sirven /terms y /privacy, en modo `embedded` para que no repitan Navbar,
 * Footer ni cabeceras. Editar el texto en un solo lugar actualiza las tres
 * paginas.
 */
export default function LegalPage() {
  const { lang } = useLanguage();
  const es = lang === "es";

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-28 pb-6 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            {es ? "Volver al Inicio" : "Back to Home"}
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-orange-600" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              {es
                ? "Términos y Condiciones y Política de Privacidad"
                : "Terms & Conditions and Privacy Policy"}
            </h1>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {es
              ? "Este documento reúne nuestros Términos y Condiciones y nuestra Política de Privacidad. Al confirmar una reserva en nuestro sitio, usted acepta ambos."
              : "This document contains both our Terms & Conditions and our Privacy Policy. By confirming a booking on our site, you accept both."}
          </p>

          <nav className="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              href="#terminos"
              className="px-3 py-1.5 rounded-full border border-slate-200 bg-orange-50 text-orange-700 hover:border-orange-300 transition-colors"
            >
              {es
                ? "1 · Términos y Condiciones"
                : "1 · Terms & Conditions"}
            </a>
            <a
              href="#privacidad"
              className="px-3 py-1.5 rounded-full border border-slate-200 bg-orange-50 text-orange-700 hover:border-orange-300 transition-colors"
            >
              {es ? "2 · Política de Privacidad" : "2 · Privacy Policy"}
            </a>
          </nav>
        </div>
      </section>

      <div id="terminos" className="scroll-mt-24">
        <TermsDocument embedded />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <hr className="border-slate-200" />
      </div>

      <div id="privacidad" className="scroll-mt-24">
        <PrivacyDocument embedded />
      </div>

      <Footer />
    </main>
  );
}
