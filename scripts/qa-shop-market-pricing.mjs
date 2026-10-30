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
assert.ok(admin.includes("applyMissingMarketPrices")&&
  admin.includes("if(hasPrice(product)||marketPricePaise===null)return product;")&&
  admin.includes("Fill Missing Market Prices"),"ADMIN_EXPLICIT_PRICE_SEED_MERGE_NOT_GATED");
assert.ok(orders.includes("product.unitPricePaise*item.quantity")&&
 orders.includes('paymentStatus:"UNPAID"')&&orders.includes('status:checkoutReady?"CONFIRMED":"REQUESTED"')&&
 orders.includes("shippingPaise:0,taxPaise:0,totalPaise:subtotal")&&
 orders.includes('env.SHOP_PAYMENTS_ENABLED==="true"'),
 "SERVER_PRICED_CHECKOUT_OR_DEFAULT_UNPAID_GUARD_LOST");
assert.ok(read("components/shop-coming-soon-content.tsx").includes("Listed selling price")&&
 read("components/shop/cart-page-client.tsx").includes("Total payable")&&
 read("components/shop/cart-page-client.tsx").includes("Sign in to checkout")&&
 read("components/shop/cart-page-client.tsx").includes('payload={{purpose:"SHOP_ORDER",shopOrderId:orderId}}'),
 "CUSTOMER_DIRECT_CHECKOUT_JOURNEY_MISSING");
const cartControls=read("components/shop/quote-cart-controls.tsx");
assert.ok(cartControls.includes('function add(goToCart=false)')&&
  cartControls.includes('if(goToCart)router.push("/cart")')&&
  cartControls.includes('onClick={()=>add(true)}')&&
  cartControls.includes("Order Now")&&
  cartControls.includes("secure checkout")&&
  cartControls.includes('if(index>=0&&list[index].quantity>=10)')&&
  cartControls.includes('if(index<0&&list.length>=20)'),
  "ONE_CLICK_ORDER_NOW_MUST_PRESERVE_CART_LIMITS_AND_NO_PAYMENT_DISCLOSURE");

const homeServer=read("app/page.tsx");
const homeClient=read("components/home/editorial-home.tsx");
assert.ok(homeServer.includes("getShopCatalogue()")&&homeServer.includes("featuredShopPrices[product.id]")&&
  homeServer.includes("<EditorialHome featuredShopPrices={featuredShopPrices}")&&
  homeClient.includes("featuredShopPrices[item.id]")&&
  homeClient.includes("Selling price · no online charge"),"HOMEPAGE_PRICES_NOT_CANONICAL_WITH_SHOP");

assert.ok(ledger.includes("not supplier quotes")&&ledger.includes("unspecified contents/report"),
 "MARKET_REFERENCE_MUST_NOT_CLAIM_SUPPLIER_CERTAINTY");
console.log("SHOP_MARKET_PRICE_QA=PASS;SKUS=12;SERVER_PRICED=YES;SECURE_CHECKOUT_GATE=YES;OWNER_FULFILS_ORDERS=YES");
