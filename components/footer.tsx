"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

export function Footer() {
  const { tr, locale } = useLanguage();
  const groups = footerGroups(locale);

  return (
    <footer className="border-t border-[#1e293b] bg-[linear-gradient(180deg,rgba(10,18,36,0.78),rgba(2,6,18,0.96))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm naksh-muted-text lg:grid-cols-[1.35fr_2fr]">
        <div className="max-w-md">
          <BrandLogo />
          <p className="mt-4 leading-6">{tr("footerCopy")}</p>
        </div>
        <nav aria-label="Footer navigation" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-[#1e293b] bg-[#0f1c3a]/65 p-4">
              <p className="font-cinzel text-sm font-bold text-[#f3d382]">{group.title}</p>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link key={`${group.title}-${link.href}`} href={link.href} className="text-xs text-[#ffffff] transition hover:text-[#f3d382]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function footerGroups(locale: Locale) {
  if (locale === "hi") {
    return [
      { title: "टूल्स", links: [["कुंडली", "/kundli"], ["मिलान", "/matchmaking"], ["अंक ज्योतिष", "/numerology"], ["मुफ़्त कैलकुलेटर", "/free-calculators"], ["टैरो", "/tarot"]] },
      { title: "रिपोर्ट", links: [["रिपोर्ट", "/reports"], ["प्रीमियम कुंडली रिपोर्ट", "/reports/premium-kundli"], ["कपल कुंडली रिपोर्ट", "/reports/couple-kundli"], ["करियर रिपोर्ट", "/reports/career-report"], ["अंक ज्योतिष + लो शू रिपोर्ट", "/reports/numerology-lo-shu-report"]] },
      { title: "जल्द आ रहा है", links: [["AI ज्योतिषी", "/ai-astrologer"], ["शॉप", "/shop"], ["राशिफल", "/horoscope"], ["कंसल्टेशन", "/consultation"]] },
      { title: "सहायता", links: [["About Us", "/about"], ["Contact", "/contact"]] },
      { title: "कानूनी", links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] }
    ].map(normalizeGroup);
  }
  if (locale === "hinglish") {
    return [
      { title: "Tools", links: [["Kundli", "/kundli"], ["Match Making", "/matchmaking"], ["Numerology", "/numerology"], ["Free Calculators", "/free-calculators"], ["Tarot", "/tarot"]] },
      { title: "Reports", links: [["Reports", "/reports"], ["Premium Kundli Report", "/reports/premium-kundli"], ["Couple Kundli Report", "/reports/couple-kundli"], ["Career Report", "/reports/career-report"], ["Numerology + Lo Shu Report", "/reports/numerology-lo-shu-report"]] },
      { title: "Coming Soon", links: [["AI Astrologer", "/ai-astrologer"], ["Shop", "/shop"], ["Horoscope", "/horoscope"], ["Consultation", "/consultation"]] },
      { title: "Support", links: [["About Us", "/about"], ["Contact", "/contact"]] },
      { title: "Legal", links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] }
    ].map(normalizeGroup);
  }
  return [
    { title: "Tools", links: [["Kundli", "/kundli"], ["Match Making", "/matchmaking"], ["Numerology", "/numerology"], ["Free Calculators", "/free-calculators"], ["Tarot", "/tarot"]] },
    { title: "Reports", links: [["Reports", "/reports"], ["Premium Kundli Report", "/reports/premium-kundli"], ["Couple Kundli Report", "/reports/couple-kundli"], ["Career Report", "/reports/career-report"], ["Numerology + Lo Shu Report", "/reports/numerology-lo-shu-report"]] },
    { title: "Coming Soon", links: [["AI Astrologer", "/ai-astrologer"], ["Shop", "/shop"], ["Horoscope", "/horoscope"], ["Consultation", "/consultation"]] },
    { title: "Support", links: [["About Us", "/about"], ["Contact", "/contact"]] },
    { title: "Legal", links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] }
  ].map(normalizeGroup);
}

function normalizeGroup(group: { title: string; links: string[][] }) {
  return { title: group.title, links: group.links.map(([label, href]) => ({ label, href })) };
}
