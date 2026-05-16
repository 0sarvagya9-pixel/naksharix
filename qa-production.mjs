import { chromium, devices } from "playwright";

const baseUrl = "https://www.naksharix.com";
const routes = ["/", "/kundli", "/matchmaking", "/horoscope", "/tarot", "/calculators", "/pricing", "/about", "/astrologers", "/chatbot", "/reports", "/blog", "/contact"];
const viewports = [
  { name: "Desktop 1920", width: 1920, height: 1080 },
  { name: "Laptop 1366", width: 1366, height: 768 },
  { name: "Tablet iPad", ...devices["iPad (gen 7)"].viewport },
  { name: "Mobile Android", ...devices["Pixel 5"].viewport, isMobile: true },
  { name: "Mobile iPhone", ...devices["iPhone 13"].viewport, isMobile: true }
];

const result = { pages: [], interactions: [], apis: [], bugs: [] };

function bug(title, page, details, severity = "Medium") {
  result.bugs.push({ title, page, severity, details });
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: Boolean(viewport.isMobile) });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 }).catch((error) => ({ status: () => 0, error }));
    const status = response?.status?.() ?? 0;
    const metrics = await page.evaluate(() => ({
      title: document.title,
      bodyText: document.body.innerText.slice(0, 1000),
      horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      blank: document.body.innerText.trim().length < 30,
      navLinks: Array.from(document.querySelectorAll("nav a")).map((a) => a.textContent?.trim()).filter(Boolean),
      hamburgerVisible: Boolean(document.querySelector('[aria-controls="naksharix-mobile-sidebar"]')),
      activeNav: Array.from(document.querySelectorAll('[aria-current="page"]')).map((node) => node.textContent?.trim()).filter(Boolean)
    }));
    result.pages.push({ viewport: viewport.name, route, status, ...metrics, consoleErrors: [...errors] });
    if (status >= 400 || status === 0) bug("Route failed to load", route, `Status ${status} on ${viewport.name}`, "Critical");
    if (metrics.blank) bug("Blank or nearly blank page", route, viewport.name, "Critical");
    if (metrics.horizontalScroll) bug("Horizontal scroll detected", route, viewport.name, "High");
    if (errors.some((entry) => /hydration|minified react error|uncaught/i.test(entry))) bug("Console/runtime error", route, `${viewport.name}: ${errors.join(" | ")}`, "High");
    errors.length = 0;
  }
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const page = await context.newPage();
await page.goto(`${baseUrl}/tarot`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /shuffle/i }).click().catch((error) => bug("Tarot shuffle button not clickable", "/tarot", error.message, "High"));
await page.getByRole("button", { name: /draw/i }).click().catch((error) => bug("Tarot draw button not clickable", "/tarot", error.message, "High"));
result.interactions.push({ page: "/tarot", mobile: true, checked: "shuffle/draw click path" });

await page.goto(`${baseUrl}/kundli`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /generate kundli|कुंडली|kundli/i }).click().catch(() => {});
const kundliRequired = await page.locator("text=This field is required").count().catch(() => 0);
result.interactions.push({ page: "/kundli", checked: "empty submit validation", requiredErrors: kundliRequired });
if (kundliRequired === 0) bug("Kundli required validation not visible in English empty submit", "/kundli", "No required error text detected after empty submit.", "High");

await page.goto(`${baseUrl}/pricing`, { waitUntil: "networkidle" });
const pricingText = await page.locator("body").innerText();
result.interactions.push({ page: "/pricing", checked: "payments fallback", found: /Payments coming soon|भुगतान जल्द|Payments jald/i.test(pricingText) });
if (!/Payments coming soon|भुगतान जल्द|Payments jald/i.test(pricingText)) bug("Payment fallback missing", "/pricing", "Payments coming soon text not visible.", "Medium");

await page.goto(`${baseUrl}/about`, { waitUntil: "networkidle" });
const selects = await page.locator("select").count();
if (selects > 0) {
  await page.locator("select").first().selectOption("hi").catch(() => {});
  await page.waitForTimeout(1000);
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  const aboutHindi = await page.locator("body").innerText();
  result.interactions.push({ page: "/about", checked: "Hindi language switch", htmlLang, containsHindi: /ज्योतिष|स्पष्टता|हम/.test(aboutHindi) });
  if (!/ज्योतिष|स्पष्टता|हम/.test(aboutHindi)) bug("Hindi switch did not translate About page", "/about", "Hindi text not found after language switch.", "High");
}

await context.close();

const apiContext = await browser.newContext();
const request = apiContext.request;
const apiChecks = [
  { path: "/api/location/search?q=Delhi", method: "GET" },
  { path: "/api/horoscope", method: "POST", body: { zodiac: "Aries", period: "daily", category: "general", locale: "en" } },
  { path: "/api/kundli", method: "POST", body: {} },
  { path: "/api/tarot", method: "POST", body: { spread: "three-card", question: "Career?", locale: "en" } }
];
for (const check of apiChecks) {
  const response = check.method === "GET"
    ? await request.get(`${baseUrl}${check.path}`)
    : await request.post(`${baseUrl}${check.path}`, { data: check.body, headers: { "content-type": "application/json" } });
  const text = await response.text();
  result.apis.push({ ...check, status: response.status(), sample: text.slice(0, 240) });
  if (response.status() >= 500) bug("API returned server error", check.path, `Status ${response.status()}: ${text.slice(0, 240)}`, "High");
  if (/stack|prisma|GEMINI_API_KEY|RAZORPAY_KEY|secret/i.test(text)) bug("API may expose technical/secret details", check.path, text.slice(0, 240), "High");
}
await apiContext.close();
await browser.close();

console.log(JSON.stringify(result, null, 2));
