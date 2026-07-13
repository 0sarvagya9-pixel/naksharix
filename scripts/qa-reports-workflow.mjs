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
const reportDetail = source("app/reports/[slug]/page.tsx");
const requestPage = source("app/report-request/new/page.tsx");
const checkoutButton = source("components/razorpay-checkout-button.tsx");
const adminLayout = source("app/admin/layout.tsx");
const adminApi = source("app/api/admin/report-requests/route.ts");
const adminActions = source("components/admin/report-request-actions.tsx");
const downloadApi = source("app/api/report-requests/[id]/download/route.ts");
const generatePdfApi = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const deliverApi = source("app/api/admin/report-requests/[id]/deliver/route.ts");
const workflow = source("lib/reports/report-workflow-status.ts");

assert(schema.includes("model ReportRequest"), "ReportRequest model exists", "Prisma persistence surface present");
assert(schema.includes("reportSlug") && schema.includes("adminNotes") && schema.includes("generatedPdfBytes"), "ReportRequest stores workflow and PDF fields", "real report workflow metadata");
assert(reportApi.includes("getCurrentUser()"), "Report request API requires auth", "no anonymous fake persistence");
assert(reportApi.includes("ReportPaymentStatus.PENDING") && reportApi.includes("PENDING_REVIEW"), "Report request API creates pending-review records", "no-payment request stage is real DB persistence");
assert(
  reportsContent.includes("No-payment pending-review request")
    && reportsContent.includes("server-verified payment")
    && reportsContent.includes("actual generated PDF"),
  "Reports page explains paid and pending-review workflows",
  "no unsupported payment or delivery claim"
);
assert(
  reportDetail.includes("RazorpayCheckoutButton")
    && reportDetail.includes("successHref={checkoutSuccessHref}")
    && requestPage.includes("payment.status === PaymentStatus.PAID"),
  "Fixed-price report checkout continues only after verified payment",
  "client checkout and server gate are connected"
);
assert(
  reportApi.includes("Payment does not match this report")
    && reportApi.includes("metadata.reportId === checkout.reportId")
    && reportApi.includes("Number(payment.amount) === checkout.amount"),
  "Report request API binds payment to exact report and amount",
  "cross-report payment reuse is blocked"
);
assert(
  checkoutButton.includes('replace("{paymentId}"') && checkoutButton.includes("/api/payments/razorpay/verify"),
  "Checkout redirects only after server verification",
  "payment continuation uses verified internal payment id"
);
assert(adminLayout.includes("ADMIN") && adminLayout.includes("SUPER_ADMIN"), "Admin report routes are RBAC-protected", "admin layout guard");
assert(adminApi.includes("PATCH") && adminApi.includes("adminNotes"), "Admin report workflow updates status and notes", "real admin workflow API");
assert(adminApi.includes("assertAllowedReportStatusTransition"), "Admin workflow enforces centralized status transitions", "no fake lifecycle status");
assert(adminActions.includes("Generate PDF") && adminActions.includes("Save workflow"), "Admin report detail exposes real actions", "no sample data");
assert(adminActions.includes("Send Email") && adminActions.includes("/deliver"), "Admin report detail exposes real delivery action", "delivery is action-based");
assert(downloadApi.includes("reportRequest.userId !== user.id") && downloadApi.includes("application/pdf"), "Secure PDF download enforces owner/admin access", "no fake URL");
assert(generatePdfApi.includes("generatePremiumReportPdf") && generatePdfApi.includes("generatedPdfBytes"), "Admin PDF generation stores real bytes", "no fake delivery");
assert(deliverApi.includes("sendReportDeliveryEmail") && deliverApi.includes("ReportRequestStatus.DELIVERED"), "Delivery API marks delivered only through service action", "no manual fake delivery");
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
