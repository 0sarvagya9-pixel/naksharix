/**
 * Source-backed, fail-closed commerce admission. NEVER auto-publishes or initiates
 * payment. Payment and fulfillment are separate release-gated systems.
 */
const MARKET_HOSTS = new Set(["gemsmantra.com", "www.gemsmantra.com", "astroarunpandit.org", "www.astroarunpandit.org"]);
const IMAGE_RIGHTS = new Set(["OWNED", "LICENSED", "SUPPLIER_AUTHORIZED"]);
const MAX_STOCK_AGE_MS = 48 * 3600000;
const MAX_PRICE_AGE_MS = 7 * 24 * 3600000;
const nonnegative = (value) => Number.isSafeInteger(value) && value >= 0;
function recent(iso, now, age) {
  const time = Date.parse(iso ?? "");
  return Number.isFinite(time) && time <= now && now - time <= age;
}
function approvedReference(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && MARKET_HOSTS.has(url.hostname) &&
      !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}
export function reviewMarketCandidate(item, now = Date.now()) {
  const reasons = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { state: "REVIEW_HELD", reasons: ["INVALID_RECORD"], autoPublish: false, autoCheckout: false };
  }
  if (!approvedReference(item.sourceUrl)) reasons.push("REFERENCE_SOURCE_INVALID");
  if (!recent(item.observedAt, now, MAX_PRICE_AGE_MS)) reasons.push("STALE_REFERENCE_PRICE");
  if (!nonnegative(item.referencePricePaise) || item.referencePricePaise < 100) reasons.push("INVALID_REFERENCE_PRICE");
  if (typeof item.sku !== "string" || !item.sku || item.sku.length > 100) reasons.push("SKU_INVALID");
  if (typeof item.equivalenceProof !== "string" || item.equivalenceProof.length < 15) reasons.push("VARIANT_EQUIVALENCE_UNVERIFIED");
  if (!item.supplierId || item.supplierContractReviewed !== true) reasons.push("SUPPLIER_NOT_VERIFIED");
  if (!recent(item.stockConfirmedAt, now, MAX_STOCK_AGE_MS) || !nonnegative(item.stockQuantity) || item.stockQuantity < 1) reasons.push("STOCK_NOT_VERIFIED");
  if (item.fulfillmentConfirmed !== true) reasons.push("FULFILLMENT_NOT_VERIFIED");
  if (!IMAGE_RIGHTS.has(item.imageRights) || typeof item.imageProof !== "string" ||
      item.imageProof.length < 8 || typeof item.ownImageUrl !== "string" ||
      !item.ownImageUrl.startsWith("/") || item.ownImageUrl.startsWith("//")) {
    reasons.push("IMAGE_RIGHTS_UNVERIFIED");
  }
  for (const cost of ["sourcingPaise", "shippingPaise", "taxPaise", "gatewayFeePaise", "returnsReservePaise", "minimumMarginPaise"]) {
    if (!nonnegative(item[cost])) reasons.push("INVALID_" + cost.toUpperCase());
  }
  if (reasons.length) return { state: "REVIEW_HELD", reasons, autoPublish: false, autoCheckout: false };
  const undercut = Math.max(100, Math.floor(item.referencePricePaise * 0.02));
  const quotedPricePaise = item.referencePricePaise - undercut;
  const costFloorPaise = item.sourcingPaise + item.shippingPaise + item.taxPaise +
    item.gatewayFeePaise + item.returnsReservePaise + item.minimumMarginPaise;
  if (quotedPricePaise <= 0 || quotedPricePaise < costFloorPaise) {
    return { state: "REVIEW_HELD", reasons: ["UNDERCUT_BREAKS_MARGIN"], costFloorPaise, autoPublish: false, autoCheckout: false };
  }
  return { state: "PRICE_CANDIDATE_REQUIRES_ADMIN_APPROVAL", reasons: ["ADMIN_APPROVAL_REQUIRED"],
    referencePricePaise: item.referencePricePaise, quotedPricePaise, costFloorPaise,
    autoPublish: false, autoCheckout: false };
}
export function reviewPujaCandidate(item, now = Date.now()) {
  const reasons = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { state: "REVIEW_HELD", reasons: ["INVALID_RECORD"], autoPublish: false, autoCheckout: false };
  }
  if (!approvedReference(item.referenceUrl)) reasons.push("SOURCE_INVALID");
  if (typeof item.title !== "string" || !item.title || item.title.length > 140) reasons.push("TITLE_INVALID");
  if (!item.operatorId || item.operatorAgreementVerified !== true) reasons.push("OPERATOR_NOT_VERIFIED");
  if (item.panditVerified !== true) reasons.push("PANDIT_NOT_VERIFIED");
  if (item.templePermissionVerified !== true) reasons.push("TEMPLE_PERMISSION_NOT_VERIFIED");
  if (!recent(item.availableDateConfirmedAt, now, MAX_STOCK_AGE_MS) ||
      !item.serviceDate || !Number.isFinite(Date.parse(item.serviceDate)) ||
      Date.parse(item.serviceDate) <= now) reasons.push("FUTURE_SERVICE_DATE_UNVERIFIED");
  if (!nonnegative(item.packagePricePaise) || item.packagePricePaise < 100) reasons.push("PRICE_INVALID");
  if (item.fulfillmentAndCancellationTermsApproved !== true) reasons.push("SERVICE_TERMS_MISSING");
  if (item.sankalpPrivacyConsentFlow !== true) reasons.push("SANKALP_PRIVACY_MISSING");
  if (item.claimsPrasadDelivery && item.prasadCourierContractVerified !== true) reasons.push("PRASAD_DELIVERY_UNVERIFIED");
  if (!item.approvedBy || !recent(item.approvedAt, now, MAX_PRICE_AGE_MS)) reasons.push("ADMIN_REVIEW_MISSING");
  return {
    state: reasons.length ? "REVIEW_HELD" : "SERVICE_OPERATIONS_REVIEW_PASSED",
    reasons, autoPublish: false, autoCheckout: false
  };
}
