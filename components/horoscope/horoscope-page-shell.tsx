"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { horoscopePageConfig } from "@/lib/horoscope/constants";
import { getHoroscopeContent, getHoroscopeOptions } from "@/lib/horoscope/content";
import type { HoroscopePageKind } from "@/lib/horoscope/types";
import type { Locale } from "@/lib/i18n";

export function HoroscopePageShell({ kind }: { kind: HoroscopePageKind }) {
  const { locale } = useLanguage();
  const config = horoscopePageConfig[kind];
  const options = useMemo(() => getHoroscopeOptions(kind), [kind]);
  const [selected, setSelected] = useState(config.defaultSlug);
  const selectedOption = options.find((option) => option.slug === selected) ?? options[0];
  const content = getHoroscopeContent(kind, selectedOption.slug);
  const labels = horoscopeLabels(locale);
  const lovePage = kind === "weekly-love";
  const chinesePage = kind === "chinese-2026";
  const numerologyPage = kind === "numerology-monthly";

  return (
    <main className="inner-page-shell min-h-screen">
      <Section first>
        {/* Hero panel */}
        <div
          className="glass-panel grid gap-8 rounded-3xl p-6 md:p-8 lg:grid-cols-[1fr_0.55fr]"
        >
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#D97706" }}
            >
              {labels.eyebrow}
            </p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#2F2418] sm:text-5xl">
              {config.titles[locale]}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8" style={{ color: "#5C4530" }}>
              {config.subtitles[locale]}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#horoscope-result">{labels.readResult}</a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={config.reportHref}>{labels.relatedReport}</Link>
              </Button>
            </div>
          </div>

          {/* Selector card */}
          <Card className="h-fit">
            <CardContent className="p-5">
              <CalendarDays className="h-6 w-6" style={{ color: "#e6941a" }} />
              <label
                htmlFor="horoscope-selector"
                className="mt-4 block text-sm font-semibold"
                style={{ color: "#1e1e1f" }}
              >
                {config.selectorLabel[locale]}
              </label>
              <select
                id="horoscope-selector"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="mt-3 w-full rounded-lg px-4 py-3 text-sm font-semibold outline-none transition border border-[rgba(20,20,20,0.08)] bg-[rgba(255,255,255,0.75)] text-[#1e1e1f]"
              >
                {options.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.labels[locale]}
                  </option>
                ))}
              </select>
              <p
                className="mt-4 rounded-xl p-3 text-xs leading-5"
                style={{
                  background: "rgba(20, 20, 20, 0.03)",
                  border: "1px solid rgba(20, 20, 20, 0.08)",
                  color: "#66666b",
                }}
              >
                {chinesePage ? labels.chineseNote : numerologyPage ? labels.numberNote : labels.zodiacNote}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Result card */}
        <Card id="horoscope-result" className="mt-10 overflow-hidden">
          <CardContent className="p-0">
            {/* Result header */}
            <div
              className="p-6 md:p-8"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(247,247,248,0.80) 100%)",
                borderBottom: "1px solid rgba(20, 20, 20, 0.08)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#e6941a" }}
              >
                {selectedOption.labels[locale]}
              </p>
              <h2 className="mt-2 font-cinzel text-3xl font-black" style={{ color: "#1e1e1f" }}>
                {content.title}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7" style={{ color: "#66666b" }}>
                {content.overview}
              </p>
            </div>

            {/* Section cards */}
            <div className="grid gap-5 p-6 md:p-8 lg:grid-cols-2">
              {content.sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.68)",
                    border: "1px solid rgba(20, 20, 20, 0.08)",
                  }}
                >
                  <h3 className="font-cinzel text-xl font-bold" style={{ color: "#1e1e1f" }}>
                    {localSectionTitle(section.title, locale)}
                  </h3>
                  <p className="mt-3 text-sm leading-7" style={{ color: "#66666b" }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucky facts */}
            <div
              className="grid gap-4 p-6 md:grid-cols-3 md:p-8"
              style={{ borderTop: "1px solid rgba(20, 20, 20, 0.08)" }}
            >
              <MiniFact label={labels.luckyColor}  value={content.luckyColor} />
              <MiniFact label={labels.luckyNumber} value={content.luckyNumber} />
              {!lovePage && !chinesePage && !numerologyPage
                ? <MiniFact label={labels.luckyTime} value={content.luckyTime ?? "-"} />
                : <MiniFact label={labels.remedy}    value={content.remedy} />}
            </div>

            {/* Dos & Don'ts */}
            <div
              className="grid gap-5 p-6 md:grid-cols-2 md:p-8"
              style={{ borderTop: "1px solid rgba(20, 20, 20, 0.08)" }}
            >
              <ListBlock title={labels.dos}   items={content.dos}   positive />
              <ListBlock title={labels.donts} items={content.donts} />
            </div>

            {/* Trust note */}
            <div
              className="p-6 md:p-8"
              style={{ borderTop: "1px solid rgba(20, 20, 20, 0.08)" }}
            >
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,255,255,0.68)",
                  border: "1px solid rgba(20, 20, 20, 0.08)",
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0" style={{ color: "#e6941a" }} />
                  <div>
                    <h3 className="font-cinzel text-xl font-bold" style={{ color: "#1e1e1f" }}>
                      {labels.trustTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-7" style={{ color: "#66666b" }}>
                      {labels.trustNote}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={config.reportHref} className="saffron-button" style={{ borderRadius: 10 }}>
                        {labels.relatedReport}
                      </Link>
                      <Link href="/kundli" className="outline-saffron-button" style={{ borderRadius: 10 }}>
                        {labels.kundliTools}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(20, 20, 20, 0.08)" }}
    >
      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "#66666b" }}>{label}</p>
      <p className="mt-2 font-cinzel text-xl font-bold" style={{ color: "#e6941a" }}>{value}</p>
    </div>
  );
}

function ListBlock({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "rgba(255,255,255,0.68)", border: "1px solid rgba(20, 20, 20, 0.08)" }}
    >
      <h3 className="font-cinzel text-xl font-bold" style={{ color: "#1e1e1f" }}>{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm" style={{ color: "#66666b" }}>
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: positive ? "#16a34a" : "#D97706" }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function horoscopeLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      eyebrow: "सामान्य राशिफल मार्गदर्शन",
      readResult: "राशिफल देखें",
      relatedReport: "संबंधित रिपोर्ट देखें",
      kundliTools: "कुंडली टूल्स देखें",
      zodiacNote: "यह पेज केवल राशि selector का उपयोग करता है; जन्म विवरण आधारित personal prediction नहीं है।",
      chineseNote: "यह पेज केवल Chinese zodiac animal selector का उपयोग करता है।",
      numberNote: "यह पेज केवल 1 से 9 तक numerology number selector का उपयोग करता है।",
      luckyColor: "लकी कलर",
      luckyNumber: "लकी नंबर",
      luckyTime: "लकी टाइम",
      remedy: "उपाय",
      dos: "क्या करें",
      donts: "क्या न करें",
      trustTitle: "विश्वास नोट",
      trustNote: "यह सामान्य राशि/साइन आधारित मार्गदर्शन है। आपकी जन्म तिथि, समय और स्थान पर आधारित व्यक्तिगत रीडिंग के लिए कुंडली टूल्स या डिटेल्ड रिपोर्ट्स देखें।"
    };
  }
  if (locale === "hinglish") {
    return {
      eyebrow: "General Horoscope Guidance",
      readResult: "Read Result",
      relatedReport: "Explore Related Report",
      kundliTools: "Explore Kundli Tools",
      zodiacNote: "Ye page sirf rashi selector use karta hai; birth-details based personal prediction nahi hai.",
      chineseNote: "Ye page sirf Chinese zodiac animal selector use karta hai.",
      numberNote: "Ye page sirf 1 to 9 numerology number selector use karta hai.",
      luckyColor: "Lucky Color",
      luckyNumber: "Lucky Number",
      luckyTime: "Lucky Time",
      remedy: "Remedy",
      dos: "Do's",
      donts: "Don'ts",
      trustTitle: "Trust Note",
      trustNote: "Yeh general rashi/sign based guidance hai. Exact birth date, time aur place based personal reading ke liye Kundli tools ya detailed reports explore karein."
    };
  }
  return {
    eyebrow: "General Horoscope Guidance",
    readResult: "Read Result",
    relatedReport: "Explore Related Report",
    kundliTools: "Explore Kundli Tools",
    zodiacNote: "This page uses only a zodiac/rashi selector; it is not a birth-details based personal prediction.",
    chineseNote: "This page uses only the Chinese zodiac animal selector.",
    numberNote: "This page uses only the numerology number selector from 1 to 9.",
    luckyColor: "Lucky Color",
    luckyNumber: "Lucky Number",
    luckyTime: "Lucky Time",
    remedy: "Remedy",
    dos: "Do's",
    donts: "Don'ts",
    trustTitle: "Trust Note",
    trustNote: "This is general sign-based guidance for self-reflection. For a personalized birth-chart based reading, explore Kundli tools or detailed reports."
  };
}

function localSectionTitle(title: string, locale: Locale) {
  if (locale !== "hi") return title;
  const map: Record<string, string> = {
    "Love & Relationships": "प्रेम और संबंध",
    "Career & Work": "करियर और काम",
    "Money & Finance": "धन और वित्त",
    "Health & Wellness": "स्वास्थ्य और संतुलन",
    "Family & Social Life": "परिवार और सामाजिक जीवन",
    Singles: "सिंगल्स",
    Couples: "कपल्स",
    "Emotional Guidance": "भावनात्मक मार्गदर्शन",
    "Communication Advice": "संवाद सलाह",
    "Career & Opportunities": "करियर और अवसर",
    "Wealth & Finance": "धन और वित्त",
    "Health & Balance": "स्वास्थ्य और संतुलन",
    "2026 Advice": "2026 सलाह",
    "Career & Goals": "करियर और लक्ष्य",
    "Money & Planning": "धन और योजना",
    Relationships: "संबंध",
    "Health & Energy": "स्वास्थ्य और ऊर्जा"
  };
  return map[title] ?? title;
}
