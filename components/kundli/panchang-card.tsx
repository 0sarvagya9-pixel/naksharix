"use client";

import { CalendarDays, Clock, Gem, MapPin, Moon, Palette, Sparkles, Star, Sun, Sunrise, Sunset } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { translateAstroValue, type AstroValueCategory } from "@/lib/kundli/chart-mapping";

type PanchangVisualData = {
  panchang?: {
    tithi?: string;
    paksha?: string;
    vaar?: string;
    nakshatra?: string;
    nakshatraPada?: string | number;
    yoga?: string;
    karan?: string;
    sunrise?: string;
    sunset?: string;
    rahuKaal?: string;
    muhurat?: string;
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

export function PanchangCard({ data }: { data: PanchangVisualData }) {
  const { apiLocale, tr } = useLanguage();
  const fallback = tr("notAvailable");
  const items = [
    { key: "tithi", label: tr("tithi"), value: data.panchang?.tithi, icon: Moon, category: "tithi" },
    { key: "paksha", label: tr("paksha"), value: data.panchang?.paksha, icon: CalendarDays, category: "paksha" },
    { key: "vaar", label: tr("vaarDay"), value: data.panchang?.vaar, icon: Sun, category: "weekday" },
    { key: "nakshatra", label: tr("nakshatra"), value: data.panchang?.nakshatra ?? data.avakhada?.nakshatra, icon: Star, category: "nakshatra" },
    { key: "nakshatraPada", label: tr("nakshatraPada"), value: data.panchang?.nakshatraPada, icon: Sparkles },
    { key: "yoga", label: tr("yoga"), value: data.panchang?.yoga, icon: Sparkles, category: "yoga" },
    { key: "karan", label: tr("karan"), value: data.panchang?.karan, icon: CalendarDays, category: "karan" },
    { key: "sunrise", label: tr("sunrise"), value: data.panchang?.sunrise, icon: Sunrise },
    { key: "sunset", label: tr("sunset"), value: data.panchang?.sunset, icon: Sunset },
    { key: "moonSign", label: tr("moonSignRashi"), value: data.avakhada?.moonSign, icon: Moon, category: "sign" },
    { key: "lagna", label: tr("lagna"), value: data.avakhada?.ascendant, icon: Star, category: "sign" },
    { key: "ayanamsha", label: tr("ayanamsha"), value: undefined, icon: Sparkles },
    { key: "timezone", label: tr("timezone"), value: data.birthDetails?.timezone, icon: Clock },
    { key: "birthPlace", label: tr("birthPlace"), value: data.birthDetails?.birthPlace, icon: MapPin },
    { key: "luckyColor", label: tr("luckyColor"), value: tr("royalGold"), icon: Palette },
    { key: "luckyNumber", label: tr("luckyNumber"), value: "7", icon: Sparkles },
    { key: "luckyDay", label: tr("luckyDay"), value: tr("thursday"), icon: CalendarDays },
    { key: "luckyGemstone", label: tr("luckyGemstone"), value: tr("yellowSapphire"), icon: Gem }
  ];

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 shadow-[0_24px_80px_rgba(2,6,18,0.15)]"
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(10px) saturate(125%)",
        border: "1px solid rgba(255, 255, 255, 0.42)",
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[rgba(255,255,255,0.15)] opacity-50" />
      <div className="pointer-events-none absolute right-6 top-8 h-28 w-28 rounded-full border border-[rgba(255,255,255,0.12)] opacity-60" />
      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#f2c56b]">{tr("kundliGenerator")}</p>
          <h3 className="mt-2 font-cinzel text-2xl font-black text-[#fffaf0]">{tr("panchangSnapshot")}</h3>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-[#f2c56b]/60 via-[rgba(255,255,255,0.2)] to-transparent sm:max-w-xs" />
      </div>
      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <PanchangMetric
            key={item.key}
            label={item.label}
            value={formatValue(item.category ? translateAstroValue(item.value, apiLocale, item.category as AstroValueCategory) : item.value, fallback)}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}

function PanchangMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDays }) {
  return (
    <div
      className="group rounded-xl p-4 transition duration-300 hover:border-[#c98924]/45"
      style={{
        background: "rgba(255, 255, 255, 0.52)",
        border: "1px solid rgba(255, 255, 255, 0.50)"
      }}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(201,137,36,0.08)] text-[#c98924] shadow-[0_0_20px_rgba(201,137,36,0.12)]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-[0.18em] text-[#525866]">{label}</span>
          <span className="mt-1 block break-words font-cinzel text-base font-bold text-[#17181d]">{value}</span>
        </span>
      </div>
    </div>
  );
}

function formatValue(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
