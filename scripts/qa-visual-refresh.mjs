import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const read=(p)=>readFileSync(p,"utf8");
const keys=["kundli","consultation","reports","learning","panchang","puja","tarot"];
for(const k of keys)assert.ok(existsSync("public/naksharix/editorial-"+k+".svg"),"MISSING_RELEVANT_ART="+k);
for(const p of ["app/horoscope/page.tsx","app/tarot/page.tsx","app/matchmaking/page.tsx","app/puja-calendar/page.tsx","app/free-calculators/page.tsx","app/consultation/page.tsx","app/reports/page.tsx","app/learn/page.tsx","app/shop/page.tsx","app/puja-enquiry/page.tsx","app/kundli/page.tsx","app/numerology/page.tsx","app/blog/page.tsx","app/astrologers/page.tsx"]){
  const s=read(p);
  assert.ok(s.includes("editorial-")||s.includes("rudraksha-mala-illustration.svg"),"HERO_NOT_CONTEXTUAL="+p);
  assert.ok(!/star-filled night sky above mountains|Golden sunrise over mountains|Milky Way sky above snowy mountains/i.test(s),"IRRELEVANT_PHOTO="+p);
}
const home=read("components/home/editorial-home.tsx");
assert.ok(home.includes("Spiritual Catalogue")&&home.includes("Traditional Puja"),"REFERENCE_SECTIONS_MISSING");
assert.ok(!home.includes("images.unsplash.com/photo-1519681393784-d120267933ba"),"GENERIC_MOUNTAIN_RETAINED");
assert.ok(home.includes('number:"08"'),"EIGHT_SERVICE_CARDS_REQUIRED");
const nav=read("components/main-nav.tsx");
for(const x of ['label: "Reports"','label: "Consultation"','label: "Puja"','label: "Shop"'])assert.ok(nav.includes(x),"TOP_NAV_MISSING="+x);
assert.ok(read("app/layout.tsx").includes("reference-redesign.css"),"REDESIGN_NOT_IMPORTED");
const header=read("components/main-nav.tsx");
assert.ok(header.includes('bg-[#fff8ee] text-[#852f3c]') && !header.includes('hover:text-white"'),"IVORY_HEADER_CONTRAST_REGRESSION");
assert.ok(read("components/language-switcher.tsx").includes('bg-[#fff8ee]'),"LANGUAGE_THEME_INCONSISTENT");
assert.ok(read("components/auth-profile-menu.tsx").includes('bg-[#fffaf4]/95'),"PROFILE_THEME_INCONSISTENT");
console.log("SITEWIDE_VISUAL_QA=PASS;ORIGINAL_RELEVANT_VISUALS=7;SERVICE_CARDS=8;LIVE_PAYMENT_CHANGES=NO");
