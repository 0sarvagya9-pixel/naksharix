#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(path,"utf8");
const publicScreens = [
  "components/home/editorial-home.tsx",
  "components/home/editorial-service-banner.tsx",
  "components/consultation-gallery.tsx",
  "app/shop/page.tsx",
  "components/shop-coming-soon-content.tsx",
  "components/shop/product-gallery.tsx",
  "app/pujas/[id]/page.tsx",
  "components/puja/puja-services-directory.tsx",
  "app/puja-calendar/page.tsx",
  "app/panchang/page.tsx",
  "app/transits/page.tsx",
  "components/reports-content.tsx",
  "app/reports/[slug]/page.tsx",
  "app/puja-enquiry/page.tsx"
];
const bannedPublicPhrases = [
  /Banner shows a licensed reference photograph/i,
  /Representative image \(not delivered ceremony\)/i,
  /Representative exhibition photo ·/i,
  /Real licensed reference photo • Exact supplied item may differ/i,
  /Owner-approved manual service fee/i,
  /provider-verified regression/i,
  /natal overlay rules pass QA/i,
  /Verification level: \{snapshot.metadata.verificationLevel\}/i,
  /This specialist report does not make an upfront payment claim/i,
  /Partner review registry/i,
  /Format preview<\/span>/i,
  /No operator-reviewed partners are listed/i
];
for (const path of publicScreens) {
  const source = read(path);
  for (const pattern of bannedPublicPhrases) {
    assert.ok(!pattern.test(source), "INTERNAL_CUSTOMER_COPY_REGRESSION="+path+" "+pattern);
  }
}
const credits=read("app/image-credits/page.tsx");
assert.ok(credits.includes("editorialPujaPhotos") &&
  credits.includes("categoryPujaPhotos") &&
  credits.includes("referenceProductPhotos") &&
  credits.includes("Astrologer.jpg") &&
  credits.includes("licenceUrl"),
  "REQUIRED_AUTHOR_AND_LICENSE_ACKNOWLEDGEMENTS_MISSING");
assert.ok(read("components/footer.tsx").includes('href="/image-credits"'),
  "IMAGE_CREDITS_FOOTER_ACCESS_MISSING");
const card=read("components/shop-coming-soon-content.tsx");
const detail=read("components/shop/product-gallery.tsx");
assert.ok(card.includes("Images are for reference") &&
  detail.includes("Product images are for reference") &&
  read("components/shop/quote-cart-controls.tsx").includes('href="/cart"'),
  "HONEST_IMAGE_REFERENCE_OR_CART_LINK_MISSING");
assert.ok(read("components/reports-content.tsx").includes("RazorpayCheckoutButton") &&
  read("components/puja/puja-services-directory.tsx").includes("offerings[topic.id]") &&
  (read("app/pujas/[id]/page.tsx").includes("displayPujaPrice") ||
   (read("app/pujas/[id]/page.tsx").includes('redirect("/pujas")') &&
    read("app/pujas/page.tsx").includes("Coming Soon"))),
  "PRICE_AND_SECURE_CHECKOUT_INTEGRITY_MISSING");
assert.ok(read("app/panchang/page.tsx").includes("Daily Panchang") &&
  !read("app/panchang/page.tsx").includes("provider-verified regression"),
  "CUSTOMER_PANCHANG_HEADING_REGRESSION");

const optionalReportCard=read("components/optional-report-next-step.tsx");
const relevantDiscovery=read("components/relevant-report-discovery.tsx");
assert.ok(optionalReportCard.includes('locale === "hinglish"') &&
  optionalReportCard.includes("Free tool use karne ke liye report kharidna zaroori nahi hai") &&
  optionalReportCard.includes("Report ki details dekhein") &&
  optionalReportCard.includes("getManualReportCheckout(reportSlug)") &&
  optionalReportCard.includes("checkout.price") &&
  optionalReportCard.includes('href={`/reports/${report.slug}`}'),
  "OPTIONAL_REPORT_HINGLISH_OR_CATALOGUE_LINK_REGRESSION");
assert.ok(relevantDiscovery.includes("hinglish: {") &&
  relevantDiscovery.includes("Free card reading ke liye purchase zaroori nahi hai") &&
  relevantDiscovery.includes("Personalized report lena bilkul optional hai") &&
  relevantDiscovery.includes("}[locale]") &&
  relevantDiscovery.includes('topic === "tarot" ? copy.tarot : copy.general') &&
  relevantDiscovery.includes("locale={locale}"),
  "RELEVANT_DISCOVERY_HINGLISH_OR_VOLUNTARY_COPY_REGRESSION");


// Both primary free tools expose an optional, catalogue-backed detail link without requiring birth inputs.
assert.ok(relevantDiscovery.includes('kundli: ["premium-kundli"]') &&
  relevantDiscovery.includes('matching: ["couple-kundli"]') &&
  read("app/kundli/page.tsx").includes('<RelevantReportDiscovery topic="kundli" />') &&
  read("app/matchmaking/page.tsx").includes('<RelevantReportDiscovery topic="matching" />'),
  "PRIMARY_FREE_TOOL_OPTIONAL_REPORT_DISCOVERY_MISSING");

console.log("PUBLIC_COPY_QA=PASS;PUBLIC_SURFACES="+publicScreens.length+";LICENSE_CREDITS=AVAILABLE;CHECKOUT_LOGIC=PRESERVED");
