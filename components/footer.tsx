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
    <footer className="border-t border-amber-200/15 bg-background/70">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-4">{tr("footerCopy")}</p>
        </div>
        {footerLinks.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-foreground">
            {tr(label)}
          </Link>
        ))}
        <Link href="/hi" className="hover:text-foreground">हिन्दी</Link>
      </div>
    </footer>
  );
}
