// Configuracion central del sitio
// Cuando migres el dominio, solo cambias siteUrl aqui

export const siteConfig = {
  // URL del sitio - cambiar a "https://privatetravelcr.com" cuando migres
  siteUrl: "https://private-travel-cr.vercel.app",

  // Nombre del negocio
  name: "Private Travel CR",
  shortName: "Private Travel CR",

  // Descripcion bilingue
  descriptionEN:
    "Premium private shuttle service in Costa Rica. Door-to-door transfers from SJO and LIR airports to La Fortuna, Manuel Antonio, Monteverde and more. ⭐ 5.0 Google · 190+ reviews · TripAdvisor Travelers' Choice 2025.",
  descriptionES:
    "Servicio de transporte privado premium en Costa Rica. Traslados puerta a puerta desde aeropuertos SJO y LIR a La Fortuna, Manuel Antonio, Monteverde y más. ⭐ 5.0 Google · 190+ reseñas · TripAdvisor Travelers' Choice 2025.",

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
    foundedYear: 2021,
    founder: "Diego Salas Oviedo",
    rating: {
      googleStars: 5.0,
      googleReviews: 190,
      tripAdvisorStars: 5.0,
      tripAdvisorReviews: 27,
    },
    awards: ["TripAdvisor Travelers' Choice 2025"],
  },

  // Imagen para preview (WhatsApp/Facebook/Twitter)
  // TODO: cuando tengas foto OG personalizada, cambiar a "/og-image.jpg"
  ogImage: "https://privatecr2.imgix.net/principal.jpeg?auto=format,compress&cs=srgb&q=75&w=1200&h=630&fit=crop",

  // Logo
  logo: "https://privatecr2.imgix.net/logos/logo-ptcr.svg",

  // Redes sociales (opcional, agregar cuando tengas)
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
