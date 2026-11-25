import { test, expect } from "@playwright/test";

const routes = ["/", "/reports", "/reports/premium-kundli", "/login", "/signup", "/shop", "/cart", "/consultation"];
const sizes = [{width:390,height:844},{width:768,height:1024},{width:1440,height:900}];

for (const route of routes) {
  for (const viewport of sizes) {
    test(`responsive ${route} at ${viewport.width}px`, async ({page}, testInfo) => {
      test.skip(testInfo.project.name === "webkit-iphone" && viewport.width === 1440, "Desktop 1440px is not an iPhone viewport; desktop engines are tested independently.");
      await page.setViewportSize(viewport);
      const response = await page.goto(route, {waitUntil:"domcontentloaded"});
      expect(response?.ok(), `HTTP response for ${route}`).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
      await page.evaluate(async () => { await document.fonts.ready; });
      const dimensions = await page.evaluate(() => ({width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth}));
      await page.screenshot({path:testInfo.outputPath("viewport.png"),fullPage:true,animations:"disabled"});
      expect(dimensions.scroll, `Horizontal document overflow on ${route}`).toBeLessThanOrEqual(dimensions.width+2);
    });
  }
}
