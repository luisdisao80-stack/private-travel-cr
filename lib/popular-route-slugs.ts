// Client-side shortcut for popular booking paths. When both ends of the
// user's selection are in POPULAR_DESTINATIONS, we navigate straight to
// /private-shuttle/<slug> instead of bouncing through /book → server-side
// smart-redirect. Saves ~200–500ms of round-trip + Supabase lookup on the
// ~80% of bookings that are popular pairs.
//
// Payload: ~7 KB inlined / ~1.5 KB gzipped. No runtime DB query.
//
// Generated from Supabase routes table — every row where both origen and
// destino are in lib/popular-routes.ts POPULAR_DESTINATIONS. If popular
// destinations or slugs change, regenerate with the script in
// data/migration/.

// Key format: "<origen DB name>|<destino DB name>" → DB slug.
const POPULAR_PAIR_SLUG: Record<string, string> = {
  "Conchal (Guanacaste)|Jaco": "conchal-to-jaco",
  "Conchal (Guanacaste)|La Fortuna (Arenal)": "conchal-to-la-fortuna",
  "Conchal (Guanacaste)|LIR - Liberia Int. Airport": "conchal-to-lir-liberia-int-airport",
  "Conchal (Guanacaste)|Manuel Antonio / Quepos": "conchal-to-manuel-antonio-quepos",
  "Conchal (Guanacaste)|Monteverde (Cloud Forest)": "conchal-to-monteverde",
  "Conchal (Guanacaste)|Papagayo Peninsula, Guanacaste": "conchal-to-papagayo-peninsula-guanacaste",
  "Conchal (Guanacaste)|Santa Teresa (Nicoya Peninsula)": "conchal-to-santa-teresa",
  "Conchal (Guanacaste)|SJO - Juan Santamaria Int. Airport": "conchal-to-sjo-juan-santamaria-int-airport",
  "Jaco|Conchal (Guanacaste)": "jaco-to-conchal",
  "Jaco|La Fortuna (Arenal)": "jaco-to-la-fortuna",
  "Jaco|LIR - Liberia Int. Airport": "jaco-to-lir-liberia-int-airport",
  "Jaco|Monteverde (Cloud Forest)": "jaco-to-monteverde",
  "Jaco|Papagayo Peninsula, Guanacaste": "jaco-to-papagayo-peninsula-guanacaste",
  "Jaco|SJO - Juan Santamaria Int. Airport": "jaco-to-sjo-juan-santamaria-int-airport",
  "Jaco|Tamarindo (Guanacaste)": "jaco-to-tamarindo",
  "La Fortuna (Arenal)|Conchal (Guanacaste)": "la-fortuna-to-conchal",
  "La Fortuna (Arenal)|Jaco": "la-fortuna-to-jaco",
  "La Fortuna (Arenal)|LIR - Liberia Int. Airport": "la-fortuna-to-lir",
  "La Fortuna (Arenal)|Manuel Antonio / Quepos": "la-fortuna-to-manuel-antonio",
  "La Fortuna (Arenal)|Monteverde (Cloud Forest)": "la-fortuna-to-monteverde",
  "La Fortuna (Arenal)|Papagayo Peninsula, Guanacaste": "la-fortuna-to-papagayo",
  "La Fortuna (Arenal)|Puerto Viejo (Caribbean Coast)": "la-fortuna-to-puerto-viejo",
  "La Fortuna (Arenal)|Santa Teresa (Nicoya Peninsula)": "la-fortuna-to-santa-teresa",
  "La Fortuna (Arenal)|SJO - Juan Santamaria Int. Airport": "la-fortuna-to-sjo",
  "La Fortuna (Arenal)|Tamarindo (Guanacaste)": "la-fortuna-to-tamarindo",
  "LIR - Liberia Int. Airport|Conchal (Guanacaste)": "lir-liberia-int-airport-to-conchal",
  "LIR - Liberia Int. Airport|Jaco": "lir-liberia-int-airport-to-jaco",
  "LIR - Liberia Int. Airport|La Fortuna (Arenal)": "lir-to-la-fortuna",
  "LIR - Liberia Int. Airport|Manuel Antonio / Quepos": "lir-liberia-int-airport-to-manuel-antonio-quepos",
  "LIR - Liberia Int. Airport|Monteverde (Cloud Forest)": "lir-to-monteverde",
  "LIR - Liberia Int. Airport|Papagayo Peninsula, Guanacaste": "lir-to-papagayo",
  "LIR - Liberia Int. Airport|Santa Teresa (Nicoya Peninsula)": "lir-liberia-int-airport-to-santa-teresa",
  "LIR - Liberia Int. Airport|SJO - Juan Santamaria Int. Airport": "lir-liberia-int-airport-to-sjo-juan-santamaria-int-airport",
  "LIR - Liberia Int. Airport|Tamarindo (Guanacaste)": "lir-liberia-int-airport-to-tamarindo",
  "Manuel Antonio / Quepos|Conchal (Guanacaste)": "manuel-antonio-quepos-to-conchal",
  "Manuel Antonio / Quepos|La Fortuna (Arenal)": "manuel-antonio-quepos-to-la-fortuna",
  "Manuel Antonio / Quepos|LIR - Liberia Int. Airport": "manuel-antonio-quepos-to-lir-liberia-int-airport",
  "Manuel Antonio / Quepos|Monteverde (Cloud Forest)": "manuel-antonio-quepos-to-monteverde",
  "Manuel Antonio / Quepos|Papagayo Peninsula, Guanacaste": "manuel-antonio-quepos-to-papagayo-peninsula-guanacaste",
  "Manuel Antonio / Quepos|Santa Teresa (Nicoya Peninsula)": "manuel-antonio-quepos-to-santa-teresa",
  "Manuel Antonio / Quepos|SJO - Juan Santamaria Int. Airport": "manuel-antonio-quepos-to-sjo-juan-santamaria-int-airport",
  "Manuel Antonio / Quepos|Tamarindo (Guanacaste)": "manuel-antonio-quepos-to-tamarindo",
  "Monteverde (Cloud Forest)|Conchal (Guanacaste)": "monteverde-to-conchal",
  "Monteverde (Cloud Forest)|Jaco": "monteverde-to-jaco",
  "Monteverde (Cloud Forest)|La Fortuna (Arenal)": "monteverde-to-la-fortuna",
  "Monteverde (Cloud Forest)|LIR - Liberia Int. Airport": "monteverde-to-lir-liberia-int-airport",
  "Monteverde (Cloud Forest)|Manuel Antonio / Quepos": "monteverde-to-manuel-antonio",
  "Monteverde (Cloud Forest)|Papagayo Peninsula, Guanacaste": "monteverde-to-papagayo-peninsula-guanacaste",
  "Monteverde (Cloud Forest)|Puerto Viejo (Caribbean Coast)": "monteverde-to-puerto-viejo",
  "Monteverde (Cloud Forest)|Santa Teresa (Nicoya Peninsula)": "monteverde-to-santa-teresa",
  "Monteverde (Cloud Forest)|SJO - Juan Santamaria Int. Airport": "monteverde-to-sjo",
  "Monteverde (Cloud Forest)|Tamarindo (Guanacaste)": "monteverde-to-tamarindo",
  "Papagayo Peninsula, Guanacaste|Conchal (Guanacaste)": "papagayo-peninsula-guanacaste-to-conchal",
  "Papagayo Peninsula, Guanacaste|Jaco": "papagayo-peninsula-guanacaste-to-jaco",
  "Papagayo Peninsula, Guanacaste|La Fortuna (Arenal)": "papagayo-peninsula-guanacaste-to-la-fortuna",
  "Papagayo Peninsula, Guanacaste|LIR - Liberia Int. Airport": "papagayo-peninsula-guanacaste-to-lir-liberia-int-airport",
  "Papagayo Peninsula, Guanacaste|Manuel Antonio / Quepos": "papagayo-peninsula-guanacaste-to-manuel-antonio-quepos",
  "Papagayo Peninsula, Guanacaste|Monteverde (Cloud Forest)": "papagayo-peninsula-guanacaste-to-monteverde",
  "Papagayo Peninsula, Guanacaste|Santa Teresa (Nicoya Peninsula)": "papagayo-peninsula-guanacaste-to-santa-teresa",
  "Papagayo Peninsula, Guanacaste|SJO - Juan Santamaria Int. Airport": "papagayo-peninsula-guanacaste-to-sjo-juan-santamaria-int-airport",
  "Papagayo Peninsula, Guanacaste|Tamarindo (Guanacaste)": "papagayo-peninsula-guanacaste-to-tamarindo",
  "Puerto Viejo (Caribbean Coast)|La Fortuna (Arenal)": "puerto-viejo-to-la-fortuna",
  "Puerto Viejo (Caribbean Coast)|Monteverde (Cloud Forest)": "puerto-viejo-to-monteverde",
  "Puerto Viejo (Caribbean Coast)|SJO - Juan Santamaria Int. Airport": "puerto-viejo-to-sjo-juan-santamaria-int-airport",
  "Santa Teresa (Nicoya Peninsula)|Conchal (Guanacaste)": "santa-teresa-to-conchal",
  "Santa Teresa (Nicoya Peninsula)|La Fortuna (Arenal)": "santa-teresa-to-la-fortuna",
  "Santa Teresa (Nicoya Peninsula)|LIR - Liberia Int. Airport": "santa-teresa-to-lir-liberia-int-airport",
  "Santa Teresa (Nicoya Peninsula)|Manuel Antonio / Quepos": "santa-teresa-to-manuel-antonio-quepos",
  "Santa Teresa (Nicoya Peninsula)|Monteverde (Cloud Forest)": "santa-teresa-to-monteverde",
  "Santa Teresa (Nicoya Peninsula)|Papagayo Peninsula, Guanacaste": "santa-teresa-to-papagayo-peninsula-guanacaste",
  "Santa Teresa (Nicoya Peninsula)|SJO - Juan Santamaria Int. Airport": "santa-teresa-to-sjo-juan-santamaria-int-airport",
  "Santa Teresa (Nicoya Peninsula)|Tamarindo (Guanacaste)": "santa-teresa-to-tamarindo",
  "SJO - Juan Santamaria Int. Airport|Conchal (Guanacaste)": "sjo-juan-santamaria-int-airport-to-conchal",
  "SJO - Juan Santamaria Int. Airport|Jaco": "sjo-juan-santamaria-int-airport-to-jaco",
  "SJO - Juan Santamaria Int. Airport|La Fortuna (Arenal)": "sjo-to-la-fortuna",
  "SJO - Juan Santamaria Int. Airport|LIR - Liberia Int. Airport": "sjo-juan-santamaria-int-airport-to-lir-liberia-int-airport",
  "SJO - Juan Santamaria Int. Airport|Manuel Antonio / Quepos": "sjo-to-manuel-antonio",
  "SJO - Juan Santamaria Int. Airport|Monteverde (Cloud Forest)": "sjo-to-monteverde",
  "SJO - Juan Santamaria Int. Airport|Papagayo Peninsula, Guanacaste": "sjo-juan-santamaria-int-airport-to-papagayo-peninsula-guanacaste",
  "SJO - Juan Santamaria Int. Airport|Puerto Viejo (Caribbean Coast)": "sjo-to-puerto-viejo",
  "SJO - Juan Santamaria Int. Airport|Santa Teresa (Nicoya Peninsula)": "sjo-juan-santamaria-int-airport-to-santa-teresa",
  "SJO - Juan Santamaria Int. Airport|Tamarindo (Guanacaste)": "sjo-to-tamarindo",
  "Tamarindo (Guanacaste)|Jaco": "tamarindo-to-jaco",
  "Tamarindo (Guanacaste)|La Fortuna (Arenal)": "tamarindo-to-la-fortuna",
  "Tamarindo (Guanacaste)|LIR - Liberia Int. Airport": "tamarindo-to-lir-liberia-int-airport",
  "Tamarindo (Guanacaste)|Manuel Antonio / Quepos": "tamarindo-to-manuel-antonio-quepos",
  "Tamarindo (Guanacaste)|Monteverde (Cloud Forest)": "tamarindo-to-monteverde",
  "Tamarindo (Guanacaste)|Papagayo Peninsula, Guanacaste": "tamarindo-to-papagayo-peninsula-guanacaste",
  "Tamarindo (Guanacaste)|Santa Teresa (Nicoya Peninsula)": "tamarindo-to-santa-teresa",
  "Tamarindo (Guanacaste)|SJO - Juan Santamaria Int. Airport": "tamarindo-to-sjo-juan-santamaria-int-airport",
};

// Returns /private-shuttle/<slug> when the from/to pair maps to a known
// popular-pair slug. Null otherwise — caller should fall back to
// /book?from=X&to=Y (which does the server-side smart redirect).
export function popularDirectUrl(from: string, to: string): string | null {
  const slug = POPULAR_PAIR_SLUG[`${from}|${to}`];
  return slug ? `/private-shuttle/${slug}` : null;
}
