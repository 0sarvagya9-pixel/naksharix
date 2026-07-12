import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

function absolute(pathname: string) {
  return new URL(pathname, baseURL).toString();
}

async function installRuntimeErrorGuard(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
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

  test("pricing exposes only active services", async ({ page }) => {
    await page.goto(absolute("/pricing"), { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Services and Pricing" })).toBeVisible();
    await expect(page.getByText("Premium Digital Reports", { exact: true })).toBeVisible();
    await expect(page.getByText("Astrologer Consultations", { exact: true })).toBeVisible();
    await expect(page.getByText(/INR 499\/mo|INR 1499\/mo|Subscribe to Premium|Subscribe to VIP/i)).toHaveCount(0);
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
});
