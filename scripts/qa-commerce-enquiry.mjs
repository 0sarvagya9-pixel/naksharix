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
 "z.string().trim().min(10).max(1200)", 'p.id === input.itemId', 'e.id === input.itemId', 'findPujaTopic(input.itemId.slice(7))']) {
 assert.ok(route.includes(term), "ENQUIRY_SERVER_VALIDATION_MISSING=" + term);
}
assert.ok(!/razorpay|providerOrderId|checkout|payment\.create|booking\.create|card(number)?/i.test(route), "ENQUIRY_MUST_NEVER_COLLECT_PAYMENT");
assert.ok(shop.includes("AddToCartButton"), "SHOP_CART_CTA_MISSING");
assert.ok(read("components/shop/cart-page-client.tsx").includes('secureFetch("/api/commerce/orders"') &&
 read("components/shop/cart-page-client.tsx").includes("Sign in to checkout"), "SHOP_DIRECT_ORDER_FROM_CART_MISSING");
assert.ok(puja.includes("/commerce-enquiry?kind=PUJA&item="), "PUJA_CTA_MISSING");
const cartQuote=read("app/api/commerce/cart-quote/route.ts");
const cartUi=read("components/shop/cart-page-client.tsx");
for(const term of ["getCurrentUser()","validateJson(request,schema)","getShopCatalogue()","p.status===\"active\"","rateLimit(","prisma.supportTicket.create","paymentRequired:false","orderCreated:false","fulfillmentConfirmed:false"]){
 assert.ok(cartQuote.includes(term),"CART_QUOTE_SAFETY_GUARD_MISSING="+term);
}
assert.ok(cartUi.includes('payload={{purpose:"SHOP_ORDER",shopOrderId:orderId}}') &&
 cartUi.includes('expectedSubtotalPaise:total'), "CART_RAZORPAY_CHECKOUT_AND_STALE_PRICE_GUARD_MISSING");
assert.ok(!/razorpay|checkoutSession|payment\.create|providerOrderId/i.test(cartQuote),"CART_QUOTE_MUST_NOT_CHARGE");
assert.ok(page.includes("getCurrentUser()") && page.includes("getShopCatalogue()"),"PAGE_SOURCE_OWNED_OPTIONS_MISSING");
assert.ok(component.includes("secureFetch(") && component.includes("/api/commerce/enquiries"),"CSRF_PROTECTED_BROWSER_REQUEST_MISSING");
assert.ok(component.includes("Open your support tickets"),"SUPPORT_TRACKING_MISSING");
console.log("COMMERCE_ENQUIRY_SOURCE_GATES=PASS");
console.log("REAL_SUPPORT_TICKET_BACKEND=YES;DIRECT_CHECKOUT_ADDED=YES;QUOTE_API_STILL_NONCHARGING=YES");
