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
  delhi:   { label: "Delhi, India",        latitude: 28.6139,  longitude: 77.209,   timezone: "+05:30" },
  mumbai:  { label: "Mumbai, India",        latitude: 19.076,   longitude: 72.8777,  timezone: "+05:30" },
  newyork: { label: "New York, USA",        latitude: 40.7128,  longitude: -74.006,  timezone: "-04:00" },
  london:  { label: "London, UK",           latitude: 51.5074,  longitude: -0.1278,  timezone: "+01:00" },
  sydney:  { label: "Sydney, Australia",    latitude: -33.8688, longitude: 151.2093, timezone: "+10:00" },
} as const;

type CityKey = keyof typeof cityPresets;

export default async function PanchangPage({
  searchParams,
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
    place: city.label,
  });

  const coreRows: Array<[string, string | null]> = [
    ["Date",     panchang.date],
    ["Location", panchang.location],
    ["Timezone", panchang.timezone],
    ["Vaar",     panchang.vaar],
    ["Sunrise",  panchang.sunrise],
    ["Sunset",   panchang.sunset],
  ];
  const lunarRows: Array<[string, string | null]> = [
    ["Tithi",     `${panchang.tithi} (${panchang.paksha})`],
    ["Nakshatra", `${panchang.nakshatra} Pada ${panchang.nakshatraPada}`],
    ["Yoga",      panchang.yoga],
    ["Karana",    panchang.karana],
    ["Moonrise",  panchang.moonrise],
    ["Moonset",   panchang.moonset],
  ];
  const muhuratRows: Array<[string, string | null]> = [
    ["Rahu Kaal",       panchang.rahuKaal],
    ["Yamaganda",       panchang.yamaganda],
    ["Gulika Kaal",     panchang.gulikaKaal],
    ["Abhijit Muhurat", panchang.abhijitMuhurat],
  ];

  return (
    <main className="inner-page-shell min-h-screen">
      <Section first>
        {/* Hero header */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 mb-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(216,154,43,0.08)] border border-[rgba(216,154,43,0.18)] text-[#d89a2b]"
              >
                Provider Verified
              </span>
              <h1 className="mt-4 font-cinzel text-4xl font-black text-[#1b1c22] sm:text-5xl">
                Today&apos;s Panchang
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#5c6170]">
                Calculate core Panchang fields using Naksharix&apos;s deterministic internal ephemeris
                provider. Values may vary slightly by source, so cross-check for critical Muhurat decisions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {[
                  { icon: <MapPin className="h-4 w-4 text-[#d89a2b]" />,   label: "Location-aware" },
                  { icon: <Clock3 className="h-4 w-4 text-[#d89a2b]" />,   label: "Timezone-based" },
                  { icon: <SunMedium className="h-4 w-4 text-[#d89a2b]" />, label: "Sunrise anchored" },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/60 bg-white/40 text-[#5c6170] shadow-sm"
                  >
                    {icon}{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Date / city form card */}
            <Card>
              <CardContent className="p-5">
                <form className="grid gap-4" action="/panchang">
                  <label className="grid gap-2 text-sm font-semibold text-[#1b1c22]">
                    Date
                    <input
                      type="date"
                      name="date"
                      defaultValue={selectedDate}
                      className="naksh-input"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[#1b1c22]">
                    Location preset
                    <select
                      name="city"
                      defaultValue={selectedCity}
                      className="naksh-input"
                    >
                      {Object.entries(cityPresets).map(([key, preset]) => (
                        <option key={key} value={key}>
                          {preset.label} ({preset.timezone})
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" className="h-12">
                    <CalendarDays className="h-4 w-4" />
                    Calculate Panchang
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panchang data cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          <PanchangCard title="Core Day"      icon={<CalendarDays className="h-5 w-5" />} rows={coreRows} />
          <PanchangCard title="Lunar Details" icon={<MoonStar className="h-5 w-5" />}     rows={lunarRows} />
          <PanchangCard title="Day Windows"   icon={<Sparkles className="h-5 w-5" />}     rows={muhuratRows} />
        </div>

        {/* Trust note */}
        <Card className="mt-8">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#d89a2b]" />
              <div>
                <h2 className="font-cinzel text-xl font-bold text-[#1b1c22]">
                  Trust note
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#5c6170]">
                  Calculations are generated by Naksharix&apos;s internal ephemeris provider and may vary
                  slightly by source. Use for spiritual guidance and cross-check for critical muhurat.
                  This is provider-verified regression, not external Swiss/Jagannatha Hora verification.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/kundli">Use Kundli Generator</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/reports/premium-kundli">Explore Detailed Reports</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function PanchangCard({ title, icon, rows }: { title: string; icon: ReactNode; rows: Array<[string, string | null]> }) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <h2 className="flex items-center gap-2 font-cinzel text-xl font-bold text-[#1b1c22]">
          <span className="text-[#d89a2b]">{icon}</span>
          {title}
        </h2>
        <div className="mt-4 grid gap-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl p-3 border border-white/60 bg-white/40 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[#5c6170]">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1b1c22]">
                {value ?? "Unavailable"}
              </p>
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
