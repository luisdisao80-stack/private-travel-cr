// Destination hub pages (/shuttle-to/[slug]).
//
// Each entry is a curated landing page that aggregates EVERY indexable route
// into one place — "all the ways to reach La Fortuna" — instead of the
// pair-by-pair /private-shuttle/[slug] pages. This gives Google a single
// strong internal-linking hub per destination (targets "shuttle to X" /
// "transportation to X" / "private transfer to X" queries) and gives
// travelers a logical overview page.
//
// `dbName` MUST match the routes.destino / routes.origen value in Supabase
// exactly — it's how we pull the routes for the page.

export type Destination = {
  /** URL slug: /shuttle-to/<slug> */
  slug: string;
  /** Exact Supabase origen/destino value — used to query routes. */
  dbName: string;
  /** Friendly display name used in headings and copy. */
  name: string;
  /** One-line hero subtitle. */
  tagline: string;
  /** 1-2 sentence intro paragraph (accurate, no invented numbers). */
  intro: string;
  /** 3-4 short "good to know" bullets shown under the intro. */
  highlights: string[];
  /** Whether this destination is an airport (changes some copy). */
  isAirport?: boolean;
};

export const DESTINATIONS: readonly Destination[] = [
  {
    slug: "la-fortuna",
    dbName: "La Fortuna (Arenal)",
    name: "La Fortuna",
    tagline: "Gateway to the Arenal Volcano, hot springs and waterfalls.",
    intro:
      "La Fortuna is the base town for Arenal Volcano National Park, the hot springs, and the La Fortuna Waterfall. There's no airport in town, so nearly every traveler arrives by private shuttle from San José (SJO) or Liberia (LIR), or from another destination on their itinerary.",
    highlights: [
      "~3 hours from both SJO and LIR airports",
      "Door-to-door drop-off at any Arenal-area hotel",
      "Popular pairing with Monteverde, Tamarindo and Manuel Antonio",
    ],
  },
  {
    slug: "manuel-antonio",
    dbName: "Manuel Antonio / Quepos",
    name: "Manuel Antonio",
    tagline: "Rainforest-meets-ocean national park on the central Pacific.",
    intro:
      "Manuel Antonio is Costa Rica's most-visited national park — jungle beaches full of monkeys and sloths, an easy 3-hour drive from San José. Most guests reach it by private shuttle from SJO or as an inland leg from La Fortuna.",
    highlights: [
      "~3 hours from San José Airport (SJO)",
      "Pickup at any hotel in Manuel Antonio or Quepos",
      "Common combo with La Fortuna and Monteverde",
    ],
  },
  {
    slug: "monteverde",
    dbName: "Monteverde (Cloud Forest)",
    name: "Monteverde",
    tagline: "Misty cloud forest, hanging bridges and zip-lines.",
    intro:
      "Monteverde sits high in the mountains, reached by winding scenic roads that reward a comfortable private vehicle. Travelers usually arrive from La Fortuna (around Lake Arenal), from the Guanacaste beaches, or straight from an airport.",
    highlights: [
      "Scenic mountain drive — private vehicle strongly recommended",
      "Door-to-door service to Santa Elena and Monteverde lodges",
      "Frequent pairing with La Fortuna and Tamarindo",
    ],
  },
  {
    slug: "tamarindo",
    dbName: "Tamarindo (Guanacaste)",
    name: "Tamarindo",
    tagline: "Guanacaste's classic surf-and-sunset beach town.",
    intro:
      "Tamarindo is the best-known beach town in Guanacaste — long surfable beaches, restaurants and nightlife. It's about 1.5 hours from Liberia Airport (LIR), and a longer inland connector from La Fortuna or San José.",
    highlights: [
      "~1.5 hours from Liberia Airport (LIR)",
      "Pickup at any Tamarindo hotel, villa or Airbnb",
      "Popular combo with La Fortuna and Monteverde",
    ],
  },
  {
    slug: "jaco",
    dbName: "Jaco",
    name: "Jacó",
    tagline: "The closest surf-and-party beach to San José.",
    intro:
      "Jacó is the nearest Pacific beach town to San José — roughly 1.5 hours by road — which makes it a favorite first or last stop on a Costa Rica trip. Private shuttles run door-to-door from SJO and from destinations up and down the coast.",
    highlights: [
      "~1.5 hours from San José Airport (SJO)",
      "Door-to-door to Jacó, Herradura and Los Sueños",
      "Easy add-on between the airport and Manuel Antonio",
    ],
  },
  {
    slug: "conchal",
    dbName: "Conchal (Guanacaste)",
    name: "Playa Conchal",
    tagline: "Crushed-shell beach and the Westin/Reserva Conchal resorts.",
    intro:
      "Playa Conchal, in northern Guanacaste, is known for its shell-sand beach and the Westin and Reserva Conchal resorts. It's a short private transfer from Liberia Airport (LIR) and a longer connector from La Fortuna or Monteverde.",
    highlights: [
      "Close to Liberia Airport (LIR)",
      "Drop-off at the Westin, Reserva Conchal and Brasilito",
      "Pairs well with La Fortuna and Monteverde",
    ],
  },
  {
    slug: "papagayo",
    dbName: "Papagayo Peninsula, Guanacaste",
    name: "Papagayo Peninsula",
    tagline: "Guanacaste's luxury-resort peninsula.",
    intro:
      "The Papagayo Peninsula is home to Costa Rica's flagship luxury resorts (Four Seasons, Andaz, Planet Hollywood and more). It's one of the closest destinations to Liberia Airport (LIR), making private transfers quick and easy.",
    highlights: [
      "Very close to Liberia Airport (LIR)",
      "Door-to-door to every Papagayo resort",
      "Ideal starting point for a Guanacaste + Arenal trip",
    ],
  },
  {
    slug: "puerto-viejo",
    dbName: "Puerto Viejo (Caribbean Coast)",
    name: "Puerto Viejo",
    tagline: "Afro-Caribbean beach town on the southern Caribbean coast.",
    intro:
      "Puerto Viejo de Talamanca is the laid-back heart of Costa Rica's Caribbean coast — reggae, rainforest and reef. It's a scenic drive from San José, usually done as a private door-to-door transfer.",
    highlights: [
      "Private transfer from San José (SJO)",
      "Drop-off in Puerto Viejo, Cocles and Manzanillo",
      "The gateway to the Caribbean side of Costa Rica",
    ],
  },
  {
    slug: "santa-teresa",
    dbName: "Santa Teresa (Nicoya Peninsula)",
    name: "Santa Teresa",
    tagline: "Bohemian surf town on the tip of the Nicoya Peninsula.",
    intro:
      "Santa Teresa, on the southern Nicoya Peninsula, is a surf-and-wellness hotspot. The trip usually combines road and (for some routes) a ferry across the Gulf of Nicoya — a private transfer handles the logistics end to end.",
    highlights: [
      "Reached from San José, Liberia or La Fortuna",
      "Door-to-door to Santa Teresa, Mal País and Montezuma",
      "We coordinate the ferry connection when needed",
    ],
  },
  {
    slug: "sjo-airport",
    dbName: "SJO - Juan Santamaria Int. Airport",
    name: "San José Airport (SJO)",
    tagline: "Departure transfers to Juan Santamaría International Airport.",
    intro:
      "Juan Santamaría International Airport (SJO) is Costa Rica's main gateway. For your flight home, book a private shuttle from anywhere in the country and we'll get you to the terminal on time, with flight-time buffers built in.",
    highlights: [
      "Departure pickups from any hotel or town",
      "We time the drive to your flight, with buffer",
      "The most-connected destination in our network",
    ],
    isAirport: true,
  },
  {
    slug: "lir-airport",
    dbName: "LIR - Liberia Int. Airport",
    name: "Liberia Airport (LIR)",
    tagline: "Departure transfers to Daniel Oduber International Airport.",
    intro:
      "Daniel Oduber International Airport (LIR) serves Guanacaste and the northern Pacific. Book a private shuttle to LIR from the beaches, La Fortuna or anywhere on your route for a stress-free departure day.",
    highlights: [
      "Departure pickups from Guanacaste, Arenal and beyond",
      "Timed to your flight, with buffer for traffic",
      "Closest airport to the Guanacaste beach towns",
    ],
    isAirport: true,
  },
] as const;

export function getAllDestinationSlugs(): string[] {
  return DESTINATIONS.map((d) => d.slug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

/**
 * Look up a destination hub by its exact Supabase origen/destino value.
 * Lets route pages link "See all shuttles to <place>" to the matching hub
 * when one exists. Returns undefined for places without a curated hub.
 */
export function getDestinationByDbName(dbName: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.dbName === dbName);
}
