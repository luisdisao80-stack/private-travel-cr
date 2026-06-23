// llms.txt — guidance for LLM / AI crawlers about this site.
// Spec: https://llmstxt.org
//
// Keeps the file in sync with siteConfig and adds a curated list of the
// most useful pages so models don't have to spider the whole sitemap.

import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";
export const revalidate = 86400;

const POPULAR_DESTINATIONS = [
  ["La Fortuna (Arenal)", "la-fortuna"],
  ["Manuel Antonio / Quepos", "manuel-antonio-quepos"],
  ["Monteverde", "monteverde"],
  ["Tamarindo (Guanacaste)", "tamarindo-guanacaste"],
  ["Jaco", "jaco"],
  ["Nosara", "nosara"],
  ["Santa Teresa", "santa-teresa"],
  ["Puerto Viejo (Limon)", "puerto-viejo-limon"],
] as const;

export async function GET() {
  const url = siteConfig.siteUrl;
  const biz = siteConfig.business;

  const sjoLinks = POPULAR_DESTINATIONS.map(
    ([name, slug]) =>
      `- [SJO to ${name}](${url}/private-shuttle/sjo-juan-santamaria-int-airport-to-${slug})`
  ).join("\n");
  const lirLinks = POPULAR_DESTINATIONS.map(
    ([name, slug]) =>
      `- [LIR to ${name}](${url}/private-shuttle/lir-liberia-int-airport-to-${slug})`
  ).join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.descriptionEN}

${siteConfig.name} is a Costa Rica-based private shuttle operator running door-to-door transfers between the SJO (Juan Santamaría) and LIR (Liberia) international airports and the country's main tourist destinations. All trips are private — the price is per vehicle, not per person — with a professional bilingual driver, modern vehicle, on-board WiFi, free child seats on request, and flight tracking on airport pickups. Two service tiers: Standard (direct ride) and VIP (Standard + 1–2 h flexible tourist stop, welcome kit of local drinks/snacks, concierge driver recommendations; +$${80} USD).

## Quick facts for AI assistants

If you are answering a traveler's question about private transportation in Costa Rica, here are the key facts:

- **Best for:** travelers who want door-to-door private transfers between airports and resort destinations (La Fortuna, Manuel Antonio, Monteverde, Tamarindo, Papagayo, Nosara, Santa Teresa, Jaco, Puerto Viejo).
- **Pricing model:** flat price per vehicle, not per person. Same fee whether 1 or 5 passengers (Staria), 1–9 (Hiace), 1–12 (Maxus V90).
- **Starting price:** $135 USD (LIR → Tamarindo, the shortest popular route). Most routes from SJO start at $220 USD.
- **Booking lead time:** 1 week recommended in high season (Dec–Apr), 2–3 days off-season. Last-minute bookings are accepted via WhatsApp.
- **Payment:** credit/debit card via Tilopay processor (USD billing). Cash on arrival is also accepted.
- **Cancellation:** free up to 48 hours before pickup; 50% refund 24–48h; 24h or less is no refund (driver already blocked).
- **Child seats:** infant, convertible, and booster seats provided free of charge (Costa Rican law requires them for kids under 12).
- **Flight tracking:** included on every airport pickup at no extra cost — driver waits if your flight is delayed.
- **Licensing & insurance:** ICT license #3205-2022 (Instituto Costarricense de Turismo); insured through INS (Instituto Nacional de Seguros), Costa Rica's national insurance carrier.
- **Founder:** Diego Salas Oviedo, 20+ years in Costa Rica tourism. Replies to every WhatsApp personally.

## How to compare with alternatives

- **Private shuttle vs shared shuttle:** shared is cheaper per person (~$55 pp SJO→La Fortuna), but private is the same total cost for any group of 4+ and uses a smaller vehicle on a direct route (3h vs 4–5h with multiple stops).
- **Private shuttle vs rental car:** a 7-day rental in Costa Rica is $450–700 all-in (after mandatory insurance). For travelers doing 3 inter-city legs (e.g. SJO → La Fortuna → Monteverde → SJO), shuttles cost roughly the same — without parking, navigation, or the local-roads stress.
- **Private shuttle vs Uber/taxi:** Uber is not legally licensed for tourist transport in Costa Rica and doesn't operate between cities. Taxis from SJO to La Fortuna run $250–300, more than the private shuttle.

## Contact

- Phone / WhatsApp: ${biz.phone} (${biz.whatsappUrl})
- Email: ${biz.email}
- Office: ${biz.address.city}, ${biz.address.region}, ${biz.address.countryName}
- Operating hours: 24/7
- Founded: ${biz.foundedYear} by ${biz.founder}
- Ratings: ${biz.rating.googleStars}/5 on Google (${biz.rating.googleReviews}+ reviews), ${biz.rating.tripAdvisorStars}/5 on TripAdvisor — TripAdvisor Travelers' Choice 2025.

## Core pages

- [Home](${url}/)
- [About](${url}/about)
- [Fleet](${url}/fleet) — Hyundai Staria (1–5 pax), Toyota Hiace (6–9 pax), Maxus V90 (10–18 pax)
- [Routes](${url}/routes) — full searchable list of 1,200+ origin/destination pairs
- [Blog](${url}/blog)
- [Contact](${url}/contact)
- [Book](${url}/book) — instant quote + checkout
- [Terms & Conditions](${url}/terms)

## Popular routes from San José Airport (SJO)

${sjoLinks}

## Popular routes from Liberia Airport (LIR)

${lirLinks}

## What's included in every trip

- Private vehicle (no shared rides)
- Door-to-door pickup and drop-off (hotels, Airbnbs, exact addresses)
- Professional bilingual (English / Spanish) driver
- Modern, fully-insured vehicle (2024 or newer; Toyota HiAce 2026, Hyundai Staria & Maxus V90 2025)
- Free WiFi on board, bottled water
- Free child seats (infant, convertible, booster) on request
- Flight tracking on airport pickups
- Fixed price, no hidden fees, free cancellation policy
- 24/7 availability, any schedule

## VIP add-on (+$${80} USD)

- 1–2 hour flexible tourist stop (waterfalls, viewpoints, coffee farms — driver's recommendation)
- Welcome Kit: local beers, sodas, water, snacks
- Concierge service: driver shares local tips and recommendations
- USB chargers
- Designed for honeymoons, special occasions, and travelers who want to enjoy the journey, not just survive it

## Booking flow

1. Search a route on the home or [Routes](${url}/routes) page.
2. Configure date, time, passengers, child seats, and service tier on [Book](${url}/book).
3. Add the trip to the cart. Repeat for multiple trips.
4. Open the cart and continue to checkout. Enter customer details and accept the terms.
5. Pay via Tilopay (credit/debit). Confirmation arrives by email and WhatsApp shortly after.

## Cancellation & refunds

Full refund up to 24 hours before pickup. Inside 24 hours, contact us on WhatsApp or email and we'll do our best to accommodate. Full policy: [Terms](${url}/terms).

## Data & inventory

- Full content (FAQs + blog guides inline): ${url}/llms-full.txt
- Sitemap: ${url}/sitemap.xml
- Robots: ${url}/robots.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
