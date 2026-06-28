import type { Metadata } from "next";
import { NxHome } from "@/components/nx-home";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Your Destiny. Your Dharma. | Vedic Astrology",
  description:
    "Naksharix is your cosmic guide to self-discovery, clarity and a life aligned with your purpose. Kundli, Panchang, Daily Horoscope, Numerology, Tarot and premium reports.",
  path: "/",
  keywords: ["Naksharix", "Kundli", "Panchang", "Horoscope", "Vedic Astrology", "Numerology", "Tarot"],
});

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[var(--nx-bg)] text-[var(--nx-text)]">
      <NxHome />
    </main>
  );
}
