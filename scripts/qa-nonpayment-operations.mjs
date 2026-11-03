import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const send = read("lib/notifications/fulfilment-updates.ts");
const shop = read("app/api/admin/shop-orders/route.ts");
const puja = read("app/api/admin/puja-bookings/route.ts");
const adminShop = read("components/admin-shop-orders.tsx");
const adminPuja = read("components/admin-puja-bookings.tsx");
const myShop = read("app/orders/page.tsx");
const myPuja = read("app/puja-bookings/page.tsx");
const reportDeliver = read("app/api/admin/report-requests/[id]/deliver/route.ts");
const reportGenerate = read("app/api/admin/report-requests/[id]/generate-pdf/route.ts");
const commercial = read("lib/ops/commercial-readiness.ts");
const readiness = read("app/admin/readiness/page.tsx");
const monitors = read("scripts/ops/check-public-endpoints.mjs");
const opsWorkflow = read(".github/workflows/free-public-uptime.yml");
const backups = read(".github/workflows/free-encrypted-db-backup.yml");

assert.ok(send.includes('import "server-only";') &&
  send.includes('import { sendEmail } from "@/lib/email/email-service"') &&
  send.includes('kind: "shop"') === false,
  "Fulfilment notifications are protected by the server-only delivery service");
for (const name of ["CONFIRMED","PACKING","DISPATCHED","DELIVERED","CANCELED","SCHEDULED","IN_PROGRESS","COMPLETED","REJECTED"]) {
  assert.ok(send.includes(name+":"), "Missing real status notification: "+name);
}
assert.ok(send.includes("input.status === input.oldStatus") &&
  send.includes('outcome: "not_needed"') &&
  send.includes("sendEmail({") &&
  send.includes("provider_accepted") &&
  send.includes("catch {") &&
  send.includes("not a payment receipt") &&
  send.includes("Provider API acceptance does not guarantee actual inbox placement"),
  "Status email must only be attempted on a transition, never claim payment or inbox delivery");
for (const [file, kind] of [[shop,"shop"],[puja,"puja"]]) {
  assert.ok(file.includes('import { notifyCustomerOfFulfilmentChange }') &&
    file.includes("if(!") &&
    file.includes("notifyCustomerOfFulfilmentChange({") &&
    file.includes('kind:"'+kind+'"') &&
    file.includes("oldStatus:") &&
    file.indexOf("notifyCustomerOfFulfilmentChange({") > file.indexOf("if(!"),
    "Owner mutation must complete before fail-soft "+kind+" notification");
}
assert.ok(shop.includes("updateMany({") && shop.includes("version:input.expectedVersion") &&
  puja.includes("updateMany({") && puja.includes("version:input.expectedVersion"),
  "Both fulfilment flows retain single-writer status change guards");
assert.ok(adminShop.includes("nextStatuses") && adminPuja.includes("nextStatuses") &&
  adminShop.includes("result.data.notification?.outcome") && adminPuja.includes("result.data.notification?.outcome"),
  "Owner UI restricts invalid status choices and explains email acceptance honestly");
assert.ok(myShop.includes('order.status==="DELIVERED"') && myPuja.includes("Naksharix owner team"),
  "Customer tracking shows current fulfilment and owner coordination");
assert.ok(reportDeliver.includes('deliveryStatus === "email_sent"') &&
  reportDeliver.includes("Already recorded as sent; no duplicate email attempted") &&
  reportDeliver.includes("Email delivery was not accepted by the provider"),
  "Report delivery is idempotent after provider acceptance, without fake inbox claims");
assert.ok(reportGenerate.includes('reportRequest.status === ReportRequestStatus.DELIVERED') &&
  reportGenerate.includes("Delivered reports cannot be regenerated in place"),
  "Delivered PDFs are preserved against accidental overwrite");
assert.ok(commercial.includes('eligible === 0 || published === eligible ? "ready"') &&
  commercial.includes('All " + manualReports.length + " published report types'),
  "Fully priced report catalogue does not need manual pricing table rows");
assert.ok(!readiness.includes("Automatic Shop/Puja payments: DISABLED") &&
  readiness.includes("Fulfilment acceptance: confirm actual item dispatch"),
  "Operator readiness is not displaying stale disabled-commerce text");

const expected = ["/api/health","/api/release","/api/ops/readiness","/ads.txt",
  "/","/kundli","/shop","/pujas","/puja-calendar","/reports","/consultation",
  "/advertising","/robots.txt","/sitemap.xml"];
for(const path of expected){
  assert.ok(monitors.includes(JSON.stringify(path)), "Missing hourly public service probe "+path);
}
assert.ok(monitors.includes("databaseSchema?.ready === true") &&
  monitors.includes("services?.email?.enabled === true") &&
  monitors.includes("reportStorage?.enabled === true") &&
  opsWorkflow.includes("issues: write") && opsWorkflow.includes("gh issue create"),
  "Monitoring fails closed on unhealthy database, email, report storage and alerts GitHub owner");
assert.ok(backups.includes("BACKUP_DATABASE_URL") && backups.includes("BACKUP_AGE_RECIPIENT") &&
  backups.includes("Stream PostgreSQL 17 custom-format dump directly into age encryption"),
  "Encrypted backup job remains fail-closed pending missing external protected values");
console.log("NONPAYMENT_OPERATIONS_QA=PASS;CUSTOMER_STATUS_EMAIL=FAIL_SOFT;FULFILMENT_GUARDS=RETAINED;DUPLICATE_REPORT_EMAIL=BLOCKED;REPORTS_PRICE_GATE=CORRECT;PUBLIC_MONITOR=14_ENDPOINTS");
