import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { PricingContent } from "@/components/pricing-content";
import { displayPujaPrice } from "@/lib/puja/offerings";
import { getPujaLaunchState } from "@/lib/puja/launch-readiness";

export const metadata: Metadata = seo({
  title: "Naksharix Services and Pricing",
  description: "Review available Naksharix free tools, premium digital reports, and astrologer consultation options. Prices are shown on the relevant report or approved astrologer page.",
  path: "/pricing",
  keywords: ["Naksharix Services", "Kundli Report Price", "Astrology Consultation Price"]
});

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const launch = await getPujaLaunchState();
  const prices = Object.values(launch.offers).map(offer => offer.pricePaise);
  const consistent = launch.enabled && prices.length > 0 &&
    prices.every(price => Number.isSafeInteger(price) && price === prices[0]);
  const pujaPriceLabel = !launch.enabled ? "Coming Soon" :
    consistent ? displayPujaPrice(prices[0]) + " per available Puja" : "Price shown per available Puja";
  return <PricingContent pujaPriceLabel={pujaPriceLabel} pujaEnabled={launch.enabled} />;
}
