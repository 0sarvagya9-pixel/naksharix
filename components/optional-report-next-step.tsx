import Link from "next/link";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";

type ReportSlug = "premium-kundli" | "couple-kundli";

/** An optional, catalogue-backed next step. No checkout, personal data or ad integration. */
export function OptionalReportNextStep({ reportSlug, locale }: { reportSlug: ReportSlug; locale: "en" | "hi" }) {
  const report = getManualReport(reportSlug);
  const checkout = getManualReportCheckout(reportSlug);
  if (!report || !checkout || !Number.isFinite(checkout.amount) || checkout.amount <= 0) return null;
  const labels = locale === "hi" ? {
    heading: "वैकल्पिक सशुल्क व्यक्तिगत रिपोर्ट",
    copy: "फ्री टूल का उपयोग करने के लिए रिपोर्ट खरीदना जरूरी नहीं है। खरीदने से पहले रिपोर्ट में शामिल विवरण और एक बार का शुल्क देखें।",
    price: "एक बार का शुल्क",
    action: "रिपोर्ट का विवरण देखें"
  } : {
    heading: "Optional personalized paid report",
    copy: "You can use the free tool without buying anything. Review what is included and the one-time fee before deciding.",
    price: "One-time fee",
    action: "View report details"
  };
  return (
    <aside className="mt-8 rounded-2xl border border-[#e4d0ac] bg-[#fffaf2] p-5 text-[#432d31] sm:p-6" aria-label={labels.heading}>
      <p className="text-sm font-semibold text-[#77434a]">{labels.heading}</p>
      <h2 className="mt-2 font-cinzel text-xl font-bold">{report.name[locale]}</h2>
      <p className="mt-2 text-sm leading-7">{labels.copy}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <p className="text-sm">{labels.price}: <strong className="text-lg">{checkout.price}</strong></p>
        <Link href={`/reports/${report.slug}`} className="inline-flex min-h-11 items-center rounded-xl bg-[#793746] px-4 py-2 text-sm font-semibold text-white hover:bg-[#622b38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#793746]">{labels.action}</Link>
      </div>
    </aside>
  );
}
