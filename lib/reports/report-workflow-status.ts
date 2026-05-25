export type ReportWorkflowReadiness = {
  publicDbPersistenceEnabled: false;
  reason: string;
  existingSafeSurfaces: string[];
  blockers: string[];
};

export function getReportWorkflowReadiness(): ReportWorkflowReadiness {
  return {
    publicDbPersistenceEnabled: false,
    reason: "The existing ReportRequest API is authenticated and payment/admin-bypass oriented, while the public reports page is intentionally no-payment request-intent.",
    existingSafeSurfaces: [
      "Prisma ReportRequest model exists.",
      "Admin report request read API exists.",
      "Admin report request detail page exists.",
      "Public report catalogue uses request-intent without fake submission."
    ],
    blockers: [
      "ReportRequest model does not store reportSlug/reportType from the manual catalogue.",
      "Current ReportRequestStatus enum does not include pending_review, needs_info, ready_for_generation, generated, or delivered.",
      "No admin notes field exists.",
      "No no-payment public request policy has been approved.",
      "No user report request history page is wired to real persisted data yet."
    ]
  };
}
