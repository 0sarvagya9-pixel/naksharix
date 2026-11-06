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
        <div className="nx-gallery-kundli-grid mt-8">
          <div className="nx-gallery-kundli-form"><KundliForm /></div>
          <aside className="nx-gallery-kundli-preview" aria-label="Traditional chart preview before calculation">
            <p className="nx-gallery-kundli-eyebrow">Traditional chart preview</p>
            <h2>Your Kundli, at a glance</h2>
            <div className="nx-gallery-chart-placeholder">
              <svg viewBox="0 0 320 320" role="img" aria-label="Decorative diamond-grid Vedic chart placeholder, not a calculated result">
                <rect x="12" y="12" width="296" height="296" rx="3" fill="#fffbf2" stroke="#bd9754" strokeWidth="2" />
                <path d="M160 12 L308 160 L160 308 L12 160 Z M12 12 L308 308 M308 12 L12 308"
                  fill="none" stroke="#b88a58" strokeWidth="1.7" />
                <text x="160" y="174" textAnchor="middle" fill="#be9b59" fontSize="29" fontWeight="700">ॐ</text>
              </svg>
              <p>Birth chart appears after you submit your actual details</p>
            </div>
            <div className="nx-gallery-kundli-mini">
              <div><strong>↗</strong><small>Ascendant</small></div>
              <div><strong>☼</strong><small>Planets</small></div>
              <div><strong>▧</strong><small>Houses</small></div>
            </div>
          </aside>
        </div>
      </Section>
    </main>
  );
}
