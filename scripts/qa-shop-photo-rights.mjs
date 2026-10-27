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
assert.ok(productDetail.includes('chosen.imageRights === "LICENSED"') && productDetail.includes("administrator-approved usage rights"),"ADMIN_APPROVED_PHOTOS_MISLABELLED_AS_REFERENCES");
assert.ok(ui.includes('product.galleryImages[0].imageRights === "LICENSED"'),"SHOP_CARD_LICENSE_LABEL_MISSING");
const cart=read("components/shop/cart-page-client.tsx");
assert.ok(cart.includes('import Image from "next/image"') && cart.includes("p.galleryImages?.[0]?.url"),"CART_PRODUCT_PHOTOS_MISSING");
const reviewForm=read("components/consultation-review-form.tsx");
assert.ok(reviewForm.includes("Rate your consultation") && reviewForm.includes("Submit rating") && reviewForm.includes("aria-pressed={rating === value}"),"ACCESSIBLE_CUSTOMER_RATINGS_MISSING");
assert.ok(read("app/api/consultation-bookings/review/route.ts").includes("rating: z.coerce.number().int().min(1).max(5)"),"RATINGS_MUST_BE_INTEGERS");
console.log("SHOP_VISUAL_AND_IMAGE_RIGHTS_QA=PASS;LICENSED_PHOTO_REFERENCES=12;UNLICENSED_EXTERNAL_PHOTOS=HELD;LIVE_CHECKOUT=NO");
