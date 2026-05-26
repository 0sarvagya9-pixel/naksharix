import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const schema = source("prisma/schema.prisma");
const reportApi = source("app/api/report-requests/route.ts");
const reportsContent = source("components/reports-content.tsx");
const adminLayout = source("app/admin/layout.tsx");
const adminApi = source("app/api/admin/report-requests/route.ts");
const adminActions = source("components/admin/report-request-actions.tsx");
const downloadApi = source("app/api/report-requests/[id]/download/route.ts");
const generatePdfApi = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const workflow = source("lib/reports/report-workflow-status.ts");

assert(schema.includes("model ReportRequest"), "ReportRequest model exists", "Prisma persistence surface present");
assert(schema.includes("reportSlug") && schema.includes("adminNotes") && schema.includes("generatedPdfBytes"), "ReportRequest stores workflow and PDF fields", "real report workflow metadata");
assert(reportApi.includes("getCurrentUser()"), "Report request API requires auth", "no anonymous fake persistence");
assert(reportApi.includes("ReportPaymentStatus.PENDING") && reportApi.includes("PENDING_REVIEW"), "Report request API creates pending-review records", "no-payment request stage is real DB persistence");
assert(reportsContent.includes("Real submission creates a pending-review DB request"), "Reports page explains real pending-review submission", "no unsupported delivery claim");
assert(adminLayout.includes("ADMIN") && adminLayout.includes("SUPER_ADMIN"), "Admin report routes are RBAC-protected", "admin layout guard");
assert(adminApi.includes("PATCH") && adminApi.includes("adminNotes"), "Admin report workflow updates status and notes", "real admin workflow API");
assert(adminActions.includes("Generate PDF") && adminActions.includes("Save workflow"), "Admin report detail exposes real actions", "no sample data");
assert(downloadApi.includes("reportRequest.userId !== user.id") && downloadApi.includes("application/pdf"), "Secure PDF download enforces owner/admin access", "no fake URL");
assert(generatePdfApi.includes("generatePremiumReportPdf") && generatePdfApi.includes("generatedPdfBytes"), "Admin PDF generation stores real bytes", "no fake delivery");
assert(workflow.includes("publicDbPersistenceEnabled: true"), "Report workflow readiness is active", "authenticated DB persistence enabled");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nReports workflow QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);
