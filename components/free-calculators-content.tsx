"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarDays, Clock3, Grid3X3, HeartHandshake, MoonStar, Search, Sparkles, WandSparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type CalculatorStatus = "active" | "soon";
type CalculatorItem = {
  id: string;
  group: "kundli" | "numerology" | "matching" | "tarot" | "horoscope";
  status: CalculatorStatus;
  href?: string;
  icon: LucideIcon;
  title: Record<Locale, string>;
  copy: Record<Locale, string>;
  required: Record<Locale, string>;
  engine: string;
};

const calculators: CalculatorItem[] = [
  active("free-kundli", "kundli", "/kundli", MoonStar, "Free Kundli Calculator", "मुफ़्त कुंडली कैलकुलेटर", "Free Kundli Calculator", "Generate a birth-chart foundation using complete birth details.", "पूर्ण जन्म विवरण से कुंडली आधार बनाएं।", "Complete birth details se Kundli foundation banayein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli"),
  active("match-making", "matching", "/matchmaking", HeartHandshake, "Match Making Calculator", "कुंडली मिलान कैलकुलेटर", "Match Making Calculator", "Review compatibility through the existing matching module.", "मौजूदा मिलान module से compatibility समझें।", "Existing matching module se compatibility review karein.", "Bride and groom full birth details.", "वधू और वर के पूर्ण जन्म विवरण।", "Bride aur groom full birth details.", "Match Making"),
  active("numerology", "numerology", "/numerology", WandSparkles, "Numerology Calculator", "अंक ज्योतिष कैलकुलेटर", "Numerology Calculator", "Calculate core numbers, name vibration, and daily numerology.", "मुख्य अंक, नाम vibration और daily numerology देखें।", "Core numbers, name vibration aur daily numerology calculate karein.", "Full name and date of birth.", "पूरा नाम और जन्म तिथि।", "Full name aur DOB.", "Numerology"),
  active("lo-shu", "numerology", "/free-calculators/lo-shu-grid-calculator", Grid3X3, "Lo Shu Grid Calculator", "लो शू ग्रिड कैलकुलेटर", "Lo Shu Grid Calculator", "Understand missing, repeated, and present numbers in the Lo Shu grid.", "लो शू grid में उपस्थित, अनुपस्थित और दोहराए गए अंक समझें।", "Lo Shu grid mein present, missing aur repeated numbers samjhein.", "Date of birth.", "जन्म तिथि।", "DOB.", "Numerology / Lo Shu"),
  active("name-number", "numerology", "/free-calculators/name-number-calculator", Sparkles, "Name Number Calculator", "नामांक कैलकुलेटर", "Name Number Calculator", "Review name number and name compatibility guidance.", "नामांक और नाम compatibility guidance देखें।", "Naamank aur name compatibility guidance dekhein.", "Full name and date of birth.", "पूरा नाम और जन्म तिथि।", "Full name aur DOB.", "Numerology"),
  active("mobile-number", "numerology", "/free-calculators/mobile-number-calculator", Search, "Mobile Number Calculator", "मोबाइल नंबर कैलकुलेटर", "Mobile Number Calculator", "Reflect on mobile number total and Lo Shu support.", "मोबाइल नंबर total और Lo Shu support समझें।", "Mobile number total aur Lo Shu support samjhein.", "Full name, date of birth, mobile number.", "पूरा नाम, जन्म तिथि, मोबाइल नंबर।", "Full name, DOB, mobile number.", "Numerology"),
  active("vehicle-number", "numerology", "/free-calculators/vehicle-number-calculator", Clock3, "Vehicle Number Calculator", "वाहन नंबर कैलकुलेटर", "Vehicle Number Calculator", "Review vehicle number compatibility without guaranteed claims.", "वाहन नंबर compatibility को बिना guarantee claims के समझें।", "Vehicle number compatibility bina guarantee claims ke dekhein.", "Full name, date of birth, vehicle number.", "पूरा नाम, जन्म तिथि, वाहन नंबर।", "Full name, DOB, vehicle number.", "Numerology"),
  active("tarot", "tarot", "/tarot", BookOpen, "Tarot Reading", "टैरो रीडिंग", "Tarot Reading", "Ask a focused question and receive reflective tarot guidance.", "एक focused question पूछें और reflective tarot guidance पाएं।", "Focused question poochein aur reflective tarot guidance paayen.", "Question or selected category.", "प्रश्न या चुनी हुई category।", "Question ya selected category.", "Tarot"),
  active("dasha", "kundli", "/free-calculators/dasha-calculator", CalendarDays, "Dasha Calculator", "दशा कैलकुलेटर", "Dasha Calculator", "Calculate current Vimshottari Mahadasha and Antardasha from complete birth details.", "पूर्ण जन्म विवरण से वर्तमान Vimshottari महादशा और अंतर्दशा देखें।", "Complete birth details se current Vimshottari Mahadasha aur Antardasha dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli / Dasha"),
  active("nakshatra", "kundli", "/free-calculators/nakshatra-calculator", MoonStar, "Nakshatra Calculator", "नक्षत्र कैलकुलेटर", "Nakshatra Calculator", "Find birth Nakshatra, Pada, Moon sign, and focused guidance.", "जन्म नक्षत्र, पाद, चंद्र राशि और focused guidance देखें।", "Birth Nakshatra, Pada, Moon sign aur focused guidance dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli / Nakshatra"),
  active("moon-sign", "kundli", "/free-calculators/moon-sign-calculator", MoonStar, "Moon Sign Calculator", "चंद्र राशि कैलकुलेटर", "Moon Sign Calculator", "Find Chandra Rashi and emotional guidance.", "चंद्र राशि और emotional guidance देखें।", "Chandra Rashi aur emotional guidance dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli"),
  active("lagna", "kundli", "/free-calculators/lagna-calculator", MoonStar, "Lagna Calculator", "लग्न कैलकुलेटर", "Lagna Calculator", "Find Lagna and personality direction.", "लग्न और personality direction देखें।", "Lagna aur personality direction dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli"),
  active("manglik", "kundli", "/free-calculators/manglik-calculator", HeartHandshake, "Manglik Calculator", "मांगलिक कैलकुलेटर", "Manglik Calculator", "Check Manglik indication with calm guidance.", "मांगलिक संकेत को शांत guidance के साथ देखें।", "Manglik indication calm guidance ke saath dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli / Dosha"),
  active("yoga", "kundli", "/free-calculators/yoga-calculator", Sparkles, "Yoga Calculator", "योग कैलकुलेटर", "Yoga Calculator", "Review important Kundli yoga indicators.", "महत्वपूर्ण Kundli yoga indicators देखें।", "Important Kundli yoga indicators dekhein.", "Name, gender, date of birth, time of birth, birth place.", "नाम, लिंग, जन्म तिथि, जन्म समय, जन्म स्थान।", "Name, gender, DOB, time, birth place.", "Kundli / Yoga"),
  active("destiny", "numerology", "/free-calculators/destiny-number-calculator", WandSparkles, "Destiny Number Calculator", "भाग्यांक कैलकुलेटर", "Destiny Number Calculator", "Calculate Bhagyank / Life Path from DOB.", "DOB से भाग्यांक / Life Path देखें।", "DOB se Bhagyank / Life Path dekhein.", "Date of birth.", "जन्म तिथि।", "DOB.", "Numerology"),
  active("personality", "numerology", "/free-calculators/personality-number-calculator", Sparkles, "Personality Number Calculator", "व्यक्तित्व अंक कैलकुलेटर", "Personality Number Calculator", "Calculate outer expression from name.", "नाम से outer expression देखें।", "Name se outer expression dekhein.", "Full name.", "पूरा नाम।", "Full name.", "Numerology"),
  active("guna", "matching", "/free-calculators/guna-milan-calculator", HeartHandshake, "Guna Milan Calculator", "गुण मिलान कैलकुलेटर", "Guna Milan Calculator", "Calculate focused Ashtakoot score.", "Focused Ashtakoot score देखें।", "Focused Ashtakoot score dekhein.", "Bride and groom full birth details.", "वधू और वर के पूर्ण जन्म विवरण।", "Bride aur groom full birth details.", "Match Making"),
  active("nadi", "matching", "/free-calculators/nadi-dosha-calculator", HeartHandshake, "Nadi Dosha Calculator", "नाड़ी दोष कैलकुलेटर", "Nadi Dosha Calculator", "Check focused Nadi compatibility.", "Focused Nadi compatibility देखें।", "Focused Nadi compatibility dekhein.", "Bride and groom full birth details.", "वधू और वर के पूर्ण जन्म विवरण।", "Bride aur groom full birth details.", "Match Making"),
  active("bhakoot", "matching", "/free-calculators/bhakoot-calculator", HeartHandshake, "Bhakoot Calculator", "भकूट कैलकुलेटर", "Bhakoot Calculator", "Check focused Bhakoot compatibility.", "Focused Bhakoot compatibility देखें।", "Focused Bhakoot compatibility dekhein.", "Bride and groom full birth details.", "वधू और वर के पूर्ण जन्म विवरण।", "Bride aur groom full birth details.", "Match Making"),
  active("marriage-suitability", "matching", "/free-calculators/marriage-suitability-calculator", HeartHandshake, "Marriage Suitability Calculator", "विवाह उपयुक्तता कैलकुलेटर", "Marriage Suitability Calculator", "Review focused marriage suitability guidance.", "Focused marriage suitability guidance देखें।", "Focused marriage suitability guidance dekhein.", "Bride and groom full birth details.", "वधू और वर के पूर्ण जन्म विवरण।", "Bride aur groom full birth details.", "Match Making")
];

const filters = ["all", "kundli", "numerology", "matching", "tarot", "horoscope"] as const;

export function FreeCalculatorsContent() {
  const { locale } = useLanguage();
  const labels = calculatorLabels(locale);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const visible = useMemo(() => calculators.filter((item) => filter === "all" || item.group === filter), [filter]);
  const grouped = [
    ["kundli", labels.groups.kundli],
    ["numerology", labels.groups.numerology],
    ["matching", labels.groups.matching],
    ["tarot", labels.groups.tarot]
  ] as const;

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div
          className="inner-section rounded-3xl p-6 md:p-8"
          style={{
            background: "rgba(255, 255, 255, 0.74)",
            backdropFilter: "blur(10px) saturate(130%)",
            border: "1px solid rgba(255, 255, 255, 0.62)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72), 0 16px 48px rgba(0,0,0,0.14)"
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c98924]">{labels.eyebrow}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#17181d] sm:text-5xl">{labels.title}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#525866]">{labels.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                  filter === item
                    ? "border-[#c98924] bg-[#c98924]/15 text-[#c98924]"
                    : "border-[rgba(255,255,255,0.50)] bg-[rgba(255,255,255,0.52)] text-[#525866] hover:bg-white/60"
                }`}
              >
                {labels.filters[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8">
          {grouped.map(([group, title]) => {
            const items = visible.filter((item) => item.group === group);
            if (!items.length) return null;
            return (
              <section key={group}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="font-cinzel text-2xl font-black text-white">{title}</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {items.map((item) => <CalculatorCard key={item.id} item={item} labels={labels} locale={locale} />)}
                </div>
              </section>
            );
          })}
        </div>
      </Section>
    </main>
  );
}

function CalculatorCard({ item, labels, locale }: { item: CalculatorItem; labels: ReturnType<typeof calculatorLabels>; locale: Locale }) {
  const Icon = item.icon;
  const content = (
    <Card className={`inner-card h-full transition-all duration-300 ${item.status === "active" ? "hover:-translate-y-1 hover:border-[#c98924]/45" : "opacity-80"}`}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-[rgba(201,137,36,0.25)] bg-[rgba(201,137,36,0.08)] text-[#c98924]">
            <Icon className="h-5 w-5" />
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.status === "active" ? "border-[rgba(22,163,74,0.35)] bg-[rgba(22,163,74,0.06)] text-[#16a34a]" : "border-[rgba(255,255,255,0.40)] bg-[rgba(255,255,255,0.50)] text-[#525866]"}`}>
            {item.status === "active" ? labels.active : labels.comingSoon}
          </span>
        </div>
        <h3 className="mt-4 font-cinzel text-xl font-bold text-[#17181d]">{item.title[locale]}</h3>
        <p className="mt-2 text-sm leading-6 text-[#525866]">{item.copy[locale]}</p>
        <div
          className="mt-4 rounded-xl p-3 text-xs leading-5"
          style={{
            background: "rgba(255, 255, 255, 0.52)",
            border: "1px solid rgba(255, 255, 255, 0.50)",
            color: "#525866"
          }}
        >
          <p className="font-semibold text-[#17181d]">{labels.requiredDetails}</p>
          <p className="mt-1">{item.required[locale]}</p>
        </div>
        <p className="mt-3 text-xs text-[#525866]">{labels.engine}: {item.engine}</p>
        <div className="mt-auto pt-5">
          {item.status === "active" && item.href ? (
            <Button className="w-full bg-[#c98924] text-white hover:bg-[#c98924]/90" asChild><Link href={item.href}>{labels.openCalculator}</Link></Button>
          ) : (
            <Button className="w-full cursor-not-allowed" variant="outline" disabled>{labels.comingSoon}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
  return content;
}

function active(id: string, group: CalculatorItem["group"], href: string, icon: LucideIcon, en: string, hi: string, hinglish: string, copyEn: string, copyHi: string, copyHinglish: string, reqEn: string, reqHi: string, reqHinglish: string, engine: string): CalculatorItem {
  return { id, group, status: "active", href, icon, title: { en, hi, hinglish }, copy: { en: copyEn, hi: copyHi, hinglish: copyHinglish }, required: { en: reqEn, hi: reqHi, hinglish: reqHinglish }, engine };
}



function calculatorLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      eyebrow: "Free Tools Hub",
      title: "मुफ़्त ज्योतिष कैलकुलेटर",
      subtitle: "कुंडली, मिलान, अंक ज्योतिष, लो शू, नामांक, मोबाइल नंबर, वाहन नंबर, टैरो और अन्य कैलकुलेटर देखें।",
      active: "सक्रिय",
      comingSoon: "जल्द आ रहा है",
      requiredDetails: "आवश्यक विवरण",
      openCalculator: "कैलकुलेटर खोलें",
      engine: "इंजन",
      filters: { all: "सभी", active: "सक्रिय", soon: "जल्द आ रहा है", kundli: "कुंडली", numerology: "अंक ज्योतिष", matching: "मिलान", tarot: "टैरो", horoscope: "राशिफल" },
      groups: { kundli: "कुंडली कैलकुलेटर", numerology: "अंक ज्योतिष कैलकुलेटर", matching: "मिलान कैलकुलेटर", tarot: "टैरो और आध्यात्मिक टूल्स", horoscope: "राशिफल और समय — जल्द आ रहा है" }
    };
  }
  if (locale === "hinglish") {
    return {
      eyebrow: "Free Tools Hub",
      title: "Free Astrology Calculators",
      subtitle: "Kundli, Milan, Numerology, Lo Shu, Name Number, Mobile Number, Vehicle Number, Tarot aur more calculators explore karein.",
      active: "Active",
      comingSoon: "Coming Soon",
      requiredDetails: "Required details",
      openCalculator: "Open Calculator",
      engine: "Engine",
      filters: { all: "All", active: "Active", soon: "Coming Soon", kundli: "Kundli", numerology: "Numerology", matching: "Matching", tarot: "Tarot", horoscope: "Horoscope" },
      groups: { kundli: "Kundli Calculators", numerology: "Numerology Calculators", matching: "Match Making Calculators", tarot: "Tarot & Spiritual Tools", horoscope: "Horoscope & Timing — Coming Soon" }
    };
  }
  return {
    eyebrow: "Free Tools Hub",
    title: "Free Astrology Calculators",
    subtitle: "Explore Naksharix calculators for Kundli, Match Making, Numerology, Lo Shu, name number, mobile number, vehicle number, tarot, and more.",
    active: "Active",
    comingSoon: "Coming Soon",
    requiredDetails: "Required details",
    openCalculator: "Open Calculator",
    engine: "Engine",
    filters: { all: "All", active: "Active", soon: "Coming Soon", kundli: "Kundli", numerology: "Numerology", matching: "Matching", tarot: "Tarot", horoscope: "Horoscope" },
    groups: { kundli: "Kundli Calculators", numerology: "Numerology Calculators", matching: "Match Making Calculators", tarot: "Tarot & Spiritual Tools", horoscope: "Horoscope & Timing — Coming Soon" }
  };
}
