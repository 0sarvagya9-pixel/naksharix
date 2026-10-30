import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(path,"utf8");
const workflow=read(".github/workflows/production-acceptance.yml");
const readiness=read("app/api/ops/readiness/route.ts");
const e2e=read("tests/e2e/release.spec.ts");
const shop=read("components/shop-coming-soon-content.tsx");
const order=read("app/api/commerce/orders/route.ts");
assert.ok(workflow.includes("workflow_dispatch:")&&!workflow.includes("branches: [complete-production-polish]"),
  "PRODUCTION_ACCEPTANCE_MUST_NOT_RUN_AUTOMATICALLY_BEFORE_DEPLOY_PERMISSION");
assert.ok(workflow.includes("EXPECTED_SHA: ${{ github.sha }}")&&
 workflow.includes("Wait for the exact release deployment"),"PRODUCTION_EXACT_SHA_GATE_REMOVED");
assert.ok(readiness.includes('"razorpay_shop_checkout"')&&
 workflow.includes('"razorpay_shop_checkout"')&&
 e2e.includes('"razorpay_shop_checkout"'),
 "SHOP_CHECKOUT_CAPABILITY_NOT_CONSISTENT");
assert.ok(shop.includes("<AddToCartButton")&&workflow.includes("grep -Eqi 'Add to cart'")&&
 order.includes('paymentStatus:"UNPAID"')&&
 order.includes('shippingPaise:0,taxPaise:0,totalPaise:subtotal')&&
 read("components/shop/cart-page-client.tsx").includes("Sign in to checkout"),
 "SHOP_ORDER_TOTAL_AND_CHECKOUT_LOGIN_NOT_VERIFIED");
assert.ok(workflow.includes('Boolean(data?.ready) !== hasAi') &&
 workflow.includes("production-evidence/ai-status.json") &&
 workflow.includes("AI readiness/sitemap mismatch") &&
 !workflow.includes("Private/feature-gated AI route leaked to sitemap."),
 "FEATURE_GATED_AI_SITEMAP_ACCEPTANCE_WRONG");
console.log("PRODUCTION_ACCEPTANCE_MANUAL_GATE=PASS;AUTO_DEPLOY=NO;POSTDEPLOY_SHA_CHECK=YES;MARKET_PRICE_ORDER_REQUESTS=YES");
