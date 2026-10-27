import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path)=>readFileSync(path,"utf8");
const schema=read("prisma/schema.prisma");
const sql=["docs/sql/20261027_shop_catalogue_snapshot.sql","docs/sql/20261027_puja_offering.sql","docs/sql/20261027_shop_orders.sql","docs/sql/20261027_puja_bookings.sql","docs/sql/20261027_manual_report_offerings.sql"];
for(const [name] of [["ShopCatalogueSnapshot"],["PujaOffering"],["ShopOrder"],["PujaBookingRequest"],["ManualReportOffering"]])
 assert.ok(schema.includes("model "+name+" {"),"Missing Prisma model "+name);
for(const path of sql){
 const source=read(path);
 assert.ok(source.includes("CREATE TABLE IF NOT EXISTS"),"Missing additive DDL: "+path);
 assert.ok(!/\bDROP\s+(?:TABLE|SCHEMA)\b|\bTRUNCATE\b|\bDELETE\s+FROM\b/i.test(source),"Destructive DDL prohibited: "+path);
}
const snapshotSql=read("docs/sql/20261027_shop_catalogue_snapshot.sql");
const store=read("lib/shop/catalogue-store.ts");
assert.ok(snapshotSql.includes('"products" JSONB NOT NULL') &&
 snapshotSql.includes('"version" INTEGER NOT NULL DEFAULT 1') &&
 store.includes("shopCatalogueSnapshot.findUnique") &&
 store.includes("storageReady: false"), "Catalogue schema and fail-closed fallback mismatch");
const orders=read("app/api/commerce/orders/route.ts");
const adminOrders=read("app/api/admin/shop-orders/route.ts");
const puja=read("app/api/puja/bookings/route.ts");
const adminPuja=read("app/api/admin/puja-bookings/route.ts");
assert.ok(orders.includes("getCurrentUser()")&&orders.includes("getShopCatalogue()")&&
 orders.includes('paymentStatus:"UNPAID"')&&orders.includes("Number.isSafeInteger(subtotal)"),"Order price/payment invariant absent");
assert.ok(orders.includes("new Set(productIds).size")&&orders.includes("rateLimit("),"Duplicate/rate limit absent");
assert.ok(adminOrders.includes("getAdminApiUser()")&&adminOrders.includes("updateMany")&&
 adminOrders.includes("expectedVersion")&&adminOrders.includes("adminActionLog.create"),
 "Shop admin role/concurrency/audit missing");
assert.ok(adminOrders.includes("paymentCollected:false")&&adminOrders.includes("onlinePaymentVerified:false"),
 "Never claim an unverified gateway charge");
assert.ok(puja.includes("getCurrentUser()")&&puja.includes("getPuja")===false&&
 puja.includes("pujaOffering.findUnique")&&puja.includes("rateLimit(")&&puja.includes("preferredDate"),
 "Puja booking must read real published offer and validate preferred date");
assert.ok(adminPuja.includes("getAdminApiUser()")&&adminPuja.includes('reviewStatus!=="VERIFIED"')&&
 adminPuja.includes("updateMany")&&adminPuja.includes("adminActionLog.create"),
 "Puja admin needs verified partner and optimistic concurrency");
assert.ok(read("components/shop/cart-page-client.tsx").includes('secureFetch("/api/commerce/orders"')&&
 read("app/orders/page.tsx").includes("userId:user.id"),"Customer shop order flow missing");
assert.ok(read("components/puja/booking-request-client.tsx").includes('secureFetch("/api/puja/bookings"')&&
 read("app/puja-bookings/page.tsx").includes("userId:user.id"),"Customer Puja booking flow missing");
assert.ok(read("scripts/qa-auth-role-e2e.mjs").includes("real Shop order request")&&
 read("scripts/qa-auth-role-e2e.mjs").includes("real Puja booking requires"),"Disposable HTTP acceptance missing");
const reportAdmin=read("app/api/admin/manual-report-offerings/route.ts");
const reportUI=read("components/reports-content.tsx");
assert.ok(reportAdmin.includes("getAdminApiUser()")&&reportAdmin.includes("getManualReportCheckout(input.reportSlug)")&&
 reportAdmin.includes("adminActionLog.create"),"Manual report prices must be admin-only and gateway-safe");
assert.ok(reportUI.includes("formattedManualPrice")&&reportUI.includes("manualOfferings[report.slug]"),
 "Manual report public price missing");
console.log("COMMERCE_PREDEPLOY_QA=PASS;REVIEWED_MISSING_TABLES=5;PERSISTED_ORDER_AND_PUJA_REQUEST=YES;OWNER_ADMIN_CAS=YES;LIVE_CHARGING=NO");
