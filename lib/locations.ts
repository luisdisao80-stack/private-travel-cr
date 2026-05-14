// Display + búsqueda para las locations del cotizador.
//
// Las locations en Supabase guardan nombres "oficiales" largos como
// "SJO - Juan Santamaria Int. Airport". Para el usuario eso es ruido:
// quiere ver "San Jose Airport" y poder buscarlo escribiendo "sjo",
// "san jose", "juan santamaria" o "airport sjo". Este archivo concentra
// las 3 transformaciones que hacemos sobre cada DB name:
//
//   1. displayLocation(db)  → cómo lo renderea la UI
//   2. matchScore(db, q)    → cuánto matchea la query (incluyendo aliases)
//   3. priorityScore(db)    → boost para que aeropuertos queden arriba

// DB name → label friendly que ve el usuario.
// Si el DB name no está acá, se devuelve tal cual (caso default).
const DISPLAY: Record<string, string> = {
  "SJO - Juan Santamaria Int. Airport": "San Jose Airport",
  "LIR - Liberia Int. Airport": "Liberia Airport",
};

// DB name → palabras alternativas con las que el usuario podría buscarlo.
// Todo en lowercase. No hace falta repetir el nombre oficial (ya se matchea).
const ALIASES: Record<string, string[]> = {
  "SJO - Juan Santamaria Int. Airport": [
    "sjo",
    "san jose airport",
    "san jose",
    "juan santamaria",
    "santamaria",
    "alajuela airport",
  ],
  "LIR - Liberia Int. Airport": [
    "lir",
    "liberia airport",
    "liberia",
    "guanacaste airport",
  ],
  "La Fortuna (Arenal)": ["la fortuna", "fortuna", "arenal", "volcano"],
  "Monteverde (Cloud Forest)": ["monteverde", "cloud forest"],
  "Manuel Antonio / Quepos": ["manuel antonio", "quepos", "ma"],
  "Tamarindo (Guanacaste)": ["tamarindo"],
  "Conchal (Guanacaste)": ["conchal", "playa conchal"],
  "Brasilito (Guanacaste)": ["brasilito", "playa brasilito"],
  "Papagayo Peninsula, Guanacaste": ["papagayo", "peninsula papagayo"],
  "Puerto Viejo (Caribbean Coast)": ["puerto viejo", "caribbean", "caribe", "limon"],
  "Santa Teresa (Nicoya Peninsula)": ["santa teresa", "nicoya"],
  Jaco: ["jaco"],
  "Playas del Coco (Guanacaste)": ["coco", "playas del coco", "playa del coco", "el coco"],
  "Flamingo (Guanacaste)": ["flamingo", "playa flamingo"],
  "Playa Hermosa (Guanacaste)": ["playa hermosa", "hermosa"],
  "Playa Grande (Guanacaste)": ["playa grande"],
  "Playa Potrero (Guanacaste)": ["potrero", "playa potrero"],
  "Playa Avellanas (Guanacaste)": ["avellanas", "playa avellanas"],
  "Ocotal (Guanacaste)": ["ocotal", "playa ocotal"],
  "Dominical (Beach Town)": ["dominical"],
  Uvita: ["uvita"],
  Ojochal: ["ojochal"],
  "Esterillos (Este & Oeste Beach)": ["esterillos", "playa esterillos"],
  "Herradura (Los Sueños)": ["herradura", "los suenos", "los sueños"],
  "Hacienda Pinilla (Guanacaste)": ["hacienda pinilla", "pinilla"],
  "JW Marriott (Guanacaste)": ["jw marriott", "marriott"],
  "RIU Guanacaste Hotel / RIU Palace Hotel (Guanacaste)": ["riu", "riu palace", "riu guanacaste"],
  "Las Catalinas, Guanacaste": ["las catalinas", "catalinas"],
  "Punta Islita (Hotel & Beach)": ["punta islita"],
  "Punta Leona (Resort)": ["punta leona"],
  "Rincon de la Vieja (National Park)": ["rincon", "rincon de la vieja", "rincón"],
  "Bajos del Toro (Cloud Forest)": ["bajos del toro", "toro"],
  "La Paz Waterfall Gardens": ["la paz", "waterfalls", "cataratas"],
  "La Pavona (Tortuguero)": ["tortuguero", "pavona", "la pavona"],
  "Los Chiles (Nicaragua Border)": ["los chiles", "frontera"],
  "Penas Blancas (Nicaragua Border)": ["penas blancas", "peñas blancas", "nicaragua border"],
  "Sarapiqui, Heredia": ["sarapiqui", "sarapiquí"],
  "Malpaís (Nicoya Peninsula)": ["malpais", "mal pais", "malpaís"],
  "Montezuma (Nicoya Peninsula)": ["montezuma"],
  "Nosara (Playa Guiones Area)": ["nosara", "guiones", "playa guiones"],
  "Samara / Playa Carrillo (Guanacaste)": ["samara", "sámara", "playa carrillo", "carrillo"],
  "Puerto Jimenez (Osa Peninsula)": ["puerto jimenez", "puerto jiménez", "osa"],
  "Rio Celeste": ["rio celeste", "río celeste", "celeste"],
  "San Gerardo de Dota (Cloud Forest)": ["san gerardo", "dota", "san gerardo de dota"],
  "San Jose Downtown": ["san jose", "san josé", "downtown", "capital"],
  "Alajuela City": ["alajuela"],
};

// Locations que aparecen primero en el dropdown cuando no hay query. Travelers
// vienen en avión 99% de las veces — exponerlos primero ahorra clicks.
const AIRPORT_SET = new Set([
  "SJO - Juan Santamaria Int. Airport",
  "LIR - Liberia Int. Airport",
]);

export function displayLocation(dbName: string): string {
  return DISPLAY[dbName] ?? dbName;
}

export function isAirport(dbName: string): boolean {
  return AIRPORT_SET.has(dbName);
}

// Devuelve un score > 0 si la location matchea la query. Más alto = mejor match.
// 0 significa "no matchea, no mostrar".
export function matchScore(dbName: string, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;

  const haystacks = [
    dbName.toLowerCase(),
    displayLocation(dbName).toLowerCase(),
    ...(ALIASES[dbName] ?? []).map((a) => a.toLowerCase()),
  ];

  // Exact match on the full string of any haystack — highest priority.
  for (const h of haystacks) {
    if (h === q) return 1000;
  }

  // Substring match on any haystack.
  for (const h of haystacks) {
    if (h.includes(q)) {
      // Prefix match is worth more than middle match.
      return h.startsWith(q) ? 500 : 200;
    }
  }

  // Multi-token match: split query by whitespace, every token must appear
  // in at least one haystack. Catches "san jose" → "San Jose Airport".
  const tokens = q.split(/\s+/);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every((t) =>
      haystacks.some((h) => h.includes(t))
    );
    if (allTokensMatch) return 100;
  }

  return 0;
}

// Boost score para que aeropuertos siempre queden arriba ante empates.
export function priorityScore(dbName: string): number {
  return isAirport(dbName) ? 50 : 0;
}
