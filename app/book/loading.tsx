import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// /book is mostly a transient page — it usually 307s to /routes/<slug>
// when the from/to pair maps to a known route. A minimal spinner is
// enough; the visual destination skeleton lives at the routes loading.tsx.
export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={32} className="text-amber-400 animate-spin" />
          <p className="text-sm">Loading your route…</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
