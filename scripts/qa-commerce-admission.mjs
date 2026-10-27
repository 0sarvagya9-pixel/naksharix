import assert from "node:assert/strict";
import { reviewMarketCandidate, reviewPujaCandidate } from "../lib/commerce/admission.mjs";
const now = Date.parse("2026-10-27T06:00:00Z");
const good = {
  sourceUrl: "https://gemsmantra.com/pages/gemsmantra-astro-sale",
  observedAt: "2026-10-27T05:00:00Z", sku: "NX-BRACELET-1",
  equivalenceProof: "Same bead count, size, composition and grading",
  referencePricePaise: 94900, supplierId: "sample-fixture-id",
  supplierContractReviewed: true, stockConfirmedAt: "2026-10-27T05:00:00Z",
  stockQuantity: 5, fulfillmentConfirmed: true, imageRights: "OWNED",
  imageProof: "Fixture-only image rights proof", ownImageUrl: "/shop/owned-bracelet.jpg",
  sourcingPaise: 25000, shippingPaise: 4000, taxPaise: 6000,
  gatewayFeePaise: 2500, returnsReservePaise: 2000, minimumMarginPaise: 10000
};
const accepted = reviewMarketCandidate(good, now);
assert.equal(accepted.state, "PRICE_CANDIDATE_REQUIRES_ADMIN_APPROVAL");
assert.equal(accepted.autoCheckout, false);
assert.equal(accepted.autoPublish, false);
assert.ok(accepted.quotedPricePaise < good.referencePricePaise);
assert.ok(accepted.quotedPricePaise >= accepted.costFloorPaise);
for (const mutation of [
  {sourceUrl:"https://invalid.example/item"},
  {imageRights:"COPIED"}, {supplierContractReviewed:false},
  {stockConfirmedAt:"2026-10-22T05:00:00Z"},
  {observedAt:"2026-10-01T05:00:00Z"},
  {sourcingPaise:90000}, {referencePricePaise:1}
]) assert.equal(reviewMarketCandidate({...good,...mutation},now).state,"REVIEW_HELD");
const puja={
  referenceUrl:"https://astroarunpandit.org/poojan/en/",
  title:"Surya Puja",operatorId:"fixture-operator",operatorAgreementVerified:true,
  panditVerified:true,templePermissionVerified:true,
  availableDateConfirmedAt:"2026-10-27T05:00:00Z",
  serviceDate:"2026-11-15",packagePricePaise:88000,
  fulfillmentAndCancellationTermsApproved:true,sankalpPrivacyConsentFlow:true,
  claimsPrasadDelivery:false,approvedBy:"fixture-admin",
  approvedAt:"2026-10-27T05:00:00Z"
};
assert.equal(reviewPujaCandidate(puja,now).state,"SERVICE_OPERATIONS_REVIEW_PASSED");
for (const mutation of [
  {panditVerified:false}, {operatorAgreementVerified:false},
  {serviceDate:"2026-10-20"}, {claimsPrasadDelivery:true},
  {approvedBy:null}, {templePermissionVerified:false}
]) assert.equal(reviewPujaCandidate({...puja,...mutation},now).state,"REVIEW_HELD");
assert.equal(reviewPujaCandidate(puja,now).autoCheckout,false);
console.log("COMMERCE_ADMISSION_QA=PASS;NO_AUTO_CHECKOUT=YES");
