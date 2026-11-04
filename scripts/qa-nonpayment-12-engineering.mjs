import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = path => readFileSync(path, "utf8");
const reportAdmin = source("app/api/admin/report-requests/route.ts");
const pdf = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const reportPage = source("app/admin/report-requests/[id]/page.tsx");
const reportActions = source("components/admin/report-request-actions.tsx");
const workflow = source("lib/reports/report-workflow-status.ts");
const draftApi = source("app/api/ai/report-generator/route.ts");
const draftProvider = source("lib/ai/report-draft.ts");
const draftUi = source("components/ai-report-generator-form.tsx");
const emailAdmin = source("app/api/admin/email-test/route.ts");
const emailUi = source("components/admin/admin-email-acceptance-test.tsx");
const analytics = source("app/api/admin/analytics/route.ts");
const admin = source("app/admin/page.tsx");
const env = source("lib/env.ts");

assert.ok(reportAdmin.includes('reviewConfirmed: z.boolean().optional()') &&
  reportAdmin.includes('body.reviewConfirmed !== true') &&
  reportAdmin.includes('(body.adminNotes ?? "").trim().length < 30') &&
  reportAdmin.includes('reviewConfirmed: body.status === ReportRequestStatus.READY_FOR_GENERATION') &&
  reportAdmin.includes("assertAllowedReportStatusTransition"),
  "PDF preparation requires real, explicit operator review with audit notes and existing status guard");

assert.ok(pdf.includes('reportRequest.status !== ReportRequestStatus.READY_FOR_GENERATION') &&
  pdf.includes("prisma.reportStatusHistory.findFirst({") &&
  pdf.includes('actorRole: { in: ["ADMIN", "SUPER_ADMIN"] }') &&
  pdf.includes("approvedReview.note !== reportRequest.adminNotes") &&
  pdf.includes("generatedPdfStorageKey: null") &&
  pdf.includes("prisma.reportRequest.updateMany({") &&
  pdf.includes('if (claim.count !== 1) return fail(') &&
  pdf.includes("reportRequest.paymentStatus !== \"PAID\"") &&
  pdf.includes("generatedPdfBytes"),
  "Report PDF generation must fail closed on unreviewed, unpaid, duplicated or stale requests");

assert.ok(reportActions.includes("I have manually examined") &&
  reportActions.includes("reviewConfirmed") &&
  reportActions.includes("at least 30 characters") &&
  reportActions.includes('status !== "READY_FOR_GENERATION"') &&
  reportPage.includes("request.generatedPdfStorageKey"),
  "Admin UI exposes real review approval and correctly recognizes R2/S3 stored PDFs");

assert.ok(!workflow.includes("Database migration must be applied in production") &&
  !workflow.includes("Email delivery remains disabled unless") &&
  workflow.includes("actual recipient")===false,
  "Readiness must not assert stale migration or email-disabled claims");

assert.ok(draftApi.includes("isAiReportGeneratorEnabled()") &&
  draftApi.includes("aiFeatureParkedResponse()") &&
  draftApi.includes('getCurrentUser()') &&
  draftApi.includes('z.object({') &&
  draftApi.includes('.strict()') &&
  draftApi.includes("prisma.$transaction(async tx =>") &&
  draftApi.includes("pg_advisory_xact_lock(") &&
  draftApi.includes('action: "ai.report.draft.attempt"') &&
  draftApi.includes("attempts >= 4") &&
  draftApi.includes("ReportDraftUnavailableError") &&
  draftApi.includes("customerDownloadAvailable: false"),
  "Professional AI report is authenticated, quota-protected, fail-closed and noncommercial");

assert.ok(draftProvider.includes('import "server-only";') &&
  draftProvider.includes('getenv')===false &&
  draftProvider.includes("await fetch(") &&
  draftProvider.includes('signal: controller.signal') &&
  draftProvider.includes('Unverified supplied birth/context details:') &&
  draftProvider.includes("Never invent birth-chart placements") &&
  draftProvider.includes('requiresHumanReview: true') &&
  draftProvider.includes('verifiedChart: false') &&
  !draftProvider.includes("return fallback") &&
  draftUi.includes("Unverified AI working draft"),
  "Generator must never pass off a fake fallback as a verified paid report");

assert.ok(env.includes('EMAIL_QA_RECIPIENT: z.string().email().optional()') &&
  emailAdmin.includes('getAdminApiUser()') &&
  emailAdmin.includes('modeSchema') &&
  emailAdmin.includes('mode === "suite" && !env.EMAIL_QA_RECIPIENT') &&
  emailAdmin.includes('hashtext(') &&
  emailAdmin.includes('recent >= (mode === "suite" ? 1 : 2)') &&
  emailAdmin.includes("await sendEmail({") &&
  emailAdmin.includes("idempotencyKey:") &&
  emailAdmin.includes("categories.entries()") &&
  emailAdmin.includes("Provider acceptance is not proof of inbox delivery.") &&
  emailUi.includes('submit("suite")'),
  "11-category production Resend acceptance is admin-triggered, bound to configured mailbox and daily bounded");
const categories = [
  "Account verification","Consultation request","Support ticket received","Support staff reply",
  "Written guidance enquiry","Puja service enquiry","Puja booking status",
  "Shop order status","Personalized report ready","Report delivery fallback","Administrator diagnostic"
];
for (const category of categories) assert.ok(emailAdmin.includes(category), "Missing email category: "+category);
assert.ok(!emailAdmin.includes("razorpay") && !emailAdmin.includes("prisma.payment.create") &&
  !emailAdmin.includes("createOrder("), "Email suite may never create commerce records");

for(const c of ["shopOrder.count","pujaBookingRequest.count","reportRequest.count","supportTicket.count","pujaPartner.count"]){
  assert.ok(analytics.includes(c), "Operational metrics require real production aggregate "+c);
}
assert.ok(admin.includes("Operations — database counts") &&
  admin.includes("not anonymous visitor analytics") &&
  analytics.includes('visitorAnalytics: "consented_first_party_aggregate"') && analytics.includes("aggregateAnalytics()"),
  "Admin metrics must not fake website visitor counts or external delivery acceptance");

console.log("NONPAYMENT_12_ENGINEERING_REPAIR_QA=PASS;REPORT_REVIEW=GUARDED;AI_DRAFT=NO_FALLBACK;EMAIL_SUITE=OWNER_ONLY;OPS_METRICS=DB_COUNTS;PAYMENT_WRITES=NO");
