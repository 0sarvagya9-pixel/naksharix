import assert from "node:assert/strict";

const base = (process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonical = (process.env.NEXT_PUBLIC_APP_URL || base).replace(/\/$/, "");
const absolute = (path) => new URL(path, canonical + "/").toString();
const pairs = [
  ["/", "/hi"],
  ["/free-kundli", "/hi/free-kundli"],
  ["/kundli-matching", "/hi/kundli-milan"],
  ["/about", "/hi/about"],
  ["/kumbh-mela-2027", "/hi/kumbh-mela-2027"],
  ["/festival-calendar", "/hi/festival-calendar"],
  ["/grahan-2027", "/hi/grahan-2027"],
  ["/yearly-horoscope-2027", "/hi/yearly-horoscope-2027"]
];
const nativeGuides = ["en", "hi", "mr", "bn", "es", "fr"];
const approvedGuides = ["en", "hi"];
const guidePath = (language) => language === "en" ? "/learn/kundli-explained" : "/" + language + "/learn/kundli-explained";
const langValue = (tag, code) => new RegExp('\\bhrefLang="' + code + '"', "i").test(tag);
// Next metadata serializes a root alternate as the bare origin in some builds.
// Normalize absolute URL syntax, not host, scheme, path or language.
function hrefMatches(tag, path) {
  const href=tag.match(/\bhref="([^"]+)"/i)?.[1];
  if(!href) return false;
  try { return new URL(href).href === absolute(path); } catch { return false; }
}


for (const [en, hi] of pairs) {
  for (const [path, locale] of [[en, "en"], [hi, "hi"]]) {
    const response = await fetch(base + path, {
      headers: { Cookie: "naksharix-language=en" }
    });
    assert.equal(response.status, 200, "Localized route unavailable: " + path);
    const html = await response.text();
    const foundHtml = html.match(/<html[^>]*\blang="([^"]+)"/i);
    assert.ok(foundHtml, "HTML lang missing: " + path);
    assert.equal(foundHtml[1], locale, "SSR HTML language not tied to URL: " + path);
    const links = [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/gi)].map((m) => m[0]);
    for (const [code, target] of [["en", en], ["hi", hi], ["x-default", en]]) {
      assert.ok(links.some((tag) => langValue(tag, code) && hrefMatches(tag,target)),
        "Missing reciprocal " + code + " hreflang on " + path);
    }
    const canonicals=[...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)].map(m=>m[0]);
    assert.equal(canonicals.length,1,"Expected one canonical: "+path);
    assert.ok(hrefMatches(canonicals[0],path),"Incorrect self canonical: "+path);
  }
}
for (const locale of nativeGuides) {
  const path = guidePath(locale);
  const response = await fetch(base + path, { headers: { Cookie: "naksharix-language=hi" } });
  assert.equal(response.status, 200, "Guide unavailable " + path);
  const html = await response.text();
  assert.ok(new RegExp('<html[^>]*\\blang="' + locale + '"', "i").test(html), "Wrong SSR guide language " + locale);
  assert.ok(html.includes('<h1') && html.includes('<h2'), "Guide missing depth " + locale);
  const links = [...html.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/gi)].map((x) => x[0]);
  if (approvedGuides.includes(locale)) {
    for (const code of approvedGuides) {
      assert.ok(links.some((tag) => langValue(tag, code) && hrefMatches(tag,guidePath(code))),
        "Missing reciprocal approved guide hreflang " + locale + " to " + code);
    }
  } else {
    assert.ok(/<meta[^>]+name="robots"[^>]+content="noindex,\s*follow"/i.test(html) ||
      /<meta[^>]+name="robots"[^>]+content="follow,\s*noindex"/i.test(html),
      "Unreviewed language must be noindex: " + locale);
    assert.ok(!links.some((tag) => nativeGuides.some((code) => langValue(tag, code))), "Draft published alternate links");
  }
}
const sellers = await fetch(base + "/ads.txt");
assert.equal(sellers.status, 200, "Google AdSense ads.txt unavailable at public root");
assert.equal(sellers.headers.get("content-type")?.includes("text/plain"), true, "ads.txt must be plaintext");
assert.equal((await sellers.text()).trim(), "google.com, pub-7848529669366564, DIRECT, f08c47fec0942fa0",
  "Public ads.txt publisher ID does not match owner's AdSense account");
for (const guidePath of ["/learn/kundli-explained", "/free-kundli"]) {
  const content = await fetch(base + guidePath);
  assert.equal(content.status, 200, "Educational SEO page absent");
  const body = await content.text();
  assert.ok(!body.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
    "AdSense loader must stay absent from unapproved QA site");
}
const sitemap = await fetch(base + "/sitemap.xml");
assert.equal(sitemap.status, 200, "Sitemap unavailable");
const xml = await sitemap.text();
for (const [en, hi] of pairs) {
  for (const link of [absolute(en), absolute(hi)]) {
    assert.ok(xml.includes(link), "Sitemap missing localized URL: " + link);
  }
}
for (const locale of approvedGuides) {
  assert.ok(xml.includes(absolute(guidePath(locale))), "Approved guide missing from sitemap: " + locale);
}
for (const locale of nativeGuides.filter((x) => !approvedGuides.includes(x))) {
  assert.ok(!xml.includes("<loc>" + absolute(guidePath(locale)) + "</loc>"), "Unreviewed guide sitemap leak: " + locale);
}
for (const route of ["/commerce-enquiry", "/ask-astrologer", "/puja-enquiry", "/dashboard/deferred-services"]) {
  assert.ok(!xml.includes("<loc>" + absolute(route) + "</loc>"), "Private intake sitemap leak: " + route);
}
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(locs.length, new Set(locs).size, "Sitemap contains duplicate URLs");
assert.ok(xml.includes('hreflang="hi"') && xml.includes('hreflang="x-default"'),
  "Sitemap lacks localized alternates");
const rootEntry=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>m[1]).find(x=>x.includes("<loc>"+canonical+"/</loc>"));
assert.ok(rootEntry && rootEntry.includes('hreflang="en"') && rootEntry.includes('hreflang="hi"') && rootEntry.includes('hreflang="x-default"'),"Root sitemap canonical or language cluster missing");
for (const route of ["/","/about","/hi/about"]) {
  const response=await fetch(base+route);
  assert.equal(response.status,200);
  const html=await response.text();
  const script=html.match(/<script[^>]*id="naksharix-schema"[^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(script,"Missing actual server-rendered JSON-LD on "+route);
  const graph=JSON.parse(script[1])["@graph"];
  assert.ok(Array.isArray(graph) && graph.some(node=>node["@type"]==="Organization" && node.name==="Naksharix") && graph.some(node=>node["@type"]==="WebSite" && node.name==="Naksharix" && node.url.endsWith("/")));
  if(route!=="/")assert.ok(html.includes('id="brand-answers-heading"') && html.includes('id="naksharix-about-schema"'),"Missing visible brand answers or AboutPage graph");
}
const llms=await fetch(base+"/llms.txt");
assert.equal(llms.status,200);
assert.ok((await llms.text()).includes("https://www.naksharix.com/hi/about"),"Missing public brand directory");
console.log("SEO_RUNTIME_HTTP=PASS;BILINGUAL_ROUTES=16;SITEMAP_ALTERNATES=YES;SSR_LANGUAGE=YES;BRAND_GRAPH=YES");

 
// Check the actual rendered public pages from the previous 50-page audit.
// Titles are editorial length targets, not a Google ranking requirement.
const focusedSeoRoutes = ["/about", "/astrology", "/calculators", "/free-calculators",
  "/free-calculators/dasha-calculator", "/free-calculators/lo-shu-grid-calculator",
  "/free-calculators/marriage-suitability-calculator", "/free-calculators/moon-sign-calculator",
  "/free-calculators/nakshatra-calculator", "/free-kundli", "/horoscope",
  "/kundli-matching", "/learn/kundli-explained", "/panchang", "/transits"];
const stripMarkup=(html)=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<!--[\s\S]*?-->/g,"");
const decodeBasic=(value)=>value.replace(/&amp;/g,"&").replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"');
for(const path of focusedSeoRoutes){
  const response=await fetch(base+path);
  assert.equal(response.status,200,"Audit page unavailable "+path);
  const html=stripMarkup(await response.text());
  const title=decodeBasic(html.match(/<title>([^<]+)<\/title>/i)?.[1]??"");
  assert.ok(title.length>=15 && title.length<=60,"Missing/overlong editorial title "+path+": "+title);
  if(path==="/panchang"){
    const description=decodeBasic([...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(tag=>/\bname="description"/i.test(tag))?.match(/\bcontent="([^"]*)"/i)?.[1]??"");
    assert.ok(description.length>=70&&description.length<=160,"Missing/overlong Panchang description: "+description);
  }
  if(["/calculators","/horoscope","/transits"].includes(path)){
    const levels=[...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map(m=>Number(m[1]));
    const start=levels.indexOf(1);
    assert.ok(start>=0 && levels.slice(start+1).every((level,i)=>level<=levels[start+i]+1),"Skipped heading hierarchy "+path);
  }
}
const homeHtml=stripMarkup(await (await fetch(base+"/")).text());
assert.equal([...homeHtml.matchAll(/<h1\b[^>]*>/gi)].length,1,"Homepage must have one main heading");
const social=await fetch(base+"/og.png");
assert.equal(social.status,200,"Social preview unavailable");
assert.ok(social.headers.get("content-type")?.includes("image/png"),"Social preview must be PNG");
const png=Buffer.from(await social.arrayBuffer());
assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a","Invalid PNG signature");
assert.equal(png.readUInt32BE(16),1200);
assert.equal(png.readUInt32BE(20),630);
assert.ok(homeHtml.includes("/og.png"),"Homepage metadata must reference shareable raster preview");
console.log("ONPAGE_AUDIT_HTTP=PASS;FOCUSED_ROUTES="+focusedSeoRoutes.length+";SOCIAL_PREVIEW=1200x630_PNG");

for(const [path,kind,markers] of [
  ["/kumbh-mela-2027","kumbh",["2027-08-02","2027-09-11","2027-09-12","2028-07-24","simhasthamahakumbh.maharashtra.gov.in/snan-calendar"]],
  ["/hi/kumbh-mela-2027","kumbh",["अमृत स्नान","2027-09-12"]],
  ["/festival-calendar","festivals",["Local Panchang","Vivah Panchami"]],
  ["/hi/festival-calendar","festivals",["स्थानीय पंचांग","विवाह पंचमी"]],
  ["/grahan-2027","eclipses",["2027-02-21","2027-08-02","ISO 12312-2","science.nasa.gov/eclipses/safety/"]],
  ["/hi/grahan-2027","eclipses",["चंद्र ग्रहण","2027-08-02","ISO 12312-2"]]
]){
  const response=await fetch(base+path);assert.equal(response.status,200,"Seasonal page unavailable "+path);
  const html=await response.text(), publicHtml=stripMarkup(html);
  assert.equal([...publicHtml.matchAll(/<h1\b[^>]*>/gi)].length,1,"Seasonal H1 "+path);
  for(const marker of markers)assert.ok(publicHtml.includes(marker),"Missing seasonal content "+path+" "+marker);
  const script=html.match(new RegExp('<script[^>]*id="seasonal-guide-'+kind+'"[^>]*>([\\s\\S]*?)<\\/script>','i'));
  assert.ok(script,"Missing rendered seasonal schema "+path);
  const schema=JSON.parse(script[1]);assert.equal(schema["@type"],"WebPage");assert.equal(schema.inLanguage,path.startsWith("/hi/")?"hi":"en");
  assert.ok(Array.isArray(schema.citation)&&schema.citation.length>=2);
  assert.ok(xml.includes("<loc>"+absolute(path)+"</loc>"),"Missing seasonal sitemap URL");
  assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(publicHtml),"Unexpected noindex "+path);
}
console.log("SEASONAL_HTTP=PASS;SIX_BILINGUAL_ROUTES;DATES_AND_SAFETY");

for(const path of ["/yearly-horoscope-2027","/hi/yearly-horoscope-2027"]){const r=await fetch(base+path);assert.equal(r.status,200);const html=stripMarkup(await r.text());assert.ok(html.includes("annual-rashi"));assert.ok(html.includes("2027-01-01")&&html.includes("2027-12-01"));assert.equal([...html.matchAll(/<h1\b[^>]*>/gi)].length,1);}

// Query-led helpful content: visible answers and valid, voluntary public tool links.
for (const [path,topic,english,hindi,links] of [
  ["/weekly-love-horoscope","love","How to read a weekly love horoscope","साप्ताहिक प्रेम राशिफल कैसे पढ़ें?",["/free-kundli","/kundli-matching"]],
  ["/numerology","numerology","What is a numerology reading?","अंक ज्योतिष रीडिंग क्या है?",["/free-calculators/name-number-calculator","/free-calculators/lo-shu-grid-calculator"]]
]) {
  for(const [locale,heading] of [["en",english],["hi",hindi]]) {
    const r=await fetch(base+path,{headers:{Cookie:"naksharix-language="+locale}});
    assert.equal(r.status,200);
    const html=stripMarkup(await r.text());
    assert.equal([...html.matchAll(/<h1\b[^>]*>/gi)].length,1,"One H1 "+path);
    assert.ok(html.includes('id="reading-guide-'+topic+'"')&&html.includes(heading),"Missing rendered reading guide "+locale+" "+path);
    if(locale==="en")for(const link of links){assert.ok(html.includes('href="'+link+'"'),"Missing resource link "+link);assert.equal((await fetch(base+link)).status,200);}
    assert.ok([...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)].map(m=>m[0]).some(tag=>hrefMatches(tag,path)),"Guide canonical "+path);
  }
}
const guideDirectory=await(await fetch(base+"/llms.txt")).text();
assert.ok(guideDirectory.includes("https://www.naksharix.com/weekly-love-horoscope")&&guideDirectory.includes("https://www.naksharix.com/free-calculators/name-number-calculator"));
console.log("QUERY_LED_PUBLIC_GUIDES_HTTP=PASS;2_EXISTING_ROUTES;EN_HI_VISIBLE;CANONICAL;PUBLIC_TOOL_LINKS");
