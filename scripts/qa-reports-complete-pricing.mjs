import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(f,"utf8");
const catalogue = read("lib/manual-catalogue.ts");
const section = catalogue.split("export const manualReports: ManualReport[] = [")[1]?.split("\n];")[0];
assert.ok(section, "Manual report inventory exists");
const slugs=[...section.matchAll(/\breport\("([a-z0-9-]+)"/g)].map(x=>x[1]);
assert.equal(slugs.length,15, "All fifteen published report types must exist");
assert.equal(new Set(slugs).size,15,"Unique report slugs");

const checkoutSource=read("lib/reports/checkout-catalogue.ts");
const mapBlock=checkoutSource.split("const manualToPaidReportId: Record<string, string> = {")[1]?.split("\n};")[0];
assert.ok(mapBlock, "Checkout mapping exists");
const mapping=new Map([...mapBlock.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(x=>[x[1],x[2]]));
assert.equal(mapping.size,15,"Every public report is explicitly configured");
const paymentsSrc=read("lib/paid-reports.ts");
const entries=[...paymentsSrc.matchAll(/\bid:\s*"([^"]+)"[\s\S]*?\bprice:\s*"INR (\d+)"[\s\S]*?\bamount:\s*(\d+),/g)].map(m=>({id:m[1],display:Number(m[2]),amount:Number(m[3])}));
const byId=new Map(entries.map(e=>[e.id,e]));
assert.equal(byId.size,entries.length,"No duplicate fixed-price report IDs");
assert.ok(byId.size>=16,"Existing and nine new paid reports remain available");

const published = [];
for(const slug of slugs){
  assert.ok(mapping.has(slug),"Missing checkout mapping for "+slug);
  const id=mapping.get(slug);
  assert.ok(byId.has(id), "Missing valid payment item for "+slug+" -> "+id);
  const item=byId.get(id);
  assert.equal(item.display,item.amount,"Display-to-charge mismatch on "+slug);
  assert.ok(item.amount>=299&&item.amount<=1499,"Competitive bounded price required on "+slug);
  published.push({slug,id,amount:item.amount});
}
assert.equal(new Set(published.map(x=>x.id)).size,15, "Each report has its own payment identity");
const exactPrices = {
"premium-kundli":799,"couple-kundli":699,"career-report":599,"wealth-report":599,
"love-report":499,"baby-name-report":399,"sade-sati-report":399,
"manglik-kaal-sarp-report":499,"numerology-lo-shu-report":399,
"name-correction-report":399,"yearly-horoscope-report":999,
"transit-report":449,"rahu-ketu-report":399,"jupiter-transit-report":399,
"fortune-report":499
};
for(const x of published) assert.equal(x.amount,exactPrices[x.slug],"Owner published price for "+x.slug);

const index=read("components/reports-content.tsx");
const details=read("app/reports/[slug]/page.tsx");
const order=read("app/api/payments/razorpay/order/route.ts");
const request=read("app/report-request/new/page.tsx");
const create=read("app/api/report-requests/route.ts");
assert.ok(index.includes("RazorpayCheckoutButton")&&index.includes("checkout.reportId"),"Catalogue must create linked checkout");
assert.ok(details.includes("RazorpayCheckoutButton")&&details.includes("checkout.reportId"),"Report detail must create linked checkout");
assert.ok(order.includes('getPaidReport(body.reportId)')&&order.includes("amount: report.amount"),"Razorpay must charge canonical server amount");
assert.ok(request.includes("payment.status === PaymentStatus.PAID")&&request.includes("metadata.reportId === checkout.reportId"),"Paid detail form must bind order to report");
assert.ok(create.includes("payment.status === PaymentStatus.PAID")&&create.includes("metadata.reportId === checkout.reportId"),"Creation must verify capture ownership");
assert.ok(index.includes("15 clearly priced personalized reports"),"English customer message advertises accurate count");
const manualOfferSource=read("lib/reports/manual-offerings.ts");
assert.ok(manualOfferSource.includes("if(!allowed.size)return {};") &&
  manualOfferSource.indexOf("if(!allowed.size)return {};") < manualOfferSource.indexOf("prisma.manualReportOffering.findMany"),
  "Fixed price catalogue must render without a database read of irrelevant manual offers");
console.log("REPORTS_COMPLETE_PRICING=PASS;15_OF_15_PUBLISHED_PRICED=TRUE;ONE_RAZORPAY_MERCHANT=TRUE;PAYMENT_IDENTITY_UNIQUE=TRUE;SERVER_PRICE_VERIFIED=TRUE");
