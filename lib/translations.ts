// Sistema de traducciones Private Travel CR
// EN = English (principal)
// ES = Spanish

export type Language = "en" | "es";

export const translations = {
  en: {
    // NAVBAR
    nav: {
      home: "Home",
      quote: "Get Quote",
      fleet: "Fleet",
      routes: "Routes",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      whatsapp: "WhatsApp",
    },

    // ABOUT PAGE
    about: {
      hero: {
        badge: "Our Story",
        titlePart1: "The story behind",
        titlePart2: "every ride",
        subtitle:
          "Private Travel CR is more than a shuttle service. It's a family project born from passion for Costa Rica and a commitment to give every traveler the welcome they deserve.",
      },
      story: {
        badge: "✦ MY JOURNEY",
        title: "From a young dreamer to your trusted driver",
        chapter1: {
          title: "Where it all began",
          body:
            "I entered the tourism industry in 2006, when I was still figuring out what I wanted to do with my life. What I learned in those early years stayed with me forever: transportation in Costa Rica is not about moving people from point A to point B. It's the very first impression a traveler gets of our country, and the very last memory they take home. That responsibility shaped me.",
        },
        chapter2: {
          eyebrow: "15 Years of Learning",
          title: "Two companies, one obsession",
          body:
            "For nearly 15 years I worked at two of the most important transportation companies in Costa Rica. I learned operations, logistics, customer service, fleet management, every detail. But over time I noticed something was missing: the human touch. The personal care. The kind of attention a traveler who chose Costa Rica for their honeymoon, family vacation, or once-in-a-lifetime trip truly deserves.",
        },
        chapter3: {
          title: "The day everything changed",
          body:
            "In 2021 my second son was born. Holding him in my arms, I knew I had to build something of my own — something I could one day show my family with pride. I called Anthony, my cousin, who shared the same vision. We took the leap together. Private Travel CR was born from that moment, from the desire to do things our way, with care, with purpose, with heart.",
        },
        chapter4: {
          eyebrow: "Almost 4 years later",
          title: "From La Fortuna, with gratitude",
          body:
            "Today, almost 4 years in, we're based in La Fortuna, in the shadow of the Arenal Volcano. Every traveler we welcome reminds us why we started. Every five-star review on Google tells us we're on the right path. We're not the biggest shuttle company in Costa Rica, and we don't want to be. We want to be the one you remember.",
        },
      },
      values: {
        badge: "✦ WHAT WE STAND FOR",
        title: "Three things we never compromise",
        subtitle:
          "These aren't marketing words. They're the daily decisions Anthony and I make for every single ride.",
        family: {
          title: "Family-Run",
          description:
            "We are a family business, not a corporation. When you ride with us, you're treated like family — because that's how we know how to treat people.",
        },
        purpose: {
          title: "Purpose-Driven",
          description:
            "Every ride matters because every traveler matters. Your trip is unique, and so is the way we plan, drive, and care for you from start to finish.",
        },
        costaRica: {
          title: "Costa Rican Roots",
          description:
            "This is our country. We know every curve, every viewpoint, every hidden waterfall. When you travel with us, you travel with locals who genuinely love showing you home.",
        },
      },
      cta: {
        title: "Ready to travel with people who care?",
        subtitle:
          "Send us a message on WhatsApp and let's plan your Costa Rica trip together. We respond fast, in English or Spanish, any day, any hour.",
        whatsapp: "Chat on WhatsApp",
        quote: "Get a quote",
      },
    },

    // HERO
    hero: {
      badge: "PREMIUM PRIVATE TRANSPORTATION",
      titlePart1: "Private Shuttle Transportation",
      titlePart2: "in Costa Rica",
      subtitle: "Private Shuttle Service",
      features: "Instant quotes · Bilingual drivers · Door-to-door",
      ctaQuote: "Get Quote Now",
      ctaWhatsapp: "Direct WhatsApp",
      statStars: "Stars",
      statAvailable: "Available",
      statPrivate: "Private",
      scroll: "SCROLL",
    },

    // BENEFITS
    benefits: {
      badge: "✦ WHY CHOOSE US",
      titlePart1: "Why travelers",
      titlePart2: "prefer us",
      subtitle:
        "More than a shuttle, a premium experience designed so your Costa Rica trip starts stress-free.",
      items: [
        {
          title: "Door to Door",
          description:
            "We pick you up exactly where you are and take you directly to your destination. No unnecessary stops, no detours.",
        },
        {
          title: "100% Private",
          description:
            "Your own vehicle with a dedicated driver for you and your group only. No sharing with strangers, total privacy.",
        },
        {
          title: "Meet & Greet",
          description:
            "Your driver welcomes you with a name sign and helps with luggage. Stress-free arrival guaranteed.",
        },
        {
          title: "24/7 Support",
          description:
            "We are available before, during, and after your trip. Quick response via WhatsApp at any hour.",
        },
      ],
      trust: {
        google: "on Google Reviews",
        travelers: "happy travelers",
        insurance: "Insurance",
        insuranceLabel: "included",
        costaRican: "Costa Rican",
      },
    },

    // SERVICE COMPARISON
    services: {
      badge: "✦ TWO WAYS TO TRAVEL",
      titlePart1: "Choose your",
      titlePart2: "experience style",
      subtitle:
        "All our trips are private and comfortable. The difference is in the details and how much you want to enjoy the journey.",
      standard: {
        badge: "FAST AND EFFICIENT",
        name: "Standard",
        description:
          "The fastest way to reach your destination. A private, direct trip, no stops, no waiting.",
        priceLabel: "From",
        priceNote: "Price per vehicle (not per person)",
        features: [
          "Direct route without detours or stops",
          "Available 24/7, any schedule",
          "Door-to-door service",
          "Professional bilingual driver",
          "On-board WiFi and bottled water",
          "Full insurance and flight tracking",
        ],
        cta: "Get Standard Quote",
        ideal: "Ideal for airport transfers and tight schedules",
      },
      vip: {
        badgePopular: "⭐ MOST POPULAR",
        badgeTop: "PREMIUM EXPERIENCE",
        name: "VIP",
        description:
          "Why just travel when you can live an experience? Tourist stop, local drinks, and a driver who guides you.",
        priceLabel: "Standard + $80 USD",
        priceNote: "Includes full VIP experience",
        features: [
          { label: "1-2h tourist stop", sub: "(flexible)" },
          { label: "Concierge Service", sub: "(your driver guides you)" },
          {
            label: "Welcome Kit:",
            sub: "local beers, sodas, snacks",
          },
          { label: "Onboard WiFi and USB chargers", sub: "" },
          { label: "Personalized recommendations", sub: "" },
          { label: "Everything in Standard", sub: "+ more" },
        ],
        cta: "Get VIP Quote",
        ideal: "Perfect for honeymoons and unforgettable trips",
      },
      notSure: "Not sure which to choose?",
      chatWhatsapp: "Chat with us on WhatsApp →",
    },

    // QUOTE CALCULATOR
    quote: {
      sectionBadge: "✦ INSTANT QUOTE",
      sectionTitle: "Get your price in seconds",
      sectionSubtitle:
        "Select your route, indicate how many passengers, and we give you the exact price instantly.",
      title: "Instant Quote",
      subtitle: "Get your price instantly, no waiting",
      origin: "Origin",
      originPlaceholder: "Where are you starting from?",
      destination: "Destination",
      destinationPlaceholder: "Where are you going?",
      passengers: "Passengers",
      childrenLabel: "Children under 12",
      childrenHint: "Free car seats included",
      date: "Travel date",
      serviceType: "Service type",
      standardLabel: "Standard",
      standardDesc: "Direct · Fast · Door-to-door",
      vipLabel: "VIP",
      vipDesc: "+1-2h stop · Drinks · Snacks",
      vipPremium: "PREMIUM",
      calculate: "Calculate Price",
      notAvailable:
        "This route is not available. Contact us on WhatsApp for a custom quote.",
      chooseVehicle: "Choose your vehicle",
      vipSelected: "VIP SELECTED",
      recommended: "RECOMMENDED",
      passengersRange: "passengers",
      priceUSD: "USD",
      vipIncluded: "Includes VIP service",
      priceTotal: "Total trip price",
      notForPax: "Not suitable for",
      estimatedDuration: "Estimated duration:",
      distance: "Distance:",
      vipStop: " + VIP stop",
      standardIncluded: "✓ Included in your reservation:",
      vipIncludedTitle: "INCLUDED IN YOUR VIP EXPERIENCE:",
      reserveWhatsapp: "Reserve via WhatsApp",
      addToCart: "Add to Cart",
      addedToCart: "Added to Cart!",
      selectDateForCart: "Please select a date to add to cart",
      fillPickupDropoff: "Please fill pick up & drop off locations",
      fillPickupLocation: "Please fill the pick up location",
      fillPickupTime: "Please fill the pick up time",
      fillDropoffLocation: "Please fill the drop off location",
      or: "or",
      pickupDropoff: {
        title: "Pickup & Drop-off Details",
        subtitle: "Help us know exactly where to pick you up and drop you off.",
        pickupLabel: "Pick up location",
        pickupTimeLabel: "Pick up time",
        pickupTimePlaceholder: "Select a time",
        dropoffLabel: "Drop off location",
        pickupPlaceholder: "e.g., SJO Terminal 1 - Exit 5",
        dropoffPlaceholder: "e.g., Hotel Tabacón Lobby",
      },
      flightInfo: {
        title: "Flight Information",
        subtitleArrival: "We'll track your incoming flight to coordinate the pickup, even if it's delayed.",
        subtitleDeparture: "We use your flight info to time your pickup correctly to arrive on time.",
        arrivalLabel: "Arrival flight number",
        departureLabel: "Departure flight number",
        placeholder: "e.g., AA1234, UA567",
      },
      fillFlightNumber: "Please add your flight number",
      standardFeatures: [
        "Bilingual driver",
        "Door-to-door service",
        "Free water",
        "On-board WiFi",
      ],
      vipFeatures: [
        { strong: "1-2h tourist stop", normal: "flexible" },
        { strong: "Concierge Service", normal: "personalized" },
        { strong: "Local beers", normal: "" },
        { strong: "Sodas & premium water", normal: "" },
        { strong: "Local snacks", normal: "" },
        { strong: "Onboard WiFi + chargers", normal: "" },
        { strong: "Expert bilingual driver", normal: "" },
        { strong: "Door-to-door service", normal: "" },
      ],
      extraStops: {
        title: "Add tourist stops?",
        subtitle: "Perfect for waterfalls, viewpoints, photo ops or lunch along the way.",
        hour: "hour",
        hours: "hours",
        perHour: "per hour",
        maxNote: "Max 3 hours",
        noStops: "No extra stops",
        increase: "Add one hour",
        decrease: "Remove one hour",
        shortLabel: "stop",
        shortLabelPlural: "stops",
        includedLabel: "tourist stop included",
      },
    },

    // FLEET
    fleet: {
      badge: "✦ OUR FLEET",
      titlePart1: "Modern vehicles,",
      titlePart2: "total comfort",
      subtitle:
        "All our vehicles are kept in optimal condition, clean and air-conditioned for your comfort.",
      mostPopular: "MOST POPULAR",
      largeGroups: "LARGE GROUPS",
      stariaDesc: "Perfect for couples, small families and business trips.",
      hiaceDesc: "Ideal for large groups, tours and families with extra luggage.",
      paxLabel: "passengers",
      luggageLabel: "luggage",
      from: "From",
      cta: "Get Quote",
      guarantees: "New fleet · Technical inspection up to date · Full insurance included",
    },

    // POPULAR ROUTES
    routes: {
      badge: "✦ POPULAR ROUTES",
      titlePart1: "The most searched",
      titlePart2: "destinations in Costa Rica",
      subtitle:
        "Fixed and transparent fares for the most requested routes by our travelers.",
      popular: "POPULAR",
      private: "Private",
      from: "From",
      quote: "Quote",
      noDestination: "Don't see your destination? We have",
      routesAvailable: "25+ routes available",
      inCostaRica: "throughout Costa Rica.",
      seeAll: "See all routes and quote",
    },

    // REVIEWS
    reviews: {
      badge: "✦ VERIFIED REVIEWS",
      titlePart1: "Real travelers,",
      titlePart2: "real stories",
      stars: "out of 5 stars",
      outOfFive: "out of 5 stars",
      googleReviews: "Google reviews",
      tripadvisorReviews: "TripAdvisor reviews",
      travelersChoice: "Travelers' Choice",
      verified: "Verified",
      previous: "Previous review",
      next: "Next review",
      goToReview: "Go to review",
      readOnGoogle: "Read on Google",
      readOnTripadvisor: "Read on TripAdvisor",
      seeAll: "See all reviews on Google",
      seeAllGoogle: "See all reviews on Google",
    },

    // FAQ
    faq: {
      badge: "✦ FREQUENTLY ASKED QUESTIONS",
      titlePart1: "We answer your",
      titlePart2: "most common questions",
      subtitle: "Everything you need to know before booking your private transport in Costa Rica.",
      anotherQuestion: "Have another question?",
      writeUs: "Write us on WhatsApp →",
      ctaText: "Have another question?",
      ctaLink: "Write us on WhatsApp →",
      items: [
        {
          question: "Is it safe to travel with Private Travel CR?",
          answer:
            "Absolutely. Our fleet consists of new vehicles with up-to-date technical inspections and full insurance. All our drivers are professional bilingual with years of experience driving in Costa Rica. We have over 190 5-star reviews on Google that back up our service.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept credit card payments securely. When confirming your reservation via WhatsApp, we send you the payment link to process the transaction. It's fast, secure, and you can pay from anywhere in the world before your trip.",
        },
        {
          question: "What happens if my flight is delayed or cancelled?",
          answer:
            "Don't worry. When booking we ask for your flight number and monitor its status in real time. If your flight is delayed, we automatically adjust the pickup time at no extra cost. If it's cancelled, we reschedule your service for the new date.",
        },
        {
          question: "Can I cancel my reservation?",
          answer:
            "Yes. We offer free cancellation 48 hours before the trip. Simply write us on WhatsApp at +506 8633-4133 and we process your cancellation without complications. We want you to book with complete peace of mind.",
        },
        {
          question: "Do you offer child seats?",
          answer:
            "Yes, we offer completely free child seats upon request. Just tell us when booking the age and number of children traveling, and we prepare the vehicle with the appropriate seats. Your family's safety is our priority.",
        },
        {
          question: "How far in advance should I book?",
          answer:
            "We recommend booking at least 24 hours in advance to guarantee availability, especially in high season (December to April). For last-minute bookings, contact us on WhatsApp and we'll do our best to help you.",
        },
        {
          question: "How much luggage can I bring?",
          answer:
            "Each passenger can bring one large suitcase and one carry-on at no extra cost. If you travel with special equipment (surfboards, bicycles, diving gear), let us know when booking to confirm available space in the correct vehicle.",
        },
        {
          question: "Can you make stops during the trip?",
          answer:
            "Of course! Short stops (bathroom, coffee, photos) are included at no cost. If you want a more complete experience with 1-2 hour tourist stops (waterfalls, coffee farms, viewpoints), we recommend our VIP service for just $80 extra, which includes flexible stops, drinks, and snacks.",
        },
        {
          question: "Is the price per person or per vehicle?",
          answer:
            "The price is per COMPLETE vehicle, not per person. This means you travel privately with your group, without sharing with strangers. Up to 5 passengers go in Hyundai Staria and 6 to 9 passengers in Toyota Hiace, at the same price.",
        },
        {
          question: "What's the difference between Standard and VIP?",
          answer:
            "Standard is a direct, fast, and comfortable transfer. VIP (+$80) includes 1-2 hours of flexible tourist stops, a Welcome Kit with local beers, sodas, waters and snacks, onboard WiFi, chargers, and Concierge service where your driver recommends the best places. Perfect for honeymoons or special trips.",
        },
      ],
    },

    // CONTACT FORM
    contact: {
      badge: "✦ CONTACT US",
      titlePart1: "Tell us about",
      titlePart2: "your next trip",
      subtitle:
        "Fill out the form and we'll send you your personalized quote via WhatsApp in minutes.",
      name: "Full name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "your@email.com",
      whatsapp: "WhatsApp (optional)",
      whatsappPlaceholder: "+1 555-123-4567",
      passengers: "Number of travelers",
      travelers: "Number of travelers",
      route: "Route you're interested in",
      routePlaceholder: "Select your route",
      date: "Travel date",
      service: "Service type",
      serviceType: "Service type",
      standardShort: "Standard",
      standardDescShort: "Direct · Fast",
      standardDesc: "Direct · Fast",
      vipShort: "VIP",
      vipDescShort: "+1-2h stop · +$80",
      vipDesc: "+1-2h stop · +$80",
      details: "Additional details (optional)",
      additionalDetails: "Additional details (optional)",
      detailsPlaceholder:
        "Flight number, hotel, special needs (child seats, extra luggage, etc.)",
      privacy:
        "Your information is safe. We don't share it with third parties. When you submit, WhatsApp will open with your pre-written message for you to just hit send.",
      privacyNote:
        "Your information is safe. We don't share it with third parties. When you submit, WhatsApp will open with your pre-written message for you to just hit send.",
      send: "Send via WhatsApp",
      sendWhatsapp: "Send via WhatsApp",
      sending: "Opening WhatsApp!",
      opening: "Opening WhatsApp!",
      otherWays: "Prefer to contact us directly?",
      directContact: "Prefer to contact us directly?",
      routeOptions: [
        "SJO Airport → La Fortuna",
        "SJO Airport → Manuel Antonio",
        "SJO Airport → Monteverde",
        "SJO Airport → Tamarindo",
        "LIR Airport → La Fortuna",
        "LIR Airport → Tamarindo",
        "LIR Airport → Monteverde",
        "La Fortuna → Monteverde",
        "La Fortuna → Manuel Antonio",
        "La Fortuna → Tamarindo",
        "Other route (I'll detail in the message)",
      ],
      whatsappMessage: {
        greeting: "Hello Private Travel CR!",
        intro: "I want to quote a private shuttle.",
        name: "Name",
        email: "Email",
        whatsapp: "WhatsApp",
        travelers: "Travelers",
        person: "person",
        people: "people",
        route: "Route",
        date: "Date",
        service: "Service",
        details: "Additional details",
        closing: "What would be the price and availability? Thanks!",
        standardService: "Standard",
        vipService: "VIP (with stops + drinks + snacks)",
      },
    },

    // FOOTER
    footer: {
      description:
        "Premium private transportation in Costa Rica. Instant quotes, bilingual driver, door-to-door service.",
      brandDescription:
        "Premium private transportation in Costa Rica. Instant quotes, bilingual driver, door-to-door service.",
      reviews: "reviews",
      reviewsCount: "190+ reviews",
      quickLinks: "Quick Links",
      links: {
        home: "Home",
        benefits: "Benefits",
        services: "Services",
        quote: "Quote",
        fleet: "Fleet",
      routes: "Routes",
        reviews: "Reviews",
        faq: "FAQ",
      },
      contact: "Contact",
      whatsappLabel: "WhatsApp",
      phoneLabel: "Phone",
      phone: "+506 8633-4133",
      emailLabel: "Email",
      locationLabel: "Location",
      location: "La Fortuna, Costa Rica",
      follow: "Follow Us",
      followUs: "Follow Us",
      followDesc: "Check out our adventures and real client reviews.",
      followDescription: "Check out our adventures and real client reviews.",
      travellersChoice: "Travellers' Choice",
      copyright: "All rights reserved.",
      madeIn: "Made with ❤️ in Costa Rica 🇨🇷",
    },

    // WHATSAPP FLOAT
    whatsappFloat: {
      greeting: "Hello!",
      message: "Need help with your transportation? We're here for you.",
      chat: "Chat now →",
      close: "Close",
      ariaLabel: "Chat on WhatsApp",
      prefilledMessage: "Hi! I'm interested in your private transportation service in Costa Rica.",
    },

    // CART
    cart: {
      title: "Your Trip",
      transfer: "transfer",
      transfers: "transfers",
      pax: "pax",
      child: "child",
      children: "children",
      pickup: "Pick up",
      dropoff: "Drop off",
      flight: "Flight",
      standard: "Standard",
      total: "Total",
      continueBooking: "Continue to Booking",
      bookingDetails: "Booking Details",
      backToCart: "Back to cart",
      sendBooking: "Send Booking via WhatsApp",
      removeItem: "Remove transfer",
      clearAll: "Clear all transfers",
      close: "Close cart",
      openCart: "Open cart",
      emptyTitle: "Your cart is empty",
      emptyDescription: "Add transfers from the calculator to start building your trip.",
      startBooking: "Start booking",
      formIntro: "Please complete your details so we can confirm your reservation.",
      privacyNote: "Your data is only used to process this reservation. No spam, ever.",
      termsLabel: "I accept the",
      termsLink: "Terms and Conditions",
      acceptTermsPrompt: "Please accept the Terms and Conditions to continue",
      fields: {
        name: "Full name",
        email: "Email",
        phone: "Phone (with country code)",
        hotel: "Hotel / Address",
        flightNumber: "Flight number",
        flightTime: "Flight time",
        notes: "Notes (optional)",
      },
      placeholders: {
        name: "John Doe",
        email: "you@example.com",
        phone: "+1 555 123 4567",
        hotel: "e.g., Tabacón Resort",
        flightNumber: "e.g., AA1234",
        notes: "Special requests, baby seat, allergies, etc.",
      },
    },

    // LANGUAGE SWITCHER
    langSwitcher: {
      current: "EN",
      other: "ES",
    },
  },

  // ==========================================
  // ESPAÑOL
  // ==========================================
  es: {
    nav: {
      home: "Inicio",
      quote: "Cotizador",
      fleet: "Flota",
      routes: "Rutas",
      about: "Nosotros",
      blog: "Blog",
      contact: "Contacto",
      whatsapp: "WhatsApp",
    },

    // ABOUT PAGE
    about: {
      hero: {
        badge: "Nuestra Historia",
        titlePart1: "La historia detrás",
        titlePart2: "de cada viaje",
        subtitle:
          "Private Travel CR es más que un servicio de shuttles. Es un proyecto familiar nacido del amor por Costa Rica y del compromiso de darle a cada viajero la bienvenida que merece.",
      },
      story: {
        badge: "✦ MI CAMINO",
        title: "De un joven soñador a tu chofer de confianza",
        chapter1: {
          title: "Donde todo comenzó",
          body:
            "Entré al turismo en el 2006, cuando todavía estaba descubriendo qué quería hacer con mi vida. Lo que aprendí en esos primeros años se me quedó para siempre: el transporte en Costa Rica no se trata de mover personas de un punto A a un punto B. Es la primera impresión que un viajero tiene de nuestro país, y el último recuerdo que se lleva a casa. Esa responsabilidad me marcó.",
        },
        chapter2: {
          eyebrow: "15 Años de Aprendizaje",
          title: "Dos empresas, una misma obsesión",
          body:
            "Durante casi 15 años trabajé en dos de las empresas de transporte más importantes de Costa Rica. Aprendí operaciones, logística, servicio al cliente, manejo de flota, cada detalle. Pero con el tiempo noté que algo faltaba: el toque humano. La atención personal. El tipo de cuidado que un viajero que escogió Costa Rica para su luna de miel, sus vacaciones familiares o el viaje de su vida realmente merece.",
        },
        chapter3: {
          title: "El día que todo cambió",
          body:
            "En el 2021 nació mi segundo hijo. Teniéndolo en brazos, supe que tenía que construir algo propio, algo que algún día le pudiera mostrar a mi familia con orgullo. Llamé a Anthony, mi primo, que compartía la misma visión. Dimos el salto juntos. Private Travel CR nació de ese momento, del deseo de hacer las cosas a nuestra manera, con cuidado, con propósito, con corazón.",
        },
        chapter4: {
          eyebrow: "Casi 4 años después",
          title: "Desde La Fortuna, con gratitud",
          body:
            "Hoy, casi 4 años después, estamos basados en La Fortuna, a la sombra del Volcán Arenal. Cada viajero que recibimos nos recuerda por qué empezamos. Cada reseña de cinco estrellas en Google nos confirma que vamos por buen camino. No somos la empresa de shuttles más grande de Costa Rica, y no queremos serlo. Queremos ser la que recordás.",
        },
      },
      values: {
        badge: "✦ LO QUE NOS DEFINE",
        title: "Tres cosas en las que nunca cedemos",
        subtitle:
          "No son frases de marketing. Son las decisiones diarias que Anthony y yo tomamos en cada viaje.",
        family: {
          title: "Negocio Familiar",
          description:
            "Somos un negocio familiar, no una corporación. Cuando viajás con nosotros, te tratamos como familia, porque así es como sabemos tratar a la gente.",
        },
        purpose: {
          title: "Con Propósito",
          description:
            "Cada viaje importa porque cada viajero importa. Tu viaje es único, y así es como lo planificamos, lo conducimos y te cuidamos de principio a fin.",
        },
        costaRica: {
          title: "Raíces Ticas",
          description:
            "Este es nuestro país. Conocemos cada curva, cada mirador, cada catarata escondida. Cuando viajás con nosotros, viajás con costarricenses que aman mostrarte su tierra.",
        },
      },
      cta: {
        title: "¿Listo para viajar con quienes les importa?",
        subtitle:
          "Mandanos un mensaje por WhatsApp y planeamos tu viaje por Costa Rica juntos. Respondemos rápido, en inglés o español, cualquier día, cualquier hora.",
        whatsapp: "Chatear por WhatsApp",
        quote: "Cotizar mi viaje",
      },
    },

    hero: {
      badge: "PREMIUM PRIVATE TRANSPORTATION",
      titlePart1: "Transporte Privado",
      titlePart2: "En Costa Rica",
      subtitle: "Servicio de Shuttle Privado",
      features: "Cotización instantánea · Chofer bilingüe · Puerta a puerta",
      ctaQuote: "Cotizar Ahora",
      ctaWhatsapp: "WhatsApp Directo",
      statStars: "Estrellas",
      statAvailable: "Disponibilidad",
      statPrivate: "Privado",
      scroll: "SCROLL",
    },

    benefits: {
      badge: "✦ POR QUÉ ELEGIRNOS",
      titlePart1: "Por qué los viajeros",
      titlePart2: "nos prefieren",
      subtitle:
        "Más que un shuttle, una experiencia premium diseñada para que tu viaje por Costa Rica empiece sin estrés.",
      items: [
        {
          title: "Puerta a Puerta",
          description:
            "Te recogemos exactamente donde estés y te llevamos directo a tu destino. Sin paradas innecesarias, sin desvíos.",
        },
        {
          title: "100% Privado",
          description:
            "Tu propio vehículo con chofer dedicado solo para ti y tu grupo. Sin compartir con desconocidos, total privacidad.",
        },
        {
          title: "Meet & Greet",
          description:
            "Tu chofer te recibe con un cartel con tu nombre y te ayuda con el equipaje. Llegada sin estrés garantizada.",
        },
        {
          title: "Soporte 24/7",
          description:
            "Estamos disponibles antes, durante y después de tu viaje. Responde rápido vía WhatsApp a cualquier hora.",
        },
      ],
      trust: {
        google: "en Google Reviews",
        travelers: "viajeros satisfechos",
        insurance: "Seguros",
        insuranceLabel: "incluidos",
        costaRican: "costarricense",
      },
    },

    services: {
      badge: "✦ DOS FORMAS DE VIAJAR",
      titlePart1: "Elige tu estilo de",
      titlePart2: "experiencia",
      subtitle:
        "Todos nuestros viajes son privados y cómodos. La diferencia está en los detalles y en cuánto quieres disfrutar el trayecto.",
      standard: {
        badge: "RÁPIDO Y EFICIENTE",
        name: "Standard",
        description:
          "La forma más rápida de llegar a tu destino. Un viaje privado, directo, sin paradas, sin esperas.",
        priceLabel: "Desde",
        priceNote: "Precio por vehículo (no por persona)",
        features: [
          "Ruta directa sin desvíos ni paradas",
          "Disponible 24/7, cualquier horario",
          "Servicio puerta a puerta",
          "Chofer bilingüe profesional",
          "WiFi a bordo y agua embotellada",
          "Seguro completo y monitoreo de vuelos",
        ],
        cta: "Cotizar Standard",
        ideal: "Ideal para traslados aeropuerto y horarios apretados",
      },
      vip: {
        badgePopular: "⭐ MÁS POPULAR",
        badgeTop: "EXPERIENCIA PREMIUM",
        name: "VIP",
        description:
          "¿Por qué solo viajar cuando puedes vivir una experiencia? Parada turística, bebidas locales y un chofer que te guía.",
        priceLabel: "Standard + $80 USD",
        priceNote: "Incluye toda la experiencia VIP",
        features: [
          { label: "1-2h de parada turística", sub: "(flexible)" },
          { label: "Servicio Concierge", sub: "(tu chofer te guía)" },
          { label: "Welcome Kit:", sub: "cervezas, sodas, snacks" },
          { label: "WiFi a bordo y cargadores USB", sub: "" },
          { label: "Recomendaciones personalizadas", sub: "" },
          { label: "Todo lo de Standard", sub: "+ más" },
        ],
        cta: "Cotizar VIP",
        ideal: "Perfecto para lunas de miel y viajes inolvidables",
      },
      notSure: "¿No estás seguro qué elegir?",
      chatWhatsapp: "Chatea con nosotros por WhatsApp →",
    },

    quote: {
      sectionBadge: "✦ COTIZACIÓN INSTANTÁNEA",
      sectionTitle: "Obtén tu precio en segundos",
      sectionSubtitle:
        "Selecciona tu ruta, indica cuántas personas viajan y te damos el precio exacto al instante.",
      title: "Cotización Instantánea",
      subtitle: "Obtén tu precio al instante, sin esperas",
      origin: "Origen",
      originPlaceholder: "¿Desde dónde sales?",
      destination: "Destino",
      destinationPlaceholder: "¿A dónde vas?",
      passengers: "Pasajeros",
      childrenLabel: "Niños menores de 12",
      childrenHint: "Sillas de auto gratis incluidas",
      date: "Fecha de viaje",
      serviceType: "Tipo de servicio",
      standardLabel: "Standard",
      standardDesc: "Directo · Rápido · Puerta a puerta",
      vipLabel: "VIP",
      vipDesc: "+1-2h parada · Bebidas · Snacks",
      vipPremium: "PREMIUM",
      calculate: "Calcular Precio",
      notAvailable:
        "Esta ruta no está disponible. Contáctanos por WhatsApp para cotización personalizada.",
      chooseVehicle: "Elige tu vehículo",
      vipSelected: "VIP SELECCIONADO",
      recommended: "RECOMENDADO",
      passengersRange: "pasajeros",
      priceUSD: "USD",
      vipIncluded: "Incluye servicio VIP",
      priceTotal: "Precio total del viaje",
      notForPax: "No apto para",
      estimatedDuration: "Duración estimada:",
      distance: "Distancia:",
      vipStop: " + parada VIP",
      standardIncluded: "✓ Incluido en tu reserva:",
      vipIncludedTitle: "INCLUIDO EN TU EXPERIENCIA VIP:",
      reserveWhatsapp: "Reservar por WhatsApp",
      addToCart: "Agregar al Carrito",
      addedToCart: "¡Agregado al Carrito!",
      selectDateForCart: "Por favor selecciona una fecha para agregar al carrito",
      fillPickupDropoff: "Completa los lugares de recogida y destino",
      fillPickupLocation: "Por favor completa el lugar de recogida",
      fillPickupTime: "Por favor selecciona la hora de recogida",
      fillDropoffLocation: "Por favor completa el lugar de destino",
      or: "o",
      pickupDropoff: {
        title: "Lugares de Recogida y Destino",
        subtitle: "Ayudanos a saber exactamente dónde recogerte y dónde dejarte.",
        pickupLabel: "Lugar de recogida",
        pickupTimeLabel: "Hora de recogida",
        pickupTimePlaceholder: "Selecciona una hora",
        dropoffLabel: "Lugar de destino",
        pickupPlaceholder: "Ej: SJO Terminal 1 - Salida 5",
        dropoffPlaceholder: "Ej: Hotel Tabacón Recepción",
      },
      flightInfo: {
        title: "Información del Vuelo",
        subtitleArrival: "Monitoreamos tu vuelo de llegada para coordinar el pickup, incluso si hay atrasos.",
        subtitleDeparture: "Usamos tu información de vuelo para coordinar el pickup y llegar a tiempo.",
        arrivalLabel: "Número de vuelo (llegada)",
        departureLabel: "Número de vuelo (salida)",
        placeholder: "Ej: AA1234, UA567",
      },
      fillFlightNumber: "Por favor ingresa tu número de vuelo",
      standardFeatures: [
        "Chofer bilingüe",
        "Servicio puerta a puerta",
        "Agua gratis",
        "WiFi a bordo",
      ],
      vipFeatures: [
        { strong: "1-2h de parada turistica", normal: "flexible" },
        { strong: "Servicio Concierge", normal: "personalizado" },
        { strong: "Cervezas locales", normal: "" },
        { strong: "Sodas & aguas premium", normal: "" },
        { strong: "Snacks locales", normal: "" },
        { strong: "WiFi a bordo + cargadores", normal: "" },
        { strong: "Chofer bilingue experto", normal: "" },
        { strong: "Servicio puerta a puerta", normal: "" },
      ],
      extraStops: {
        title: "¿Agregar paradas turísticas?",
        subtitle: "Perfecto para cataratas, miradores, fotos o almuerzo en el camino.",
        hour: "hora",
        hours: "horas",
        perHour: "por hora",
        maxNote: "Máximo 3 horas",
        noStops: "Sin paradas extra",
        increase: "Agregar una hora",
        decrease: "Quitar una hora",
        shortLabel: "parada",
        shortLabelPlural: "paradas",
        includedLabel: "de parada turística incluida",
      },
    },

    fleet: {
      badge: "✦ NUESTRA FLOTA",
      titlePart1: "Vehículos modernos,",
      titlePart2: "comodidad total",
      subtitle:
        "Todos nuestros vehículos se mantienen en óptimas condiciones, limpios y con aire acondicionado para tu comodidad.",
      mostPopular: "MÁS POPULAR",
      largeGroups: "GRUPOS GRANDES",
      stariaDesc: "Perfecto para parejas, familias pequeñas y viajes de negocios.",
      hiaceDesc: "Ideal para grupos grandes, tours y familias con equipaje extra.",
      paxLabel: "pasajeros",
      luggageLabel: "equipaje",
      from: "Desde",
      cta: "Cotizar",
      guarantees: "Flota renovada · Revisión técnica al día · Seguros completos incluidos",
    },

    routes: {
      badge: "✦ RUTAS POPULARES",
      titlePart1: "Los destinos más",
      titlePart2: "buscados en Costa Rica",
      subtitle:
        "Tarifas fijas y transparentes para las rutas más solicitadas por nuestros viajeros.",
      popular: "POPULAR",
      private: "Privado",
      from: "Desde",
      quote: "Cotizar",
      noDestination: "¿No ves tu destino? Tenemos",
      routesAvailable: "25+ rutas disponibles",
      inCostaRica: "en todo Costa Rica.",
      seeAll: "Ver todas las rutas y cotizar",
    },

    reviews: {
      badge: "✦ RESEÑAS VERIFICADAS",
      titlePart1: "Viajeros reales,",
      titlePart2: "historias reales",
      stars: "de 5 estrellas",
      outOfFive: "de 5 estrellas",
      googleReviews: "reseñas en Google",
      tripadvisorReviews: "reseñas en TripAdvisor",
      travelersChoice: "Travelers' Choice",
      verified: "Verificada",
      previous: "Reseña anterior",
      next: "Siguiente reseña",
      goToReview: "Ir a reseña",
      readOnGoogle: "Leer en Google",
      readOnTripadvisor: "Leer en TripAdvisor",
      seeAll: "Ver todas las reseñas en Google",
      seeAllGoogle: "Ver todas las reseñas en Google",
    },

    faq: {
      badge: "✦ PREGUNTAS FRECUENTES",
      titlePart1: "Resolvemos tus",
      titlePart2: "dudas más comunes",
      subtitle:
        "Todo lo que necesitas saber antes de reservar tu transporte privado en Costa Rica.",
      anotherQuestion: "¿Tienes otra pregunta?",
      writeUs: "Escríbenos por WhatsApp →",
      ctaText: "¿Tienes otra pregunta?",
      ctaLink: "Escríbenos por WhatsApp →",
      items: [
        {
          question: "¿Es seguro viajar con Private Travel CR?",
          answer:
            "Absolutamente. Nuestra flota está compuesta por vehículos nuevos, con revisión técnica al día y seguros completos. Todos nuestros choferes son profesionales bilingües con años de experiencia manejando en Costa Rica. Contamos con más de 190 reseñas de 5 estrellas en Google que respaldan nuestro servicio.",
        },
        {
          question: "¿Qué métodos de pago aceptan?",
          answer:
            "Aceptamos pago con tarjeta de crédito de forma segura. Al confirmar tu reserva por WhatsApp, te enviamos el link de pago para procesar la transacción. Es rápido, seguro y puedes pagar desde cualquier parte del mundo antes de tu viaje.",
        },
        {
          question: "¿Qué pasa si mi vuelo se retrasa o se cancela?",
          answer:
            "No te preocupes. Al hacer tu reserva te pedimos tu número de vuelo y monitoreamos su estado en tiempo real. Si tu vuelo se retrasa, ajustamos automáticamente la hora de recogida sin costo extra. Si se cancela, reagendamos tu servicio para la nueva fecha.",
        },
        {
          question: "¿Puedo cancelar mi reserva?",
          answer:
            "Sí. Ofrecemos cancelación gratuita con 48 horas de anticipación al viaje. Simplemente escríbenos por WhatsApp al +506 8633-4133 y procesamos tu cancelación sin complicaciones. Queremos que reserves con total tranquilidad.",
        },
        {
          question: "¿Ofrecen sillas para niños?",
          answer:
            "Sí, ofrecemos sillas para niños completamente gratis bajo solicitud. Solo indícanos al reservar la edad y cantidad de niños que viajarán, y preparamos el vehículo con las sillas apropiadas. La seguridad de tu familia es nuestra prioridad.",
        },
        {
          question: "¿Con cuánto tiempo debo reservar?",
          answer:
            "Recomendamos reservar con al menos 24 horas de anticipación para garantizar disponibilidad, especialmente en temporada alta (diciembre a abril). Para reservas de último minuto, contáctanos por WhatsApp y haremos todo lo posible por ayudarte.",
        },
        {
          question: "¿Cuánto equipaje puedo llevar?",
          answer:
            "Cada pasajero puede llevar una maleta grande y un equipaje de mano sin costo adicional. Si viajas con equipo especial (tablas de surf, bicicletas, equipo de buceo), avísanos al reservar para confirmar el espacio disponible en el vehículo correcto.",
        },
        {
          question: "¿Pueden hacer paradas durante el viaje?",
          answer:
            "¡Por supuesto! Paradas cortas (baño, café, fotos) están incluidas sin costo. Si quieres una experiencia más completa con paradas turísticas de 1-2 horas (cataratas, cafetales, miradores), te recomendamos nuestro servicio VIP por solo $80 extra, que incluye paradas flexibles, bebidas y snacks.",
        },
        {
          question: "¿El precio es por persona o por vehículo?",
          answer:
            "El precio es por VEHÍCULO completo, no por persona. Esto significa que viajas en privado con tu grupo, sin compartir con desconocidos. Hasta 5 pasajeros van en Hyundai Staria y de 6 a 9 pasajeros en Toyota Hiace, al mismo precio.",
        },
        {
          question: "¿Cuál es la diferencia entre Standard y VIP?",
          answer:
            "El Standard es un traslado directo, rápido y cómodo. El VIP (+$80) incluye 1-2 horas de parada turística flexible, Welcome Kit con cervezas locales, sodas, aguas y snacks, WiFi a bordo, cargadores y servicio Concierge donde tu chofer te recomienda los mejores lugares. Perfecto para lunas de miel o viajes especiales.",
        },
      ],
    },

    contact: {
      badge: "✦ CONTÁCTANOS",
      titlePart1: "Cuéntanos sobre",
      titlePart2: "tu próximo viaje",
      subtitle:
        "Llena el formulario y te enviaremos tu cotización personalizada por WhatsApp en minutos.",
      name: "Nombre completo",
      namePlaceholder: "Tu nombre",
      email: "Email",
      emailPlaceholder: "tu@email.com",
      whatsapp: "WhatsApp (opcional)",
      whatsappPlaceholder: "+1 555-123-4567",
      passengers: "Número de viajeros",
      travelers: "Número de viajeros",
      route: "Ruta que te interesa",
      routePlaceholder: "Selecciona tu ruta",
      date: "Fecha del viaje",
      service: "Tipo de servicio",
      serviceType: "Tipo de servicio",
      standardShort: "Standard",
      standardDescShort: "Directo · Rápido",
      standardDesc: "Directo · Rápido",
      vipShort: "VIP",
      vipDescShort: "+1-2h parada · +$80",
      vipDesc: "+1-2h parada · +$80",
      details: "Detalles adicionales (opcional)",
      additionalDetails: "Detalles adicionales (opcional)",
      detailsPlaceholder:
        "Número de vuelo, hotel, necesidades especiales (sillas para niños, equipaje extra, etc.)",
      privacy:
        "Tu información está segura. No la compartimos con terceros. Al enviar se abrirá WhatsApp con tu mensaje pre-escrito para que solo presiones enviar.",
      privacyNote:
        "Tu información está segura. No la compartimos con terceros. Al enviar se abrirá WhatsApp con tu mensaje pre-escrito para que solo presiones enviar.",
      send: "Enviar por WhatsApp",
      sendWhatsapp: "Enviar por WhatsApp",
      sending: "¡Abriendo WhatsApp!",
      opening: "¡Abriendo WhatsApp!",
      otherWays: "¿Prefieres contactarnos directamente?",
      directContact: "¿Prefieres contactarnos directamente?",
      routeOptions: [
        "SJO Airport → La Fortuna",
        "SJO Airport → Manuel Antonio",
        "SJO Airport → Monteverde",
        "SJO Airport → Tamarindo",
        "LIR Airport → La Fortuna",
        "LIR Airport → Tamarindo",
        "LIR Airport → Monteverde",
        "La Fortuna → Monteverde",
        "La Fortuna → Manuel Antonio",
        "La Fortuna → Tamarindo",
        "Otra ruta (la detallo en el mensaje)",
      ],
      whatsappMessage: {
        greeting: "¡Hola Private Travel CR!",
        intro: "Quiero cotizar un shuttle privado.",
        name: "Nombre",
        email: "Email",
        whatsapp: "WhatsApp",
        travelers: "Viajeros",
        person: "persona",
        people: "personas",
        route: "Ruta",
        date: "Fecha",
        service: "Servicio",
        details: "Detalles adicionales",
        closing: "¿Cuál sería el precio y la disponibilidad? ¡Gracias!",
        standardService: "Standard",
        vipService: "VIP (con paradas + bebidas + snacks)",
      },
    },

    footer: {
      description:
        "Transporte privado premium en Costa Rica. Cotización instantánea, chofer bilingüe y servicio puerta a puerta.",
      brandDescription:
        "Transporte privado premium en Costa Rica. Cotización instantánea, chofer bilingüe y servicio puerta a puerta.",
      reviews: "reseñas",
      reviewsCount: "190+ reseñas",
      quickLinks: "Enlaces Rápidos",
      links: {
        home: "Inicio",
        benefits: "Beneficios",
        services: "Servicios",
        quote: "Cotizador",
        fleet: "Flota",
      routes: "Rutas",
        reviews: "Reseñas",
        faq: "FAQ",
      },
      contact: "Contacto",
      whatsappLabel: "WhatsApp",
      phoneLabel: "Teléfono",
      phone: "+506 8633-4133",
      emailLabel: "Email",
      locationLabel: "Ubicación",
      location: "La Fortuna, Costa Rica",
      follow: "Síguenos",
      followUs: "Síguenos",
      followDesc: "Mira nuestras aventuras y reseñas reales de clientes.",
      followDescription: "Mira nuestras aventuras y reseñas reales de clientes.",
      travellersChoice: "Travellers' Choice",
      copyright: "Todos los derechos reservados.",
      madeIn: "Hecho con ❤️ en Costa Rica 🇨🇷",
    },

    whatsappFloat: {
      greeting: "¡Hola!",
      message: "¿Necesitas ayuda con tu transporte? Estamos aquí para ti.",
      chat: "Chatear ahora →",
      close: "Cerrar",
      ariaLabel: "Chatear por WhatsApp",
      prefilledMessage: "¡Hola! Me interesa su servicio de transporte privado en Costa Rica.",
    },

    cart: {
      title: "Tu Viaje",
      transfer: "trayecto",
      transfers: "trayectos",
      pax: "pax",
      child: "niño",
      children: "niños",
      pickup: "Recogida",
      dropoff: "Destino",
      flight: "Vuelo",
      standard: "Standard",
      total: "Total",
      continueBooking: "Continuar con la Reserva",
      bookingDetails: "Detalles de Reserva",
      backToCart: "Volver al carrito",
      sendBooking: "Enviar Reserva por WhatsApp",
      removeItem: "Quitar trayecto",
      clearAll: "Vaciar carrito",
      close: "Cerrar carrito",
      openCart: "Abrir carrito",
      emptyTitle: "Tu carrito está vacío",
      emptyDescription: "Agrega trayectos desde el cotizador para armar tu viaje.",
      startBooking: "Empezar a reservar",
      formIntro: "Completa tus datos para que podamos confirmar tu reserva.",
      privacyNote: "Tus datos solo se usan para procesar esta reserva. Sin spam.",
      termsLabel: "Acepto los",
      termsLink: "Términos y Condiciones",
      acceptTermsPrompt: "Por favor acepta los Términos y Condiciones para continuar",
      fields: {
        name: "Nombre completo",
        email: "Correo electrónico",
        phone: "Teléfono (con código de país)",
        hotel: "Hotel / Dirección",
        flightNumber: "Número de vuelo",
        flightTime: "Hora del vuelo",
        notes: "Notas (opcional)",
      },
      placeholders: {
        name: "Juan Pérez",
        email: "tu@email.com",
        phone: "+506 8888 8888",
        hotel: "Ej: Tabacón Resort",
        flightNumber: "Ej: AA1234",
        notes: "Pedidos especiales, silla de bebé, alergias, etc.",
      },
    },

    langSwitcher: {
      current: "ES",
      other: "EN",
    },
  },
};

// Función helper para obtener traducciones
export function getTranslations(lang: Language) {
  return translations[lang];
}
