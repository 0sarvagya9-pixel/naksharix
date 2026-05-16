import Link from "next/link";
import { MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex flex-shrink-0 items-center gap-3 whitespace-nowrap", className)} aria-label="Naksharix home">
      <span className="relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-amber-300/35 bg-[linear-gradient(135deg,rgba(126,72,255,0.95),rgba(245,190,88,0.9))] text-white shadow-[0_0_32px_rgba(177,132,255,0.35)]">
        <span className="absolute inset-1 rounded-md border border-white/20" />
        <MoonStar className="relative h-5 w-5" />
      </span>
      {!compact ? (
        <span className="min-w-0 leading-none">
          <span className="block font-cinzel text-xl font-black tracking-wide text-foreground">Naksharix</span>
          <span className="hidden text-[0.68rem] font-medium uppercase tracking-[0.24em] text-amber-200/80 sm:block">Cosmic Destiny</span>
        </span>
      ) : null}
    </Link>
  );
}
