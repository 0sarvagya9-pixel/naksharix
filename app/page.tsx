import type { Metadata } from "next";
import { Theme10ProductionHome } from "@/components/theme10-production-home";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Kundli, Panchang, Horoscope and Premium Reports",
  description: "Premium astrology tools, daily Panchang, Kundli insights and review-based personalized reports using the Naksharix internal astrology workflow.",
  path: "/",
  keywords: ["Naksharix", "Kundli", "Panchang", "Horoscope", "Astrology Reports"]
});

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#fbf6ea] text-[#172536]">
      <Theme10ProductionHome />
    </main>
  );
}
