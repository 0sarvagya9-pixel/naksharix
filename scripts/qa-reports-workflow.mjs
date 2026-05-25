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
const workflow = source("lib/reports/report-workflow-status.ts");

assert(schema.includes("model ReportRequest"), "ReportRequest model exists", "Prisma persistence surface present");
assert(reportApi.includes("getCurrentUser()"), "Report request API requires auth", "no anonymous fake persistence");
assert(reportApi.includes("Payment required. Please complete checkout first."), "Report API payment dependency is explicit", "not silently pretending no-payment persistence");
assert(reportsContent.includes("Online request submission is coming soon"), "Public reports remain request-intent", "no fake submit");
assert(adminLayout.includes("ADMIN") && adminLayout.includes("SUPER_ADMIN"), "Admin report routes are RBAC-protected", "admin layout guard");
assert(workflow.includes("publicDbPersistenceEnabled: false"), "Report workflow readiness is blocked honestly", "foundation status");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) {
  console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}
console.log(`\nReports workflow QA summary: ${JSON.stringify(counts)}`);

if (counts.FAILED) process.exit(1);
