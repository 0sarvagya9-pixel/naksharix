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
const directory=read("components/puja/puja-services-directory.tsx");
assert.ok(directory.includes("results.slice(0,visibleCount)") && directory.includes("Load more Puja topics"),"PUJA_MOBILE_PAGINATION_MISSING");
const nav=read("components/main-nav.tsx");
for(const x of ['label: "Reports"','label: "Consultation"','label: "Puja"','label: "Shop"'])assert.ok(nav.includes(x),"TOP_NAV_MISSING="+x);
assert.ok(read("app/layout.tsx").includes("reference-redesign.css"),"REDESIGN_NOT_IMPORTED");
const header=read("components/main-nav.tsx");
assert.ok(header.includes('bg-[#fff8ee] text-[#852f3c]') && !header.includes('hover:text-white"'),"IVORY_HEADER_CONTRAST_REGRESSION");
assert.ok(header.includes('Sign in</Link>') && header.includes('My account</Link>') && header.includes('<LanguageSwitcher className="!block w-20" />'),"MOBILE_ACCOUNT_OR_LANGUAGE_MISSING");
assert.ok(read("components/language-switcher.tsx").includes('bg-[#fff8ee]'),"LANGUAGE_THEME_INCONSISTENT");
assert.ok(read("components/auth-profile-menu.tsx").includes('bg-[#fffaf4]/95'),"PROFILE_THEME_INCONSISTENT");
assert.ok(read("components/brand-logo.tsx").includes("from-[#6d2635]"),"WORDMARK_IVORY_CONTRAST_MISSING");
assert.ok(!read("components/background/premium-cosmic-background.tsx").includes("premium-cosmic-bg-v2.webp"),"OLD_BACKGROUND_NOT_REMOVED");
assert.ok(read("components/pwa-register.tsx").includes('"127.0.0.1"'),"CI_SERVICE_WORKER_ISOLATION_MISSING");
const siteShell=read("components/layout/premium-glass-shell.tsx");
assert.ok(siteShell.includes('data-layout={isEditorial ? "editorial" : "workspace"}'),"PUBLIC_FULL_BLEED_LAYOUT_MISSING");
assert.ok(siteShell.includes('"naksharix-editorial-shell mx-0 my-0 max-w-none rounded-none"'),"PUBLIC_CONTAINED_BY_WORKSPACE");
assert.ok(!read("app/shop/[slug]/page.tsx").includes('text-[#e1d6dd]'), "SHOP_DETAIL_LOW_CONTRAST_TEXT");
// The premium redesign must not regress into unreadable navy panels or cartoon hero art.
const premium=read("app/premium-ux-20261027.css");
const calendar=read("app/puja-calendar/page.tsx");
assert.ok(home.includes('const STARRY_SKY = "/naksharix/ganesh-hero-light-saffron.jpg"'),"CARTOON_HERO_RETURNED");
assert.ok(premium.includes("header nav > a") && premium.includes("color:#432b34!important") && premium.includes("header nav > a[aria-current"),"HEADER_CONTRAST_UNSAFE");
assert.ok(calendar.includes("nx-puja-calendar") && calendar.includes("text-[#fffaf2]") && calendar.includes("text-[#f8e9de]") && calendar.includes("bg-[#fff8ee]"),"CALENDAR_DARK_ON_DARK_REGRESSION");
const shop=read("components/shop-coming-soon-content.tsx");
const adminApi=read("app/api/admin/shop-catalogue/route.ts");
const cart=read("components/shop/cart-page-client.tsx");
assert.ok(shop.includes("AddToCartButton") && read("app/cart/page.tsx").includes("CartPageClient"),"CART_LINK_BROKEN");
assert.ok(adminApi.includes("unitPricePaise: z.number().int().min(100)") && adminApi.includes("imageRights"),"PRICE_OR_IMAGE_RIGHTS_UNVALIDATED");
assert.ok(cart.includes("No payment is charged") && cart.includes("Secure checkout is not enabled"),"CART_PAYMENT_SAFETY_MISSING");
const photoRegistry=read("lib/puja/editorial-photos.ts");
assert.ok(photoRegistry.includes("CC BY-SA 4.0") && photoRegistry.includes("CC0 1.0") && read("components/puja/puja-services-directory.tsx").includes("pujaEditorialPhoto(topic.id,topic.category)!.license"),"PUJA_IMAGE_RIGHTS_CREDIT_MISSING");

console.log("SITEWIDE_VISUAL_QA=PASS;ORIGINAL_RELEVANT_VISUALS=7;SERVICE_CARDS=8;LIVE_PAYMENT_CHANGES=NO");
