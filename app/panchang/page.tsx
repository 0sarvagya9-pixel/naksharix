import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, MoonStar, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { calculatePremiumPanchang } from "@/lib/astrology/premium-engine/panchang";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Today Panchang | Naksharix",
  description: "Calculate provider-verified Panchang fields including tithi, nakshatra, yoga, karana, Vaar, Rahu Kaal, Yamaganda, Gulika Kaal, and Abhijit Muhurat.",
  path: "/panchang",
  keywords: ["Panchang", "Today Panchang", "Tithi", "Rahu Kaal", "Abhijit Muhurat"]
});

const cityPresets = {
  delhi: { label: "Delhi, India", latitude: 28.6139, longitude: 77.209, timezone: "+05:30" },
  mumbai: { label: "Mumbai, India", latitude: 19.076, longitude: 72.8777, timezone: "+05:30" },
  newyork: { label: "New York, USA", latitude: 40.7128, longitude: -74.006, timezone: "-04:00" },
  london: { label: "London, UK", latitude: 51.5074, longitude: -0.1278, timezone: "+01:00" },
  sydney: { label: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093, timezone: "+10:00" }
} as const;

type CityKey = keyof typeof cityPresets;

export default async function PanchangPage({
  searchParams
}: {
  searchParams?: Promise<{ date?: string; city?: string }>;
}) {
  const params = await searchParams;
  const selectedCity = normalizeCity(params?.city);
  const city = cityPresets[selectedCity];
  const selectedDate = validDate(params?.date) ? params?.date ?? todayInIso() : todayInIso();
  const panchang = calculatePremiumPanchang({
    date: selectedDate,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    place: city.label
  });

  const coreRows: Array<[string, string | null]> = [
    ["Date", panchang.date],
    ["Location", panchang.location],
    ["Timezone", panchang.timezone],
    ["Vaar", panchang.vaar],
    ["Sunrise", panchang.sunrise],
    ["Sunset", panchang.sunset]
  ];
  const lunarRows: Array<[string, string | null]> = [
    ["Tithi", `${panchang.tithi} (${panchang.paksha})`],
    ["Nakshatra", `${panchang.nakshatra} Pada ${panchang.nakshatraPada}`],
    ["Yoga", panchang.yoga],
    ["Karana", panchang.karana],
    ["Moonrise", panchang.moonrise],
    ["Moonset", panchang.moonset]
  ];
  const muhuratRows: Array<[string, string | null]> = [
    ["Rahu Kaal", panchang.rahuKaal],
    ["Yamaganda", panchang.yamaganda],
    ["Gulika Kaal", panchang.gulikaKaal],
    ["Abhijit Muhurat", panchang.abhijitMuhurat]
  ];

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full border border-[#00f5a0]/35 bg-[#00f5a0]/10 px-3 py-1 text-xs font-semibold text-[#00f5a0]">Provider Verified</span>
              <h1 className="mt-4 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">Today&apos;s Panchang</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#a8b3c7]">
                Calculate core Panchang fields using Naksharix&apos;s deterministic internal ephemeris provider. Values may vary slightly by source, so cross-check for critical Muhurat decisions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#d7deec]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#263957] bg-[#0a1224]/80 px-4 py-2"><MapPin className="h-4 w-4 text-[#f3d382]" />Location-aware</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#263957] bg-[#0a1224]/80 px-4 py-2"><Clock3 className="h-4 w-4 text-[#f3d382]" />Timezone-based</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#263957] bg-[#0a1224]/80 px-4 py-2"><SunMedium className="h-4 w-4 text-[#f3d382]" />Sunrise anchored</span>
              </div>
            </div>

            <Card className="inner-card">
              <CardContent className="p-5">
                <form className="grid gap-4" action="/panchang">
                  <label className="grid gap-2 text-sm font-semibold text-white">
                    Date
                    <input
                      type="date"
                      name="date"
                      defaultValue={selectedDate}
                      className="h-11 rounded-lg border border-[#263957] bg-[#020612] px-3 text-white outline-none focus:border-[#dca956]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-white">
                    Location preset
                    <select
                      name="city"
                      defaultValue={selectedCity}
                      className="h-11 rounded-lg border border-[#263957] bg-[#020612] px-3 text-white outline-none focus:border-[#dca956]"
                    >
                      {Object.entries(cityPresets).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.label} ({preset.timezone})</option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" className="bg-[#009b72] text-white hover:bg-[#008766]">
                    <CalendarDays className="h-4 w-4" />Calculate Panchang
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <PanchangCard title="Core Day" icon={<CalendarDays className="h-5 w-5" />} rows={coreRows} />
            <PanchangCard title="Lunar Details" icon={<MoonStar className="h-5 w-5" />} rows={lunarRows} />
            <PanchangCard title="Day Windows" icon={<Sparkles className="h-5 w-5" />} rows={muhuratRows} />
          </div>

          <Card className="inner-card mt-8 border-[#dca956]/25">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#00f5a0]" />
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">Trust note</h2>
                  <p className="mt-2 text-sm leading-7 text-[#a8b3c7]">
                    Calculations are generated by Naksharix&apos;s internal ephemeris provider and may vary slightly by source. Use for spiritual guidance and cross-check for critical muhurat. This is provider-verified regression, not external Swiss/Jagannatha Hora verification.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild variant="outline"><Link href="/kundli">Use Kundli Generator</Link></Button>
                    <Button asChild variant="outline"><Link href="/reports/premium-kundli">Explore Detailed Reports</Link></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

function PanchangCard({ title, icon, rows }: { title: string; icon: ReactNode; rows: Array<[string, string | null]> }) {
  return (
    <Card className="inner-card h-full">
      <CardContent className="p-5">
        <h2 className="flex items-center gap-2 font-cinzel text-xl font-bold text-[#f3d382]">
          <span className="text-[#00f5a0]">{icon}</span>{title}
        </h2>
        <div className="mt-4 grid gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#263957] bg-[#020612]/50 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{value ?? "Unavailable"}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeCity(value?: string): CityKey {
  return value && value in cityPresets ? (value as CityKey) : "delhi";
}

function validDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function todayInIso() {
  return new Date().toISOString().slice(0, 10);
}
