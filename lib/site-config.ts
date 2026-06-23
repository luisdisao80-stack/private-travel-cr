// Configuracion central del sitio
// Cuando migres el dominio, solo cambias siteUrl aqui

export const siteConfig = {
  // URL del sitio - el dominio canonico en Vercel es www.privatetravelcr.com
  // (el apex privatetravelcr.com redirige al www con 307)
  siteUrl: "https://www.privatetravelcr.com",

  // Nombre del negocio
  name: "Private Travel CR",
  shortName: "Private Travel CR",

  // Descripcion bilingue — optimized for CTR (industry avg 3-5%, ours was 1.2%).
  // Leading with a price anchor + reviews count + free child seats acts as
  // a fact sheet inside the SERP snippet. Each line answers a known
  // pre-click objection (price, trust, family-friendly).
  descriptionEN:
    "Private transportation in Costa Rica from $135. Door-to-door SJO/LIR airport transfers to La Fortuna, Manuel Antonio, Monteverde. ⭐ 5.0 · 200+ reviews · free child seats · instant booking.",
  descriptionES:
    "Transporte privado en Costa Rica desde $135. Traslados puerta a puerta desde SJO/LIR a La Fortuna, Manuel Antonio, Monteverde. ⭐ 5.0 · 200+ reseñas · sillas de bebé gratis · reserva al instante.",

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
