import { expect, test } from "@playwright/test";

const baseline = [
  { route: "/", heading: /cosmic journey/i },
  { route: "/reports", heading: /premium astrology reports/i },
  { route: "/kundli", heading: /kundli/i },
  { route: "/matchmaking", heading: /matching/i },
  { route: "/hi", heading: /ज्योतिषीय यात्रा/ }
] as const;

test("royal heritage pages render with accessible, nonoverlapping header", async ({ page }) => {
  test.setTimeout(120_000);
  for (const item of baseline) {
    const response = await page.goto(item.route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), item.route).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: item.heading })).toBeVisible();
    const info = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Primary navigation"]');
      const brand = document.querySelector('a[aria-label="Naksharix home"]');
      const navBox = nav?.getBoundingClientRect();
      const logoBox = brand?.getBoundingClientRect();
      const overlap = Boolean(navBox && logoBox &&
        navBox.left < logoBox.right && navBox.right > logoBox.left &&
        navBox.top < logoBox.bottom && navBox.bottom > logoBox.top);
      return {
        overlap,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        background: getComputedStyle(document.body).backgroundColor
      };
    });
    expect(info.overlap, "Logo/header overlap at " + item.route).toBe(false);
    expect(info.overflow, "Horizontal scroll at " + item.route).toBe(false);
  }
});

test("Kundli and matching required inputs have accessible names", async ({ page }) => {
  for (const route of ["/kundli", "/matchmaking"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const controls = page.locator('input[data-field$="name"], input[type="date"], input[type="time"], select');
    const count = await controls.count();
    expect(count).toBeGreaterThan(3);
    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);
      const named = await control.evaluate(node => {
        const input = node as HTMLInputElement;
        const label = input.closest("label");
        return Boolean((input.getAttribute("aria-label") ?? "").trim() ||
          (input.labels && input.labels.length > 0) ||
          (label && label.textContent?.trim()));
      });
      expect(named, "Accessible name for " + route + " control " + i).toBe(true);
    }
  }
});

test("light-first theme switch actually changes the page surface", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("naksharix-theme"));
  await page.reload({ waitUntil: "domcontentloaded" });
  const button = page.getByRole("button", { name: "Toggle dark and light mode" });
  await expect(button).toBeEnabled();
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await button.click();
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(before).not.toBe(after);
  await page.reload({ waitUntil: "domcontentloaded" });
  // The theme hook restores localStorage after hydration; domcontentloaded
  // can precede the first React effect, especially on slower WebKit devices.
  await expect.poll(async () => page.evaluate(() => getComputedStyle(document.body).backgroundColor), {
    message: "Saved theme should be restored after hydration",
    timeout: 8000
  }).toBe(after);
});
