import Link from "next/link";
import { CalendarDays, Clock, MapPin, ShieldCheck, Sun } from "lucide-react";

export function Theme10PanchangCard() {
  const rows = [
    { icon: Sun,         title: "Sunrise / Sunset",        copy: "Location-aware daily calculation" },
    { icon: Clock,       title: "Rahu Kaal & Muhurat",     copy: "Shown through the Panchang engine" },
    { icon: MapPin,      title: "Date, city & timezone",   copy: "Values may vary slightly by source" },
  ];

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#D8AF66]/25 bg-[rgba(4,12,30,0.60)] shadow-[0_22px_70px_rgba(0,0,0,0.50)] backdrop-blur-xl">
      {/* Card header */}
      <div className="border-b border-[#D8AF66]/20 bg-[radial-gradient(circle_at_90%_10%,rgba(216,175,102,0.14),transparent_34%),linear-gradient(135deg,rgba(4,12,30,0.80),rgba(2,6,18,0.95))] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D8AF66]/30 bg-[#D8AF66]/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#D8AF66]">
            <CalendarDays className="h-4 w-4" />
            Today&apos;s Panchang
          </span>
          <span className="rounded-full border border-[#0f8f6f]/30 bg-[#0f8f6f]/10 px-3 py-1 text-xs font-bold text-[#0f8f6f]">
            Provider calculated
          </span>
        </div>
        <h2 className="mt-4 font-cinzel text-3xl font-black text-[#FAFAFA]">
          Daily timing for mindful planning
        </h2>
      </div>

      {/* Card body */}
      <div className="grid gap-3 p-5">
        {rows.map(({ icon: Icon, title, copy }) => (
          <div
            key={title}
            className="flex gap-3 rounded-2xl border border-[#D8AF66]/15 bg-white/[0.03] p-3"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#D8AF66]/12 text-[#D8AF66]">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#FAFAFA]">{title}</p>
              <p className="text-sm leading-6 text-[#94a3b8]">{copy}</p>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-[#94a3b8]">
            <ShieldCheck className="h-4 w-4 text-[#0f8f6f]" />
            Cross-check for critical Muhurat.
          </p>
          <Link href="/panchang" className="btn-gold">
            Open Panchang
          </Link>
        </div>
      </div>
    </article>
  );
}
