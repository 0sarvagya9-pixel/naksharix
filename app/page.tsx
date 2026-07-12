import type { Metadata } from "next";
import { NxHome } from "@/components/nx-home";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix - Vedic Astrology Tools, Reports and Consultations",
  description:
    "Explore Kundli, Panchang, horoscope, numerology, tarot, saved digital reports, verified premium access, and astrologer consultation booking on Naksharix.",
  path: "/",
  keywords: ["Naksharix", "Kundli", "Panchang", "Horoscope", "Vedic Astrology", "Numerology", "Tarot", "Astrology Consultation"],
});

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[var(--nx-bg)] text-[var(--nx-text)]">
      <NxHome />
    </main>
  );
}
