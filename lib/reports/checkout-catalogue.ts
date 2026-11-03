import { getPaidReport } from "@/lib/paid-reports";

const manualToPaidReportId: Record<string, string> = {
  "premium-kundli": "kundli-pro",
  "couple-kundli": "marriage-report",
  "career-report": "career-report",
  "wealth-report": "finance-report",
  "numerology-lo-shu-report": "numerology-report",
  "yearly-horoscope-report": "yearly-ai",
  "love-report": "love-relationship-report",
  "baby-name-report": "baby-name-personalized",
  "sade-sati-report": "sade-sati-personalized",
  "manglik-kaal-sarp-report": "manglik-kaal-sarp-personalized",
  "name-correction-report": "name-correction-personalized",
  "transit-report": "transit-personalized",
  "rahu-ketu-report": "rahu-ketu-personalized",
  "jupiter-transit-report": "jupiter-transit-personalized",
  "fortune-report": "fortune-personalized"
};

export type ManualReportCheckout = {
  reportSlug: string;
  reportId: string;
  purpose: "KUNDLI_REPORT" | "YEARLY_REPORT" | "MATCH_REPORT";
  name: string;
  amount: number;
  price: string;
};

export function getManualReportCheckout(reportSlug: string): ManualReportCheckout | null {
  const reportId = manualToPaidReportId[reportSlug];
  if (!reportId) return null;

  const paidReport = getPaidReport(reportId);
  if (!paidReport) return null;

  return {
    reportSlug,
    reportId: paidReport.id,
    purpose: paidReport.purpose,
    name: paidReport.name,
    amount: paidReport.amount,
    price: paidReport.price
  };
}

export function isPaidManualReport(reportSlug: string) {
  return Boolean(getManualReportCheckout(reportSlug));
}
