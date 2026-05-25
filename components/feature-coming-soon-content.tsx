"use client";

import Link from "next/link";
import { CalendarDays, HeartHandshake, MoonStar, ScrollText, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type FeatureKind = "horoscope" | "consultation";

const ctas: { key: "kundli" | "matching" | "numerology" | "reports"; href: string; icon: LucideIcon }[] = [
  { key: "kundli", href: "/kundli", icon: MoonStar },
  { key: "matching", href: "/matchmaking", icon: HeartHandshake },
  { key: "numerology", href: "/numerology", icon: Sparkles },
  { key: "reports", href: "/reports", icon: ScrollText }
];

export function FeatureComingSoonContent({ kind }: { kind: FeatureKind }) {
  const { locale } = useLanguage();
  const labels = featureLabels(kind, locale);
  const HeroIcon = kind === "consultation" ? Users : CalendarDays;

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 text-center md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382] shadow-[0_0_34px_rgba(0,245,160,0.14)]">
            <HeroIcon className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">{labels.badge}</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
          <p className="mx-auto mt-5 max-w-3xl rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4 text-sm leading-6 text-[#a8b3c7]">{labels.safety}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {ctas.map(({ key, href, icon: Icon }) => (
            <Card key={key} className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/45">
              <CardContent className="flex h-full flex-col p-5">
                <Icon className="h-6 w-6 text-[#00f5a0]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold text-[#f3d382]">{labels.cards[key].title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{labels.cards[key].copy}</p>
                <Button className="mt-auto w-full bg-[#009b72] text-white hover:bg-[#008766]" asChild>
                  <Link href={href}>{labels.cards[key].cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

function featureLabels(kind: FeatureKind, locale: Locale) {
  if (locale === "hi") {
    const base = {
      badge: "जल्द आ रहा है",
      safety: "यह सुविधा अभी active booking, payment, live chat, AI response या automatic confirmation नहीं दिखाती। उपलब्ध free tools और manual report catalogue का उपयोग करें।",
      cards: {
        kundli: { title: "कुंडली बनाएं", copy: "पूर्ण जन्म विवरण से free Kundli experience शुरू करें।", cta: "कुंडली खोलें" },
        matching: { title: "मिलान करें", copy: "वधू और वर विवरण से compatibility guidance देखें।", cta: "मिलान खोलें" },
        numerology: { title: "अंक ज्योतिष देखें", copy: "नाम, जन्म तिथि, मोबाइल, वाहन और लो शू insights देखें।", cta: "अंक ज्योतिष खोलें" },
        reports: { title: "रिपोर्ट देखें", copy: "Manual contact process के साथ premium reports explore करें।", cta: "रिपोर्ट खोलें" }
      }
    };
    return kind === "consultation"
      ? { ...base, title: "Consultation जल्द आ रहा है", subtitle: "हम Naksharix consultation experience को सुरक्षित expert onboarding, scheduling और confirmation flow के साथ तैयार कर रहे हैं।" }
      : { ...base, title: "राशिफल जल्द आ रहा है", subtitle: "हम daily, weekly, monthly और yearly horoscope experience को बेहतर timing context और साफ guidance के साथ तैयार कर रहे हैं।" };
  }
  if (locale === "hinglish") {
    const base = {
      badge: "Coming Soon",
      safety: "Ye feature abhi active booking, payment, live chat, AI response ya automatic confirmation nahi dikhata. Available free tools aur manual report catalogue use karein.",
      cards: {
        kundli: { title: "Explore Kundli", copy: "Complete birth details se free Kundli experience start karein.", cta: "Open Kundli" },
        matching: { title: "Try Match Making", copy: "Bride aur groom details se compatibility guidance dekhein.", cta: "Open Matching" },
        numerology: { title: "Explore Numerology", copy: "Name, DOB, mobile, vehicle aur Lo Shu insights dekhein.", cta: "Open Numerology" },
        reports: { title: "View Reports", copy: "Manual contact process ke saath premium reports explore karein.", cta: "Open Reports" }
      }
    };
    return kind === "consultation"
      ? { ...base, title: "Consultation Jaldi Aa Raha Hai", subtitle: "Hum Naksharix consultation experience ko safe expert onboarding, scheduling aur confirmation flow ke saath prepare kar rahe hain." }
      : { ...base, title: "Horoscope Jaldi Aa Raha Hai", subtitle: "Hum daily, weekly, monthly aur yearly horoscope experience ko better timing context aur clear guidance ke saath prepare kar rahe hain." };
  }
  const base = {
    badge: "Coming Soon",
    safety: "This feature is not showing active booking, payment, live chat, AI response, or automatic confirmation yet. Please use the available free tools and manual report catalogue.",
    cards: {
      kundli: { title: "Explore Kundli", copy: "Start with a free Kundli experience from complete birth details.", cta: "Open Kundli" },
      matching: { title: "Try Match Making", copy: "Review compatibility guidance from bride and groom details.", cta: "Open Matching" },
      numerology: { title: "Explore Numerology", copy: "Review name, DOB, mobile, vehicle, and Lo Shu insights.", cta: "Open Numerology" },
      reports: { title: "View Reports", copy: "Explore premium reports through the manual contact process.", cta: "Open Reports" }
    }
  };
  return kind === "consultation"
    ? { ...base, title: "Consultation Coming Soon", subtitle: "We are preparing Naksharix consultation with safe expert onboarding, scheduling, and confirmation flow." }
    : { ...base, title: "Horoscope Coming Soon", subtitle: "We are preparing daily, weekly, monthly, and yearly horoscope experiences with better timing context and clear guidance." };
}
