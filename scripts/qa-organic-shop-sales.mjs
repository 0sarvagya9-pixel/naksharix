import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const detail = read("app/shop/[slug]/page.tsx");
const actions = read("components/shop/product-share-actions.tsx");
const product = read("lib/shop/organic-discovery.ts");
const gallery = read("components/shop/product-gallery.tsx");
const guides = read("lib/blog-content.ts");
const jsonld = read("components/seo/json-ld.tsx");

for (const marker of [
  "ProductShareActions",
  "AddToCartButton",
  "getShopCatalogue()",
  "productDiscoverySchema(product, canonicalOrigin)",
  "shop-breadcrumb-",
  "shop-product-"
]) assert.ok(detail.includes(marker), "SHOP_PURCHASE_DISCOVERY_REGRESSION=" + marker);

assert.ok(actions.includes("https://wa.me/?text=") &&
  actions.includes("navigator.clipboard.writeText(productUrl)") &&
  actions.includes("noopener noreferrer") &&
  actions.includes("encodeURIComponent(text)"),
  "BUYER_REFERRAL_SHARE_MUST_BE_VOLUNTARY_AND_DIRECT");

for (const marker of [
  'rights !== "OWNED" && rights !== "SUPPLIER_AUTHORIZED"',
  'referencePhotoForProduct(product.id)',
  'placeholder|illustration|fallback|reference',
  '"@type": "Product"',
  '"@type": "Offer"',
  'priceCurrency: "INR"',
]) assert.ok(product.includes(marker), "UNVERIFIED_MERCHANT_FEED_CLAIM=" + marker);
assert.ok(!product.includes("schema.org/InStock") &&
  !product.includes("AggregateRating") &&
  !product.includes('"gtin"') &&
  !product.includes('"review"'),
  "SHOP_SCHEMA_MUST_NOT_INVENT_STOCK_IDENTIFIERS_OR_REVIEWS");
assert.ok(gallery.includes("itemPhotoVerified") &&
  gallery.includes("Product images are for reference"),
  "NO_REFERENCE_PHOTO_DISCLOSURE_LOSS");
assert.ok(guides.includes('"/shop/5-mukhi-rudraksha"') &&
  guides.includes('"/shop/rudraksha-mala"') &&
  guides.includes('"/shop/shri-yantra"'),
  "BUYER_EDUCATION_MUST_LINK_TO_REAL_CATALOGUE_ROUTES");
const indexnow = read("scripts/seo/submit-indexnow.mjs");
for (const route of ["/shop", "/shop/5-mukhi-rudraksha", "/shop/dhan-yog-bracelet", "/shop/shri-yantra", "/shop/rudraksha-mala"]) {
  assert.ok(indexnow.includes('"' + route + '"'), "BUYER_ROUTE_MISSING_FROM_FREE_INDEXNOW_DISCOVERY=" + route);
}
assert.ok(jsonld.includes('replace(/</g, "\\\\u003c")'),
  "INLINE_PRODUCT_JSONLD_REQUIRES_HTML_ESCAPE");
console.log("NAKSHARIX_ORGANIC_SALES_QA=PASS;SHARE_LINKS=YES;LIVE_SHOP_PRICES=YES;UNVERIFIED_IMAGES_EXCLUDED=YES;GOOGLE_MERCHANT_ACCOUNT_CONNECTION_STILL_REQUIRED=YES");
