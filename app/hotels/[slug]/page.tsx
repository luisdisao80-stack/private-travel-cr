import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import HotelDetail from "@/components/HotelDetail";
import {
  getHotelBySlug,
  getIndexableHotelSlugs,
  getRelatedHotels,
} from "@/lib/hotels-db";
import { getRoutesFromOrigen } from "@/lib/routes-db";
import { siteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getIndexableHotelSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) {
    return { title: "Hotel not found", robots: { index: false, follow: false } };
  }

  const title = `Private Shuttle from ${hotel.name} | Door-to-Door Transfer`;
  const description =
    hotel.description ||
    `Private shuttle service from ${hotel.name} in ${hotel.city}, Costa Rica. Door-to-door transfers to airports and all major destinations. Instant pricing.`;

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      `shuttle from ${hotel.name}`,
      `${hotel.name} airport transfer`,
      `${hotel.city} private shuttle`,
      `${hotel.name} to SJO`,
      `${hotel.name} to LIR`,
      `transportation from ${hotel.name}`,
    ],
    alternates: { canonical: `/hotels/${slug}` },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${siteConfig.siteUrl}/hotels/${slug}`,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      alternateLocale: "es_CR",
      images: [
        {
          url: hotel.image_url || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `Private shuttle service from ${hotel.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: [hotel.image_url || siteConfig.ogImage],
    },
    robots: hotel.is_indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function HotelPage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const [routes, related] = await Promise.all([
    getRoutesFromOrigen(hotel.area_origen),
    getRelatedHotels(hotel.city, slug, 4),
  ]);

  return (
    <>
      <Navbar />
      <HotelDetail hotel={hotel} routes={routes} related={related} />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
