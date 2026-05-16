import { chromium } from "playwright";

const baseUrl = "https://www.naksharix.com";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
const out = { language: [], mobile: [], apis: [], pwa: [] };

for (const route of ["/", "/about", "/pricing", "/horoscope", "/kundli", "/astrologers", "/chatbot"]) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const selectCount = await page.locator("select").count();
  const options = selectCount ? await page.locator("select").first().locator("option").evaluateAll((opts) => opts.map((o) => ({ text: o.textContent, value: o.getAttribute("value") }))) : [];
  if (selectCount) {
    await page.locator("select").first().selectOption("hi").catch(() => {});
    await page.waitForTimeout(600);
  }
  out.language.push({
    route,
    selectCount,
    firstSelectOptions: options,
    htmlLang: await page.evaluate(() => document.documentElement.lang),
    hasHindiText: /राशि|कुंडली|ज्योतिष|मूल्य|स्पष्टता|भुगतान|रीडिंग|सभी|हिंदी|भाषा|लिंग/.test(await page.locator("body").innerText())
  });
}

await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
const hamburger = page.locator('[aria-controls="naksharix-mobile-sidebar"]');
out.mobile.push({ check: "hamburger visible", visible: await hamburger.isVisible().catch(() => false) });
await hamburger.click().catch(() => {});
await page.waitForTimeout(300);
out.mobile.push({ check: "sidebar opens", visible: await page.locator("#naksharix-mobile-sidebar").isVisible().catch(() => false) });
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
out.mobile.push({ check: "sidebar closes on escape", closed: !(await page.locator("#naksharix-mobile-sidebar").isVisible().catch(() => false)) });

const request = page.request;
const apiChecks = [
  { path: "/api/auth/signup", body: {} },
  { path: "/api/auth/login", body: {} },
  { path: "/api/matchmaking", body: {} },
  { path: "/api/horoscope", body: { zodiac: "", period: "daily", category: "general", locale: "hi" } }
];
for (const check of apiChecks) {
  const res = await request.post(`${baseUrl}${check.path}`, { data: check.body, headers: { "content-type": "application/json" } });
  const text = await res.text();
  out.apis.push({ path: check.path, status: res.status(), safeError: !/stack|trace|prisma|secret|GEMINI|RAZORPAY/i.test(text), sample: text.slice(0, 180) });
}
for (const path of ["/manifest.webmanifest", "/site.webmanifest", "/favicon.ico"]) {
  const res = await request.get(`${baseUrl}${path}`);
  out.pwa.push({ path, status: res.status(), contentType: res.headers()["content-type"] });
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
