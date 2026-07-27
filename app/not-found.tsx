import Link from "next/link";
import { Home, Car, MapPin, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

// Branded 404. Next.js otherwise renders a bare white default page, which
// is a dead end for anyone landing on a stale link (old blog URLs, mistyped
// paths, delisted routes). This keeps them on-brand and one click from the
// pages that convert — quote, routes, and WhatsApp. Rendered as a server
// component so it stays cheap and fully crawlable.

// 404s must NOT be indexed. Next serves this with a 404 status already, but
// the explicit noindex is belt-and-suspenders for crawlers.
export const metadata = {
  title: "Page not found — Private Travel CR",
  robots: { index: false, follow: true },
};

const RESCUE_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/private-transportation-costa-rica", label: "Private Transportation", icon: Car },
  { href: "/routes", label: "Browse Routes", icon: MapPin },
  { href: "/book", label: "Get a Quote", icon: Car },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center px-4 pt-32 pb-24">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-4">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            This page took a wrong turn
          </h1>
          <p className="text-white/70 mb-10 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Let&apos;s get you back on the road — here are the most useful
            places to go next.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {RESCUE_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-amber-500/20 bg-zinc-950/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors font-semibold text-sm"
              >
                <Icon className="w-4 h-4 text-amber-400" />
                {label}
              </Link>
            ))}
          </div>

          <a
            href={siteConfig.business.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Diego directly
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
