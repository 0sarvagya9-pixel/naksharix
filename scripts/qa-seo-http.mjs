import assert from "node:assert/strict";

const base = (process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonical = (process.env.NEXT_PUBLIC_APP_URL || base).replace(/\/$/, "");
const absolute = (path) => canonical + (path === "/" ? "" : path);
const pairs = [
  ["/", "/hi"],
  ["/free-kundli", "/hi/free-kundli"],
  ["/kundli-matching", "/hi/kundli-milan"]
];
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
const sitemap = await fetch(base + "/sitemap.xml");
assert.equal(sitemap.status, 200, "Sitemap unavailable");
const xml = await sitemap.text();
for (const [en, hi] of pairs) {
  for (const link of [absolute(en), absolute(hi)]) {
    assert.ok(xml.includes(link), "Sitemap missing localized URL: " + link);
  }
}
assert.ok(xml.includes('hreflang="hi"') && xml.includes('hreflang="x-default"'),
  "Sitemap lacks localized alternates");
console.log("SEO_RUNTIME_HTTP=PASS;BILINGUAL_ROUTES=6;SITEMAP_ALTERNATES=YES;SSR_LANGUAGE=YES");
