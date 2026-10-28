import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PricingContent } from "@/components/pricing-content";
import { getPublishedPujaOffers, displayPujaPrice } from "@/lib/puja/offerings";
import { pujaTopics } from "@/lib/puja/service-catalogue";

export const metadata: Metadata = seo({
  title: "Naksharix Services and Pricing",
  description: "Review available Naksharix free tools, premium digital reports, and astrologer consultation options. Prices are shown on the relevant report or approved astrologer page.",
  path: "/pricing",
  keywords: ["Naksharix Services", "Kundli Report Price", "Astrology Consultation Price"]
});

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  // Only advertise the published owner-managed price. A missing or mixed
  // catalogue cannot be substituted with a guessed amount.
  const published = await getPublishedPujaOffers();
  const prices = pujaTopics.map(topic => published[topic.id]?.pricePaise);
  const consistent = prices.length === pujaTopics.length &&
    prices.every(price => Number.isSafeInteger(price) && price === prices[0]);
  const pujaPriceLabel = consistent && typeof prices[0] === "number"
    ? displayPujaPrice(prices[0]) + " listed fee"
    : "See prices per Puja";
  return <PricingContent pujaPriceLabel={pujaPriceLabel} />;
}
