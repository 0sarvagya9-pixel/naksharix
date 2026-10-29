import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";
import { KundliForm } from "@/components/kundli-form";
import { Section } from "@/components/section";
import Link from "next/link";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Kundli Online | Janam Kundali & Vedic Birth Chart",
  description: "Generate a free Vedic Janam Kundli using birth date, time and place. Explore lagna, planetary positions, Navamsa, Dasha and traditional chart interpretations.",
  path: "/kundli",
  keywords: ["Kundli", "Kundli Generator", "Birth Chart", "Manglik Analysis", "Dasha"]
});

export default function KundliPage() {
  return (
    <main className="inner-page-shell star-field">
      <EditorialServiceBanner eyebrow="FREE VEDIC BIRTH CHART" headline="Your Kundli, your starting point" caption="Enter your birth details for a structured traditional chart. Times, location and ephemeris settings matter." image="/naksharix/editorial-kundli.svg" imageAlt="Original Vedic birth-chart grid illustration" link="/panchang" linkLabel="Explore the Panchang" />
      <Section first>
        <h1 className="font-cinzel text-4xl font-black text-white">Kundli Generator</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Enter your birth date, exact time and birthplace to explore a traditional Vedic birth chart. The calculations and interpretations depend on the supplied details and method.</p>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">New to Lagna, Rashi, Nakshatra or Dasha? <Link href="/learn/kundli-explained" className="underline underline-offset-4">Read the free Kundli explanation</Link> before interpreting a chart.</p>
        <div className="mt-8">
          <KundliForm />
        </div>
      </Section>
    </main>
  );
}
