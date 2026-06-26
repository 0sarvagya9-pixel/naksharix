import { Database, FileCheck2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  { label: "Trusted workflow",          icon: FileCheck2 },
  { label: "Secure workflow",           icon: LockKeyhole },
  { label: "Provider calculated",       icon: ShieldCheck },
  { label: "Premium reports",           icon: Sparkles },
  { label: "Internal astrology engine", icon: Database },
];

export function Theme10TrustRow() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="cosmic-glass grid gap-3 rounded-[1.75rem] p-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 transition hover:bg-[#D8AF66]/8"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#D8AF66]/12 text-[#D8AF66]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-[#FAFAFA]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
