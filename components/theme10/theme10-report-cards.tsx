import Link from "next/link";
import { ArrowRight, FileText, LockKeyhole, ScrollText } from "lucide-react";

const reports = [
  {
    title: "Premium Kundli Report",
    copy: "Provider-calculated chart sections prepared for admin review.",
    href: "/reports/premium-kundli",
    icon: ScrollText,
  },
  {
    title: "Career Report",
    copy: "Reviewed report request workflow for career-focused guidance.",
    href: "/reports/career-report",
    icon: FileText,
  },
  {
    title: "Secure PDF Access",
    copy: "Downloads appear only when a real generated file exists.",
    href: "/reports",
    icon: LockKeyhole,
  },
];

export function Theme10ReportCards() {
  return (
    <section className="mx-auto grid w-full max-w-[1380px] gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
      {reports.map(({ title, copy, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className="cosmic-glass-interactive group rounded-[1.75rem] p-5"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#D8AF66] via-[#F3D382] to-[#B8862E] text-[#0D1B2A] shadow-[0_10px_28px_rgba(216,175,102,0.28)]">
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="mt-5 font-cinzel text-2xl font-black text-[#FAFAFA]">{title}</h3>
          <p className="mt-3 min-h-16 text-sm leading-6 text-[#94a3b8]">{copy}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#D8AF66]">
            View workflow <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      ))}

      {/* Full-width dark CTA banner */}
      <div className="rounded-[1.75rem] border border-[#D8AF66]/25 bg-[radial-gradient(circle_at_88%_18%,rgba(216,175,102,0.14),transparent_34%),linear-gradient(135deg,rgba(4,12,30,0.88),rgba(2,6,18,0.98))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:col-span-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8AF66]">
              Premium report workflow
            </p>
            <h3 className="mt-2 font-cinzel text-3xl font-black text-[#FAFAFA]">
              Reviewed through Naksharix workflow
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#94a3b8]">
              No unsupported payment confirmation, no unsupported delivery claim, and no public
              completion state until the system has a real saved request, admin action, and
              generated PDF.
            </p>
          </div>
          <Link href="/reports" className="btn-gold shrink-0">
            Request Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
