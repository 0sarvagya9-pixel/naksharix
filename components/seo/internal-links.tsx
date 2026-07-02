import Link from "next/link";
import { ArrowRight } from "lucide-react";

const links = [
  { href: "/horoscope/all-signs/today", label: "Today horoscope" },
  { href: "/kundli", label: "Free kundli" },
  { href: "/matchmaking", label: "Kundli matching" },
  { href: "/reports", label: "Premium reports" }
];

export function SeoInternalLinks({ title = "Explore Naksharix" }: { title?: string }) {
  return (
    <div className="mt-10 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-5">
      <h2 className="font-cinzel text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between rounded-md border border-[#D4AF37]/15 bg-[#02112C]/60 px-3 py-2 text-sm transition hover:border-[#D4AF37]/45">
            {link.label}
            <ArrowRight className="h-4 w-4 text-[#FFD700]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
