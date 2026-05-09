import { getAllLocations } from "@/lib/routes-db";
import QuoteSectionClient from "@/components/QuoteSectionClient";

export default async function QuoteSection() {
  const locations = await getAllLocations();
  return <QuoteSectionClient locations={locations} />;
}
