import { NextResponse } from "next/server";
import { getRouteByLocations } from "@/lib/routes-db";
import { getPriceForGroupSize, formatDuration } from "@/lib/quote-helpers";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Rate limit — the hero preview hits this once per visitor, but the
  // route pulls from Supabase, so we don't want it flooded either.
  // Higher window than payment endpoints since a legit visitor may
  // preview several routes while browsing.
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { max: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      },
    );
  }

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
