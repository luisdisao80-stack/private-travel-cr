// Curated 5-star reviews shown on the home page.
// Sources: TripAdvisor + Google. Last updated 2026-05.
//
// Order: newest first. To add a Google review, paste it as a new object
// at the top with source: "google" and date in "Mon YYYY" format.

export type Review = {
  id: string;
  author: string;
  location: string;
  rating: 5;
  date: string; // "Dec 2025"
  title: string;
  body: string;
  source: "tripadvisor" | "google";
  travelType?: "Friends" | "Family" | "Couples" | "Solo" | "Business";
};

export const reviews: Review[] = [
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
];

// Stats agregados para mostrar en el header de la sección
export const reviewStats = {
  google: {
    rating: 5.0,
    count: 190,
    // Was "https://g.co/kgs/cWkFwFM" — Google's KG short URL silently
    // failed on iOS Safari and various in-app browsers (Instagram, FB),
    // doing nothing on tap. Switched to the canonical search URL keyed
    // on our Place ID (same one in lib/google-reviews.ts), which opens
    // directly to the reviews list everywhere. Same Place ID is used
    // in the footer link, so we know it resolves reliably.
    url: "https://search.google.com/local/reviews?placeid=ChIJl0aOiIQNoI8R6KcwnmmDEw8",
  },
  tripadvisor: {
    rating: 5.0,
    count: 27,
    url: "https://www.tripadvisor.com/Attraction_Review-g309226-d25394648-Reviews-Private_Travel_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_.html",
    travelersChoiceYear: 2025,
  },
};
