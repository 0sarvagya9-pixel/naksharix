import { expect, test } from "@playwright/test";

test.describe("Owner-approved NAKSHARIX gallery reference fidelity", () => {
  test("homepage renders six real tools, four image cards, and the approved headline", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const surface = page.locator(".nx-approved-home");
    await expect(surface).toBeVisible();
    await expect(surface.getByRole("heading", { level: 1, name: /Discover your cosmic journey/i })).toBeVisible();
    await expect(surface.locator(".nx-a-tool")).toHaveCount(6);
    await expect(surface.locator(".nx-a-card")).toHaveCount(4);

    const expectedLinks = [
      ["Create Free Kundli", "/kundli"],
      ["Explore Services", "/free-calculators"],
      ["Kundli", "/kundli"],
      ["Matching", "/matchmaking"],
      ["Panchang", "/panchang"],
      ["Horoscope", "/horoscope"],
      ["Numerology", "/numerology"],
      ["Tarot", "/tarot"],
      ["Explore puja", "/pujas"],
      ["Browse catalogue", "/shop"],
      ["Browse reports", "/reports"],
      ["Find guidance", "/consultation"],
    ] as const;

    for (const [label, href] of expectedLinks) {
      await expect(surface.getByRole("link", { name: new RegExp(label, "i") }).first()).toHaveAttribute("href", href);
    }
    await expect(page.locator(".nx-approved-retained")).toBeAttached();
    await expect(page.getByText("5 Mukhi Rudraksha", { exact: true })).toBeVisible();
    await expect(page.getByText("Rudrabhishek", { exact: true })).toBeVisible();
  });

  test("approved desktop layout preserves reference proportions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const layout = await page.evaluate(() => {
      const hero = document.querySelector(".nx-a-hero")!.getBoundingClientRect();
      const art = document.querySelector(".nx-a-hero-art")!.getBoundingClientRect();
      const grid = document.querySelector(".nx-a-services")!;
      const tools = document.querySelector(".nx-a-tools")!;
      const g = getComputedStyle(grid);
      const t = getComputedStyle(tools);
      const css = getComputedStyle(document.querySelector(".nx-approved-home")!);
      return {
        heroHeight: hero.height,
        heroWidth: hero.width,
        photoRatio: art.width / hero.width,
        cardColumns: g.gridTemplateColumns.split(" ").filter(Boolean).length,
        toolColumns: t.gridTemplateColumns.split(" ").filter(Boolean).length,
        hasCreamBackground: css.backgroundColor !== "rgba(0, 0, 0, 0)",
      };
    });
    expect(layout.heroHeight).toBeGreaterThanOrEqual(350);
    expect(layout.heroHeight).toBeLessThanOrEqual(410);
    expect(layout.photoRatio).toBeGreaterThan(.43);
    expect(layout.photoRatio).toBeLessThan(.51);
    expect(layout.cardColumns).toBe(4);
    expect(layout.toolColumns).toBe(6);
    expect(layout.hasCreamBackground).toBe(true);
  });

  test("all approved homepage photos load or gracefully show a valid local fallback", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const imgs = page.locator(".nx-approved-home .nx-a-card-image");
    await expect(imgs).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(async () => imgs.nth(i).evaluate(node => {
        const img = node as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      }), { timeout: 12_000 }).toBe(true);
    }
  });

  test("responsive screenshots: 320px to 1440px without clipped content", async ({ page }) => {
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".nx-approved-home")).toBeVisible();
      const sizes = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        heading: document.querySelector(".nx-a-hero h1")?.getBoundingClientRect().width ?? 0,
        tools: document.querySelector(".nx-a-tools")?.getBoundingClientRect().width ?? 0,
      }));
      expect(sizes.document, JSON.stringify({ width, sizes })).toBeLessThanOrEqual(sizes.viewport + 2);
      expect(sizes.heading).toBeGreaterThan(200);
      expect(sizes.tools).toBeGreaterThan(280);
    }
  });

  test("call-to-action links navigate to the original functional page, never a mock form", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator(".nx-a-hero").getByRole("link", { name: /Create Free Kundli/i }).click();
    await expect(page).toHaveURL(/\/kundli(?:\?|$)/);
    await expect(page.getByRole("heading", { level: 1, name: /Kundli Generator/i })).toBeVisible();
  });
});
