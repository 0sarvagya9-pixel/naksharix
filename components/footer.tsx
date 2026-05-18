"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

const footerLinks = [
  ["horoscope", "/horoscope"],
  ["kundli", "/kundli"],
  ["tarot", "/tarot"],
  ["calculators", "/calculators"],
  ["contact", "/contact"]
] as const;

export function Footer() {
  const { tr } = useLanguage();

  return (
    <footer className="border-t border-[#F5C542]/20 bg-[#090016]/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm naksh-muted-text md:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-4">{tr("footerCopy")}</p>
        </div>
        {footerLinks.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-[#FFF7E8]">
            {tr(label)}
          </Link>
        ))}
        <Link href="/hi" className="hover:text-[#FFF7E8]">हिन्दी</Link>
      </div>
    </footer>
  );
}
