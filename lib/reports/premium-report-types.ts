export type PremiumReportAutomationStatus =
  | "foundation_only"
  | "manual_review_required"
  | "blocked_until_database_workflow"
  | "blocked_until_payment_workflow";

export type PremiumReportGenerationStatus =
  | "draft"
  | "pending_review"
  | "ready_for_generation"
  | "generated"
  | "delivered"
  | "failed";

export type PremiumReportSection = {
  key: string;
  title: string;
  requiredData: string[];
  generatedAutomatically: false;
  requiresAdminReview: true;
};

export type PremiumReportTemplate = {
  id: string;
  reportType: string;
  version: string;
  language: "en" | "hi" | "hinglish";
  sections: PremiumReportSection[];
  pdfRenderer: "future_html_to_pdf_chromium";
  automaticDeliveryEnabled: false;
  paymentRequiredInApp: false;
  status: PremiumReportAutomationStatus;
};

export const premiumReportAutomationStatus = {
  status: "foundation_only" as const,
  automaticGenerationEnabled: false,
  automaticDeliveryEnabled: false,
  paymentEnabled: false,
  requiresAdminReview: true,
  rendererPlan: "Migrate premium reports to reviewed HTML-to-PDF/Chromium templates after chart precision and database workflows are verified.",
  publicClaimBoundary: "Naksharix must not claim instant premium PDF generation or delivery until the workflow is real."
};
