import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex min-w-0 flex-shrink-0 items-center gap-3 whitespace-nowrap", className)} aria-label="Naksharix home">
      <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center overflow-visible bg-transparent md:h-[3.25rem] md:w-[3.25rem]">
        <Image
          src="/images/naksharix-final-logo-symbol.png"
          alt=""
          width={96}
          height={96}
          priority
          className="h-full w-full object-contain object-center drop-shadow-[0_0_16px_rgba(220,169,86,0.28)]"
          sizes="52px"
        />
      </span>
      {!compact ? (
        <span className="hidden min-w-0 leading-none min-[360px]:block">
          <span className="block bg-gradient-to-r from-[#6d2635] via-[#963b44] to-[#ac6b3e] bg-clip-text font-cinzel text-lg font-black tracking-[0.16em] text-transparent md:text-xl">NAKSHARIX</span>
          <span className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#71505a] lg:block naksh-brand-subtitle">Vedic Astrology</span>
        </span>
      ) : null}
    </Link>
  );
}
