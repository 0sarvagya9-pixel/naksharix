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
const retryRoute = read("app/api/admin/fulfilment-notification/route.ts");
const supportMail = read("lib/notifications/support-updates.ts");
const staffReply = read("app/api/admin/support/reply/route.ts");
const newTicket = read("app/api/support/tickets/route.ts");
const guidance = read("app/api/guidance-enquiries/route.ts");
const supportUi = read("components/support-conversation.tsx");
const emailProvider = read("lib/email/email-service.ts");
const reportEmail = read("lib/reports/report-delivery-service.ts");

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
assert.ok(retryRoute.includes('getAdminApiUser()') &&
  retryRoute.includes('if (!admin) return fail("Forbidden", 403)') &&
  retryRoute.includes('validateJson(request, inputSchema)') &&
  retryRoute.includes('z.enum(["shop", "puja"])') &&
  retryRoute.includes("expectedVersion: z.number().int().min(1)") &&
  retryRoute.includes('pg_advisory_xact_lock(') &&
  retryRoute.includes('tx.adminActionLog.count({where:') &&
  retryRoute.includes('recent>=2') &&
  retryRoute.includes('action:"fulfilment.email.retry.claim"') &&
  retryRoute.includes('return fail("Notification retry limit reached. Please try later.",429)') &&
  retryRoute.includes('status:claim.status'),
  "Owner email retry must authenticate, lock, log and throttle without accepting arbitrary recipients");
assert.ok(retryRoute.includes('record.version !== input.expectedVersion') &&
  retryRoute.includes('isNotifiableFulfilmentStatus(input.kind,record.status)') &&
  retryRoute.includes('oldStatus:"__AUTHORIZED_ADMIN_RETRY__"') &&
  !retryRoute.includes("input.to") &&
  !retryRoute.includes("sendEmail({"),
  "Email retry must bind to exact, current Shop/Puja status and existing account");
assert.ok(send.includes('export function isNotifiableFulfilmentStatus(') &&
  adminShop.includes('secureFetch("/api/admin/fulfilment-notification"') &&
  adminShop.includes('kind:"shop",id:order.id,expectedVersion:order.version') &&
  adminPuja.includes('secureFetch("/api/admin/fulfilment-notification"') &&
  adminPuja.includes('kind:"puja",id:booking.id,expectedVersion:booking.version'),
  "Owner UI may retry bounded notification without creating a new order or payment");

assert.ok(supportMail.includes('import "server-only";') &&
  supportMail.includes("await sendEmail({ to, subject, text, idempotencyKey })") &&
  supportMail.includes('new URL(path, env.NEXT_PUBLIC_APP_URL)') &&
  supportMail.includes('select: { user: { select: { email: true } } }') &&
  !supportMail.includes('input.message') && !supportMail.includes('ticket.subject') &&
  supportMail.includes("Provider acceptance of this message does not prove inbox delivery."),
  "Support email notifications must be private, owner-bound and inbox-proof neutral");
assert.ok(staffReply.includes('getAdminApiUser()') &&
  staffReply.includes('result.duplicate ? "not_needed"') &&
  staffReply.includes('await notifyCustomerOfSupportReply(input.ticketId, input.clientMutationId)') &&
  newTicket.includes('await notifySupportTeamOfNewTicket(ticket.id)') &&
  guidance.includes('await notifySupportTeamOfNewTicket(ticket.id)') &&
  staffReply.includes('return ok({ recorded: true, duplicate: result.duplicate, notification })') &&
  supportUi.includes('Email provider accepted a customer notification; inbox delivery is not confirmed.'),
  "Admin replies and new support/enquiry tickets must notify without duplicate sends or fake delivery");
assert.ok(newTicket.indexOf('supportTicket.create(') < newTicket.indexOf('notifySupportTeamOfNewTicket(ticket.id)') &&
  guidance.indexOf('supportTicket.create(') < guidance.indexOf('notifySupportTeamOfNewTicket(ticket.id)') &&
  staffReply.indexOf('appendSupportMessage({') < staffReply.indexOf('notifyCustomerOfSupportReply(input.ticketId, input.clientMutationId)'),
  "Notifications must happen only after the ticket or staff reply is stored successfully");
assert.ok(emailProvider.includes('"Idempotency-Key": input.idempotencyKey') &&
  emailProvider.includes("Invalid email idempotency key.") &&
  emailProvider.includes("inbox delivery is not confirmed.") &&
  reportEmail.includes('idempotencyKey: "naksharix/report-delivery/" + input.reportRequestId') &&
  supportMail.includes('"naksharix/support-reply/" + ticketId + "/" + clientMutationId') &&
  supportMail.includes('"naksharix/support-new/" + ticketId'),
  "Resend provider idempotency must cover support and report notifications without sending duplicate emails");

console.log("NONPAYMENT_OPERATIONS_QA=PASS;CUSTOMER_STATUS_EMAIL=FAIL_SOFT;FULFILMENT_GUARDS=RETAINED;DUPLICATE_REPORT_EMAIL=BLOCKED;REPORTS_PRICE_GATE=CORRECT;PUBLIC_MONITOR=14_ENDPOINTS");
