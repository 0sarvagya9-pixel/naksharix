import Link from "next/link";
import { Calculator, CalendarDays, Grid3X3, HeartHandshake, MoonStar, MoreHorizontal, ScrollText, Sparkles, SunMoon } from "lucide-react";

const tools = [
  { label: "Kundli", href: "/kundli", icon: MoonStar },
  { label: "Panchang", href: "/panchang", icon: CalendarDays },
  { label: "Horoscope", href: "/daily-horoscope", icon: SunMoon },
  { label: "Numerology", href: "/numerology", icon: Grid3X3 },
  { label: "Match Making", href: "/matchmaking", icon: HeartHandshake },
  { label: "Tarot", href: "/tarot", icon: Sparkles },
  { label: "Transits", href: "/transits", icon: ScrollText },
  { label: "More Tools", href: "/free-calculators", icon: Calculator }
];

export function Theme10ToolStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-5 w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
      <div className="theme10-tool-strip grid auto-cols-[6.8rem] grid-flow-col gap-3 overflow-x-auto rounded-[2rem] border border-[#E7D8BE] bg-white/88 p-3 shadow-[0_24px_80px_rgba(86,64,31,0.14)] backdrop-blur-xl sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
        {tools.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#FFF9F0]/45 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#D8AF66]/45 hover:bg-[#F7EAD3]/65 hover:shadow-[0_16px_30px_rgba(86,64,31,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862E]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_25%,#FFF9F0,#D8AF66_45%,#B8862E_100%)] text-[#0D2438] shadow-[0_12px_28px_rgba(216,175,102,0.24)] ring-1 ring-white/70">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1F2933]">{label}</span>
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
        <Link key={label} href={href} className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-[#E7D8BE] bg-white/82 p-2 text-center shadow-sm">
          <Icon className="h-5 w-5 text-[#B8862E]" />
          <span className="text-[0.66rem] font-bold leading-tight text-[#1F2933]">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function Theme10MoreIcon() {
  return <MoreHorizontal className="h-5 w-5" />;
}
