import Link from "next/link";
import { MessageCircle, Mail, Globe } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

// Server component. Renders at the bottom of every blog post to give
// Google + readers a clear "who wrote this" signal. E-E-A-T (experience,
// expertise, authoritativeness, trust) is the explicit ranking factor
// here — anonymous content gets pushed below content with a real
// person attached to it. Visual mirrors BlogHighlights / RelatedArticles
// (amber-500/20 border, gradient gray-900/95 to black/95, rounded-2xl).

export default function AuthorBox() {
  return (
    <aside
      className="mt-12 p-6 md:p-8 bg-white border border-slate-200 rounded-2xl"
      aria-label="About the author"
    >
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
        {/* Avatar — amber circle with DS initials. We avoid pulling a
            stock headshot since we don't have one of Diego on-disk; the
            initials read as intentional rather than missing. */}
        <div
          className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg shadow-orange-600/15"
          aria-hidden="true"
        >
          DS
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-orange-600 mb-1">
            About the author
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-blue-900 leading-tight">
            Diego Salas Oviedo
          </h2>
          <p className="text-sm text-orange-600/90 mb-3">
            Owner, Private Travel Costa Rica
          </p>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-5">
            I live in La Fortuna and run Private Travel Costa Rica — a
            private shuttle service I founded in 2022. I&apos;ve been
            in Costa Rica&apos;s tourism industry for 20+ years and
            write these guides from the perspective of someone who
            drives these routes every week and knows the country
            firsthand.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={siteConfig.business.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <a
              href={`mailto:${siteConfig.business.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-600 text-xs font-semibold transition-colors"
            >
              <Mail size={14} />
              Email
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-600 text-xs font-semibold transition-colors"
            >
              <Globe size={14} />
              privatetravelcr.com
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
