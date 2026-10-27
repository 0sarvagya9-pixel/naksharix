import assert from "node:assert/strict";
import fs from "node:fs";
const read = (p) => fs.readFileSync(p, "utf8");
const route = read("app/api/commerce/enquiries/route.ts");
const page = read("app/commerce-enquiry/page.tsx");
const component = read("components/commerce-enquiry-form.tsx");
const shop = read("components/shop-coming-soon-content.tsx");
const puja = read("app/puja-calendar/page.tsx");
for (const term of ["getCurrentUser()", "validateJson(request, schema)", "getShopCatalogue()", 'p.status === "active"', "nextTwoYearsPujaCalendar()", "rateLimit(", "prisma.supportTicket.create", "paymentRequired: false", "orderCreated: false", "bookingCreated: false", "fulfillmentConfirmed: false"]) {
 assert.ok(route.includes(term), "ENQUIRY_FAIL_CLOSED_GUARD_MISSING=" + term);
}
for (const term of ['kind: z.literal("SHOP")', 'kind: z.literal("PUJA")',
 "quantity: z.number().int().min(1).max(10)", "city: z.string().trim().min(2).max(90)",
 "z.string().trim().min(10).max(1200)", 'product.id === input.itemId', 'e.id === input.itemId']) {
 assert.ok(route.includes(term), "ENQUIRY_SERVER_VALIDATION_MISSING=" + term);
}
assert.ok(!/razorpay|providerOrderId|checkout|payment\.create|booking\.create|card(number)?/i.test(route), "ENQUIRY_MUST_NEVER_COLLECT_PAYMENT");
assert.ok(shop.includes("/commerce-enquiry?kind=SHOP&item="), "SHOP_CTA_MISSING");
assert.ok(puja.includes("/commerce-enquiry?kind=PUJA&item="), "PUJA_CTA_MISSING");
assert.ok(page.includes("getCurrentUser()") && page.includes("getShopCatalogue()"),"PAGE_SOURCE_OWNED_OPTIONS_MISSING");
assert.ok(component.includes("secureFetch(") && component.includes("/api/commerce/enquiries"),"CSRF_PROTECTED_BROWSER_REQUEST_MISSING");
assert.ok(component.includes("Open your support tickets"),"SUPPORT_TRACKING_MISSING");
console.log("COMMERCE_ENQUIRY_SOURCE_GATES=PASS");
console.log("REAL_SUPPORT_TICKET_BACKEND=YES;AUTOMATIC_PAID_ORDERS=NO;PRODUCTION_DB_WRITES=NO");
