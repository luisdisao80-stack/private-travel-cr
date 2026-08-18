import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import DestinationHub from "@/components/DestinationHub";
import {
  getAllDestinationSlugs,
  getDestinationBySlug,
} from "@/lib/destinations";
import { getRoutesToDestino } from "@/lib/routes-db";
import { siteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllDestinationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) {
    return { title: "Destination not found", robots: { index: false, follow: false } };
  }

  const title = `Private Shuttle to ${dest.name} | Door-to-Door Transfers`;
  const description = `Book a private shuttle to ${dest.name}, Costa Rica. Door-to-door transfers from every airport and town, with live pricing, flight tracking and free child seats.`;

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      `shuttle to ${dest.name}`,
      `private shuttle to ${dest.name}`,
      `${dest.name} transfer`,
      `transportation to ${dest.name}`,
      `${dest.name} private transfer`,
      `${dest.name} Costa Rica shuttle`,
    ],
    alternates: { canonical: `/shuttle-to/${slug}` },
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${siteConfig.siteUrl}/shuttle-to/${slug}`,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      alternateLocale: "es_CR",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `Private shuttle to ${dest.name}, Costa Rica`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
      images: [siteConfig.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ShuttleToPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const routes = await getRoutesToDestino(dest.dbName);

  return (
    <>
      <Navbar />
      <DestinationHub destination={dest} routes={routes} />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
