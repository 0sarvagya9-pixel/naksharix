"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

const footerLinks = [
  ["horoscope", "/horoscope"],
  ["kundli", "/kundli"],
  ["tarot", "/tarot"],
  ["navCalculator", "/calculators"],
  ["navReports", "/reports"],
  ["navContact", "/contact"]
] as const;

const trustLinks = [
  ["about", "/about"],
  ["contact", "/contact"],
  ["privacyPolicy", "/privacy-policy"],
  ["termsConditions", "/terms"],
  ["disclaimer", "/disclaimer"],
  ["refundPolicy", "/refund-policy"]
] as const;

export function Footer() {
  const { tr } = useLanguage();

  return (
    <footer className="border-t border-[#1e293b] bg-[linear-gradient(180deg,rgba(10,18,36,0.78),rgba(2,6,18,0.96))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm naksh-muted-text md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-md">
          <BrandLogo />
          <p className="mt-4 leading-6">{tr("footerCopy")}</p>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
          {footerLinks.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md border border-[#1e293b] bg-[#0f1c3a]/65 px-3 py-2 text-[#ffffff] transition hover:border-[#dca956]/50 hover:text-[#f3d382]">
              {tr(label)}
            </Link>
          ))}
        </nav>
        <div className="rounded-xl border border-[#1e293b] bg-[#0f1c3a]/65 p-4">
          <p className="font-cinzel text-sm font-bold text-[#f3d382]">{tr("premiumReports")}</p>
          <div className="mt-3 grid gap-2">
            <Link href="/reports" className="text-[#ffffff] transition hover:text-[#f3d382]">{tr("navReports")}</Link>
            <Link href="/panchang" className="text-[#ffffff] transition hover:text-[#f3d382]">{tr("navPanchang")}</Link>
            <Link href="/numerology" className="text-[#ffffff] transition hover:text-[#f3d382]">{tr("navNumerology")}</Link>
          </div>
          <div className="mt-5 border-t border-[#1e293b] pt-4">
            <p className="font-cinzel text-sm font-bold text-[#f3d382]">{tr("trustSafety")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {trustLinks.map(([label, href]) => (
                <Link key={href} href={href} className="text-xs text-[#ffffff] transition hover:text-[#f3d382]">
                  {tr(label)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
