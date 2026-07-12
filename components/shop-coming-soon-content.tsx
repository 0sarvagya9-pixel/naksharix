"use client";

import Link from "next/link";
import { HeartHandshake, MoonStar, PackageSearch, ScrollText, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

const ctas = [
  { key: "kundli", href: "/kundli", icon: MoonStar },
  { key: "matching", href: "/matchmaking", icon: HeartHandshake },
  { key: "numerology", href: "/numerology", icon: WandSparkles },
  { key: "reports", href: "/reports", icon: ScrollText }
] as const;

export function ShopComingSoonContent() {
  const { locale } = useLanguage();
  const labels = shopHoldLabels(locale);

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section overflow-hidden rounded-3xl border border-[#263957] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{labels.eyebrow}</p>
              <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-[#006b50] text-white hover:bg-[#00583f]">
                  <Link href="/free-calculators">{labels.freeTools}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/reports">{labels.viewReports}</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-[#263957] bg-[radial-gradient(circle_at_25%_15%,rgba(243,211,130,0.2),transparent_16rem),linear-gradient(135deg,#142647,#07111f)] p-6">
              <PackageSearch className="h-10 w-10 text-[#00f5a0]" />
              <h2 className="mt-5 font-cinzel text-2xl font-bold text-[#f3d382]">{labels.holdTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.holdCopy}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {labels.items.map((item) => (
                  <span key={item} className="rounded-full border border-[#dca956]/25 bg-[#dca956]/10 px-3 py-1 text-xs text-[#f3d382]">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {ctas.map(({ key, href, icon: Icon }) => (
            <Card key={key} className="inner-card transition hover:-translate-y-1 hover:border-[#dca956]/50">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-[#f3d382]" />
                <h2 className="mt-4 font-cinzel text-xl font-bold text-white">{labels.cards[key].title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{labels.cards[key].copy}</p>
                <Button className="mt-5 w-full" variant="outline" asChild>
                  <Link href={href}><Sparkles className="h-4 w-4" />{labels.cards[key].cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

function shopHoldLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      eyebrow: "Coming Soon",
      title: "शॉप जल्द आ रही है",
      subtitle: "Naksharix Shop अभी तैयार की जा रही है। Public catalogue, cart, product checkout और physical order service अभी उपलब्ध नहीं हैं।",
      freeTools: "मुफ़्त टूल्स देखें",
      viewReports: "रिपोर्ट देखें",
      holdTitle: "सुरक्षित लॉन्च तैयारी",
      holdCopy: "हम product review, authenticity process, fulfilment और customer support तैयार करने के बाद ही shop launch करेंगे।",
      items: ["Product review", "Authenticity checks", "Fulfilment setup", "Customer support"],
      cards: {
        kundli: { title: "कुंडली बनाएं", copy: "जन्म विवरण से अपना मुफ्त कुंडली अनुभव शुरू करें।", cta: "कुंडली खोलें" },
        matching: { title: "मिलान करें", copy: "वधू और वर विवरण से compatibility समझें।", cta: "मिलान खोलें" },
        numerology: { title: "अंक ज्योतिष देखें", copy: "नाम, जन्म तिथि, मोबाइल, वाहन और लो शू insights देखें।", cta: "Numerology खोलें" },
        reports: { title: "रिपोर्ट देखें", copy: "उपलब्ध digital reports और saved Kundli reports देखें।", cta: "Reports खोलें" }
      }
    };
  }
  if (locale === "hinglish") {
    return {
      eyebrow: "Coming Soon",
      title: "Shop Jaldi Aa Raha Hai",
      subtitle: "Naksharix Shop abhi prepare ho raha hai. Public catalogue, cart, product checkout aur physical order service abhi available nahi hain.",
      freeTools: "Free Tools Dekhein",
      viewReports: "View Reports",
      holdTitle: "Safe launch preparation",
      holdCopy: "Product review, authenticity process, fulfilment aur customer support ready hone ke baad hi shop launch hoga.",
      items: ["Product review", "Authenticity checks", "Fulfilment setup", "Customer support"],
      cards: {
        kundli: { title: "Explore Kundli", copy: "Birth details se free Kundli experience start karein.", cta: "Open Kundli" },
        matching: { title: "Try Match Making", copy: "Bride aur groom details se compatibility samjhein.", cta: "Open Matching" },
        numerology: { title: "Explore Numerology", copy: "Name, DOB, mobile, vehicle aur Lo Shu insights dekhein.", cta: "Open Numerology" },
        reports: { title: "View Reports", copy: "Available digital reports aur saved Kundli reports dekhein.", cta: "Open Reports" }
      }
    };
  }
  return {
    eyebrow: "Coming Soon",
    title: "Shop Coming Soon",
    subtitle: "The Naksharix Shop is being prepared. No public catalogue, cart, product checkout, or physical-order service is available yet.",
    freeTools: "Explore Free Tools",
    viewReports: "View Reports",
    holdTitle: "Safe launch preparation",
    holdCopy: "The shop will open only after product review, authenticity processes, fulfilment, and customer support are ready.",
    items: ["Product review", "Authenticity checks", "Fulfilment setup", "Customer support"],
    cards: {
      kundli: { title: "Explore Kundli", copy: "Start with a free Kundli experience from birth details.", cta: "Open Kundli" },
      matching: { title: "Try Match Making", copy: "Understand compatibility from bride and groom details.", cta: "Open Matching" },
      numerology: { title: "Explore Numerology", copy: "Review name, DOB, mobile, vehicle, and Lo Shu insights.", cta: "Open Numerology" },
      reports: { title: "View Reports", copy: "Explore available digital reports and saved Kundli reports.", cta: "Open Reports" }
    }
  };
}
