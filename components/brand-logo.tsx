import Link from "next/link";
import { MoonStar, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex flex-shrink-0 items-center gap-3 whitespace-nowrap", className)} aria-label="Naksharix home">
      <span className="relative grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-[#dca956]/60 bg-[radial-gradient(circle_at_34%_24%,#f3d382_0%,#f3d382_24%,#dca956_50%,#dca956_74%,#020612_100%)] text-[#020612] shadow-[0_0_30px_rgba(220,169,86,0.32),0_0_18px_rgba(0,245,160,0.16)]">
        <span className="absolute inset-1.5 rounded-full border border-[#f3d382]/40" />
        <span className="absolute inset-2.5 rounded-full border border-[#020612]/25" />
        <MoonStar className="relative h-5 w-5" />
        <Sparkle className="absolute right-1 top-1 h-2.5 w-2.5 text-[#f3d382]" />
      </span>
      {!compact ? (
        <span className="min-w-0 leading-none">
          <span className="block bg-gradient-to-r from-[#f3d382] via-[#f3d382] to-[#dca956] bg-clip-text font-cinzel text-xl font-black tracking-[0.16em] text-transparent">NAKSHARIX</span>
          <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#94a3b8] lg:block">Cosmic Destiny</span>
        </span>
      ) : null}
    </Link>
  );
}
