import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const zodiacSigns = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const calculatorSlugs = [
  "bhakoot-calculator",
  "dasha-calculator",
  "destiny-number-calculator",
  "guna-milan-calculator",
  "lagna-calculator",
  "lo-shu-grid-calculator",
  "manglik-calculator",
  "marriage-suitability-calculator",
  "mobile-number-calculator",
  "moon-sign-calculator",
  "nadi-dosha-calculator",
  "nakshatra-calculator",
  "name-number-calculator",
  "personality-number-calculator",
  "vehicle-number-calculator",
  "yoga-calculator"
];

function absolute(pathname: string) {
  return new URL(pathname, baseURL).toString();
}

async function installRuntimeErrorGuard(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/Failed to load resource:.*401 \(Unauthorized\)/i.test(text)) return;
    if (/Failed to fetch RSC payload for .* Falling back to browser navigation\. Error/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }));
  expect(dimensions.documentWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 2);
  expect(dimensions.bodyWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 2);
}

async function expectNamedInteractiveControls(page: Page) {
  const unnamed = await page.locator("button:visible, a:visible").evaluateAll((elements) => elements
    .filter((element) => {
      const aria = element.getAttribute("aria-label")?.trim();
      const title = element.getAttribute("title")?.trim();
      const text = element.textContent?.trim();
      const imageAlt = element.querySelector("img")?.getAttribute("alt")?.trim();
      return !aria && !title && !text && !imageAlt;
    })
    .map((element) => element.outerHTML.slice(0, 240)));
  expect(unnamed, unnamed.join("\n")).toEqual([]);
}

test.describe("Naksharix release browser QA", () => {
  test("core public pages render without runtime errors", async ({ page }) => {
    const paths = [
      "/",
      "/about",
      "/contact",
      "/faq",
      "/kundli",
      "/panchang",
      "/numerology",
      "/tarot",
      "/free-calculators",
      "/horoscope",
      "/consultation",
      "/pricing",
      "/shop",
      "/ai-astrologer"
    ];

    for (const pathname of paths) {
      const runtimeErrors = await installRuntimeErrorGuard(page);
      const response = await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
      expect(response?.status(), pathname).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("h1").first(), pathname).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectNamedInteractiveControls(page);
      expect(runtimeErrors, `${pathname}: ${runtimeErrors.join("\n")}`).toEqual([]);
    }
  });

  test("all zodiac, horoscope, calculator, and legal route families respond", async ({ request }) => {
    const paths = [
      ...zodiacSigns.flatMap((sign) => [
        `/horoscope/${sign}`,
        `/horoscope/${sign}/today`,
        `/yearly-horoscope-2026/${sign}`,
        `/zodiac/${sign}`
      ]),
      ...calculatorSlugs.map((slug) => `/free-calculators/${slug}`),
      "/about",
      "/contact",
      "/faq",
      "/privacy-policy",
      "/terms-and-conditions",
      "/refund-policy",
      "/delivery-policy",
      "/disclaimer",
      "/daily-horoscope",
      "/weekly-horoscope",
      "/yearly-horoscope"
    ];

    for (const pathname of paths) {
      const response = await request.get(absolute(pathname), { maxRedirects: 0 });
      expect(response.status(), pathname).toBeLessThan(400);
    }
  });

  for (const viewport of [
    { width: 320, height: 800 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
    { width: 1920, height: 1080 }
  ]) {
    test(`homepage and pricing fit ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      for (const pathname of ["/", "/pricing"]) {
        await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("legacy AI routes permanently resolve to the parked AI page", async ({ page }) => {
    for (const pathname of ["/talk-to-kundli", "/chatbot"]) {
      const response = await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
      expect(response?.status(), pathname).toBe(200);
      await expect(page).toHaveURL(/\/ai-astrologer$/);
      await expect(page.getByRole("heading", { level: 1, name: /AI Astrologer/i })).toBeVisible();
      await expect(page.locator("textarea, input[placeholder*='AI' i]")).toHaveCount(0);
    }
  });

  test("parked pages are noindex and active consultation remains indexable", async ({ page }) => {
    for (const pathname of ["/ai-astrologer", "/shop"]) {
      await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    }
    await page.goto(absolute("/consultation"), { waitUntil: "domcontentloaded" });
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count()) await expect(robots).not.toHaveAttribute("content", /noindex/i);
  });

  test("pricing exposes only active services", async ({ page }) => {
    await page.goto(absolute("/pricing"), { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Services and Pricing" })).toBeVisible();
    await expect(page.getByText("Premium Digital Reports", { exact: true })).toBeVisible();
    await expect(page.getByText("Astrologer Consultations", { exact: true })).toBeVisible();
    await expect(page.getByText(/INR 499\/mo|INR 1499\/mo|Subscribe to Premium|Subscribe to VIP/i)).toHaveCount(0);
  });

  test("security headers are present on public pages", async ({ request }) => {
    const response = await request.get(absolute("/"));
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
  });

  test("desktop theme and language controls work", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(absolute("/"), { waitUntil: "domcontentloaded" });

    const themeButton = page.getByRole("button", { name: "Toggle dark and light mode" });
    await expect(themeButton).toBeVisible();
    const before = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
    await themeButton.click();
    const after = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
    expect(after).not.toBe(before);

    const languageButton = page.getByRole("button", { name: "Language" });
    await languageButton.click();
    await page.getByRole("option", { name: /Hinglish/i }).click();
    await expect(languageButton).toHaveText("HIN");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-Latn");
  });

  test("reduced-motion preference suppresses long animations and transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(absolute("/"), { waitUntil: "domcontentloaded" });
    const timing = await page.locator("button:visible").first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
    });
    const largestDuration = (value: string) => Math.max(...value.split(",").map((part) => Number.parseFloat(part) || 0));
    expect(largestDuration(timing.animationDuration)).toBeLessThanOrEqual(0.001);
    expect(largestDuration(timing.transitionDuration)).toBeLessThanOrEqual(0.001);
  });

  test("mobile menu opens, closes with Escape, and keeps consultation active", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(absolute("/"), { waitUntil: "domcontentloaded" });

    const menuButton = page.getByRole("button", { name: "Open navigation menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Book Consultation/i }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("login and signup forms expose labelled fields", async ({ page }) => {
    for (const pathname of ["/login", "/signup"]) {
      await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expectNamedInteractiveControls(page);
    }
  });

  test("protected pages redirect logged-out visitors and unknown routes return 404", async ({ page }) => {
    await page.goto(absolute("/dashboard"), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);

    const response = await page.goto(absolute("/definitely-not-a-real-naksharix-route"), { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toBeVisible();
  });
});
