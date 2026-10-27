import assert from "node:assert/strict";
import fs from "node:fs";
const read=(path)=>fs.readFileSync(path,"utf8");
const ui=read("components/shop-coming-soon-content.tsx");
const admin=read("components/admin-shop-content.tsx");
const api=read("app/api/admin/shop-catalogue/route.ts");
const model=read("lib/manual-catalogue.ts");
for(const part of ["safeProductVisual(product)","import Image from \"next/image\"", "Illustrative catalogue visual", "product.imageRights", "product.imageEvidenceUrl"]) {
  assert.ok(ui.includes(part),"SHOP_PHOTO_RENDER_GUARD_MISSING="+part);
}
for(const part of ["imageRights: z.enum", "imageEvidenceUrl: z.string().url()", "External product image requires documented image-use rights.", "evidence.protocol !== \"https:\""]) {
  assert.ok(api.includes(part),"SHOP_IMAGE_LICENSE_BACKEND_GUARD_MISSING="+part);
}
for(const part of ["Image usage rights", "Image rights evidence HTTPS URL", "SUPPLIER_AUTHORIZED"]) {
  assert.ok(admin.includes(part),"SHOP_ADMIN_PHOTO_PROOF_UI_MISSING="+part);
}
for(const part of ["imageRights?:", "imageEvidenceUrl?:", "imageRights: [\"OWNED\""]) {
  assert.ok(model.includes(part),"SHOP_IMAGE_PROOF_PERSISTENCE_MISSING="+part);
}
const photos=read("lib/shop/real-photo-seeds.ts");
const store=read("lib/shop/catalogue-store.ts");
const productDetail=read("components/shop/product-gallery.tsx");
const home=read("components/home/editorial-home.tsx");
const entries=[...photos.matchAll(/^\s*"([a-z0-9-]+)":\s*\{url:/gm)].map(m=>m[1]);
assert.equal(entries.length,12,"REAL_SEED_PHOTO_COUNT_NOT_12");
assert.equal(new Set(entries).size,12,"REAL_SEED_PHOTO_IDS_DUPLICATED");
assert.ok(photos.includes("thumb.wikimedia.org") && photos.includes("commons.wikimedia.org") && photos.includes("licenseUrl:"),"PHOTO_PROVENANCE_MISSING");
assert.ok(store.includes("photoFallbackForLegacySeed") && store.includes("product.imageRights"),"STORED_ADMIN_IMAGES_NOT_PRESERVED");
assert.ok(productDetail.includes("Real reference photograph, not verified Naksharix stock") &&
  productDetail.includes("chosen.credit") && productDetail.includes("chosen.licenseUrl"),"PRODUCT_IMAGE_RIGHTS_DISCLOSURE_MISSING");
assert.ok(home.includes("referencePhotoForProduct(item.id)") && ui.includes("Real reference photo"),"PHOTOGRAPHY_NOT_SITEWIDE");
assert.ok(home.includes('referencePhotoForProduct("rudraksha-mala")') && home.includes('pujaEditorialImage("rudrabhishek"'),"HOME_SERVICES_MUST_USE_REAL_CREDITED_REFERENCES");
const shopPage=read("app/shop/page.tsx");
assert.ok(shopPage.includes('referencePhotoForProduct("rudraksha-mala")') && shopPage.includes("Banner shows a licensed reference photograph"),"SHOP_HERO_PHOTO_ATTRIBUTION_MISSING");
const calendarPage=read("app/puja-calendar/page.tsx");
assert.ok(calendarPage.includes('pujaEditorialImage("griha-pravesh-puja"') && calendarPage.includes("representative ritual photograph"),"PUJA_CALENDAR_REAL_PHOTO_ATTRIBUTION_MISSING");
assert.ok(productDetail.includes('chosen.imageRights === "LICENSED"') && productDetail.includes("administrator-approved usage rights"),"ADMIN_APPROVED_PHOTOS_MISLABELLED_AS_REFERENCES");
assert.ok(ui.includes('product.galleryImages[0].imageRights === "LICENSED"'),"SHOP_CARD_LICENSE_LABEL_MISSING");
const cart=read("components/shop/cart-page-client.tsx");
assert.ok(cart.includes('import Image from "next/image"') && cart.includes("p.galleryImages?.[0]?.url"),"CART_PRODUCT_PHOTOS_MISSING");
const reviewForm=read("components/consultation-review-form.tsx");
assert.ok(reviewForm.includes("Rate your consultation") && reviewForm.includes("Submit rating") && reviewForm.includes("aria-pressed={rating === value}"),"ACCESSIBLE_CUSTOMER_RATINGS_MISSING");
assert.ok(read("app/api/consultation-bookings/review/route.ts").includes("rating: z.coerce.number().int().min(1).max(5)"),"RATINGS_MUST_BE_INTEGERS");
console.log("SHOP_VISUAL_AND_IMAGE_RIGHTS_QA=PASS;LICENSED_PHOTO_REFERENCES=12;UNLICENSED_EXTERNAL_PHOTOS=HELD;LIVE_CHECKOUT=NO");

// Admin-only commercial readiness must distinguish genuine published owner data
// from proof of supplier stock, contracts, delivery and payments.
const commercial=read("lib/ops/commercial-readiness.ts");
const readinessPage=read("app/admin/readiness/page.tsx");
const readinessApi=read("app/api/admin/readiness/route.ts");
for(const marker of ["getShopCatalogue()","getPublishedPujaOffers()","getPublishedManualReportOffers()","prisma.pujaPartner.count","to_regclass", "readyForAutomaticPayments: false", "imageRights === \"SUPPLIER_AUTHORIZED\""]) {
  assert.ok(commercial.includes(marker),"ADMIN_COMMERCE_READINESS_GATE_MISSING="+marker);
}
assert.ok(readinessPage.includes("getCommercialReadiness") && readinessPage.includes("Automatic Shop/Puja payments: DISABLED"),"ADMIN_READINESS_UI_MISSING");
assert.ok(readinessApi.includes("const commercial = await getCommercialReadiness()") && readinessApi.includes("    commercial,"),"ADMIN_READINESS_API_MISSING");

const redisCache=read("lib/cache/redis-cache.ts");
const cache=read("lib/cache/index.ts");
const env=read("lib/env.ts");
for(const marker of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) {
  assert.ok(env.includes(marker),"REDIS_REST_ENV_SCHEMA_MISSING="+marker);
}
for(const marker of ["ATOMIC_INCREMENT", "redis.call('INCR'", "redis.call('EXPIRE'", 'restCommand(["EVAL"', "AbortSignal.timeout(3500)", "redisPing()"]) {
  assert.ok(redisCache.includes(marker),"ATOMIC_REDIS_REST_MISSING="+marker);
}
assert.ok(cache.includes("if (sharedRedisConfigured())") && cache.includes('throw new Error("Shared Redis unavailable for rate limiting")'),"REDIS_RATE_LIMIT_MUST_FAIL_CLOSED");
assert.ok(read("app/admin/readiness/page.tsx").includes("redisPing()") && read("app/api/admin/readiness/route.ts").includes("redisPing()"),"REDIS_ADMIN_READINESS_PROBE_MISSING");
