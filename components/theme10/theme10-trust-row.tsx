import { Database, FileCheck2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  { label: "Trusted workflow", icon: FileCheck2 },
  { label: "Secure workflow", icon: LockKeyhole },
  { label: "Provider calculated", icon: ShieldCheck },
  { label: "Premium reports", icon: Sparkles },
  { label: "Internal astrology engine", icon: Database }
];

export function Theme10TrustRow() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-[1.75rem] border border-[#E7D8BE] bg-white/82 p-4 shadow-[0_18px_64px_rgba(86,64,31,0.10)] sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#FFF9F0]/74 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F7EAD3] text-[#B8862E] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-[#1F2933]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
