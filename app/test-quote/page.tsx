import QuoteCalculatorV2 from "@/components/QuoteCalculatorV2";
import { getAllLocations } from "@/lib/routes-db";

export const metadata = {
  title: "Test Quote V2 | Private Travel CR",
  description: "Testing new quote calculator",
};

export const revalidate = 3600;

export default async function TestQuotePage() {
  const locations = await getAllLocations();
  return (
    <main className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full mb-3">
            🧪 NEW VERSION - TEST PAGE
          </span>
          <h1 className="text-4xl font-bold">Quote Calculator V2</h1>
          <p className="text-gray-400 mt-2">
            Testing with {locations.length} locations from Supabase
          </p>
        </div>
        <QuoteCalculatorV2 locations={locations} />
      </div>
    </main>
  );
}
