import type { Metadata } from "next";
import Link from "next/link";
import { Gem, Package, ShieldCheck } from "lucide-react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Astrology Shop - Gemstones, Rudraksha and Yantra",
  description: "Naksharix ecommerce placeholder for gemstones, rudraksha, yantra, puja items, and premium astrology report recommendations.",
  path: "/shop",
  keywords: ["Gemstones", "Rudraksha", "Yantra", "Astrology Shop"]
});

const products = [
  ["Gemstones", "Personalized gemstone recommendations based on kundli strength and remedies.", "Coming soon"],
  ["Rudraksha", "Rudraksha suggestions for focus, calm, and devotional discipline.", "Coming soon"],
  ["Yantra", "Yantra recommendations for puja routines and mindful intention-setting.", "Coming soon"]
];

export default function ShopPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Astrology Ecommerce</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Gemstones, Rudraksha and Yantra</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Naksharix shop is prepared as a production placeholder. Products stay in coming-soon mode until inventory, pricing, and fulfillment are configured.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {products.map(([name, copy, status]) => (
            <Card key={name} className="glass">
              <CardContent className="p-6">
                <Gem className="h-6 w-6 text-[#FFD700]" />
                <h2 className="mt-4 font-cinzel text-2xl font-bold">{name}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">{copy}</p>
                <p className="mt-4 inline-flex rounded-full border border-[#D4AF37]/25 px-3 py-1 text-xs text-[#FFD700]">{status}</p>
                <Button className="mt-5 w-full" disabled><Package className="h-4 w-4" /> Shop coming soon</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-8 border-[#D4AF37]/20 bg-[#061D3C]/75">
          <CardContent className="p-6">
            <ShieldCheck className="h-6 w-6 text-[#FFD700]" />
            <h2 className="mt-4 font-cinzel text-2xl font-black">Recommendation flow</h2>
            <p className="mt-3 text-sm leading-6 naksh-muted-text">Generate a Kundli or premium report first, then use recommendations as reflective guidance. Product purchase should always include quality verification and ethical disclaimers.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild><Link href="/kundli">Generate Kundli</Link></Button>
              <Button variant="outline" asChild><Link href="/reports/kundli-pro">View Premium Report</Link></Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
