import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { NumerologyContent } from "@/components/numerology-content";

export const metadata: Metadata = seo({
  title: "Numerology - Life Path, Destiny and Name Numerology",
  description: "Use Naksharix Numerology for life path, destiny, soul urge, personality, name, mobile, vehicle, and daily numerology predictions.",
  path: "/numerology",
  keywords: ["Numerology", "Life Path Number", "Destiny Number", "Name Numerology"]
});

export default function NumerologyPage() {
  return <NumerologyContent />;
}
