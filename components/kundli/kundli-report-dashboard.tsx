"use client";

import type { ReactNode } from "react";
import { CalendarDays, Clock, MapPin, Moon, Sparkles, Star, Sun, Sunrise, Sunset } from "lucide-react";
import { NorthIndianChart } from "@/components/kundli/north-indian-chart";
import { useLanguage } from "@/components/language-provider";
import { translateAstroValue, translatePlanet, translateSign, type AstroValueCategory, type ChartHouse, type ChartLanguage, type ChartType } from "@/lib/kundli/chart-mapping";

type PlanetPosition = {
  planet?: string;
  sign?: string;
  house?: number;
  degree?: number;
  nakshatra?: string;
  pada?: number;
  dignity?: string;
};

type DashboardReport = {
  planetPositions?: PlanetPosition[];
  charts?: {
    lagna?: Array<{ house?: number; sign?: string; planets?: string[] }>;
    navamsa?: Array<{ house?: number; sign?: string; planets?: string[] }>;
  };
  panchang?: {
    tithi?: string;
    paksha?: string;
    vaar?: string;
    nakshatra?: string;
    yoga?: string;
    karan?: string;
    sunrise?: string;
    sunset?: string;
  };
  avakhada?: {
    moonSign?: string;
    ascendant?: string;
    nakshatra?: string;
  };
  birthDetails?: {
    birthPlace?: string;
    timezone?: string;
  };
};

export function KundliReportDashboard({ report, language }: { report: DashboardReport; language: ChartLanguage }) {
  const { tr } = useLanguage();
  const labels = dashboardLabels(language);
  const fallback = tr("notAvailable");

  return (
    <section className="rounded-3xl border border-[#1e293b] bg-[radial-gradient(circle_at_12%_6%,rgba(220,169,86,0.12),transparent_28rem),linear-gradient(135deg,#0a1224,#020612_76%)] p-4 shadow-[0_24px_80px_rgba(0,5,16,0.46)] sm:p-6">
      <ReportSectionHeader eyebrow={labels.dashboard} title={labels.title} />

      <div className="space-y-6">
        <div>
          <PanelTitle title={labels.chartsSection} />
          <div className="grid gap-5 xl:grid-cols-2">
            <NorthIndianChart data={buildNorthIndianChart("D1", report, language)} />
            <NorthIndianChart data={buildNorthIndianChart("D9", report, language)} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
          <div className="min-w-0">
            <PanelTitle title={labels.middlePanel} />
            <PlanetaryPositionTable planets={report.planetPositions ?? []} labels={labels} fallback={fallback} language={language} />
          </div>

          <div>
            <PanelTitle title={labels.rightPanel} />
            <BirthPanchangPanel report={report} labels={labels} fallback={fallback} language={language} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportSectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#dca956]">{eyebrow}</p>
        <h3 className="font-cinzel text-2xl font-black text-[#f3d382] sm:text-3xl">{title}</h3>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[#dca956]/60 via-[#00f5a0]/20 to-transparent sm:max-w-sm" />
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <h4 className="mb-3 flex items-center gap-2 font-cinzel text-lg font-bold text-[#f3d382]"><Sparkles className="h-4 w-4 text-[#dca956]" />{title}</h4>;
}

function PlanetaryPositionTable({
  planets,
  labels,
  fallback,
  language
}: {
  planets: PlanetPosition[];
  labels: ReturnType<typeof dashboardLabels>;
  fallback: string;
  language: ChartLanguage;
}) {
  const rows = planets.length ? planets : [{ planet: undefined, sign: undefined, house: undefined, degree: undefined, nakshatra: undefined, pada: undefined, dignity: undefined }];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0a1224] shadow-[0_18px_48px_rgba(0,5,16,0.34)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm text-[#ffffff]">
          <thead className="sticky top-0 z-10 bg-[#0f1c3a] font-cinzel text-xs uppercase tracking-[0.13em] text-[#f3d382]">
            <tr>
              <Th>{labels.planet}</Th>
              <Th>{labels.sign}</Th>
              <Th>{labels.house}</Th>
              <Th>{labels.degree}</Th>
              <Th>{labels.nakshatra}</Th>
              <Th>{labels.pada}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((planet, index) => (
              <tr key={`${planet.planet ?? "missing"}-${index}`} className="border-t border-[#1e293b] transition odd:bg-[#0f1c3a] even:bg-[#0a1224] hover:bg-[#102247]">
                <Td strong>{valueOrFallback(translatePlanet(planet.planet, language), fallback)}</Td>
                <Td>{valueOrFallback(translateSign(planet.sign, language), fallback)}</Td>
                <Td>{valueOrFallback(planet.house, fallback)}</Td>
                <Td>{typeof planet.degree === "number" ? `${planet.degree.toFixed(2)}°` : fallback}</Td>
                <Td>{valueOrFallback(translateAstroValue(planet.nakshatra, language, "nakshatra"), fallback)}</Td>
                <Td>{valueOrFallback(planet.pada, fallback)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BirthPanchangPanel({
  report,
  labels,
  fallback,
  language
}: {
  report: DashboardReport;
  labels: ReturnType<typeof dashboardLabels>;
  fallback: string;
  language: ChartLanguage;
}) {
  const items = [
    { label: labels.tithi, value: report.panchang?.tithi, icon: Moon, category: "tithi" },
    { label: labels.paksha, value: report.panchang?.paksha, icon: CalendarDays, category: "paksha" },
    { label: labels.vaar, value: report.panchang?.vaar, icon: Sun, category: "weekday" },
    { label: labels.nakshatra, value: report.panchang?.nakshatra ?? report.avakhada?.nakshatra, icon: Star, category: "nakshatra" },
    { label: labels.yoga, value: report.panchang?.yoga, icon: Sparkles, category: "yoga" },
    { label: labels.karan, value: report.panchang?.karan, icon: CalendarDays, category: "karan" },
    { label: labels.sunrise, value: report.panchang?.sunrise, icon: Sunrise },
    { label: labels.sunset, value: report.panchang?.sunset, icon: Sunset },
    { label: labels.moonSign, value: translateSign(report.avakhada?.moonSign, language), icon: Moon },
    { label: labels.lagna, value: translateSign(report.avakhada?.ascendant, language), icon: Star },
    { label: labels.timezone, value: report.birthDetails?.timezone, icon: Clock },
    { label: labels.birthPlace, value: report.birthDetails?.birthPlace, icon: MapPin }
  ];

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0a1224] p-3 shadow-[0_18px_48px_rgba(0,5,16,0.34)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 rounded-xl border border-[#1e293b] bg-[#0f1c3a] p-3 text-[#ffffff] shadow-[inset_0_1px_0_rgba(243,211,130,0.05)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#dca956]/10 text-[#dca956]">
              <item.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">{item.label}</span>
              <span className="mt-1 block break-words text-sm font-bold text-[#ffffff]">{valueOrFallback(item.category ? translateAstroValue(item.value, language, item.category as AstroValueCategory) : item.value, fallback)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return <td className={`px-4 py-3.5 align-top ${strong ? "font-bold text-[#f3d382]" : "text-[#ffffff]"}`}>{children}</td>;
}

function valueOrFallback(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function buildNorthIndianChart(chartType: ChartType, report: DashboardReport, language: ChartLanguage) {
  const sourceHouses = chartType === "D1" ? report.charts?.lagna : report.charts?.navamsa;
  const ascendantSign = sourceHouses?.find((house) => house.house === 1)?.sign || report.avakhada?.ascendant || "Aries";
  const houses = normalizeChartHouses(sourceHouses, chartType === "D1" ? report.planetPositions : undefined, ascendantSign);
  return {
    chartType,
    ascendantSign,
    language,
    houses
  };
}

function normalizeChartHouses(
  sourceHouses: Array<{ house?: number; sign?: string; planets?: string[] }> | undefined,
  planetPositions: PlanetPosition[] | undefined,
  ascendantSign: string
): ChartHouse[] {
  return (sourceHouses ?? [])
    .filter((house): house is { house: number; sign?: string; planets?: string[] } => typeof house.house === "number")
    .slice(0, 12)
    .map((house) => ({
      house: house.house,
      sign: house.sign || signForHouse(ascendantSign, house.house),
      signLord: signLordFor(house.sign || signForHouse(ascendantSign, house.house)),
      planets: (house.planets ?? []).map((planetName) => {
        const details = planetPositions?.find((planet) => planet.planet === planetName || planet.planet?.toLowerCase() === planetName.toLowerCase());
        return {
          planet: planetName,
          degree: details?.degree,
          nakshatra: details?.nakshatra,
          pada: details?.pada
        };
      })
    }));
}

function signForHouse(ascendantSign: string, house: number) {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const start = Math.max(0, signs.indexOf(ascendantSign));
  return signs[(start + house - 1) % signs.length];
}

function signLordFor(sign: string) {
  const lords: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
  return lords[sign] ?? "Planet";
}

function dashboardLabels(language: ChartLanguage) {
  if (language === "hi") {
    return {
      dashboard: "कुंडली रिपोर्ट",
      title: "चार्ट, ग्रह स्थिति और जन्म पंचांग",
      chartsSection: "चार्ट",
      middlePanel: "ग्रह स्थिति तालिका",
      rightPanel: "जन्म पंचांग",
      planet: "ग्रह",
      sign: "राशि",
      house: "भाव",
      degree: "डिग्री",
      nakshatra: "नक्षत्र",
      pada: "पद",
      dignity: "बल स्थिति",
      tithi: "तिथि",
      paksha: "पक्ष",
      vaar: "वार",
      yoga: "योग",
      karan: "करण",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      moonSign: "चंद्र राशि",
      lagna: "लग्न",
      timezone: "समय क्षेत्र",
      birthPlace: "जन्म स्थान"
    };
  }
  if (language === "hinglish") {
    return {
      dashboard: "Kundli Report",
      title: "Charts, Grah Positions aur Janm Panchang",
      chartsSection: "Charts",
      middlePanel: "Grah Position Table",
      rightPanel: "Janm Panchang",
      planet: "Grah",
      sign: "Rashi",
      house: "Bhav",
      degree: "Degree",
      nakshatra: "Nakshatra",
      pada: "Pada",
      dignity: "Dignity",
      tithi: "Tithi",
      paksha: "Paksha",
      vaar: "Vaar",
      yoga: "Yoga",
      karan: "Karan",
      sunrise: "Sunrise",
      sunset: "Sunset",
      moonSign: "Moon Sign",
      lagna: "Lagna",
      timezone: "Timezone",
      birthPlace: "Birth Place"
    };
  }
  return {
    dashboard: "Kundli Report",
    title: "Charts, Planetary Positions and Birth Panchang",
    chartsSection: "Charts",
    middlePanel: "Planetary Position Table",
    rightPanel: "Birth Panchang",
    planet: "Planet",
    sign: "Sign",
    house: "House",
    degree: "Degree",
    nakshatra: "Nakshatra",
    pada: "Pada",
    dignity: "Dignity",
    tithi: "Tithi",
    paksha: "Paksha",
    vaar: "Vara",
    yoga: "Yoga",
    karan: "Karana",
    sunrise: "Sunrise",
    sunset: "Sunset",
    moonSign: "Moon Sign",
    lagna: "Lagna",
    timezone: "Timezone",
    birthPlace: "Birth Place"
  };
}
