"use client";

import Link from "next/link";
import { BookOpen, BrainCircuit, FileText, Grid3X3, HeartHandshake, Languages, MoonStar, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type FunnelCard = { title: string; copy: string; cta?: string; href?: string; icon: LucideIcon; badge?: string };

export function HomeBusinessFunnel() {
  const { locale } = useLanguage();
  const labels = homeFunnelLabels(locale);

  return (
    <>
      <FunnelSection title={labels.featureTitle} subtitle={labels.featureSubtitle}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {labels.features.map((item) => <FunnelCardView key={item.title} item={item} />)}
        </div>
      </FunnelSection>

      <FunnelSection title={labels.toolsTitle} subtitle={labels.toolsSubtitle} action={{ label: labels.viewAllCalculators, href: "/free-calculators" }}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labels.tools.map((item) => <FunnelCardView key={item.title} item={item} compact />)}
        </div>
      </FunnelSection>

      <FunnelSection title={labels.reportsTitle} subtitle={labels.reportsSubtitle} action={{ label: labels.viewReports, href: "/reports" }}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labels.reports.map((item) => <FunnelCardView key={item.title} item={item} compact />)}
        </div>
        <p className="mt-5 rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4 text-sm leading-6 text-[#a8b3c7]">{labels.reportsNote}</p>
      </FunnelSection>

      <FunnelSection title={labels.whyTitle} subtitle={labels.whySubtitle}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {labels.why.map((item) => <FunnelCardView key={item.title} item={item} compact />)}
        </div>
      </FunnelSection>

      <FunnelSection title={labels.ecosystemTitle} subtitle={labels.ecosystemSubtitle}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {labels.ecosystem.map((item) => <FunnelCardView key={item.title} item={{ ...item, badge: labels.comingSoon }} compact disabled />)}
        </div>
      </FunnelSection>

      <FunnelSection title={labels.faqTitle} subtitle={labels.faqSubtitle}>
        <div className="grid gap-4 lg:grid-cols-2">
          {labels.faq.map((item) => (
            <Card key={item.q} className="border-[#1e293b] bg-[#0f1c3a]/82">
              <CardContent className="p-5">
                <h3 className="font-cinzel text-lg font-bold text-[#f3d382]">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </FunnelSection>
    </>
  );
}

function FunnelSection({ title, subtitle, action, children }: { title: string; subtitle: string; action?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <Section className="relative max-w-[1440px] px-6 py-6 lg:px-12">
      <div className="rounded-3xl border border-[#1e293b] bg-[#0a1224]/82 p-5 shadow-[0_24px_80px_rgba(0,5,16,0.34)] md:p-7">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">Naksharix</p>
            <h2 className="mt-2 font-cinzel text-3xl font-black text-[#f3d382]">{title}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#a8b3c7]">{subtitle}</p>
          </div>
          {action ? <Button variant="outline" asChild><Link href={action.href}>{action.label}</Link></Button> : null}
        </div>
        {children}
      </div>
    </Section>
  );
}

function FunnelCardView({ item, compact = false, disabled = false }: { item: FunnelCard; compact?: boolean; disabled?: boolean }) {
  const Icon = item.icon;
  return (
    <Card className={`group h-full border-[#1e293b] bg-[#0f1c3a] transition ${disabled ? "opacity-82" : "hover:-translate-y-1 hover:border-[#dca956]/50"}`}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#dca956]/25 bg-[#dca956]/10 text-[#f3d382]">
            <Icon className="h-5 w-5" />
          </span>
          {item.badge ? <span className="rounded-full border border-[#dca956]/30 bg-[#dca956]/10 px-3 py-1 text-xs text-[#f3d382]">{item.badge}</span> : null}
        </div>
        <h3 className={`${compact ? "mt-4 text-lg" : "mt-5 text-xl"} font-cinzel font-bold text-white`}>{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{item.copy}</p>
        {item.href && item.cta ? (
          <Button className="mt-auto w-full bg-[#009b72] pt-5 text-white hover:bg-[#008766]" asChild>
            <Link href={item.href}>{item.cta}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function homeFunnelLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      featureTitle: "Active Naksharix Features",
      featureSubtitle: "Free tools से शुरू करें, focused results देखें, फिर deeper guidance के लिए reports catalogue explore करें।",
      toolsTitle: "मुफ़्त ज्योतिष टूल्स",
      toolsSubtitle: "कुंडली, मिलान, अंक ज्योतिष, लो शू, नामांक, मोबाइल, वाहन और टैरो tools एक जगह।",
      reportsTitle: "प्रीमियम ज्योतिष रिपोर्ट",
      reportsSubtitle: "कुंडली, मिलान, करियर, धन, प्रेम, अंक ज्योतिष और दोष reports manual contact process से request करें।",
      reportsNote: "रिपोर्ट गहरी चिंतनात्मक मार्गदर्शन के लिए तैयार की जाती हैं और मैन्युअल संपर्क प्रक्रिया के माध्यम से साझा की जाती हैं।",
      whyTitle: "Why Naksharix",
      whySubtitle: "Spiritual-tech अनुभव जो fear-based claims से दूर, practical और reflective guidance पर focused है।",
      ecosystemTitle: "Coming Soon Ecosystem",
      ecosystemSubtitle: "Future modules अभी hold पर हैं; वे active tools की तरह advertise नहीं किए गए हैं।",
      faqTitle: "FAQ / Trust",
      faqSubtitle: "Naksharix tools और reports को practical judgment के साथ use करें।",
      viewAllCalculators: "सभी मुफ़्त कैलकुलेटर देखें",
      viewReports: "रिपोर्ट देखें",
      comingSoon: "जल्द आ रहा है",
      features: featureCards("hi"),
      tools: toolCards("hi"),
      reports: reportCards("hi"),
      why: whyCards("hi"),
      ecosystem: ecosystemCards("hi"),
      faq: faqItems("hi")
    };
  }
  if (locale === "hinglish") {
    return {
      featureTitle: "Active Naksharix Features",
      featureSubtitle: "Free tools se start karein, focused results dekhein, phir deeper guidance ke liye reports catalogue explore karein.",
      toolsTitle: "Free Astrology Tools",
      toolsSubtitle: "Kundli, Match Making, Numerology, Lo Shu, Name Number, Mobile, Vehicle aur Tarot tools ek jagah.",
      reportsTitle: "Premium Astrology Reports",
      reportsSubtitle: "Kundli, Milan, Career, Wealth, Love, Numerology aur Dosha reports manual contact process se request karein.",
      reportsNote: "Reports deeper reflective guidance ke liye prepare hoti hain aur manual contact process ke through share ki jaati hain.",
      whyTitle: "Why Naksharix",
      whySubtitle: "Spiritual-tech experience jo fear-based claims se door, practical aur reflective guidance par focused hai.",
      ecosystemTitle: "Coming Soon Ecosystem",
      ecosystemSubtitle: "Future modules abhi hold par hain; unhe active tools ki tarah advertise nahi kiya gaya hai.",
      faqTitle: "FAQ / Trust",
      faqSubtitle: "Naksharix tools aur reports ko practical judgment ke saath use karein.",
      viewAllCalculators: "View All Free Calculators",
      viewReports: "View Reports",
      comingSoon: "Coming Soon",
      features: featureCards("hinglish"),
      tools: toolCards("hinglish"),
      reports: reportCards("hinglish"),
      why: whyCards("hinglish"),
      ecosystem: ecosystemCards("hinglish"),
      faq: faqItems("hinglish")
    };
  }
  return {
    featureTitle: "Active Naksharix Features",
    featureSubtitle: "Start with free tools, review focused results, then explore the reports catalogue for deeper guidance.",
    toolsTitle: "Free Astrology Tools",
    toolsSubtitle: "Kundli, Match Making, Numerology, Lo Shu, Name Number, Mobile Number, Vehicle Number, and Tarot tools in one flow.",
    reportsTitle: "Premium Astrology Reports",
    reportsSubtitle: "Request Kundli, matching, career, wealth, love, numerology, and dosha reports through the manual contact process.",
    reportsNote: "Reports are prepared for deeper reflective guidance and shared through the manual contact process.",
    whyTitle: "Why Naksharix",
    whySubtitle: "A spiritual-tech experience focused on practical, non-fear-based, reflective guidance.",
    ecosystemTitle: "Coming Soon Ecosystem",
    ecosystemSubtitle: "Future modules are clearly held back instead of being advertised as active tools.",
    faqTitle: "FAQ / Trust",
    faqSubtitle: "Use Naksharix tools and reports with practical judgment.",
    viewAllCalculators: "View All Free Calculators",
    viewReports: "View Reports",
    comingSoon: "Coming Soon",
    features: featureCards("en"),
    tools: toolCards("en"),
    reports: reportCards("en"),
    why: whyCards("en"),
    ecosystem: ecosystemCards("en"),
    faq: faqItems("en")
  };
}

function featureCards(locale: Locale): FunnelCard[] {
  const text = {
    en: [
      ["Free Kundli Generator", "Decode Your Cosmic Blueprint", "Generate Free Kundli"],
      ["Match Making / Milan", "Check Relationship Compatibility with Vedic Matching", "Try Match Making"],
      ["Numerology + Lo Shu", "Discover Your Numbers, Name Energy & Lo Shu Balance", "Calculate Numerology"],
      ["Premium Reports", "Detailed Astrology Reports for Deeper Guidance", "Explore Reports"],
      ["Tarot Basic", "Ask the Cards for Reflective Guidance", "Try Tarot"]
    ],
    hi: [
      ["मुफ़्त कुंडली", "अपना cosmic blueprint समझें", "कुंडली बनाएं"],
      ["कुंडली मिलान", "Vedic matching से relationship compatibility देखें", "मिलान करें"],
      ["अंक ज्योतिष + लो शू", "अपने numbers, name energy और Lo Shu balance देखें", "Numerology करें"],
      ["प्रीमियम रिपोर्ट", "Deeper guidance के लिए detailed astrology reports", "Reports देखें"],
      ["टैरो Basic", "Reflective guidance के लिए cards से संकेत लें", "Tarot खोलें"]
    ],
    hinglish: [
      ["Free Kundli Generator", "Apna cosmic blueprint decode karein", "Generate Kundli"],
      ["Match Making / Milan", "Vedic matching se relationship compatibility check karein", "Try Match Making"],
      ["Numerology + Lo Shu", "Numbers, name energy aur Lo Shu balance discover karein", "Calculate Numerology"],
      ["Premium Reports", "Deeper guidance ke liye detailed astrology reports", "Explore Reports"],
      ["Tarot Basic", "Reflective guidance ke liye cards se poochein", "Try Tarot"]
    ]
  }[locale];
  const icons = [MoonStar, HeartHandshake, Grid3X3, FileText, BookOpen];
  const hrefs = ["/kundli", "/matchmaking", "/numerology", "/reports", "/tarot"];
  return text.map(([title, copy, cta], index) => ({ title, copy, cta, href: hrefs[index], icon: icons[index] }));
}

function toolCards(locale: Locale): FunnelCard[] {
  const names = locale === "hi"
    ? ["Free Kundli", "मिलान", "अंक ज्योतिष", "लो शू ग्रिड", "नामांक", "मोबाइल नंबर", "वाहन नंबर", "टैरो"]
    : locale === "hinglish"
      ? ["Free Kundli", "Match Making", "Numerology", "Lo Shu Grid", "Name Number", "Mobile Number", "Vehicle Number", "Tarot"]
      : ["Free Kundli", "Match Making", "Numerology", "Lo Shu Grid", "Name Number", "Mobile Number", "Vehicle Number", "Tarot"];
  const hrefs = ["/kundli", "/matchmaking", "/numerology", "/numerology", "/numerology", "/numerology", "/numerology", "/tarot"];
  return names.map((title, index) => ({
    title,
    copy: locale === "hi" ? "Focused input से active tool खोलें और related report CTA देखें।" : locale === "hinglish" ? "Focused input se active tool open karein aur related report CTA dekhein." : "Open the active tool with focused inputs and related report CTAs.",
    cta: locale === "hi" ? "खोलें" : "Open",
    href: hrefs[index],
    icon: index === 1 ? HeartHandshake : index >= 2 && index <= 6 ? WandSparkles : index === 7 ? BookOpen : MoonStar
  }));
}

function reportCards(locale: Locale): FunnelCard[] {
  const names = locale === "hi"
    ? ["प्रीमियम कुंडली रिपोर्ट", "कपल कुंडली रिपोर्ट", "करियर रिपोर्ट", "धन रिपोर्ट", "प्रेम रिपोर्ट", "अंक ज्योतिष + लो शू रिपोर्ट", "साढ़े साती रिपोर्ट", "मांगलिक / काल सर्प रिपोर्ट"]
    : ["Premium Kundli Report", "Couple Kundli Report", "Career Report", "Wealth Report", "Love Report", "Numerology + Lo Shu Report", "Sade Sati Report", "Manglik / Kaal Sarp Report"];
  const slugs = ["premium-kundli", "couple-kundli", "career-report", "wealth-report", "love-report", "numerology-lo-shu-report", "sade-sati-report", "manglik-kaal-sarp-report"];
  return names.map((title, index) => ({
    title,
    copy: locale === "hi" ? "Manual contact process से request करें। कोई fake instant payment/report flow नहीं।" : locale === "hinglish" ? "Manual contact process se request karein. Koi fake instant payment/report flow nahi." : "Request through the manual contact process. No fake instant payment or report flow.",
    cta: locale === "hi" ? "Details देखें" : "View Details",
    href: `/reports/${slugs[index]}`,
    icon: FileText
  }));
}

function whyCards(locale: Locale): FunnelCard[] {
  const data = locale === "hi"
    ? [["Vedic Astrology Foundation", "कुंडली और मिलान flows existing engines पर आधारित हैं।", MoonStar], ["Numerology + Lo Shu Insights", "Numbers, name, mobile, vehicle और Lo Shu guidance एक जगह।", Grid3X3], ["Hindi / English / Hinglish", "तीन language modes core UI में supported हैं।", Languages], ["Premium PDF & Report Experience", "Kundli PDF और manual report catalogue structured हैं।", FileText], ["Practical Non-Fear-Based Guidance", "No guaranteed outcomes, no fear-based claims.", ShieldCheck], ["AI-Ready Spiritual-Tech Platform", "AI और Shop future ecosystem hold पर रखा गया है।", BrainCircuit]]
    : [["Vedic Astrology Foundation", "Kundli and matching flows are built around existing engines.", MoonStar], ["Numerology + Lo Shu Insights", "Numbers, name, mobile, vehicle, and Lo Shu guidance in one place.", Grid3X3], ["Hindi / English / Hinglish Support", "Three language modes are supported across core UI.", Languages], ["Premium PDF & Report Experience", "Kundli PDF and manual report catalogue are structured.", FileText], ["Practical Non-Fear-Based Guidance", "No guaranteed outcomes and no fear-based claims.", ShieldCheck], ["AI-Ready Spiritual-Tech Platform", "AI and Shop are held for the future ecosystem.", BrainCircuit]];
  return data.map(([title, copy, icon]) => ({ title: String(title), copy: String(copy), icon: icon as LucideIcon }));
}

function ecosystemCards(locale: Locale): FunnelCard[] {
  const names = locale === "hi" ? ["AI ज्योतिषी", "Shop", "Horoscope", "Consultation"] : ["AI Astrologer", "Shop", "Horoscope", "Consultation"];
  return names.map((title) => ({
    title,
    copy: locale === "hi" ? "Future phase के लिए planned. अभी active product promise नहीं।" : locale === "hinglish" ? "Future phase ke liye planned. Abhi active product promise nahi." : "Planned for a future phase. Not presented as an active product yet.",
    icon: title.includes("AI") ? BrainCircuit : title.includes("Shop") ? Sparkles : title.includes("Horoscope") ? MoonStar : HeartHandshake
  }));
}

function faqItems(locale: Locale) {
  if (locale === "hi") {
    return [
      { q: "क्या Naksharix free है?", a: "Core tools जहाँ applicable हैं, free रूप में available हैं। Premium reports manual request process से आती हैं।" },
      { q: "Kundli के लिए क्या details चाहिए?", a: "Accurate Kundli के लिए date, time और birth place जरूरी हैं।" },
      { q: "क्या astrology result guarantee करती है?", a: "नहीं। Astrology, numerology और tarot reflective guidance tools हैं, guarantee नहीं।" },
      { q: "क्या premium reports automatic हैं?", a: "अभी reports manual/contact-based process से handled हैं।" },
      { q: "कौन सी languages supported हैं?", a: "English, Hindi और Hinglish supported हैं।" },
      { q: "Report कैसे request करें?", a: "Reports catalogue या detail page से request details review करें। Online submission/payment अभी active नहीं है।" }
    ];
  }
  if (locale === "hinglish") {
    return [
      { q: "Kya Naksharix free hai?", a: "Core tools jahan applicable hain, free available hain. Premium reports manual request process se aati hain." },
      { q: "Kundli ke liye kya details chahiye?", a: "Accurate Kundli ke liye date, time aur birth place zaroori hain." },
      { q: "Kya astrology result guarantee karti hai?", a: "Nahi. Astrology, numerology aur tarot reflective guidance tools hain, guarantee nahi." },
      { q: "Kya premium reports automatic hain?", a: "Abhi reports manual/contact-based process se handled hain." },
      { q: "Kaunsi languages supported hain?", a: "English, Hindi aur Hinglish supported hain." },
      { q: "Report kaise request karein?", a: "Reports catalogue ya detail page se request details review karein. Online submission/payment abhi active nahi hai." }
    ];
  }
  return [
    { q: "Is Naksharix free?", a: "Core tools are available free where applicable. Premium reports use a manual request process." },
    { q: "What details are needed for Kundli?", a: "Accurate Kundli generation needs date, time, and birth place." },
    { q: "Does astrology guarantee results?", a: "No. Astrology, numerology, and tarot are reflective guidance tools, not guarantees." },
    { q: "Are premium reports automatic?", a: "Reports are manual/contact-based for now." },
    { q: "Which languages are supported?", a: "English, Hindi, and Hinglish are supported." },
    { q: "How do I request a report?", a: "Use the reports catalogue or detail pages to review request details. Online submission and payment are not active yet." }
  ];
}
