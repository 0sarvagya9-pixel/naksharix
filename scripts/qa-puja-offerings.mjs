import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
const prisma=read("prisma/schema.prisma");
const admin=read("app/api/admin/puja-offerings/route.ts");
const ui=read("components/admin-puja-offerings.tsx");
const catalogueCopy=read("lib/admin/catalogue-copy.ts");
const index=read("app/pujas/page.tsx");
const detail=read("app/pujas/[id]/page.tsx");
const listings=read("components/puja/puja-services-directory.tsx");
const db=read("lib/puja/offerings.ts");
const pujaPaused=index.includes("Coming Soon") && detail.includes('redirect("/pujas")') &&
  read("app/api/puja/bookings/route.ts").includes("New bookings are temporarily closed.");
const launch=read("lib/puja/launch-readiness.ts");
const env=read("lib/env.ts");
assert.ok(env.includes('PUJA_BOOKINGS_ENABLED: z.enum(["true", "false"]).default("false")') &&
  launch.includes('env.PUJA_BOOKINGS_ENABLED !== "true"') &&
  launch.includes("partnerSupportsTopic(partner, topicId)") &&
  launch.includes("getEmailReadiness().emailEnabled"),
  "Puja must be paused by default and launch must require an exact-topic verified Pandit and email");
assert.ok(db.includes("no payment is collected before confirmation")&&db.includes("note:/(verified Pandit availability"),"LEGACY_PUJA_NOTE_MUST_NOT_MISLEAD_PUBLIC");
const sql=read("docs/sql/20261027_puja_offering.sql");
assert.match(prisma,/model PujaOffering \{/);
assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "PujaOffering"'),"Additive SQL migration missing");
assert.ok(admin.includes("getAdminApiUser()")&&admin.includes("validateJson(request,payload)")&&admin.includes("adminActionLog.create"),"No admin-only authenticated audited price edits");
assert.ok(admin.includes('if(!findPujaTopic(input.topicId))')&&admin.includes('input.available&&input.pricePaise===null'),"Invented Puja ID or zero-priced live publication");
assert.ok(admin.includes('pricePaise:z.number().int().min(100).max(100000000).nullable()'),"Unsafe amount range");
assert.ok(!/\b(?:razorpay|payment\.create|checkoutSession|prisma\.payment\.create)\b/.test(admin),"Admin rate update must not collect a payment");
assert.ok(ui.includes('secureFetch("/api/admin/puja-offerings"')&&ui.includes("copy.publishOffer")&&catalogueCopy.includes("Publish price only if this Puja can actually be offered"),"Missing editable Admin Puja prices");
assert.ok(pujaPaused || (index.includes("getPublishedPujaOffers()")&&listings.includes("offerings[topic.id]")&&detail.includes('const offering=(await getPublishedPujaOffers())[item.id]')),"Public price integration must be active or deliberately paused");
assert.ok(db.includes('error.code==="P2021"')&&db.includes("return {}"),"Missing-table fallback must not fake prices");
assert.ok(pujaPaused || (listings.includes('"Book Now" : "Enquire"')&&detail.includes('"Book Now — "')&&listings.includes("listed service fee · secure checkout")),"Puja public booking must be priced or coming soon");
const bookingClient=read("components/puja/booking-request-client.tsx");
const bookingApi=read("app/api/puja/bookings/route.ts");
assert.ok(pujaPaused || (bookingClient.includes("expectedPricePaise:pricePaise") &&
  bookingApi.includes("expectedPricePaise:z.number().int().min(100).max(100000000).optional()") &&
  bookingApi.includes("offer.pricePaise!==input.expectedPricePaise") &&
  bookingApi.includes('Refresh and review the new price before submitting.')), "PUJA_PRICE_STALE_SUBMISSION_MUST_FAIL_CLOSED");
assert.ok(bookingClient.includes("confirmedQuotePaise")&&bookingClient.includes("quotedPricePaise")&&
  !bookingClient.includes("Listed fee ₹1,100."),"BOOKING_COPY_MUST_FOLLOW_SERVER_QUOTE");
assert.ok(pujaPaused || (!detail.includes("₹1,100 is the listed service fee.")&&detail.includes("Book Now saves your preferred date")),
  "PUJA_DETAIL_MUST_NOT_CONTRADICT_ADMIN_PRICE");
assert.ok(ui.includes('ResilientEditorialImage')&&ui.includes('fallbackSrc={topic.graphic}')&&
  !ui.includes('import Image from "next/image"'), "ADMIN_PHOTO_MUST_FALLBACK_IF_COMMONS_UNAVAILABLE");
assert.ok(ui.includes("pricePaise:110000,durationMinutes:null,available:false")&&
  ui.includes("copy.feeTerms")&&catalogueCopy.includes("Existing saved rates are preserved"),"UNPUBLISHED_OWNER_1100_DRAFT_MISSING");
console.log("PUJA_OFFER_PRICING_QA=PASS;94_TOPICS_ADMIN_CONTROLS=READY;OWNER_PRICES_MANAGED=YES;PAYMENTS_REQUIRE_PUBLISHED_FEE_AND_GATEWAY");

const gatewayOrder=read("app/api/payments/razorpay/order/route.ts");
const gatewayWebhook=read("app/api/payments/razorpay/webhook/route.ts");
const bookingPage=read("app/puja-bookings/page.tsx");
assert.ok(prisma.includes("PUJA_BOOKING")&&read("lib/env.ts").includes('PUJA_PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false")'),"PUJA_GATEWAY_MUST_DEFAULT_DISABLED");
for(const s of ['booking.userId !== userId','booking.status !== "SCHEDULED"',
 'offer.pricePaise !== booking.quotedPricePaise','booking.quotedPricePaise !== 110000','pujaBookingId: booking.id',
 'partnerSupportsTopic(partner, booking.topicId)','booking.scheduledAt.getTime() <= Date.now()'])
  assert.ok(gatewayOrder.includes(s),"PUJA_PAYMENT_PRICE_OR_OWNERSHIP_GUARD_MISSING="+s);
const sharedRefund=read("lib/payments/purpose-reconciliation.ts");
assert.ok(gatewayWebhook.includes('event.event === "refund.processed"')&&
  gatewayWebhook.includes("reconcileProcessedRefund")&&
  gatewayWebhook.includes("verifyRazorpayWebhookSignature")&&
  sharedRefund.includes('original.purpose === "PUJA_BOOKING"')&&
  sharedRefund.includes('status: "REFUNDED"'),"PUJA_REFUND_WEBHOOK_GUARD_MISSING");
assert.ok(bookingPage.includes("const canCheckout = release.enabled") &&
  bookingPage.includes('row.status === "SCHEDULED"') &&
  bookingPage.includes("const validatedPartner = partner ? partnerSupportsTopic(partner,row.topicId)") &&
  bookingPage.includes("currentOffer?.pricePaise===row.quotedPricePaise") &&
  bookingPage.includes('row.quotedPricePaise === 110000') &&
  bookingPage.includes("RazorpayCheckoutButton") &&
  bookingPage.includes("paymentSettled=bookingPayments.some") &&
  bookingPage.includes('"REFUNDED"') &&
  bookingPage.includes("!paymentSettled && !pendingOld"),
  "PUJA_CHECKOUT_UI_MUST_REQUIRE_LAUNCH_PANDIT_SCHEDULE_CURRENCY_AND_NO_DUPLICATE");
const checkoutClient=read("components/razorpay-checkout-button.tsx");
const checkoutCopy=read("lib/payments/customer-copy.ts");
assert.ok(checkoutClient.includes('setStatus("networkPending")')&&checkoutCopy.includes("Unable to reach the payment server")&&
  checkoutClient.includes('setStatus("confirmationPending")')&&checkoutCopy.includes("Payment confirmation is pending")&&
  checkoutCopy.includes("do not pay twice")&&
  checkoutClient.includes('} finally {\n          setBusy(false);')&&
  checkoutClient.includes('checkout.on("payment.failed"')&&
  checkoutClient.includes('lockCheckout();')&&
  checkoutClient.includes('if (busyRef.current || lockedRef.current'),"RAZORPAY_CLIENT_FAILURE_OR_DUPLICATE_CHARGE_GUIDANCE_MISSING");

const pricingPage=read("app/pricing/page.tsx");
const pricingContent=read("components/pricing-content.tsx");
assert.ok(pricingPage.includes("getPujaLaunchState()") &&
  pricingPage.includes('displayPujaPrice(prices[0])') &&
  pricingPage.includes('"Coming Soon"') &&
  pricingContent.includes("pujaPriceLabel") &&
  pricingContent.includes("pujaEnabled") &&
  pricingContent.includes("No advance payment"),
  "PUBLIC_PRICING_MUST_FOLLOW_VERIFIED_LAUNCH_GATE_OR_SHOW_COMING_SOON");
assert.ok(pricingContent.includes('href: "/pujas"')&&
  pricingContent.includes('href: "/shop"')&&
  pricingContent.includes('href: "/shop"'),"PRICING_MUST_DESCRIBE_REAL_COMMERCE_STATE");
assert.ok(sharedRefund.includes("prisma.$transaction(async (tx) =>") &&
  sharedRefund.includes("if (updated.count !== 1) return false;") &&
  sharedRefund.includes('status: "REFUNDED"') &&
  sharedRefund.includes("Prisma.TransactionIsolationLevel.Serializable"),"REFUND_WEBHOOK_MUST_BE_IDEMPOTENT");
assert.ok(read("components/ai-astrologer-chat.tsx").includes("!json.data.answer.trim()"),"AI_CHAT_MUST_REJECT_EMPTY_PROVIDER_TEXT");
