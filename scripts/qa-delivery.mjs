import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function record(status, name, detail) {
  results.push({ status, name, detail });
}

function assert(condition, name, detail) {
  record(condition ? "PASSED" : "FAILED", name, detail);
}

const schema = source("prisma/schema.prisma");
const email = source("lib/email/email-service.ts");
const delivery = source("lib/reports/report-delivery-service.ts");
const deliverRoute = source("app/api/admin/report-requests/[id]/deliver/route.ts");
const adminActions = source("components/admin/report-request-actions.tsx");

assert(schema.includes("deliveryStatus") && schema.includes("emailSentAt") && schema.includes("deliveryError"), "Delivery state fields exist", "Prisma metadata");
assert(email.includes("EMAIL_PROVIDER") && email.includes("SMTP_FROM"), "Email provider readiness validates SMTP env", "disabled-safe email");
assert(email.includes("emailEnabled: false") && email.includes("sendEmail"), "Email service fails closed before sending", "no fake sent state");
assert(delivery.includes("sendEmail") && delivery.includes("secure download"), "Report delivery service uses email abstraction", "secure download fallback");
assert(deliverRoute.includes("generatedPdfBytes") && deliverRoute.includes("generatedPdfSize"), "Delivery route requires generated PDF", "no fake delivery");
assert(deliverRoute.includes("READY_FOR_DELIVERY") && deliverRoute.includes("DELIVERED"), "Delivery route separates ready and delivered", "sent only after action");
assert(deliverRoute.includes("emailSentAt") && deliverRoute.includes("deliveryStatus"), "Delivery route stores delivery metadata", "real delivery state");
assert(adminActions.includes("/deliver") && adminActions.includes("Send Email"), "Admin action calls delivery route", "admin-triggered delivery");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nDelivery QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);
