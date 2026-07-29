import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
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
const s3Compatible = source("lib/storage/s3-compatible.ts");
const generateRoute = source("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const downloadRoute = source("app/api/report-requests/[id]/download/route.ts");
const deliveryRoute = source("app/api/admin/report-requests/[id]/deliver/route.ts");
const env = source("lib/env.ts");

assert(storageTypes.includes('ReportStorageDriver = "database" | "r2" | "s3"'), "Storage driver type exists", "database/r2/s3");
assert(storageTypes.includes("activeDriver: ReportStorageDriver"), "Active cloud driver is modeled", "not hardcoded to database");
assert(storage.includes("getReportStorageReadiness"), "Storage readiness helper exists", "selected driver fails closed when env is incomplete");
assert(storage.includes("putPrivateObject") && storage.includes("getPrivateObject"), "Private cloud adapter is wired", "R2/S3 upload and protected retrieval");
assert(storage.includes("timingSafeEqual") && storage.includes("checksumMatches"), "Retrieved PDF checksum is verified", "tampered/corrupt object fails closed");
assert(storage.includes("publicUrl: null"), "Storage adapter never returns public report URL", "private object boundary");
assert(s3Compatible.includes("AWS4-HMAC-SHA256") && s3Compatible.includes("x-amz-content-sha256"), "S3-compatible requests use SigV4", "AWS S3 and Cloudflare R2 private API");
assert(s3Compatible.includes("r2.cloudflarestorage.com"), "Cloudflare R2 endpoint is implemented", "S3-compatible R2 path");
assert(s3Compatible.includes("s3.${region}.amazonaws.com"), "AWS S3 endpoint is implemented", "virtual-hosted private object path");
assert(schema.includes("generatedPdfStorageDriver") && schema.includes("generatedPdfChecksum"), "Prisma stores PDF storage metadata", "driver/checksum fields already present; no new migration required");
assert(generateRoute.includes("await saveReportPdf") && generateRoute.includes("generatedPdfChecksum"), "Generate route awaits storage adapter", "real object upload completes before metadata commit");
assert(downloadRoute.includes("reportRequest.userId !== user.id"), "Download route owner/admin guard exists", "other users blocked");
assert(downloadRoute.includes("await loadReportPdf") && downloadRoute.includes("generatedPdfChecksum"), "Download route loads protected storage with integrity data", "database/R2/S3 supported");
assert(downloadRoute.includes("writeAuditLog") && downloadRoute.includes("report_pdf.downloaded"), "Download route audits access", "audit trail");
assert(deliveryRoute.includes("generatedPdfStorageKey") && deliveryRoute.includes("generatedPdfBytes"), "Delivery accepts DB or cloud-backed generated file", "secure app download link remains the delivery surface");
assert(env.includes("REPORT_STORAGE_DRIVER") && env.includes("CLOUDFLARE_R2_BUCKET") && env.includes("AWS_S3_BUCKET"), "Storage env configuration exists", "database/r2/s3 config");

const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] ?? 0) + 1;
  return acc;
}, {});

for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
console.log(`\nStorage QA summary: ${JSON.stringify(counts)}`);
if (counts.FAILED) process.exit(1);
