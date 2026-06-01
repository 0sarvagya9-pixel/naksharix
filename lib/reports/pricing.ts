import "server-only";
import { PaymentPurpose } from "@prisma/client";
import { paidReports } from "@/lib/paid-reports";

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

export function getReportPricing(reportSlug: string) {
  return reportPricing.find((item) => item.reportSlug === reportSlug) ?? null;
}
