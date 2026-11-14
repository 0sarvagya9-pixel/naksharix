import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const s=(p)=>readFileSync(p,"utf8");
const page=s("app/pujas/page.tsx");
assert.ok(page.includes("Coming Soon")&&page.includes("पूजा सेवाएँ")&&page.includes("नई पूजा बुकिंग"));
assert.ok(!page.includes("PujaServicesDirectory")&&!page.includes("getPublishedPujaOffers"));
assert.ok(!page.includes("Book Now")&&!page.includes("RazorpayCheckoutButton"));
const home=s("components/home/editorial-home.tsx");
assert.ok(home.includes("Coming Soon <ArrowRight")&&!home.includes("Book Now <ArrowRight"),"Homepage Puja CTA must not offer bookings");
for(const p of ["app/pujas/[id]/page.tsx","app/puja-booking/page.tsx","app/puja-enquiry/page.tsx"]) {
 assert.ok(s(p).includes('redirect("/pujas")'),"Legacy Puja URL must route to Coming Soon: "+p);
}
assert.ok(s("app/commerce-enquiry/page.tsx").includes('if (params.kind === "PUJA") redirect("/pujas")'));
const bookApi=s("app/api/puja/bookings/route.ts");
assert.ok(bookApi.includes("export async function GET()"));
assert.ok(bookApi.includes("prisma.pujaBookingRequest.findMany"),"Existing customer history must remain intact");
assert.match(bookApi,/export async function POST\(\)\s*\{\s*return fail\([^;]+,503\);/);
assert.ok(!bookApi.includes("pujaBookingRequest.create("),"No new Puja bookings, even for old clients");
const pay=s("app/api/payments/razorpay/order/route.ts");
assert.ok(pay.includes('if (body.purpose === "PUJA_BOOKING")')&&pay.includes("New Puja payments are temporarily closed."));
assert.ok(pay.indexOf('if (body.purpose === "PUJA_BOOKING")')<pay.indexOf("razorpay.orders.create"),"Hard fail before payment order");
const history=s("app/puja-bookings/page.tsx");
assert.ok(history.includes("prisma.payment.findMany")&&history.includes("prisma.pujaBookingRequest.findMany"));
assert.ok(!history.includes("RazorpayCheckoutButton"),"No payment retry UI even for existing unpaid requests");
assert.ok(s("app/api/commerce/enquiries/route.ts").includes('if (String(input.kind) === "PUJA") return fail'));
assert.ok(s("app/api/guidance-enquiries/route.ts").includes('if (String(input.kind) === "PUJA_ENQUIRY") return fail'));
console.log("NAKSHARIX_PUJA_COMING_SOON=PASS;NO_NEW_BOOKINGS=YES;NO_NEW_PAYMENTS=YES;EXISTING_RECORDS_PRESERVED=YES");
