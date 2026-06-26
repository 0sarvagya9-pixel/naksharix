import Link from "next/link";
import { CalendarDays, Clock, MapPin, ShieldCheck, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Theme10PanchangCard() {
  const rows = [
    { icon: Sun, title: "Sunrise / Sunset", copy: "Location-aware daily calculation" },
    { icon: Clock, title: "Rahu Kaal & Muhurat", copy: "Shown through the Panchang engine" },
    { icon: MapPin, title: "Date, city & timezone", copy: "Values may vary slightly by source" }
  ];

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#E7D8BE] bg-white/90 shadow-[0_22px_70px_rgba(86,64,31,0.12)]">
      <div className="border-b border-[#E7D8BE] bg-[radial-gradient(circle_at_90%_10%,rgba(216,175,102,0.26),transparent_34%),linear-gradient(135deg,#FFF9F0,#F7EAD3)] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#B8862E]">
            <CalendarDays className="h-4 w-4" />
            Today&apos;s Panchang
          </span>
          <span className="rounded-full border border-[#0f8f6f]/20 bg-[#0f8f6f]/10 px-3 py-1 text-xs font-bold text-[#0f8f6f]">Provider calculated</span>
        </div>
        <h2 className="mt-4 font-cinzel text-3xl font-black text-[#1F2933]">Daily timing for mindful planning</h2>
      </div>
      <div className="grid gap-3 p-5">
        {rows.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="flex gap-3 rounded-2xl border border-[#E7D8BE] bg-[#FFF9F0]/76 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F7EAD3] text-[#B8862E]">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#1F2933]">{title}</p>
              <p className="text-sm leading-6 text-[#6B7280]">{copy}</p>
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <ShieldCheck className="h-4 w-4 text-[#0f8f6f]" />
            Cross-check for critical Muhurat.
          </p>
          <Button asChild>
            <Link href="/panchang">Open Panchang</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
