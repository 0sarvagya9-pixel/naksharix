import { AstroTool } from "@/components/astro-tool";
import { Section } from "@/components/section";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Numerology - Life Path, Destiny and Name Numerology",
  description: "Use Naksharix Numerology for life path, destiny, soul urge, personality, name, mobile, vehicle, and daily numerology predictions.",
  path: "/numerology",
  keywords: ["Numerology", "Life Path Number", "Destiny Number", "Name Numerology"]
});

export default function NumerologyPage() {
  return (
    <Section>
      <h1 className="font-cinzel text-4xl font-black">Numerology</h1>
      <p className="mt-3 naksh-muted-text">Life path, destiny, soul urge, personality, name, mobile, vehicle, and daily numerology predictions.</p>
      <div className="mt-8"><AstroTool type="numerology" /></div>
    </Section>
  );
}
