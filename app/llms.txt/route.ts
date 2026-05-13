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
- [Fleet](${url}/fleet) — Hyundai Staria (1–6 pax), Toyota Hiace (7–9 pax), Maxus V90 (10–18 pax)
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
- Modern, fully-insured vehicle (2023 or newer)
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
