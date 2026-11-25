import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { calculatePremiumPanchang } from "@/lib/astrology/premium-engine/panchang";
import { todayInTimezone } from "@/lib/astrology/timezone-offset";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Shubh Muhurat Finder - Naksharix",
  description: "Find Shubh Muhurat for marriage, griha pravesh, business start, puja, travel, and important decisions with Naksharix Panchang.",
  path: "/shubh-muhurat",
  keywords: ["Shubh Muhurat", "Muhurat Finder", "Panchang", "Auspicious Time"]
});

export const dynamic = "force-dynamic";

const categories = ["Marriage Muhurat", "Griha Pravesh", "Business Start", "Vehicle Purchase", "Puja Muhurat", "Travel Muhurat"];

export default function ShubhMuhuratPage() {
  const panchang = calculatePremiumPanchang({date:todayInTimezone("Asia/Kolkata"),latitude:28.6139,longitude:77.209,timezone:"+05:30",place:"Delhi, India"});
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Muhurat Finder</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Shubh Muhurat</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">Use Naksharix for auspicious timing categories and daily panchang context. For major rituals, confirm with a qualified astrologer.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild><Link href="/consultation">Consult Astrologer</Link></Button>
          <Button variant="outline" asChild><Link href="/panchang">View Panchang</Link></Button>
        </div>
        <Card className="glass mt-10">
          <CardContent className="p-6">
            <Clock className="h-6 w-6 text-[#FFD700]" />
            <h2 className="mt-4 font-cinzel text-2xl font-black">Today&apos;s calculated Abhijit window — Delhi</h2>
            <p className="mt-3 text-lg text-[#FFD700]">{panchang.abhijitMuhurat ?? "Unavailable for this location/date"}</p>
            <p className="mt-2 text-sm naksh-muted-text">{panchang.date} · {panchang.location} · {panchang.timezone} · Nakshatra: {panchang.nakshatra} · Tithi: {panchang.tithi}</p>
            <p className="mt-3 text-xs leading-6 naksh-muted-text">The displayed Abhijit interval is the middle one-fifteenth of local daylight, calculated from sunrise and sunset. Lunar values are sampled at local noon. This is not a personal wedding or ritual muhurat. Select your city and date in Panchang. Independently cross-check important ceremony timings.</p>
          </CardContent>
        </Card>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category} className="border-[#D4AF37]/20 bg-[#061D3C]/75">
              <CardContent className="p-5">
                <Sparkles className="h-5 w-5 text-[#FFD700]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold">{category}</h2>
                <p className="mt-3 text-sm leading-6 naksh-muted-text">Use location, panchang, lunar day, nakshatra, and family context before finalizing this timing.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
