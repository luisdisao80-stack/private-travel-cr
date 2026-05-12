// Canonical FAQ data — used by FAQSection (UI, bilingual) and FAQSchema
// (JSON-LD, English for Google rich results / AI citations).

export type FAQ = {
  question: string;
  answer: string;
};

export const FAQS_EN: FAQ[] = [
  {
    question: "Is it safe to travel with Private Travel CR?",
    answer:
      "Absolutely. Our fleet consists of new vehicles with up-to-date technical inspections and full insurance coverage. All our drivers are professional bilingual drivers with years of experience driving in Costa Rica. We have over 190 5-star reviews on Google that back up our service.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept secure credit and debit card payments through Tilopay. You'll receive a payment link at booking and can pay from anywhere in the world before your trip. We also accept payment via WhatsApp confirmation.",
  },
  {
    question: "What happens if my flight is delayed or cancelled?",
    answer:
      "Don't worry. When you book, we ask for your flight number and monitor its status in real time. If your flight is delayed, we automatically adjust the pickup time at no extra cost. If it's cancelled, we reschedule your service for the new date.",
  },
  {
    question: "Can I cancel my reservation?",
    answer:
      "Yes. We offer free cancellation up to 48 hours before your trip. Just message us on WhatsApp at +506 8633-4133 and we'll process your cancellation hassle-free.",
  },
  {
    question: "Do you offer child seats?",
    answer:
      "Yes, we offer infant, convertible, and booster child seats completely free upon request. Let us know the age and number of children traveling when you book and we'll prepare the vehicle with the appropriate seats.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 24 hours in advance to guarantee availability, especially during high season (December to April). For last-minute bookings, contact us via WhatsApp and we'll do our best to help you.",
  },
  {
    question: "How much luggage can I bring?",
    answer:
      "Each passenger can bring one large suitcase and one carry-on at no additional cost. If you're traveling with special equipment (surfboards, bicycles, diving gear), let us know when booking to confirm available space in the right vehicle.",
  },
  {
    question: "Can you make stops during the trip?",
    answer:
      "Yes. Short stops (restroom, coffee, photos) are included at no cost. For a fuller experience with 1-2 hour tourist stops (waterfalls, coffee plantations, viewpoints), we recommend our VIP service for $80 extra, which includes flexible stops, drinks, and snacks.",
  },
  {
    question: "Is the price per person or per vehicle?",
    answer:
      "The price is per VEHICLE, not per person. You travel privately with your group without sharing with strangers. Up to 6 passengers fit in our Hyundai Staria, 7-9 in the Toyota Hiace, and 10-18 in the Maxus V90 — all at the same flat rate per vehicle.",
  },
  {
    question: "What's the difference between Standard and VIP?",
    answer:
      "Standard is a direct, fast, and comfortable transfer. VIP (+$80) includes 1-2 hours of flexible tourist stops, a Welcome Kit with local beers, sodas, water and snacks, onboard WiFi, USB chargers, and concierge service where your driver recommends the best places. Perfect for honeymoons or special trips.",
  },
  {
    question: "Do you pick up from SJO and LIR airports?",
    answer:
      "Yes. We operate door-to-door transfers from both Juan Santamaría International (SJO) in San José and Daniel Oduber International (LIR) in Liberia. Your driver meets you at arrivals with a sign showing your name.",
  },
  {
    question: "Are tolls and fees included in the price?",
    answer:
      "Yes. The price you see is final — it includes the driver, vehicle, fuel, tolls, taxes, water, WiFi, and child seats. No hidden fees, no tipping required.",
  },
];

export const FAQS_ES: FAQ[] = [
  {
    question: "¿Es seguro viajar con Private Travel CR?",
    answer:
      "Absolutamente. Nuestra flota está compuesta por vehículos nuevos, con revisión técnica al día y seguros completos. Todos nuestros choferes son profesionales bilingües con años de experiencia manejando en Costa Rica. Contamos con más de 190 reseñas de 5 estrellas en Google que respaldan nuestro servicio.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos pago con tarjeta de crédito y débito de forma segura a través de Tilopay. Al confirmar tu reserva te enviamos el link de pago para procesar la transacción. Es rápido, seguro y puedes pagar desde cualquier parte del mundo antes de tu viaje.",
  },
  {
    question: "¿Qué pasa si mi vuelo se retrasa o se cancela?",
    answer:
      "No te preocupes. Al hacer tu reserva te pedimos tu número de vuelo y monitoreamos su estado en tiempo real. Si tu vuelo se retrasa, ajustamos automáticamente la hora de recogida sin costo extra. Si se cancela, reagendamos tu servicio para la nueva fecha.",
  },
  {
    question: "¿Puedo cancelar mi reserva?",
    answer:
      "Sí. Ofrecemos cancelación gratuita con 48 horas de anticipación al viaje. Simplemente escríbenos por WhatsApp al +506 8633-4133 y procesamos tu cancelación sin complicaciones.",
  },
  {
    question: "¿Ofrecen sillas para niños?",
    answer:
      "Sí, ofrecemos sillas para niños (infante, convertible y booster) completamente gratis bajo solicitud. Solo indícanos al reservar la edad y cantidad de niños que viajarán, y preparamos el vehículo con las sillas apropiadas.",
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
      "Sí. Paradas cortas (baño, café, fotos) están incluidas sin costo. Si quieres una experiencia más completa con paradas turísticas de 1-2 horas (cataratas, cafetales, miradores), te recomendamos nuestro servicio VIP por $80 extra, que incluye paradas flexibles, bebidas y snacks.",
  },
  {
    question: "¿El precio es por persona o por vehículo?",
    answer:
      "El precio es por VEHÍCULO completo, no por persona. Viajas en privado con tu grupo, sin compartir con desconocidos. Hasta 6 pasajeros en Hyundai Staria, 7-9 en Toyota Hiace, y 10-18 en Maxus V90 — todos al mismo precio fijo por vehículo.",
  },
  {
    question: "¿Cuál es la diferencia entre Standard y VIP?",
    answer:
      "Standard es un traslado directo, rápido y cómodo. VIP (+$80) incluye 1-2 horas de paradas turísticas flexibles, Welcome Kit con cervezas locales, sodas, aguas y snacks, WiFi a bordo, cargadores USB y servicio Concierge donde tu chofer te recomienda los mejores lugares. Perfecto para lunas de miel o viajes especiales.",
  },
  {
    question: "¿Recogen en los aeropuertos SJO y LIR?",
    answer:
      "Sí. Operamos traslados puerta a puerta desde el aeropuerto Juan Santamaría (SJO) en San José y el Daniel Oduber (LIR) en Liberia. Tu chofer te espera en arribos con un cartel con tu nombre.",
  },
  {
    question: "¿Están incluidos los peajes y cargos en el precio?",
    answer:
      "Sí. El precio que ves es final — incluye chofer, vehículo, combustible, peajes, impuestos, agua, WiFi y sillas para niños. Sin cargos ocultos, sin propina obligatoria.",
  },
];
