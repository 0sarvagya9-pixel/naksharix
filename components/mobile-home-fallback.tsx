import Link from "next/link";
import { Bot, Gem, HeartHandshake, MoonStar, Sparkles, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

const mobileFeatures = [
  ["Kundli", "/kundli", MoonStar],
  ["AI Astrologer", "/talk-to-kundli", Bot],
  ["Matching", "/kundli-matching", HeartHandshake],
  ["Premium Reports", "/reports", Sparkles],
  ["Tarot", "/tarot", Gem],
  ["Consultation", "/consultation", Users]
] as const;

export function MobileHomeFallback() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030914] px-4 pb-10 pt-5 text-[#E0E6ED] lg:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(212,175,55,0.14),transparent_16rem),radial-gradient(circle_at_78%_24%,rgba(0,242,254,0.14),transparent_18rem),linear-gradient(135deg,#030914,#071126)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_8%_18%,rgba(255,255,255,0.42)_0_1px,transparent_2px),radial-gradient(circle_at_24%_64%,rgba(245,215,110,0.36)_0_1px,transparent_2px),radial-gradient(circle_at_62%_28%,rgba(0,242,254,0.28)_0_1px,transparent_2px),radial-gradient(circle_at_88%_72%,rgba(255,255,255,0.32)_0_1px,transparent_2px)]" />

      <div className="relative">
        <BrandLogo />

        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#F5D76E] backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Premium AI + Vedic Astrology Platform
        </div>

        <h1 className="mt-5 bg-gradient-to-r from-[#F8E7A1] via-[#D4AF37] to-[#9C741C] bg-clip-text font-decorative text-4xl font-black uppercase leading-tight text-transparent">
          Unlock Your Cosmic Destiny
        </h1>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-[#F5D76E]">अपनी कॉस्मिक नियति समझें</p>
        <p className="mt-4 text-sm leading-7 text-[#E0E6ED]/78">
          Ancient Vedic wisdom, numerology direction, AI interpretation, and expert consultation flows in one premium spiritual-tech platform.
        </p>

        <div className="mt-7 grid gap-3">
          <Button variant="secondary" asChild>
            <Link href="/kundli">अपनी कुंडली बनाएं</Link>
          </Button>
          <Button asChild>
            <Link href="/talk-to-kundli">AI ज्योतिषी से बात करें</Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {mobileFeatures.map(([title, href, Icon]) => (
            <Link
              key={title}
              href={href}
              className="rounded-2xl border border-[#D4AF37]/22 bg-white/[0.035] p-4 shadow-[0_18px_55px_rgba(0,5,16,0.34)] backdrop-blur transition hover:border-[#F5D76E]/45"
            >
              <Icon className="h-5 w-5 text-[#F5D76E]" />
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
