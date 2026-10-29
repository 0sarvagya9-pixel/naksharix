import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(p, "utf8");
const gates = read("lib/adsense.ts");
const env = read("lib/env.ts");
const client = read("components/adsense/educational-ad-client.tsx");
const wrapper = read("components/adsense/educational-ad.tsx");
const root = read("app/layout.tsx");
const guide = read("components/seo/kundli-education-page.tsx");
const growth = read("components/seo-growth-page.tsx");
const disclosure = read("app/advertising/page.tsx");
const footer = read("components/footer.tsx");
for (const key of ["ADSENSE_SITE_APPROVED", "ADSENSE_CMP_VERIFIED", "ADSENSE_ENABLE_SERVING"]) {
  assert.ok(env.includes(key + ': z.enum(["true", "false"]).default("false")'), key + " must default off");
  assert.ok(gates.includes("env." + key + ' === "true"'), key + " must explicitly gate ad serving");
}
assert.ok(env.includes("AdSense serving requires certified CMP verification"), "Production must require CMP");
assert.ok(env.includes("AdSense serving requires site approval evidence"), "Production must require approval");
assert.ok(gates.includes("if (!slot || !slotPattern.test(slot)) return null"), "No unverifiable numeric ad unit slots");
assert.ok(gates.includes("ca-pub-7848529669366564"), "Incorrect AdSense publisher");
assert.ok(wrapper.includes("if (!config) return null"), "Missing server-side kill switch");
assert.ok(client.includes("Advertisement") && client.includes("data-ad-slot") && client.includes("data-ad-client"), "Ads must be disclosed");
assert.ok(client.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), "No ad-serving loader ready");
assert.ok(!root.includes("adsbygoogle.js"), "Global ad script would affect private routes");
assert.ok(guide.includes("isIndexable ? <EducationalAd"), "No ads on unpublished native-language drafts");
assert.ok(growth.includes('page.slug === "free-kundli"'), "Ads restricted to actual educational content");
assert.ok(footer.includes('href="/advertising"') && disclosure.includes("privacy"), "No ad disclosure link");
assert.ok(read("components/legal-policy-page.tsx").includes('title: "Advertising and Cookies"'), "Privacy disclosures missing");
for (const p of ["app/login/page.tsx", "app/signup/page.tsx", "app/checkout/page.tsx", "app/kundli/page.tsx", "app/reports/page.tsx", "app/consultation/page.tsx"]) {
  try { assert.ok(!read(p).includes("EducationalAd"), "Ad in a private/sensitive view: " + p); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
console.log("ADSENSE_MONETIZATION_PREPARATION=PASS;GLOBAL_SCRIPT=OFF;REQUIRES_SITE_READY=YES;REQUIRES_CERTIFIED_CMP=YES");
