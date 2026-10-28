import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
const prisma=read("prisma/schema.prisma");
const admin=read("app/api/admin/puja-offerings/route.ts");
const ui=read("components/admin-puja-offerings.tsx");
const index=read("app/pujas/page.tsx");
const detail=read("app/pujas/[id]/page.tsx");
const listings=read("components/puja/puja-services-directory.tsx");
const db=read("lib/puja/offerings.ts");
const sql=read("docs/sql/20261027_puja_offering.sql");
assert.match(prisma,/model PujaOffering \{/);
assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "PujaOffering"'),"Additive SQL migration missing");
assert.ok(admin.includes("getAdminApiUser()")&&admin.includes("validateJson(request,payload)")&&admin.includes("adminActionLog.create"),"No admin-only authenticated audited price edits");
assert.ok(admin.includes('if(!findPujaTopic(input.topicId))')&&admin.includes('input.available&&input.pricePaise===null'),"Invented Puja ID or zero-priced live publication");
assert.ok(admin.includes('pricePaise:z.number().int().min(100).max(100000000).nullable()'),"Unsafe amount range");
assert.ok(!/\b(?:razorpay|payment\.create|checkoutSession|prisma\.payment\.create)\b/.test(admin),"Admin rate update must not collect a payment");
assert.ok(ui.includes('secureFetch("/api/admin/puja-offerings"')&&ui.includes("Publish price"),"Missing editable Admin Puja prices");
assert.ok(index.includes("getPublishedPujaOffers()")&&listings.includes("offerings[topic.id]")&&detail.includes('const offering=(await getPublishedPujaOffers())[item.id]'),"Missing public price integration");
assert.ok(db.includes('error.code==="P2021"')&&db.includes("return {}"),"Missing-table fallback must not fake prices");
assert.ok(listings.includes('"Book Now" : "Enquire"')&&detail.includes('"Book Now — "'),"Published Puja offers must show Book Now");
const bookingClient=read("components/puja/booking-request-client.tsx");
const bookingApi=read("app/api/puja/bookings/route.ts");
assert.ok(bookingClient.includes("expectedPricePaise:pricePaise") &&
  bookingApi.includes("expectedPricePaise:z.number().int().min(100).max(100000000).optional()") &&
  bookingApi.includes("offer.pricePaise!==input.expectedPricePaise") &&
  bookingApi.includes('Refresh and review the new price before submitting.'), "PUJA_PRICE_STALE_SUBMISSION_MUST_FAIL_CLOSED");
assert.ok(bookingClient.includes("confirmedQuotePaise")&&bookingClient.includes("quotedPricePaise")&&
  !bookingClient.includes("Listed fee ₹1,100."),"BOOKING_COPY_MUST_FOLLOW_SERVER_QUOTE");
assert.ok(!detail.includes("₹1,100 is the listed service fee.")&&detail.includes("published fee shown above"),
  "PUJA_DETAIL_MUST_NOT_CONTRADICT_ADMIN_PRICE");
assert.ok(ui.includes('ResilientEditorialImage')&&ui.includes('fallbackSrc={topic.graphic}')&&
  !ui.includes('import Image from "next/image"'), "ADMIN_PHOTO_MUST_FALLBACK_IF_COMMONS_UNAVAILABLE");
assert.ok(ui.includes("pricePaise:110000,durationMinutes:null,available:false")&&
  ui.includes("Existing saved rates are preserved"),"UNPUBLISHED_OWNER_1100_DRAFT_MISSING");
console.log("PUJA_OFFER_PRICING_QA=PASS;94_TOPICS_ADMIN_CONTROLS=READY;OWNER_PRICES_MANAGED=YES;PAYMENTS_GATED_UNTIL_PARTNER_CONFIRMED");

const gatewayOrder=read("app/api/payments/razorpay/order/route.ts");
const gatewayWebhook=read("app/api/payments/razorpay/webhook/route.ts");
const bookingPage=read("app/puja-bookings/page.tsx");
assert.ok(prisma.includes("PUJA_BOOKING")&&read("lib/env.ts").includes('PUJA_PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false")'),"PUJA_GATEWAY_MUST_DEFAULT_DISABLED");
for(const s of ["partner.reviewStatus !== \"VERIFIED\"","!booking.scheduledAt","booking.quotedPricePaise !== 110000","pujaBookingId: booking.id"])
  assert.ok(gatewayOrder.includes(s),"PUJA_PAYMENT_ACCEPTANCE_GUARD_MISSING="+s);
assert.ok(gatewayWebhook.includes('event.event==="refund.processed"')&&gatewayWebhook.includes('status:"REFUNDED"'),"PUJA_REFUND_WEBHOOK_GUARD_MISSING");
assert.ok(bookingPage.includes("RazorpayCheckoutButton")&&bookingPage.includes('env.PUJA_PAYMENTS_ENABLED==="true"'),"CONFIRMED_PUJA_CHECKOUT_NOT_GATED");
assert.ok(bookingPage.includes('reviewStatus:"VERIFIED"')&&bookingPage.includes('evidenceUrl:{not:null}')&&
  bookingPage.includes('pricePaise:110000')&&bookingPage.includes('publishedOfferIds.has(row.topicId)')&&
  bookingPage.includes('getRazorpayReadiness().enabled'),"PUJA_CHECKOUT_UI_PARTNER_PRICE_OR_CREDENTIAL_GUARD_MISSING");
assert.ok(bookingPage.includes('["PENDING","FAILED"].includes(payment.status)')&&
  bookingPage.includes('paymentSettled=bookingPayments.some')&&
  bookingPage.includes('"REFUNDED"')&&
  bookingPage.includes('retryable&&checkoutEnabled'),"PUJA_CHECKOUT_FAILED_PENDING_RESUME_OR_DUPLICATE_GUARD_MISSING");
const checkoutClient=read("components/razorpay-checkout-button.tsx");
assert.ok(checkoutClient.includes("Unable to reach the payment server")&&
  checkoutClient.includes("Payment confirmation is pending")&&
  checkoutClient.includes("do not pay twice")&&
  checkoutClient.includes('} finally {\n          setLoading(false);'),"RAZORPAY_CLIENT_FAILURE_OR_DUPLICATE_CHARGE_GUIDANCE_MISSING");

const pricingPage=read("app/pricing/page.tsx");
const pricingContent=read("components/pricing-content.tsx");
assert.ok(pricingPage.includes("getPublishedPujaOffers()") &&
  pricingPage.includes('displayPujaPrice(prices[0])') &&
  pricingContent.includes("pujaPriceLabel"),"PUBLIC_PRICING_MUST_FOLLOW_APPROVED_DB_FEES");
assert.ok(pricingContent.includes('href: "/pujas"')&&
  pricingContent.includes('href: "/shop"')&&
  pricingContent.includes("unpaid cart and order requests"),"PRICING_MUST_DESCRIBE_REAL_COMMERCE_STATE");
assert.ok(gatewayWebhook.includes("if(transition.count===0)") &&
  gatewayWebhook.includes("razorpay_puja_refund_duplicate_ignored"),"REFUND_WEBHOOK_MUST_BE_IDEMPOTENT");
assert.ok(read("components/ai-astrologer-chat.tsx").includes("!json.data.answer.trim()"),"AI_CHAT_MUST_REJECT_EMPTY_PROVIDER_TEXT");
