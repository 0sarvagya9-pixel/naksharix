export type ReportWorkflowReadiness = {
  publicDbPersistenceEnabled: boolean;
  reason: string;
  existingSafeSurfaces: string[];
  blockers: string[];
};

export function getReportWorkflowReadiness(): ReportWorkflowReadiness {
  return {
    publicDbPersistenceEnabled: true,
    reason: "Authenticated report requests are persisted; explicit administrator chart/input review and valid entitlement are required before a PDF can be generated and securely delivered.",
    existingSafeSurfaces: [
      "Prisma ReportRequest model exists.",
      "ReportRequest stores reportSlug, admin notes, generated PDF metadata, and workflow status.",
      "ReportStatusHistory and AuditLog store safe lifecycle/audit metadata.",
      "Central status-transition guard blocks invalid generated/delivered states.",
      "Admin report request read/update API exists.",
      "Admin report request detail page exists.",
      "User profile shows real report request history and generated PDF downloads only when a real file exists."
    ],
    blockers: [
      "Live end-to-end customer PDF receipt, chart-input approval and recipient mailbox delivery still need independent operator verification.",
      "Payment acceptance is tracked separately from this non-payment report workflow.",
      "Email adapter configuration does not prove that the recipient has received a message; validate provider and mailbox independently.",
      "R2/S3 storage env can be configured later; generated PDF bytes are stored in the database for secure authenticated download."
    ]
  };
}
