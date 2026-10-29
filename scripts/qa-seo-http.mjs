import assert from "node:assert/strict";

const base = (process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonical = (process.env.NEXT_PUBLIC_APP_URL || base).replace(/\/$/, "");
const absolute = (path) => canonical + (path === "/" ? "" : path);
const pairs = [
  ["/", "/hi"],
  ["/free-kundli", "/hi/free-kundli"],
  ["/kundli-matching", "/hi/kundli-milan"]
];
const nativeGuides = ["en", "hi", "mr", "bn", "es", "fr"];
const approvedGuides = ["en", "hi"];
const guidePath = (language) => language === "en" ? "/learn/kundli-explained" : "/" + language + "/learn/kundli-explained";
const langValue = (tag, code) => new RegExp('\\bhrefLang="' + code + '"', "i").test(tag);

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
      assert.ok(links.some((tag) => langValue(tag, code) && tag.includes('href="' + absolute(target) + '"')),
        "Missing reciprocal " + code + " hreflang on " + path);
    }
    assert.ok(html.includes('href="' + absolute(path) + '"'), "Self canonical missing: " + path);
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
      assert.ok(links.some((tag) => langValue(tag, code) && tag.includes('href="' + absolute(guidePath(code)) + '"')),
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
for (const route of ["/commerce-enquiry", "/ask-astrologer", "/puja-enquiry"]) {
  assert.ok(!xml.includes("<loc>" + absolute(route) + "</loc>"), "Private intake sitemap leak: " + route);
}
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(locs.length, new Set(locs).size, "Sitemap contains duplicate URLs");
assert.ok(xml.includes('hreflang="hi"') && xml.includes('hreflang="x-default"'),
  "Sitemap lacks localized alternates");
console.log("SEO_RUNTIME_HTTP=PASS;BILINGUAL_ROUTES=6;SITEMAP_ALTERNATES=YES;SSR_LANGUAGE=YES");
