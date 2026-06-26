import Link from "next/link";
import { Bell, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Theme10CosmicWheel } from "@/components/theme10/theme10-cosmic-wheel";
import { Theme10MobileToolGrid } from "@/components/theme10/theme10-tool-strip";

export function Theme10MobilePreview() {
  return (
    <div className="mx-auto w-full max-w-[25rem] rounded-[2rem] border border-[#E7D8BE] bg-white/90 p-3 shadow-[0_24px_80px_rgba(86,64,31,0.16)] backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#B8862E]">Naksharix</span>
        <div className="flex gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#E7D8BE] bg-[#FFF9F0]"><Bell className="h-4 w-4 text-[#B8862E]" /></span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#E7D8BE] bg-[#FFF9F0]"><UserRound className="h-4 w-4 text-[#B8862E]" /></span>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.65rem] bg-[radial-gradient(circle_at_50%_18%,rgba(216,175,102,0.30),transparent_34%),linear-gradient(135deg,#0D2438,#071827)] p-4 text-center text-[#FFF9F0]">
        <Theme10CosmicWheel compact className="scale-[0.94]" />
        <h2 className="mt-2 font-cinzel text-[clamp(1.75rem,9vw,2.25rem)] font-black uppercase leading-[0.92] tracking-[-0.025em]">
          <span className="block">Understand.</span>
          <span className="block text-[#F7EAD3]">Align. Elevate.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[17rem] text-xs leading-5 text-[#DCE8F7]">A compact cosmic dashboard for active Naksharix tools.</p>
        <Button size="sm" className="mt-4" asChild>
          <Link href="/kundli">Get My Kundli</Link>
        </Button>
      </div>
      <div className="mt-4">
        <Theme10MobileToolGrid />
      </div>
    </div>
  );
}
