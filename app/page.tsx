import type { Metadata } from "next";
import { EditorialHome } from "@/components/home/editorial-home";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Vedic Astrology Tools, Reports and Consultations",
  description:
    "Explore Kundli, Panchang, horoscope, numerology, tarot, saved digital reports, verified premium access, and astrologer consultation booking on Naksharix.",
  path: "/",
  keywords: ["Naksharix", "Kundli", "Panchang", "Horoscope", "Vedic Astrology", "Numerology", "Tarot", "Astrology Consultation"],
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Show the exact same admin-managed selling prices as Shop and checkout.
  // If the catalogue fails, display no price rather than a stale seed amount.
  const featuredShopPrices: Record<string, number | null> = {};
  try {
    const shop = await getShopCatalogue();
    for (const product of shop.products) {
      if (["5-mukhi-rudraksha", "dhan-yog-bracelet", "shri-yantra", "rudraksha-mala"].includes(product.id)) {
        featuredShopPrices[product.id] = product.status === "active" ? product.unitPricePaise ?? null : null;
      }
    }
  } catch {
    // Home page remains operational without falsely advertising unavailable prices.
  }
  return (
    <main className="overflow-hidden bg-[var(--nx-bg)] text-[var(--nx-text)]">
      <EditorialHome featuredShopPrices={featuredShopPrices} />
    </main>
  );
}
