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
      const measure = () => page.evaluate(() => ({
        width:document.documentElement.clientWidth,
        scroll:document.documentElement.scrollWidth,
        height:document.documentElement.scrollHeight,
        viewportHeight:window.innerHeight,
        dpr:window.devicePixelRatio,
        top:window.scrollY
      }));
      const dimensions = await measure();
      // Keep the actual layout assertion, including on high-DPR iPhone.
      expect(dimensions.scroll, `Horizontal document overflow on ${route}`).toBeLessThanOrEqual(dimensions.width+2);
      // WebKit cannot capture a bitmap with a dimension above 32767 pixels.
      // Preserve full-document visual evidence as overlapping viewport tiles
      // when the real device pixel size would exceed that limit.
      if (Math.max(dimensions.scroll,dimensions.height)*dimensions.dpr <= 30000) {
        await page.screenshot({path:testInfo.outputPath("viewport.png"),fullPage:true,scale:"css",animations:"disabled"});
      } else {
        let target=0, covered=0, complete=false;
        for(let index=0;index<100;index++){
          await page.evaluate(top=>window.scrollTo({top,behavior:"instant"}),target);
          await expect.poll(async()=>Math.abs((await measure()).top-target),{message:`Scroll to evidence tile ${index+1} on ${route}`}).toBeLessThanOrEqual(2);
          const view=await measure();
          expect(view.scroll,`Horizontal document overflow in tile ${index+1} on ${route}`).toBeLessThanOrEqual(view.width+2);
          expect(view.top,`No uncovered gap before tile ${index+1}`).toBeLessThanOrEqual(covered+2);
          await page.screenshot({path:testInfo.outputPath(`viewport-${String(index+1).padStart(3,"0")}.png`),scale:"css",animations:"disabled"});
          const after=await measure();
          covered=Math.max(covered,view.top+view.viewportHeight);
          if(covered>=after.height-2){complete=true;break;}
          target=Math.min(Math.max(0,after.height-after.viewportHeight),view.top+Math.max(1,view.viewportHeight-120));
          expect(target,`Evidence tiles must advance on ${route}`).toBeGreaterThan(view.top);
        }
        expect(complete,`Visual evidence must cover the entire long document on ${route}`).toBeTruthy();
      }
    });
  }
}
