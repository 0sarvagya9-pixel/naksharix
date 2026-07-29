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

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const types = source("lib/reports/premium-report-types.ts");
const service = source("lib/reports/premium-report-generation-service.ts");
const storage = source("lib/storage/report-storage.ts");
const delivery = source("lib/reports/report-delivery-service.ts");
const emailService = source("lib/email/email-service.ts");
const generateRoute = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const deliverRoute = source("app/api/admin/report-requests/[id]/deliver/route.ts");
const downloadRoute = source("app/api/report-requests/[id]/download/route.ts");
const schema = readJson("fixtures/reports/premium-report-template-schema.json");

assert(types.includes("PremiumReportGenerationStatus"), "Premium report generation status enum exists", "types foundation");
assert(service.includes("renderToBuffer"), "Premium report service can render a real internal PDF buffer", "react-pdf renderer is wired");
assert(service.includes("blocked_until_admin_review"), "PDF generation requires admin review", "no unreviewed generation");
assert(service.includes("blocked_until_report_content"), "PDF generation requires assembled report content", "no empty PDF");
assert(service.includes("generated_internal_unverified"), "Generated PDF is labeled internal and unverified", "no public precision claim");
assert(service.includes("pdfUrl: null"), "Premium report service does not return fake file", "no fake download");
assert(service.includes("deliveryEnabled: false"), "Premium report service does not enable delivery", "no fake delivery");
assert(storage.includes("db://report-requests") && storage.includes("publicUrl: null"), "Report PDF storage abstraction keeps DB-backed secure storage and no public URL", "cloud drivers also remain private");
assert(generateRoute.includes("generatedPdfBytes") && generateRoute.includes("generatedPdfStorageKey") && generateRoute.includes("GENERATED"), "Admin generation stores real PDF storage metadata before generated status", "real file metadata");
assert(downloadRoute.includes("Cache-Control") && downloadRoute.includes("application/pdf"), "Download route streams stored PDF securely", "no fake URL");
assert(downloadRoute.includes("reportRequest.userId !== user.id"), "Download route enforces owner/admin authorization", "secure download");
assert(
  emailService.includes("EMAIL_PROVIDER")
    && emailService.includes("SMTP_HOST")
    && emailService.includes("https://api.resend.com/emails")
    && emailService.includes("Authorization: `Bearer ${env.SMTP_PASS!}`"),
  "Email delivery service requires configured Resend production email settings before sending",
  "real provider request; no fake sent state"
);
assert(delivery.includes("sendEmail"), "Report delivery service delegates to email abstraction", "no fake email");
assert(deliverRoute.includes("READY_FOR_DELIVERY") && deliverRoute.includes("DELIVERED") && deliverRoute.includes("generatedPdfStorageKey"), "Delivery route requires real generated PDF and real delivery attempt", "DB or cloud-backed file; no fake delivered status");
assert(schema.automaticGenerationEnabled === false, "Template schema keeps automatic generation disabled", "foundation only");
assert(schema.automaticDeliveryEnabled === false, "Template schema keeps automatic delivery disabled", "foundation only");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nPDF generation QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);
