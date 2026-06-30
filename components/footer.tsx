"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

export function Footer() {
  const { tr, locale } = useLanguage();
  const groups = footerGroups(locale);

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.62)",
        background: "rgba(255, 255, 255, 0.74)",
        backdropFilter: "blur(10px) saturate(130%)",
        WebkitBackdropFilter: "blur(10px) saturate(130%)"
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_2.6fr]">

          {/* Brand block */}
          <div className="max-w-sm">
            <BrandLogo />
            <p className="mt-4 text-sm leading-7" style={{ color: "#525866" }}>
              {tr("footerCopy")}
            </p>
          </div>

          {/* Link groups */}
          <nav aria-label="Footer navigation" className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {groups.map((group) => (
              <div key={group.title}>
                <p
                  className="font-cinzel font-bold mb-3"
                  style={{ fontSize: 12, color: "#17181d", letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  {group.title}
                </p>
                <div className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <Link
                      key={`${group.title}-${link.href}`}
                      href={link.href}
                      className="text-xs transition-colors hover:text-[#c98924]"
                      style={{ color: "#525866", fontWeight: 500 }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.35)" }}
        >
          <p style={{ fontSize: 11, color: "#525866" }}>
            © {new Date().getFullYear()} Naksharix. All rights reserved.
          </p>
          <p style={{ fontSize: 11, color: "#525866" }}>
            Made with 🙏 for Vedic Astrology enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}

function footerGroups(locale: Locale) {
  if (locale === "hi") {
    return [
      { title: "टूल्स",       links: [["कुंडली", "/kundli"], ["मिलान", "/matchmaking"], ["अंक ज्योतिष", "/numerology"], ["मुफ़्त कैलकुलेटर", "/free-calculators"], ["टैरो", "/tarot"]] },
      { title: "रिपोर्ट",     links: [["रिपोर्ट", "/reports"], ["प्रीमियम कुंडली", "/reports/premium-kundli"], ["कपल कुंडली", "/reports/couple-kundli"], ["करियर रिपोर्ट", "/reports/career-report"]] },
      { title: "जल्द आ रहा", links: [["AI ज्योतिषी", "/ai-astrologer"], ["शॉप", "/shop"], ["कंसल्टेशन", "/consultation"]] },
      { title: "सहायता",      links: [["About Us", "/about"], ["Contact", "/contact"]] },
      { title: "कानूनी",      links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] },
    ].map(normalizeGroup);
  }
  if (locale === "hinglish") {
    return [
      { title: "Tools",       links: [["Kundli", "/kundli"], ["Match Making", "/matchmaking"], ["Numerology", "/numerology"], ["Free Calculators", "/free-calculators"], ["Tarot", "/tarot"]] },
      { title: "Reports",     links: [["Reports", "/reports"], ["Premium Kundli", "/reports/premium-kundli"], ["Couple Kundli", "/reports/couple-kundli"], ["Career Report", "/reports/career-report"]] },
      { title: "Coming Soon", links: [["AI Astrologer", "/ai-astrologer"], ["Shop", "/shop"], ["Consultation", "/consultation"]] },
      { title: "Support",     links: [["About Us", "/about"], ["Contact", "/contact"]] },
      { title: "Legal",       links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] },
    ].map(normalizeGroup);
  }
  return [
    { title: "Tools",       links: [["Kundli", "/kundli"], ["Match Making", "/matchmaking"], ["Numerology", "/numerology"], ["Free Calculators", "/free-calculators"], ["Tarot", "/tarot"]] },
    { title: "Reports",     links: [["Reports", "/reports"], ["Premium Kundli", "/reports/premium-kundli"], ["Couple Kundli", "/reports/couple-kundli"], ["Career Report", "/reports/career-report"]] },
    { title: "Coming Soon", links: [["AI Astrologer", "/ai-astrologer"], ["Shop", "/shop"], ["Consultation", "/consultation"]] },
    { title: "Support",     links: [["About Us", "/about"], ["Contact", "/contact"]] },
    { title: "Legal",       links: [["Disclaimer", "/disclaimer"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Refund Policy", "/refund-policy"]] },
  ].map(normalizeGroup);
}

function normalizeGroup(group: { title: string; links: string[][] }) {
  return { title: group.title, links: group.links.map(([label, href]) => ({ label, href })) };
}
