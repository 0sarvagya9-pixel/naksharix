import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {shopMarketPricesPaise, marketPriceForSeed, formatSeedPrice} from "../lib/shop/market-price-seeds.ts";

const expected={
 "5-mukhi-rudraksha":59900,
 "7-mukhi-rudraksha":149900,
 "dhan-yog-bracelet":69900,
 "amethyst-focus-bracelet":79900,
 "citrine-wealth-bracelet":89900,
 "black-tourmaline-protection":69900,
 "shri-yantra":79900,
 "mahamrityunjaya-yantra":59900,
 "rudraksha-mala":89900,
 "zodiac-energy-bracelet":79900,
 "career-growth-combo":149900,
 "relationship-harmony-combo":99900
};
assert.equal(Object.keys(shopMarketPricesPaise).length,12,"MUST_PRICE_EXACTLY_12_SEED_SKUS");
assert.deepEqual(shopMarketPricesPaise,expected,"UNREVIEWED_MARKET_PRICE_CHANGE");
for(const [id,paise] of Object.entries(expected)){
 assert.ok(Number.isSafeInteger(paise)&&paise>=100&&paise<=1e8,"INVALID_PAISE_"+id);
 assert.equal(marketPriceForSeed(id),paise,"PRICE_LOOKUP_NOT_CANONICAL_"+id);
 assert.ok(formatSeedPrice(paise).startsWith("₹"),"CURRENCY_MUST_BE_INR");
}
assert.equal(marketPriceForSeed("unlisted-product"),null,"UNKNOWN_SKU_MUST_NOT_RECEIVE_A_GUESSED_PRICE");
const read=(path)=>readFileSync(path,"utf8");
const catalog=read("lib/manual-catalogue.ts");
const store=read("lib/shop/catalogue-store.ts");
const orders=read("app/api/commerce/orders/route.ts");
const admin=read("components/admin-shop-content.tsx");
const ledger=read("docs/SHOP_MARKET_PRICE_BENCHMARKS_20261028.md");
for(const id of Object.keys(expected))assert.ok(catalog.includes('product("'+id+'"')&&ledger.includes('| '+id+' |'),"PRICE_WITHOUT_CATALOGUE_OR_EVIDENCE="+id);
assert.ok(catalog.includes("marketPriceForSeed(id)")&&catalog.includes("unitPricePaise: marketPricePaise")&&catalog.includes("formatSeedPrice(marketPricePaise)"),"SHOP_PRICE_SEED_NOT_CANONICAL");
assert.ok(store.includes("shopCatalogueSnapshot.findUnique")&&store.includes("if (!snapshot) return { products: shopProducts")&&store.includes("(snapshot.products as unknown as ShopProduct[])"),"ADMIN_PRICES_MUST_BE_PRESERVED_OVER_SEEDS");
assert.ok(admin.includes("unitPricePaise: editing.unitPricePaise ?? null"),"ADMIN_PRICE_OVERRIDE_LOST");
assert.ok(orders.includes("product.unitPricePaise*item.quantity")&&orders.includes('status:"REQUESTED"')&&
 orders.includes('paymentStatus:"UNPAID"')&&orders.includes("onlineCheckoutAvailable:false"),"PRICE_SECURITY_OR_UNPAID_ORDER_GUARD_LOST");
assert.ok(read("components/shop-coming-soon-content.tsx").includes("Market-compared item price")&&
 read("app/shop/[slug]/page.tsx").includes("Market-compared listing price")&&
 read("components/shop/cart-page-client.tsx").includes("Market-compared product subtotal"),
 "SHOP_PRICING_TERMS_DISCLOSURE_MISSING");
assert.ok(ledger.includes("nor proof of our source costs")&&ledger.includes("exact bundled items"),
 "MARKET_REFERENCE_MUST_NOT_CLAIM_SUPPLIER_CERTAINTY");
console.log("SHOP_MARKET_PRICE_QA=PASS;SKUS=12;PUBLIC_LIST_PRICES=INR;OWNER_BENCHMARK=2026-10-28;PAYMENT=UNPAID_MANUAL;SUPPLIER_AUTHENTICITY=NOT_ATTESTED");
