"use client";

import Link from "next/link";
import { Bot, CalendarDays, HeartHandshake, ScrollText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";

export function AiComingSoonContent() {
  const { locale } = useLanguage();
  const labels = aiSoonLabels(locale);
  const cards = [
    { title: labels.kundli, href: "/kundli", icon: Sparkles },
    { title: labels.matching, href: "/matchmaking", icon: HeartHandshake },
    { title: labels.numerology, href: "/numerology", icon: ScrollText },
    { title: labels.consultation, href: "/consultation", icon: CalendarDays },
    { title: labels.reports, href: "/reports", icon: ScrollText }
  ];

  return (
    <main className="inner-page-shell star-field">
      <Section>
        <div className="inner-section rounded-3xl border border-[#e6d4bd] bg-[#fffdf8] p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dac098] bg-[#f5e8d6] text-[#70283d] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <Bot className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#81551e]">{labels.badge}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#70283d] sm:text-5xl">{labels.title}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#584c53]">{labels.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ title, href, icon: Icon }) => (
            <Card key={href} className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45">
              <CardContent className="flex h-full flex-col p-5">
                <Icon className="h-6 w-6 text-[#70283d]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold text-[#70283d]">{title}</h2>
                <Button className="mt-auto w-full bg-[#70283d] text-[#fff9f0] hover:bg-[#542032]" asChild>
                  <Link href={href}>{labels.open}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

function aiSoonLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") {
    return {
      badge: "Beta Hold",
      title: "AI ज्योतिषी जल्द आ रहा है",
      subtitle: "हम Naksharix AI ज्योतिषी की विश्वसनीयता और सुरक्षा बेहतर कर रहे हैं। तब तक उपलब्ध कुंडली, मिलान, अंक ज्योतिष, रिपोर्ट और consultation tools का उपयोग करें।",
      kundli: "Kundli Generator उपयोग करें",
      matching: "Match Making आज़माएँ",
      numerology: "Numerology देखें",
      consultation: "Consultation बुक करें",
      reports: "Reports देखें",
      open: "खोलें"
    };
  }
  if (locale === "hinglish") {
    return {
      badge: "Beta Hold",
      title: "AI Astrologer Jaldi Aa Raha Hai",
      subtitle: "AI Astrologer filhaal available nahi hai. Kundli, Matching, Numerology, Reports aur Consultation services explore karein.",
      kundli: "Use Kundli Generator",
      matching: "Try Match Making",
      numerology: "Explore Numerology",
      consultation: "Book Consultation",
      reports: "View Reports",
      open: "Open"
    };
  }
  return {
    badge: "Beta Hold",
    title: "AI Astrologer Coming Soon",
    subtitle: "AI Astrologer is not currently available. Explore Kundli, matching, numerology, reports and consultation services in the meantime.",
    kundli: "Use Kundli Generator",
    matching: "Try Match Making",
    numerology: "Explore Numerology",
    consultation: "Book Consultation",
    reports: "View Reports",
    open: "Open"
  };
}
