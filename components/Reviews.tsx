"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

type Review = {
  name: string;
  text: string;
  dateEn: string;
  dateEs: string;
  initials: string;
  color: string;
};

// Los textos de las reviews se quedan en INGLES porque los clientes originales eran turistas internacionales
const reviews: Review[] = [
  {
    name: "Sarah M.",
    text: "We booked with Private Travel Costa Rica twice during our trip and were fortunate to have Pablo as our driver both times! He is so friendly and proud to share information about his beautiful country. He even gifted me a hand-made bracelet from his daughter for my birthday!",
    dateEn: "2 weeks ago",
    dateEs: "Hace 2 semanas",
    initials: "SM",
    color: "from-amber-400 to-amber-600",
  },
  {
    name: "Jennifer K.",
    text: "Diego was a fabulous driver! Great conversation, great ride. The car was so clean, comfortable, and smelled so fresh. He arrived early and got us there early. Best driver around! If you're traveling to Costa Rica, you HAVE to book.",
    dateEn: "3 weeks ago",
    dateEs: "Hace 3 semanas",
    initials: "JK",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Rachel T.",
    text: "My daughter and I had a fantastic experience with Diego! He took us to Poas volcano and La Paz Waterfall Gardens. He suggested taking us to the Starbucks plantation since we had extra time. Expert navigation and incredible service!",
    dateEn: "1 month ago",
    dateEs: "Hace 1 mes",
    initials: "RT",
    color: "from-rose-400 to-rose-600",
  },
  {
    name: "Michael R.",
    text: "Excellent experience with Oscar as our private driver from La Fortuna to Rio Celeste. He was incredibly professional, punctual, and made us feel safe and comfortable. Very informative — sharing insights about local wildlife and Costa Rican culture.",
    dateEn: "1 month ago",
    dateEs: "Hace 1 mes",
    initials: "MR",
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Linda H.",
    text: "Such hospitable and kind service! Pablo was our driver and was very friendly and conversational. On the way back he stopped by Cafe Macadamia and showed us a great lookout point of Lake Arenal. Very communicative and responsive — would highly recommend!",
    dateEn: "2 months ago",
    dateEs: "Hace 2 meses",
    initials: "LH",
    color: "from-purple-400 to-purple-600",
  },
  {
    name: "David P.",
    text: "Outstanding service from start to finish. Professional drivers, immaculate vehicles, and punctual pickup. Made our Costa Rica trip stress-free. Will definitely book again on our next visit!",
    dateEn: "2 months ago",
    dateEs: "Hace 2 meses",
    initials: "DP",
    color: "from-orange-400 to-orange-600",
  },
];

export default function Reviews() {
  const { t, lang } = useLanguage();

  const openGoogleReviews = () => {
    window.open(
      "https://www.google.com/maps/place/?q=place_id:ChIJl0aOiIQNoI8R6KcwnmmDEw8",
      "_blank"
    );
  };

  return (
    <section
      id="reviews"
      key={lang}
      className="relative py-24 px-4 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header con stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium tracking-wider">
              {t.reviews.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t.reviews.titlePart1}
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {t.reviews.titlePart2}
            </span>
          </h2>

          {/* Stats grandes */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-8">
            {/* 5 estrellas */}
            <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-white">5.0</div>
                <div className="text-xs text-gray-400">{t.reviews.outOfFive}</div>
              </div>
            </div>

            {/* Reviews count */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
              <svg className="w-8 h-8" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.860-1.977,13.409-5.192l-6.190-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.003-0.002,0.002-0.001,0.003-0.002l6.190,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <div className="text-left">
                <div className="text-3xl font-bold text-white">190+</div>
                <div className="text-xs text-gray-400">{t.reviews.googleReviews}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid de reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/20 group-hover:to-amber-600/20 rounded-2xl blur-xl transition-all duration-500" />

              <div className="relative h-full bg-gradient-to-br from-gray-900 to-black border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
                {/* Quote icon */}
                <Quote
                  size={32}
                  className="text-amber-500/20 mb-4"
                  fill="currentColor"
                />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-6">
                  {review.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-black text-sm font-bold">
                      {review.initials}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {review.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {lang === "en" ? review.dateEn : review.dateEs}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            onClick={openGoogleReviews}
            size="lg"
            className="bg-white hover:bg-gray-100 text-black font-semibold h-14 px-8 shadow-2xl"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.860-1.977,13.409-5.192l-6.190-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.003-0.002,0.002-0.001,0.003-0.002l6.190,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            {t.reviews.seeAllGoogle}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
