import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const s = path => readFileSync(path, "utf8");
const env = s("lib/env.ts");
const release = s("lib/puja/launch-readiness.ts");
const page = s("app/pujas/page.tsx");
const detail = s("app/pujas/[id]/page.tsx");
const bookingPage = s("app/puja-booking/page.tsx");
const bookApi = s("app/api/puja/bookings/route.ts");
const pay = s("app/api/payments/razorpay/order/route.ts");
const history = s("app/puja-bookings/page.tsx");
const sitemap = s("app/sitemap.ts");
const home = s("components/home/editorial-home.tsx");

assert.ok(env.includes('PUJA_BOOKINGS_ENABLED: z.enum(["true", "false"]).default("false")'),
  "Puja activation must default OFF independently of old payment flags");
assert.ok(release.includes('env.PUJA_BOOKINGS_ENABLED !== "true"') &&
  release.includes('env.PUJA_PAYMENTS_ENABLED !== "true"') &&
  release.includes("getRazorpayReadiness().enabled") &&
  release.includes("getEmailReadiness().emailEnabled") &&
  release.includes("env.ADMIN_EMAIL") &&
  release.includes("partnerSupportsTopic(partner, topicId)") &&
  release.includes("offer.pricePaise === 110000"),
  "Puja launch must fail closed without owner, payments, email and exact-topic Pandit");
assert.ok(page.includes("Coming Soon") && page.includes("पूजा सेवाएँ") &&
  page.includes("नई पूजा बुकिंग") && page.includes('robots: { index: false, follow: true }') &&
  page.includes("if (release.enabled) return <PujaServicesDirectory offerings={release.offers} />"),
  "Puja page must show Coming Soon by default, live directory only after all checks");
assert.ok(!page.includes("RazorpayCheckoutButton") && !page.includes("Book Now"),
  "Paused public page must never expose a payment CTA");
assert.ok(!sitemap.split("type SitemapFrequency")[0].includes('"/pujas"') &&
  sitemap.includes('puja.enabled ? ["/pujas"') &&
  sitemap.includes("Object.keys(puja.offers)"),
  "Puja sitemap entries must be conditional on verified live readiness");
assert.ok(home.includes("Coming Soon <ArrowRight") &&
  !home.includes("Book Now <ArrowRight"),"Homepage must not promote unavailable Puja bookings");
assert.ok(detail.includes('if (!release.enabled || !topic || !offer) redirect("/pujas")') &&
  bookingPage.includes('if (!item || !release.enabled || !release.offers[item]) redirect("/pujas")') &&
  s("app/puja-enquiry/page.tsx").includes('redirect("/pujas")'),
  "Legacy URLs and individual Puja booking remain closed when not launched");
assert.ok(s("app/commerce-enquiry/page.tsx").includes('if (params.kind === "PUJA") redirect("/pujas")') &&
  s("app/api/commerce/enquiries/route.ts").includes('if (String(input.kind) === "PUJA") return fail') &&
  s("app/api/guidance-enquiries/route.ts").includes('if (String(input.kind) === "PUJA_ENQUIRY") return fail'),
  "Legacy unaudited enquiry routes remain closed");
assert.ok(bookApi.includes("export async function GET()") &&
  bookApi.includes("prisma.pujaBookingRequest.findMany") &&
  bookApi.includes("export async function POST(request: Request)") &&
  bookApi.indexOf("if (!release.enabled)") < bookApi.indexOf("tx.pujaBookingRequest.create") &&
  bookApi.includes("paymentDueNow: false") &&
  bookApi.includes("expectedPricePaise") && bookApi.includes("prisma.$transaction"),
  "New requests are gated, server-priced, persisted and never charge immediately");
assert.ok(pay.includes('if (body.purpose === "PUJA_BOOKING" && !(await getPujaLaunchState()).enabled)') &&
  pay.indexOf('if (body.purpose === "PUJA_BOOKING" && !(await getPujaLaunchState()).enabled)') < pay.indexOf("razorpay.orders.create") &&
  pay.includes('booking.status !== "SCHEDULED"') &&
  pay.includes("partnerSupportsTopic(partner, booking.topicId)") &&
  pay.includes("booking.scheduledAt.getTime() <= Date.now()"),
  "Payment must fail closed before Razorpay without a future verified Pandit schedule");
assert.ok(history.includes("prisma.payment.findMany") &&
  history.includes("prisma.pujaBookingRequest.findMany") &&
  history.includes("const canCheckout = release.enabled") &&
  history.includes('row.status === "SCHEDULED"') &&
  history.includes("!paymentSettled") &&
  history.includes("RazorpayCheckoutButton"),
  "Customer history must show payment only after operator confirmation and no prior settlement");
const notifications = s("lib/puja/request-notifications.ts");
assert.ok(notifications.includes("sendEmail(") &&
  notifications.includes("idempotencyKey") && notifications.includes("env.ADMIN_EMAIL") &&
  !notifications.includes("input.sankalpNote") &&
  !notifications.includes("input.gotra"),
  "Customer and admin notices must not leak private Sankalp details");
const admin = s("app/api/admin/puja-bookings/route.ts");
assert.ok(admin.includes("partnerSupportsTopic(partner, existing.topicId)") &&
  admin.includes("partnerAcceptanceConfirmed") &&
  admin.includes('["IN_PROGRESS","COMPLETED"].includes(input.status) && !existingPaid'),
  "Admin cannot confirm phantom Pandits or mark unpaid rituals completed");
console.log("NAKSHARIX_PUJA_PAUSED_BY_DEFAULT=PASS;OWNER_ACTIVATION_REQUIRED=YES;PAYMENT_BEFORE_SCHEDULE=BLOCKED;HISTORY=KEPT");
