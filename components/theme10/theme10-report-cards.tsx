import Link from "next/link";
import { ArrowRight, FileText, LockKeyhole, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { title: "Premium Kundli Report", copy: "Provider-calculated chart sections prepared for admin review.", href: "/reports/premium-kundli", icon: ScrollText },
  { title: "Career Report", copy: "Reviewed report request workflow for career-focused guidance.", href: "/reports/career-report", icon: FileText },
  { title: "Secure PDF Access", copy: "Downloads appear only when a real generated file exists.", href: "/reports", icon: LockKeyhole }
];

export function Theme10ReportCards() {
  return (
    <section className="mx-auto grid w-full max-w-[1380px] gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
      {reports.map(({ title, copy, href, icon: Icon }) => (
        <Link key={title} href={href} className="group rounded-[1.75rem] border border-[#E7D8BE] bg-[linear-gradient(145deg,#FFFFFF,#FFF9F0)] p-5 shadow-[0_18px_60px_rgba(86,64,31,0.10)] transition hover:-translate-y-1 hover:border-[#D8AF66]/60 hover:shadow-[0_26px_70px_rgba(86,64,31,0.14)]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[radial-gradient(circle_at_35%_20%,#FFF9F0,#D8AF66_58%,#B8862E)] text-[#0D2438] shadow-[0_14px_30px_rgba(216,175,102,0.24)]">
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="mt-5 font-cinzel text-2xl font-black text-[#1F2933]">{title}</h3>
          <p className="mt-3 min-h-16 text-sm leading-6 text-[#6B7280]">{copy}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#B8862E]">
            View workflow <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
      <div className="rounded-[1.75rem] border border-[#E7D8BE] bg-[radial-gradient(circle_at_88%_18%,rgba(216,175,102,0.22),transparent_34%),linear-gradient(135deg,#0D2438,#071827)] p-5 text-[#FFF9F0] shadow-[0_18px_60px_rgba(13,36,56,0.18)] lg:col-span-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8AF66]">Premium report workflow</p>
            <h3 className="mt-2 font-cinzel text-3xl font-black">Reviewed through Naksharix workflow</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#DCE8F7]">No unsupported payment confirmation, no unsupported delivery claim, and no public completion state until the system has a real saved request, admin action, and generated PDF.</p>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/reports">Request Report</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
