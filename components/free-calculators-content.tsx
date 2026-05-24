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
  active("lo-shu", "numerology", "/numerology", Grid3X3, "Lo Shu Grid Calculator", "लो शू ग्रिड कैलकुलेटर", "Lo Shu Grid Calculator", "Understand missing, repeated, and present numbers in the Lo Shu grid.", "लो शू grid में उपस्थित, अनुपस्थित और दोहराए गए अंक समझें।", "Lo Shu grid mein present, missing aur repeated numbers samjhein.", "Date of birth.", "जन्म तिथि।", "DOB.", "Numerology / Lo Shu"),
  active("name-number", "numerology", "/numerology", Sparkles, "Name Number Calculator", "नामांक कैलकुलेटर", "Name Number Calculator", "Review name number and name compatibility guidance.", "नामांक और नाम compatibility guidance देखें।", "Naamank aur name compatibility guidance dekhein.", "Full name and date of birth.", "पूरा नाम और जन्म तिथि।", "Full name aur DOB.", "Numerology"),
  active("mobile-number", "numerology", "/numerology", Search, "Mobile Number Calculator", "मोबाइल नंबर कैलकुलेटर", "Mobile Number Calculator", "Reflect on mobile number total and Lo Shu support.", "मोबाइल नंबर total और Lo Shu support समझें।", "Mobile number total aur Lo Shu support samjhein.", "Full name, date of birth, mobile number.", "पूरा नाम, जन्म तिथि, मोबाइल नंबर।", "Full name, DOB, mobile number.", "Numerology"),
  active("vehicle-number", "numerology", "/numerology", Clock3, "Vehicle Number Calculator", "वाहन नंबर कैलकुलेटर", "Vehicle Number Calculator", "Review vehicle number compatibility without guaranteed claims.", "वाहन नंबर compatibility को बिना guarantee claims के समझें।", "Vehicle number compatibility bina guarantee claims ke dekhein.", "Full name, date of birth, vehicle number.", "पूरा नाम, जन्म तिथि, वाहन नंबर।", "Full name, DOB, vehicle number.", "Numerology"),
  active("tarot", "tarot", "/tarot", BookOpen, "Tarot Reading", "टैरो रीडिंग", "Tarot Reading", "Ask a focused question and receive reflective tarot guidance.", "एक focused question पूछें और reflective tarot guidance पाएं।", "Focused question poochein aur reflective tarot guidance paayen.", "Question or selected category.", "प्रश्न या चुनी हुई category।", "Question ya selected category.", "Tarot"),
  ...[
    ["dasha", "kundli", "Dasha Calculator", "दशा कैलकुलेटर", "Dasha Calculator"],
    ["moon-sign", "kundli", "Moon Sign Calculator", "चंद्र राशि कैलकुलेटर", "Moon Sign Calculator"],
    ["nakshatra", "kundli", "Nakshatra Calculator", "नक्षत्र कैलकुलेटर", "Nakshatra Calculator"],
    ["lagna", "kundli", "Lagna Calculator", "लग्न कैलकुलेटर", "Lagna Calculator"],
    ["manglik", "kundli", "Manglik Calculator", "मांगलिक कैलकुलेटर", "Manglik Calculator"],
    ["yoga", "kundli", "Yoga Calculator", "योग कैलकुलेटर", "Yoga Calculator"],
    ["chalit", "kundli", "Chalit Chart Calculator", "चलित चार्ट कैलकुलेटर", "Chalit Chart Calculator"],
    ["d9", "kundli", "Navamsa / D9 Calculator", "नवांश / D9 कैलकुलेटर", "Navamsa / D9 Calculator"],
    ["destiny", "numerology", "Destiny Number Calculator", "भाग्यांक कैलकुलेटर", "Destiny Number Calculator"],
    ["personality", "numerology", "Personality Number Calculator", "व्यक्तित्व अंक कैलकुलेटर", "Personality Number Calculator"],
    ["lucky-date", "numerology", "Lucky Date Calculator", "शुभ तिथि कैलकुलेटर", "Lucky Date Calculator"],
    ["lucky-color", "numerology", "Lucky Color Calculator", "शुभ रंग कैलकुलेटर", "Lucky Color Calculator"],
    ["baby-name", "numerology", "Baby Name Calculator", "बेबी नाम कैलकुलेटर", "Baby Name Calculator"],
    ["guna", "matching", "Guna Milan Calculator", "गुण मिलान कैलकुलेटर", "Guna Milan Calculator"],
    ["nadi", "matching", "Nadi Dosha Calculator", "नाड़ी दोष कैलकुलेटर", "Nadi Dosha Calculator"],
    ["bhakoot", "matching", "Bhakoot Calculator", "भकूट कैलकुलेटर", "Bhakoot Calculator"],
    ["marriage-suitability", "matching", "Marriage Suitability Calculator", "विवाह उपयुक्तता कैलकुलेटर", "Marriage Suitability Calculator"],
    ["daily-horoscope", "horoscope", "Daily Horoscope", "दैनिक राशिफल", "Daily Horoscope"],
    ["weekly-horoscope", "horoscope", "Weekly Horoscope", "साप्ताहिक राशिफल", "Weekly Horoscope"],
    ["monthly-horoscope", "horoscope", "Monthly Horoscope", "मासिक राशिफल", "Monthly Horoscope"],
    ["yearly-horoscope", "horoscope", "Yearly Horoscope", "वार्षिक राशिफल", "Yearly Horoscope"],
    ["panchang", "horoscope", "Panchang", "पंचांग", "Panchang"],
    ["muhurat", "horoscope", "Muhurat Calculator", "मुहूर्त कैलकुलेटर", "Muhurat Calculator"],
    ["transit", "horoscope", "Transit Calculator", "गोचर कैलकुलेटर", "Transit Calculator"],
    ["sade-sati", "horoscope", "Sade Sati Calculator", "साढ़े साती कैलकुलेटर", "Sade Sati Calculator"],
    ["rahu-ketu", "horoscope", "Rahu Ketu Calculator", "राहु केतु कैलकुलेटर", "Rahu Ketu Calculator"]
  ].map(([id, group, en, hi, hinglish]) => soon(id, group as CalculatorItem["group"], en, hi, hinglish))
];

const filters = ["all", "active", "soon", "kundli", "numerology", "matching", "tarot", "horoscope"] as const;

export function FreeCalculatorsContent() {
  const { locale } = useLanguage();
  const labels = calculatorLabels(locale);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const visible = useMemo(() => calculators.filter((item) => filter === "all" || item.status === filter || item.group === filter), [filter]);
  const grouped = [
    ["kundli", labels.groups.kundli],
    ["numerology", labels.groups.numerology],
    ["matching", labels.groups.matching],
    ["tarot", labels.groups.tarot],
    ["horoscope", labels.groups.horoscope]
  ] as const;

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{labels.eyebrow}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === item ? "border-[#dca956] bg-[#dca956]/15 text-[#f3d382]" : "border-[#263957] bg-[#111f3a] text-[#a8b3c7] hover:border-[#dca956]/50 hover:text-white"}`}>
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
                  <h2 className="font-cinzel text-2xl font-black text-[#f3d382]">{title}</h2>
                  {group === "horoscope" ? <span className="rounded-full border border-[#dca956]/30 bg-[#dca956]/10 px-3 py-1 text-xs text-[#f3d382]">{labels.comingSoon}</span> : null}
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
    <Card className={`inner-card h-full transition ${item.status === "active" ? "hover:-translate-y-1 hover:border-[#00f5a0]/45" : "opacity-82"}`}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#dca956]/25 bg-[#dca956]/10 text-[#f3d382]">
            <Icon className="h-5 w-5" />
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.status === "active" ? "border-[#00f5a0]/35 bg-[#00f5a0]/10 text-[#00f5a0]" : "border-[#dca956]/30 bg-[#dca956]/10 text-[#f3d382]"}`}>
            {item.status === "active" ? labels.active : labels.comingSoon}
          </span>
        </div>
        <h3 className="mt-4 font-cinzel text-xl font-bold text-white">{item.title[locale]}</h3>
        <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{item.copy[locale]}</p>
        <div className="mt-4 rounded-xl border border-[#263957] bg-[#142647]/60 p-3 text-xs leading-5 text-[#a8b3c7]">
          <p className="font-semibold text-[#f3d382]">{labels.requiredDetails}</p>
          <p className="mt-1">{item.required[locale]}</p>
        </div>
        <p className="mt-3 text-xs text-[#94a3b8]">{labels.engine}: {item.engine}</p>
        <div className="mt-auto pt-5">
          {item.status === "active" && item.href ? (
            <Button className="w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild><Link href={item.href}>{labels.openCalculator}</Link></Button>
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

function soon(id: string, group: CalculatorItem["group"], en: string, hi: string, hinglish: string): CalculatorItem {
  return {
    id,
    group,
    status: "soon",
    icon: group === "numerology" ? WandSparkles : group === "matching" ? HeartHandshake : group === "horoscope" ? CalendarDays : MoonStar,
    title: { en, hi, hinglish },
    copy: {
      en: "Focused calculator planned for a future phase using existing engines where accurate data is available.",
      hi: "Accurate data उपलब्ध होने पर existing engines से future phase में focused calculator planned है।",
      hinglish: "Accurate data available hone par existing engines ke saath future phase me focused calculator planned hai."
    },
    required: {
      en: "Full input requirements will be shown at launch.",
      hi: "Launch पर complete input requirements दिखाए जाएंगे।",
      hinglish: "Launch par complete input requirements dikhaye jayenge."
    },
    engine: "Coming Soon"
  };
}

function calculatorLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      eyebrow: "Free Tools Hub",
      title: "मुफ़्त ज्योतिष कैलकुलेटर",
      subtitle: "कुंडली, मिलान, अंक ज्योतिष, लो शू, नामांक, मोबाइल नंबर, वाहन नंबर, टैरो और अन्य कैलकुलेटर देखें।",
      active: "Active",
      comingSoon: "जल्द आ रहा है",
      requiredDetails: "आवश्यक विवरण",
      openCalculator: "Calculator खोलें",
      engine: "Engine",
      filters: { all: "All", active: "Active", soon: "Coming Soon", kundli: "Kundli", numerology: "Numerology", matching: "Matching", tarot: "Tarot", horoscope: "Horoscope" },
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
