import "server-only";
import { PaymentPurpose } from "@prisma/client";
import { paidReports } from "@/lib/paid-reports";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";

export type ReportPricingItem = {
  reportSlug: string;
  reportType: PaymentPurpose;
  amount: number;
  currency: "INR";
  name: string;
};

export const reportPricing: ReportPricingItem[] = paidReports.map((report) => ({
  reportSlug: report.id,
  reportType: report.purpose as PaymentPurpose,
  amount: report.amount,
  currency: "INR",
  name: report.name
}));

export function getReportPricing(reportSlug: string): ReportPricingItem | null {
  const direct = reportPricing.find((item) => item.reportSlug === reportSlug);
  if (direct) return direct;

  const checkout = getManualReportCheckout(reportSlug);
  if (!checkout) return null;

  return {
    reportSlug,
    reportType: checkout.purpose as PaymentPurpose,
    amount: checkout.amount,
    currency: "INR",
    name: checkout.name
  };
}
