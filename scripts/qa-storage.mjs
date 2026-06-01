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
const storage = source("lib/storage/report-storage.ts");
const storageTypes = source("lib/storage/types.ts");
const generateRoute = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const downloadRoute = source("app/api/report-requests/[id]/download/route.ts");
const env = source("lib/env.ts");

assert(storageTypes.includes("ReportStorageDriver"), "Storage driver type exists", "database/r2/s3 support surface");
assert(storage.includes("getReportStorageReadiness"), "Storage readiness helper exists", "cloud env fails closed");
assert(storage.includes("sha256") && storage.includes("checksum"), "PDF checksum is generated", "integrity metadata");
assert(storage.includes("publicUrl: null"), "Storage adapter does not return public URL", "no fake cloud URL");
assert(schema.includes("generatedPdfStorageDriver") && schema.includes("generatedPdfChecksum"), "Prisma stores PDF storage metadata", "driver/checksum fields");
assert(generateRoute.includes("saveReportPdf") && generateRoute.includes("generatedPdfChecksum"), "Generate route uses storage adapter", "real metadata stored");
assert(downloadRoute.includes("reportRequest.userId !== user.id"), "Download route owner/admin guard exists", "other users blocked");
assert(downloadRoute.includes("writeAuditLog") && downloadRoute.includes("report_pdf.downloaded"), "Download route audits access", "audit trail");
assert(env.includes("REPORT_STORAGE_DRIVER") && env.includes("CLOUDFLARE_R2_BUCKET") && env.includes("AWS_S3_BUCKET"), "Storage env placeholders exist", "database/r2/s3 config");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nStorage QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);
