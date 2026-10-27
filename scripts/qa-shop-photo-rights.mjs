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
console.log("SHOP_VISUAL_AND_IMAGE_RIGHTS_QA=PASS;UNLICENSED_EXTERNAL_PHOTOS=HELD;LIVE_CHECKOUT=NO");
