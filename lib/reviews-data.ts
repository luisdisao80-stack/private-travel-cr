// Reseñas reales de Private Travel CR
// Fuente: TripAdvisor (https://www.tripadvisor.com/Attraction_Review-g309226-d25394648)
// Última actualización: 2026-04 — Para agregar/editar, modificá este array

export type Review = {
  id: string;
  author: string;
  location: string;
  rating: 5;
  date: string; // formato: "Dec 2025"
  title: string;
  body: string;
  source: "tripadvisor" | "google";
  travelType?: "Friends" | "Family" | "Couples" | "Solo" | "Business";
};

export const reviews: Review[] = [
  {
    id: "katherine-j-dec-2025",
    author: "Katherine J",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Dec 2025",
    title: "Exceptional, Professional, and Reliable Private Transfers Across Costa Rica!",
    body:
      "Our experience with Private Travel Costa Rica was exceptional from start to finish. We used their service for multiple transfers, including from San Juan airport to La Fortuna, between locations in La Fortuna, and from Tamarindo to Liberia International Airport. Every driver was amazing—on time, flexible, and extremely professional. The responsiveness of the entire team made coordinating our travel seamless and stress-free. We highly recommend them for any transportation needs in Costa Rica.",
    source: "tripadvisor",
    travelType: "Friends",
  },
  {
    id: "ridi0406-dec-2025",
    author: "RIDI0406",
    location: "Madison, Wisconsin",
    rating: 5,
    date: "Dec 2025",
    title: "Professional and Reliable",
    body:
      "We used this company for transfers from La Fortuna to San Manuel Antonio and then from San Manuel Antonio to San Jose. I cannot say enough about the professionalism of the company and both the drivers, as well as the cleanliness of the vans. Communication was almost immediate. Our drivers Oscar and Carlos arrived a few minutes early, were highly professional, and super friendly and warm. There was wifi in the van which was much appreciated. All in all, both experiences were excellent. I cannot recommend this company enough. I will definitely use them again for transfers when we are back in CR.",
    source: "tripadvisor",
    travelType: "Family",
  },
  {
    id: "adsie65-jan-2026",
    author: "Adsie65",
    location: "London, United Kingdom",
    rating: 5,
    date: "Jan 2026",
    title: "A brilliant private transfer company",
    body:
      "Absolutely brilliant transfer company. Diego was incredibly easy and efficient to deal with. Very comfortable cars and delightful drivers who were incredibly prompt. Made our trip seamless and I can't recommend them highly enough.",
    source: "tripadvisor",
    travelType: "Couples",
  },
  {
    id: "orli-b-jun-2024",
    author: "Orli B",
    location: "Oakland, California",
    rating: 5,
    date: "Jun 2024",
    title: "Excellent care and drive with Diego",
    body:
      "I was so glad I booked our transfer from La Fortuna to Manuel Antonio with Diego. He was communicative and professional from the time of booking, confirming everything and checking on our needs. He was friendly, kind, spoke great English, and made the long drive as pleasant as possible. I'd absolutely book again.",
    source: "tripadvisor",
  },
  {
    id: "vle-apr-2024",
    author: "VLE",
    location: "Anaheim, California",
    rating: 5,
    date: "Apr 2024",
    title: "1 week in Guanacaste & La Fortuna — April 2024",
    body:
      "Our group of 10 was so well taken care by Diego Salas & his company from day 1 to day 7 during our stay here in CR. Transportation, transfers, tours, sight seeings, private van services... were all A+. The drivers and tour guides were all courteous & friendly (yes, and I mean genuinely friendly). The 'how can we help' attitude from Diego was just simply superb! Detailed & caring. Please keep it up, Diego!",
    source: "tripadvisor",
    travelType: "Friends",
  },
  {
    id: "nicole-k-may-2023",
    author: "Nicole K",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "May 2023",
    title: "Absolutely amazing",
    body:
      "We planned a family trip after my son graduating from Penn State. The boys told me they wanted the most adventurous trip I could plan for them. After finding Diego he made our trip a lifetime memory and we are forever grateful, he went above and beyond our expectations. We will definitely be returning and I highly recommend anyone traveling to Costa Rica reaching out to Diego. Thank you again! See you soon!",
    source: "tripadvisor",
    travelType: "Family",
  },
  {
    id: "nileah-b-oct-2023",
    author: "Nileah B",
    location: "Washington DC",
    rating: 5,
    date: "Oct 2023",
    title: "Best way to see CR — con Diego y Pura Vida!",
    body:
      "Diego was the best driver during my entire tour. He is very knowledgeable about all of Costa Rica, has a very easy going nature, is a fantastic driver and is wonderful to talk with. Don't hesitate to book with Private Travel Costa Rica! You won't regret it.",
    source: "tripadvisor",
    travelType: "Solo",
  },
  {
    id: "dahlthomp-2023",
    author: "dahlthomp",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Sep 2023",
    title: "Professional, trustworthy, knowledgeable, and fun",
    body:
      "We spent several days touring with Diego on our vacation to Costa Rica. It's our second trip with him and we trust him like family. It's good to travel with someone who knows their way around. The experiences he recommended were amazing! I highly recommend seeing Costa Rica with Diego. Can't wait to return!",
    source: "tripadvisor",
    travelType: "Family",
  },
  {
    id: "josie-p-jul-2023",
    author: "Josie P",
    location: "TripAdvisor Reviewer",
    rating: 5,
    date: "Jul 2023",
    title: "Drive to La Fortuna & Playa Conchal",
    body:
      "Diego was very kind while driving us to La Fortuna, and then to Playa Conchal as well! He also offered a tour of La Fortuna. Does driving, and can do more (tours, etc) if you communicate! Made sure we had rest stops and places to eat.",
    source: "tripadvisor",
    travelType: "Solo",
  },
];

// Stats agregados para mostrar en el header de la sección
export const reviewStats = {
  google: {
    rating: 5.0,
    count: 190,
    url: "https://g.co/kgs/cWkFwFM",
  },
  tripadvisor: {
    rating: 5.0,
    count: 27,
    url: "https://www.tripadvisor.com/Attraction_Review-g309226-d25394648-Reviews-Private_Travel_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_.html",
    travelersChoiceYear: 2025,
  },
};
