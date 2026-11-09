import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MoonStar, Sparkles, CalendarDays, BookOpen, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { safeServerTranslation } from "@/lib/i18n-server";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "फ्री कुंडली, राशिफल और वैदिक ज्योतिष हिंदी में",
  description: "हिंदी में फ्री जन्म कुंडली, राशि और नक्षत्र की जानकारी, कुंडली मिलान, राशिफल, पंचांग और पारंपरिक वैदिक ज्योतिष समझें।",
  path: "/hi",
  keywords: ["Hindi Astrology", "Hindi Horoscope", "Kundli Hindi", "Tarot Hindi"]
});

const features = [
  { title: "दैनिक राशिफल", description: "रोज़ का ज्योतिषीय मार्गदर्शन", href: "/hi/aaj-ka-rashifal", icon: Sparkles },
  { title: "जन्म कुंडली", description: "ग्रह, लग्न और भाव की जानकारी", href: "/hi/free-kundli", icon: MoonStar },
  { title: "कुंडली मिलान", description: "पारंपरिक गुण मिलान", href: "/matchmaking", icon: HeartHandshake },
  { title: "अंक ज्योतिष", description: "नाम और जन्मतिथि का विश्लेषण", href: "/numerology", icon: Sparkles },
  { title: "पंचांग", description: "तिथि, नक्षत्र और मुहूर्त", href: "/panchang", icon: CalendarDays },
  { title: "वैदिक ज्ञान", description: "कुंडली और ज्योतिष को समझें", href: "/hi/learn/kundli-explained", icon: BookOpen }
] as const;

export default function HindiHomePage() {
  return (
    <main className="min-h-screen bg-[#fff8ee] text-[#35242b]">
      <Section first>
        <div className="relative grid overflow-hidden rounded-[2rem] border border-[#e4cbaa] bg-[#fffdf8] shadow-[0_25px_72px_rgba(83,35,47,.12)] lg:grid-cols-[1.04fr_.96fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#835a28]">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> NAKSHARIX · वैदिक ज्ञान
            </p>
            <h1 className="mt-5 max-w-2xl font-cinzel text-[clamp(2rem,5vw,3.9rem)] font-extrabold leading-tight text-[#70283d]">
              आपके जीवन की ज्योतिषीय यात्रा
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#584b51]">{safeServerTranslation("hi", "heroCopy")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/hi/free-kundli">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  {safeServerTranslation("hi", "generateFreeKundli")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/hi/learn/kundli-explained">कुंडली को समझें</Link>
              </Button>
            </div>
            <p className="mt-7 text-xs leading-6 text-[#75656b]">
              परंपरागत गणनाएँ और सामान्य मार्गदर्शन। महत्वपूर्ण निर्णयों के लिए विशेषज्ञ सलाह लें।
            </p>
          </div>
          <div className="relative min-h-[300px] overflow-hidden bg-[#342338] lg:min-h-[530px]">
            <Image
              src="/naksharix/ganesh-hero-light-saffron.jpg"
              alt="श्री गणेश और वैदिक परंपरा से प्रेरित चित्र"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#70283d]/25 via-transparent to-[#211729]/20" />
          </div>
        </div>
      </Section>
      <Section>
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#805a29]">अपने लिए खोजें</p>
          <h2 className="mt-3 font-cinzel text-3xl font-extrabold text-[#70283d] sm:text-4xl">ज्योतिष, आसान और सुंदर</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#67595b]">स्पष्ट जानकारी, उपयोगी टूल और सरल अगला कदम—एक ही जगह।</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-start gap-4 rounded-2xl border border-[#e6d5bf] bg-[#fffdf8] p-6 shadow-[0_12px_36px_rgba(69,34,44,.06)] transition hover:-translate-y-1 hover:border-[#b58a54] hover:shadow-[0_18px_45px_rgba(69,34,44,.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#70283d]">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#f5e6cf] text-[#70283d]"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <span className="min-w-0">
                <span className="block text-lg font-bold text-[#4b2b3c]">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-[#655b61]">{description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#70283d]">आगे बढ़ें <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
