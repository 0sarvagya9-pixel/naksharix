import { expect, test } from "@playwright/test";

/**
 * Post-release navigation regression based on the owner's 06 Nov screenshot:
 * dark blue/black text on a dark-maroon Horoscope submenu on /consultation.
 * Check computed styles and actual mouse/keyboard navigation across all
 * three browsers instead of only verifying a hidden DOM link exists.
 */
function contrast(foreground: string, background: string) {
  const rgb = (v: string) => {
    const m = v.match(/rgba?\(([^)]*)\)/);
    if (!m) throw Error("Not a computed RGB colour: " + v);
    return m[1].split(",").slice(0, 3).map(x => Number(x.trim()));
  };
  const luminance = (v: string) => {
    const channels = rgb(v).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  };
  const f = luminance(foreground), b = luminance(background);
  return (Math.max(f, b) + .05) / (Math.min(f, b) + .05);
}
const routes = ["/", "/kundli", "/horoscope", "/panchang", "/pujas", "/reports", "/shop", "/consultation", "/free-calculators", "/blog"];

test.describe("NAKSHARIX live menu accessibility and positioning", () => {
  test("Horoscope links remain readable and inside the viewport on ten page families", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBe(200);
      const navigation = page.getByRole("navigation", { name: "Primary navigation" });
      const trigger = navigation.getByRole("link", { name: "Horoscope", exact: true });
      await expect(trigger, "Desktop header missing on " + route).toBeVisible();
      await trigger.hover();
      const popup = navigation.getByRole("region", { name: "Horoscope options" });
      await expect(popup, "Dropdown not accessible on " + route).toBeVisible();
      const link = popup.getByRole("link", { name: "Weekly Horoscope", exact: true });
      await expect(link).toBeVisible();
      const actual = await popup.evaluate((el) => {
        const link = el.querySelector<HTMLAnchorElement>("a.nx-nav-dropdown-link");
        if (!link) throw Error("Dropdown link missing");
        const rect = el.getBoundingClientRect();
        const body = document.documentElement;
        return {
          background: getComputedStyle(el).backgroundColor,
          foreground: getComputedStyle(link).color,
          x: rect.left,
          right: rect.right,
          width: body.clientWidth,
          pointerEvents: getComputedStyle(el).pointerEvents,
        };
      });
      expect(contrast(actual.foreground, actual.background), route + JSON.stringify(actual)).toBeGreaterThanOrEqual(4.5);
      expect(actual.x, route).toBeGreaterThanOrEqual(0);
      expect(actual.right, route).toBeLessThanOrEqual(actual.width + 1);
      expect(actual.pointerEvents, route).toBe("auto");
    }
  });

  test("mouse movement from Horoscope trigger to popup doesn't close it; link works", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/consultation", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await nav.getByRole("link", { name: "Horoscope", exact: true }).hover();
    const region = nav.getByRole("region", { name: "Horoscope options" });
    await expect(region).toBeVisible();
    const target = region.getByRole("link", { name: "Weekly Horoscope", exact: true });
    await target.hover();
    await expect(region).toBeVisible();
    await target.click();
    await expect(page).toHaveURL(/\/weekly-horoscope(?:\?|$)/);
  });

  test("keyboard focus and dark theme keep all dropdown items readable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/reports", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    const trigger = nav.getByRole("link", { name: "Horoscope", exact: true });
    await trigger.focus();
    const region = nav.getByRole("region", { name: "Horoscope options" });
    await expect(region).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(region.getByRole("link", { name: "Daily Horoscope", exact: true })).toBeFocused();
    await page.evaluate(() => { document.documentElement.classList.add("dark"); });
    const shades = await region.evaluate((el) => ({
      fg: getComputedStyle(el.querySelector("a.nx-nav-dropdown-link")!).color,
      bg: getComputedStyle(el).backgroundColor,
    }));
    expect(contrast(shades.fg, shades.bg)).toBeGreaterThanOrEqual(4.5);
  });

  test("wide-screen More menu exposes utility links with legible text", async ({ page }) => {
    await page.setViewportSize({ width: 1740, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    const trigger = nav.getByRole("button", { name: "More", exact: true });
    await expect(trigger).toBeVisible();
    await trigger.hover();
    const popup = nav.getByRole("region", { name: "More site sections" });
    await expect(popup).toBeVisible();
    await expect(popup.getByRole("link", { name: "Free Calculators", exact: true })).toHaveAttribute("href", "/free-calculators");
    const col = await popup.evaluate(el => ({
      bg: getComputedStyle(el).backgroundColor,
      fg: getComputedStyle(el.querySelector(".nx-nav-dropdown-link")!).color,
      right: el.getBoundingClientRect().right,
      width: document.documentElement.clientWidth,
    }));
    expect(contrast(col.fg, col.bg)).toBeGreaterThanOrEqual(4.5);
    expect(col.right).toBeLessThanOrEqual(col.width);
  });

  test("mobile drawer covers the viewport and Escape restores menu focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/consultation", { waitUntil: "domcontentloaded" });
    const opener = page.getByRole("button", { name: "Open navigation menu" });
    await expect(opener).toBeVisible();
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(dialog).toBeVisible();
    const rect = await dialog.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, innerWidth:window.innerWidth, innerHeight:window.innerHeight };
    });
    expect(Math.abs(rect.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(rect.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(rect.width - rect.innerWidth)).toBeLessThanOrEqual(2);
    expect(Math.abs(rect.height - rect.innerHeight)).toBeLessThanOrEqual(2);
    await expect(dialog.getByRole("link", { name: "Puja", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Cart", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});
