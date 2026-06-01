export type ReportWorkflowReadiness = {
  publicDbPersistenceEnabled: boolean;
  reason: string;
  existingSafeSurfaces: string[];
  blockers: string[];
};

export function getReportWorkflowReadiness(): ReportWorkflowReadiness {
  return {
    publicDbPersistenceEnabled: true,
    reason: "Authenticated report requests now persist as pending-review records without requiring payment at request stage.",
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
      "Database migration must be applied in production before the new fields are available.",
      "Public payment remains optional/disabled unless Razorpay environment variables are configured.",
      "Email delivery remains disabled unless EMAIL_PROVIDER=smtp and SMTP settings are configured.",
      "R2/S3 storage env can be configured later; generated PDF bytes are stored in the database for secure authenticated download."
    ]
  };
}
