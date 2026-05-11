import { NextResponse } from "next/server";
import { getRouteByLocations } from "@/lib/routes-db";
import { getPriceForGroupSize, formatDuration } from "@/lib/quote-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const route = await getRouteByLocations(from, to);
  if (!route) {
    return NextResponse.json({ found: false });
  }

  // Default to a 2-pax quote so the home/book hero can show a "from" price.
  const basePrice = getPriceForGroupSize(route, 2);

  return NextResponse.json({
    found: true,
    basePrice,
    duration: formatDuration(route.duracion),
    origen: route.origen,
    destino: route.destino,
  });
}
