import { expect, test } from "@playwright/test";

test.describe("Naksharix editorial photo homepage", () => {
  test("photo-led homepage exposes real destinations without invented service claims", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const main = page.locator(".nx-editorial");
    await expect(main).toBeVisible();
    await expect(page.locator(".nx-approved-home").getByRole("heading", { level: 1, name: /Discover your cosmic journey/i })).toBeVisible();
    await expect(page.locator(".nx-approved-home").getByRole("link", { name: /Create Free Kundli/i }).first()).toHaveAttribute("href", "/kundli");
    await expect(main.getByRole("link", { name: /Explore Puja directory/i }).first()).toHaveAttribute("href", "/pujas");
    await expect(main.locator(".nx-ed-service-card")).toHaveCount(8);
    await expect(page.locator(".nx-a-hero").getByRole("link", { name: /Create Free Kundli/i })).toHaveAttribute("href", "/kundli");
    await expect(main.getByRole("link", { name: "Explore Puja directory" }).first()).toBeVisible();
    await expect(page.locator(".nx-reference-promo")).toBeVisible();
    await expect(main.locator(".nx-ed-journey-card")).toHaveCount(3);
    await expect(main.locator(".nx-ed-zodiac-grid a")).toHaveCount(12);
    await expect(main.locator(".nx-ed-hero-photo")).toHaveCount(1);
    await expect(main.locator(".nx-ed-hero-wheel")).toHaveCount(1);
    await expect(main.locator(".nx-ed-heritage-card")).toBeAttached();
    await expect(page.locator(".nx-a-services .nx-a-card")).toHaveCount(4);
    await expect(main.locator(".nx-ed-slider-dots button")).toHaveCount(6);
    await expect(main.locator(".nx-ed-hero-aside")).toHaveCount(0);
    await expect(main.locator(".nx-ed-photo").first()).toHaveAttribute("alt", "");
    const source = await main.textContent();
    expect(source).not.toMatch(/guaranteed result|trusted by millions|1M\+|98% accuracy|verified temple partners/i);
  });

  test("approved gallery has working real destinations and retains shop/puja content", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".nx-a-hero h1")).toHaveText(/Discover your cosmic journey/i);
    await expect(page.locator(".nx-a-tool")).toHaveCount(6);
    await expect(page.locator(".nx-a-card")).toHaveCount(4);
    await expect(page.locator(".nx-a-hero").getByRole("link", { name: /Create Free Kundli/i })).toHaveAttribute("href", "/kundli");
    await expect(page.locator(".nx-a-card").getByRole("link", { name: "Browse catalogue" }).first()).toHaveAttribute("href", "/shop");
    await expect(page.getByText("5 Mukhi Rudraksha", { exact: true })).toBeVisible();
  });

  test("public service pages are full-width while account tools retain focused workspaces", async ({ page }) => {
    for (const path of ["/", "/shop", "/pujas", "/consultation", "/reports", "/faq"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('[data-layout="editorial"]')).toBeVisible();
      const width = await page.locator('[data-layout="editorial"]').evaluate(node => node.getBoundingClientRect().width);
      const viewport = await page.evaluate(() => document.documentElement.clientWidth);
      expect(Math.abs(width-viewport), path).toBeLessThanOrEqual(2);
    }
  });

  test("public service pages have photographic banners without changing their core content", async ({ page }) => {
    for (const path of ["/consultation", "/reports", "/shop", "/learn", "/puja-enquiry"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".nx-ed-inner-banner img")).toHaveCount(1);
      await expect(page.locator(".nx-ed-inner-banner h2")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth
      }));
      expect(dimensions.width, path).toBeLessThanOrEqual(dimensions.client + 2);
    }
  });

  test("approved gallery stays stable without an automatic hero switch", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const hero = page.locator(".nx-approved-home .nx-a-hero h1");
    await expect(hero).toHaveText(/Discover your cosmic journey/i);
    await expect(hero).toBeVisible();
    await expect(page.locator(".nx-approved-home [aria-label='Play featured slideshow']")).toHaveCount(0);
  });

  test("free learning self-check has real answers, explanations and no certificate claim", async ({ page }) => {
    await page.goto("/learn", { waitUntil: "domcontentloaded" });
    const practice = page.getByRole("region", { name: "Learning self-check" });
    await expect(practice.getByRole("button", { name: "Check answers" })).toBeDisabled();
    const choices = [
      "Birth time and location",
      "Tithi",
      "27",
      "A traditional interpretive timeline"
    ];
    for (const choice of choices) await practice.getByRole("radio", { name: choice }).check();
    await practice.getByRole("button", { name: "Check answers" }).click();
    await expect(practice.getByText("Self-check: 4/4.", { exact: false })).toBeVisible();
    await expect(practice.getByText("Learning only; not an accredited result.", { exact: false })).toBeVisible();
  });

  test("responsive ivory navigation opens with readable Puja and shop links", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const menu = page.getByRole("button", { name: "Open navigation menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    const panel = page.getByRole("dialog");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "Puja", exact: true })).toHaveAttribute("href", "/pujas");
    await expect(panel.getByRole("link", { name: "Shop", exact: true })).toHaveAttribute("href", "/shop");
    await expect(panel.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/login");
    await expect(panel.getByRole("link", { name: "My account", exact: true })).toHaveAttribute("href", "/profile");
    await expect(panel.getByRole("button", { name: "Language" })).toBeVisible();
    await page.getByRole("button", { name: "Close navigation menu" }).click();
    await expect(panel).toHaveCount(0);
  });

  test("320px mobile has no overflow and respects reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 750 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const result = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      animation: getComputedStyle(document.querySelector(".nx-ed-photo")!).animationName,
      imagesWithAlt: [...document.querySelectorAll(".nx-editorial img")].every((el) => el.hasAttribute("alt")),
      controlsNamed: [...document.querySelectorAll(".nx-ed-slider-controls button")].every((el) => Boolean(el.getAttribute("aria-label")))
    }));
    const overs = await page.evaluate(() => [...document.querySelectorAll("body *")]
      .filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+2)
      .slice(0,8).map(el=>[el.tagName,String(el.className).slice(0,80)]));
    expect(result.documentWidth, JSON.stringify({result,overs})).toBeLessThanOrEqual(result.viewport + 2);
    expect(result.animation).toBe("none");
    expect(result.imagesWithAlt).toBe(true);
    expect(result.controlsNamed).toBe(true);
  });
});
