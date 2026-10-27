import { expect, test } from "@playwright/test";

/**
 * Public, disposable-CI screenshots for inspection of design consistency.
 * No external secrets, user profiles, payments or live production involved.
 * The browser-release-qa artifact already uploads test-results.
 */
const publicScreens = [
  { path: "/", name: "homepage" },
  { path: "/shop", name: "shop" },
  { path: "/pujas", name: "puja-directory" },
  { path: "/consultation", name: "consultation" },
  { path: "/reports", name: "reports" },
  { path: "/kundli", name: "kundli" },
  { path: "/shop/shri-yantra", name: "shop-detail" },
  { path: "/pujas/rudrabhishek", name: "puja-detail" }
] as const;

test("capture sitewide public visual evidence for desktop and mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "firefox-desktop", "Capture Chrome and iPhone reference evidence");
  test.setTimeout(180_000);
  for (const screen of publicScreens) {
    const response = await page.goto(screen.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), screen.path).toBe(200);
    await expect(page.locator("main").first()).toBeVisible();
    await page.evaluate(async () => { await document.fonts.ready; });
    const screenshotPath = testInfo.outputPath("visual-" + screen.name + ".png");
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: "disabled" });
    await testInfo.attach(screen.name + "-visual", { path: screenshotPath, contentType: "image/png" });
  }
});