import Link from "next/link";
import {
  Calculator, CalendarDays, Grid3X3, HeartHandshake,
  MoonStar, MoreHorizontal, ScrollText, Sparkles, SunMoon,
} from "lucide-react";

const tools = [
  { label: "Kundli",      href: "/kundli",            icon: MoonStar },
  { label: "Panchang",    href: "/panchang",          icon: CalendarDays },
  { label: "Horoscope",   href: "/daily-horoscope",   icon: SunMoon },
  { label: "Numerology",  href: "/numerology",        icon: Grid3X3 },
  { label: "Match Making",href: "/matchmaking",       icon: HeartHandshake },
  { label: "Tarot",       href: "/tarot",             icon: Sparkles },
  { label: "Transits",    href: "/transits",          icon: ScrollText },
  { label: "More Tools",  href: "/free-calculators",  icon: Calculator },
];

export function Theme10ToolStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-5 w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
      <div className="theme10-tool-strip cosmic-glass grid auto-cols-[6.8rem] grid-flow-col gap-3 overflow-x-auto rounded-[2rem] p-3 sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
        {tools.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-transparent bg-white/[0.03] px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#D8AF66]/35 hover:bg-[#D8AF66]/8 hover:shadow-[0_12px_30px_rgba(216,175,102,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D8AF66]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#D8AF66] via-[#F3D382] to-[#B8862E] text-[#0D1B2A] shadow-[0_8px_22px_rgba(216,175,102,0.30)] ring-1 ring-white/20">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#FAFAFA]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Theme10MobileToolGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {tools.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="cosmic-glass-interactive flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center"
        >
          <Icon className="h-5 w-5 text-[#D8AF66]" />
          <span className="text-[0.66rem] font-bold leading-tight text-[#FAFAFA]">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function Theme10MoreIcon() {
  return <MoreHorizontal className="h-5 w-5" />;
}
