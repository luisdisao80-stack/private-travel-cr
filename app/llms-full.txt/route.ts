// llms-full.txt — extended version of llms.txt that ships the actual content
// (FAQs, blog posts, pricing) inline, not just links. Some AI crawlers and
// answer engines prefer this form because they can ground citations directly
// without making a second hop. Spec context: https://llmstxt.org
//
// Content sources:
//   - siteConfig (business info, ratings)
//   - lib/faqs.ts (FAQS_EN)
//   - content/blog/*.md (read at build/revalidate time)
//   - Supabase `routes` table (slugs, prices, durations — fetched live so
//     this file never drifts from what's actually bookable on the site;
//     route slugs aren't 100% consistent, e.g. "sjo-to-x" vs
//     "sjo-juan-santamaria-int-airport-to-x", so we always use the real
//     `route.slug` from the DB instead of a hardcoded guess)

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { siteConfig } from "@/lib/site-config";
import { FAQS_EN } from "@/lib/faqs";
import { VIP_EXTRA_USD, formatDuration } from "@/lib/quote-helpers";
import { getRouteByLocations } from "@/lib/routes-db";
import { isPopularRoute } from "@/lib/popular-routes";
import type { Route } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

const SJO = "SJO - Juan Santamaria Int. Airport";
const LIR = "LIR - Liberia Int. Airport";

// Curated destinations to feature below. `dbName` must match routes.destino
// in Supabase exactly (see lib/popular-routes.ts / lib/destinations.ts).
const FROM_SJO: ReadonlyArray<[string, string]> = [
  ["La Fortuna (Arenal)", "La Fortuna (Arenal)"],
  ["Manuel Antonio / Quepos", "Manuel Antonio / Quepos"],
  ["Monteverde", "Monteverde (Cloud Forest)"],
  ["Tamarindo (Guanacaste)", "Tamarindo (Guanacaste)"],
  ["Jaco", "Jaco"],
  ["Santa Teresa (Nicoya)", "Santa Teresa (Nicoya Peninsula)"],
  ["Puerto Viejo (Caribbean)", "Puerto Viejo (Caribbean Coast)"],
  ["Papagayo (Guanacaste)", "Papagayo Peninsula, Guanacaste"],
];

const FROM_LIR: ReadonlyArray<[string, string]> = [
  ["La Fortuna (Arenal)", "La Fortuna (Arenal)"],
  ["Manuel Antonio / Quepos", "Manuel Antonio / Quepos"],
  ["Monteverde", "Monteverde (Cloud Forest)"],
  ["Tamarindo (Guanacaste)", "Tamarindo (Guanacaste)"],
  ["Santa Teresa (Nicoya)", "Santa Teresa (Nicoya Peninsula)"],
  ["Papagayo (Guanacaste)", "Papagayo Peninsula, Guanacaste"],
  ["Conchal (Guanacaste)", "Conchal (Guanacaste)"],
];

type Featured = { label: string; route: Route };

function linkPathFor(route: Route): string {
  return isPopularRoute(route.origen, route.destino) ? "private-shuttle" : "routes";
}

async function fetchFeatured(airport: string, list: ReadonlyArray<[string, string]>): Promise<Featured[]> {
  const results = await Promise.all(list.map(([, dbName]) => getRouteByLocations(airport, dbName)));
  return list
    .map(([label], i) => ({ label, route: results[i] }))
    .filter((r): r is Featured => !!r.route && !!r.route.slug);
}

function formatRouteLine(url: string, { label, route }: Featured): string {
  const price = route.precio1a6 ? `$${route.precio1a6} USD` : "contact for pricing";
  const dur = formatDuration(route.duracion);
  return `- **${label}** — from ${price} · ~${dur} drive · [${url}/${linkPathFor(route)}/${route.slug}](${url}/${linkPathFor(route)}/${route.slug})`;
}

function readBlogPosts(): Array<{ slug: string; title: string; date: string; description: string; body: string }> {
  const dir = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title || slug),
        date: String(data.date || ""),
        description: String(data.description || ""),
        body: content.trim(),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function GET() {
  const url = siteConfig.siteUrl;
  const biz = siteConfig.business;
  const posts = readBlogPosts();

  const [sjoFeatured, lirFeatured] = await Promise.all([
    fetchFeatured(SJO, FROM_SJO),
    fetchFeatured(LIR, FROM_LIR),
  ]);

  const sjoRoutes = sjoFeatured.map((f) => formatRouteLine(url, f)).join("\n");
  const lirRoutes = lirFeatured.map((f) => formatRouteLine(url, f)).join("\n");

  const faqs = FAQS_EN.map(
    (q) => `### ${q.question}\n\n${q.answer}`
  ).join("\n\n");

  const blogs = posts
    .map(
      (p) =>
        `---\n\n## ${p.title}\n\n_Published ${p.date} · ${url}/blog/${p.slug}_\n\n${p.description ? `> ${p.description}\n\n` : ""}${p.body}`
    )
    .join("\n\n");

  const body = `# ${siteConfig.name} — Full Content for LLMs

> ${siteConfig.descriptionEN}

This document inlines the full text of the site's most-referenced content so
that AI assistants citing ${siteConfig.name} have the source material directly
available. Last updated automatically; lighter index lives at ${url}/llms.txt.

## About the company

${siteConfig.name} (also known as "PTCR") is a Costa Rica-based private shuttle
operator founded in ${biz.foundedYear} by ${biz.founder}. The company runs
door-to-door transfers between the country's two international airports —
SJO (Juan Santamaría International, San José) and LIR (Daniel Oduber
International, Liberia) — and Costa Rica's main tourist destinations,
including La Fortuna / Arenal, Manuel Antonio, Monteverde, Tamarindo, Jaco,
Santa Teresa, Nosara, Puerto Viejo and the Papagayo Peninsula.

Every trip is **private** — the price is per vehicle, not per person — and
includes a professional bilingual driver, modern vehicle (2024 or newer — Toyota HiAce 2026, Hyundai Staria & Maxus V90 2025),
on-board WiFi, bottled water, free child seats on request, flight tracking
on airport pickups, tolls and taxes, with no hidden fees.

The company maintains a 5.0★ rating on Google with ${biz.rating.googleReviews}+
reviews and is a TripAdvisor Travelers' Choice 2025 award winner.

## Contact

- **Phone / WhatsApp:** ${biz.phone} — ${biz.whatsappUrl}
- **Email:** ${biz.email}
- **Office:** ${biz.address.city}, ${biz.address.region}, ${biz.address.countryName}
- **Coordinates:** ${biz.coordinates.latitude}, ${biz.coordinates.longitude}
- **Hours:** 24/7, every day of the year
- **Languages:** English, Spanish (every driver is bilingual)

## Services

### Standard service (included in base price)

- Private vehicle, no shared rides
- Door-to-door pickup and drop-off (hotel, Airbnb, exact address)
- Professional bilingual (EN/ES) driver
- Modern, fully-insured vehicle (2024 or newer; Toyota HiAce 2026, Hyundai Staria & Maxus V90 2025)
- Free WiFi on board, bottled water
- Free child seats (infant, convertible, booster) on request
- Flight tracking on airport pickups — driver adjusts automatically if your flight is late
- All tolls and taxes included
- Short stops (restroom, photos, coffee) at no extra cost
- 24/7 availability, any schedule

### VIP service (+$${VIP_EXTRA_USD} USD on top of base)

Designed for honeymoons, special occasions, and travelers who want the journey
to be part of the trip — not just transit.

- Everything in Standard, plus:
- 1–2 hour flexible tourist stop (waterfalls, viewpoints, coffee farms — driver's recommendation)
- Welcome Kit: local craft beers, sodas, water, snacks
- USB chargers at every seat
- Concierge service: driver shares local tips, restaurant picks, and itinerary advice

## Fleet

- **Hyundai Staria** — 1 to 5 passengers · luxury SUV-van · large luggage space
- **Toyota Hiace** — 6 to 9 passengers · roomy van · ideal for families or small groups
- **Maxus V90** — 10 to 18 passengers · large group transport · weddings, retreats, corporate

The price is the **same** whether you're 1 passenger or fill the vehicle's
capacity — it's per vehicle, not per seat.

## Popular routes from San José Airport (SJO)

${sjoRoutes}

## Popular routes from Liberia Airport (LIR)

${lirRoutes}

Full inventory of 1,200+ origin/destination pairs available at ${url}/routes.

## Booking flow

1. Search a route on the home page or at ${url}/routes.
2. Configure date, time, passengers, child seats, and service tier at ${url}/book.
3. Add the trip to the cart. Repeat for multiple legs of the trip.
4. Open the cart and continue to checkout. Enter customer details and accept the terms.
5. Pay via Tilopay (credit/debit card). Confirmation arrives by email and WhatsApp shortly after.

## Cancellation & refund policy

Full refund for cancellations made at least 48 hours before pickup. Cancellations
within 48 hours: contact us on WhatsApp or email and we will do our best to
accommodate. Flight delays and cancellations are handled at no extra cost — we
monitor your flight and adjust pickup time automatically, or reschedule the
service for the new date if the flight is cancelled.

Full terms at ${url}/terms.

## Frequently asked questions

${faqs}

# Long-form guides

The blog publishes long-form, locally-written guides for travelers planning
trips to Costa Rica. Below is the full text of every guide, ordered most-recent
first. Each is also available at ${url}/blog/[slug].

${blogs}

---

## Source data

- Sitemap: ${url}/sitemap.xml
- Robots policy: ${url}/robots.txt
- Lighter index: ${url}/llms.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
