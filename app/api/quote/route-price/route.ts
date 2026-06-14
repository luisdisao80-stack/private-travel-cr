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

  // Respect ?adults=N so the hero preview can match the tier the visitor
  // already picked on a route detail page (clicking the "6-9 PAX · Hiace
  // $375" card should land them on a $375 preview, not the default $330
  // Staria one). Falls back to 2 for the generic home/hero preview so
  // visitors with no intent yet still get a "from" price. Clamp to a
  // sensible range to defend against malformed URLs.
  const adultsParam = searchParams.get("adults");
  const adultsRaw = adultsParam ? parseInt(adultsParam, 10) : 2;
  const adults =
    Number.isNaN(adultsRaw) || adultsRaw < 1 || adultsRaw > 18 ? 2 : adultsRaw;
  const basePrice = getPriceForGroupSize(route, adults);

  return NextResponse.json({
    found: true,
    basePrice,
    duration: formatDuration(route.duracion),
    origen: route.origen,
    destino: route.destino,
    adults,
  });
}
