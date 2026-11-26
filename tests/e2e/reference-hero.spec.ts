import { expect, test } from "@playwright/test";

test.describe("Owner-approved NAKSHARIX gallery reference fidelity", () => {
  test("homepage renders six real tools, four image cards, and the approved headline", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const surface = page.locator(".nx-approved-home");
    await expect(surface).toBeVisible();
    await expect(surface.getByRole("heading", { level: 1, name: /Discover your cosmic journey/i })).toBeVisible();
    await expect(surface.locator(".nx-a-tool")).toHaveCount(6);
    await expect(surface.locator(".nx-a-card")).toHaveCount(4);
    const retained = page.locator(".nx-approved-retained");
    // A seasonal offer can render its dialog between the two homepage sections.
    await retained.evaluate(section => section.before(document.createElement("dialog")));
    await expect(retained.locator(".nx-ed-hero")).toBeHidden();
    await expect(page.locator('link[rel="preload"][as="image"][href="/approved-gallery/hero-astrolabe.jpg"]')).toHaveCount(1);

    const expectedLinks = [
      ["Create Free Kundli", "/kundli"],
      ["Explore Free Tools", "/free-calculators"],
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
    // Next.js may deliver HTML before the route's CSS chunks finish loading.
    // Await the genuinely rendered hero rather than asserting a transient 0px box.
    const hero = page.locator(".nx-a-hero");
    await expect(hero).toBeVisible();
    await expect.poll(async () => hero.evaluate(node => Math.round(node.getBoundingClientRect().height)), {
      message: "Approved hero must have its final styled height (not just SSR HTML)",
      timeout: 15_000,
    }).toBeGreaterThanOrEqual(350);
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

  test("public detail banners use approved navy instead of obsolete burgundy overlay", async ({ page }) => {
    for (const route of ["/kundli", "/reports", "/shop", "/consultation"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const banner = page.locator(".nx-ed-inner-banner");
      const shade = banner.locator(".nx-ed-inner-banner-shade");
      await expect(banner).toBeVisible();
      await expect(shade).toBeAttached();
      const surface = await banner.evaluate(element => {
        const style = getComputedStyle(element);
        const overlay = element.querySelector(".nx-ed-inner-banner-shade");
        const overlayStyle = overlay ? getComputedStyle(overlay) : null;
        return {
          backgroundImage: style.backgroundImage,
          overlayImage: overlayStyle?.backgroundImage ?? "",
          overlayColor: overlayStyle?.backgroundColor ?? "",
        };
      });
      expect(surface.backgroundImage, route).toContain("linear-gradient");
      expect(surface.overlayImage, route).toBe("none");
      expect(surface.overlayColor, route).toMatch(/^rgba?\(0, 0, 0, 0\)$/);
    }
  });

  test("paused Puja service shows its honest, accessible Coming Soon notice", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pujas", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: /पूजा सेवाएँ/ })).toBeVisible();
    await expect(page.getByText("Coming Soon", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /पुरानी बुकिंग देखें/i })).toHaveAttribute("href", "/puja-bookings");
    await expect(page.locator("#puja-directory")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Book Now|Pay|Checkout/i })).toHaveCount(0);
  });
  test("mobile first-screen shows product cards and paused Puja notice", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, selector] of [
      ["/reports", "#report-catalogue > div"],
      ["/shop", ".nx-gallery-shop-grid > div"]
    ] as const) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const first = page.locator(selector).first();
      await expect(first).toBeVisible();
      const top = await first.evaluate(node => Math.round(node.getBoundingClientRect().top));
      expect(top, route + " must show a catalogue card on the first mobile screen").toBeLessThan(844);
    }
    await page.goto("/reports", { waitUntil: "domcontentloaded" });
    const compare = page.locator("#compare-reports");
    await expect(compare).not.toHaveAttribute("open", "");
    await compare.locator("summary").click();
    await expect(compare.getByRole("heading", {name:"Compare personalized reports"})).toBeVisible();
    await expect(compare.getByRole("article")).toHaveCount(3);
    await page.goto("/pujas", { waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { level: 1, name: /पूजा सेवाएँ/ });
    await expect(title).toBeVisible();
    const top = await title.evaluate(node => Math.round(node.getBoundingClientRect().top));
    expect(top, "Puja pause notice must be visible without scrolling").toBeLessThan(844);
  });
  test("approved mobile report and shop catalogues fit without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, selector] of [
      ["/reports", "#report-catalogue"],
      ["/shop", ".nx-gallery-shop-grid"]
    ] as const) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const grid = page.locator(selector);
      await expect(grid).toBeVisible();
      const rendered = await grid.evaluate(node => ({
        columns: getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      }));
      expect(rendered.columns, route).toBe(2);
      expect(rendered.documentWidth, route).toBeLessThanOrEqual(rendered.viewportWidth + 2);
    }
    await page.goto("/pujas", { waitUntil: "domcontentloaded" });
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.documentWidth, "paused Puja mobile view").toBeLessThanOrEqual(dimensions.viewportWidth + 2);
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
