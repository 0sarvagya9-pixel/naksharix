import type { PremiumReportTemplate } from "@/lib/reports/premium-report-types";

export const premiumReportTemplateRegistry: PremiumReportTemplate[] = [
  {
    id: "premium-kundli-report-template-v0",
    reportType: "premium-kundli",
    version: "0.1-foundation",
    language: "en",
    pdfRenderer: "future_html_to_pdf_chromium",
    automaticDeliveryEnabled: false,
    paymentRequiredInApp: false,
    status: "foundation_only",
    sections: [
      { key: "birth-summary", title: "Birth Details Summary", requiredData: ["verifiedBirthInput"], generatedAutomatically: false, requiresAdminReview: true },
      { key: "chart-analysis", title: "Chart Analysis", requiredData: ["verifiedChart"], generatedAutomatically: false, requiresAdminReview: true },
      { key: "dasha-guidance", title: "Dasha Guidance", requiredData: ["verifiedDashaTransitions"], generatedAutomatically: false, requiresAdminReview: true }
    ]
  }
];
