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
        <div className="inner-section rounded-3xl border border-[#263957] p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <Bot className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">{labels.badge}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ title, href, icon: Icon }) => (
            <Card key={href} className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45">
              <CardContent className="flex h-full flex-col p-5">
                <Icon className="h-6 w-6 text-[#00f5a0]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">{title}</h2>
                <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
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
      subtitle: "Hum Naksharix AI Astrologer ki reliability aur safety improve kar rahe hain. Tab tak available Kundli, Matching, Numerology, Reports aur Consultation tools use karein.",
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
    subtitle: "We are improving the reliability and safety of Naksharix AI Astrologer. Until then, use the available Kundli, matching, numerology, report, and consultation tools.",
    kundli: "Use Kundli Generator",
    matching: "Try Match Making",
    numerology: "Explore Numerology",
    consultation: "Book Consultation",
    reports: "View Reports",
    open: "Open"
  };
}
