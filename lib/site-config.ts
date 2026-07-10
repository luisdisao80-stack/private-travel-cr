// Configuracion central del sitio
// Cuando migres el dominio, solo cambias siteUrl aqui

export const siteConfig = {
  // URL del sitio - el dominio canonico en Vercel es www.privatetravelcr.com
  // (el apex privatetravelcr.com redirige al www con 307)
  siteUrl: "https://www.privatetravelcr.com",

  // Nombre del negocio
  name: "Private Travel CR",
  shortName: "Private Travel CR",

  // Descripcion bilingue — third-pass CTR rewrite (2026-07). Prior version
  // led with a fact-sheet-style list of trust signals; this one opens with
  // an active hook ("Skip the rental car") and keeps the price/reviews
  // anchor, trimmed under 160 chars so Google shows the whole line.
  descriptionEN:
    "Skip the rental car. Private door-to-door shuttles from SJO & LIR to La Fortuna, Manuel Antonio, Monteverde — from $135. 5.0 stars. Book in 60 seconds.",
  descriptionES:
    "Olvídate del rent-a-car. Shuttles privados puerta a puerta desde SJO y LIR a La Fortuna, Manuel Antonio, Monteverde — desde $135. 5.0 estrellas. Reserva en 60 seg.",

  // Datos del negocio (para Schema.org y contacto)
  business: {
    phone: "+506 8633-4133",
    phoneE164: "+50686334133",
    whatsappUrl: "https://wa.me/50686334133",
    email: "info@privatetravelcr.com",
    address: {
      city: "La Fortuna",
      region: "Alajuela",
      country: "CR",
      countryName: "Costa Rica",
    },
    coordinates: {
      // La Fortuna, Costa Rica
      latitude: 10.4670,
      longitude: -84.6433,
    },
    foundedYear: 2022,
    founder: "Diego Salas Oviedo",
    rating: {
      googleStars: 5.0,
      googleReviews: 200,
      tripAdvisorStars: 5.0,
      tripAdvisorReviews: 27,
    },
    awards: ["TripAdvisor Travelers' Choice 2025"],
  },

  // Imagen para preview (WhatsApp/Facebook/Twitter) — 1200x630, self-hosted
  ogImage: "https://www.privatetravelcr.com/og-image.jpg",

  // Logo — self-hosted SVG
  logo: "https://www.privatetravelcr.com/logo-ptcr.svg",

  // Redes sociales (opcional, agregar cuando tengas)
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
