import { expect, test } from "@playwright/test";

test.describe("NAKSHARIX premium home reference fidelity", () => {
  test("the first screen keeps the approved cosmic design and real actions", async ({page}) => {
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.goto("/", {waitUntil:"domcontentloaded"});
    const hero=page.locator(".nx-ed-hero--reference");
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("heading",{level:1,name:/Decode your destiny/i})).toBeVisible();
    await expect(hero.locator(".nx-ed-hero-photo")).toHaveCount(1);
    await expect(hero.locator(".nx-ed-hero-wheel")).toHaveCount(1);
    await expect(hero.locator(".nx-ed-heritage-card")).toBeVisible();

    for (const [name,href] of [
      ["Free Birth Kundli","/kundli"],
      ["Kundli Matching","/matchmaking"],
      ["Today's Panchang","/panchang"],
      ["Create your free Kundli","/kundli"]
    ] as const) {
      await expect(hero.getByRole("link",{name:new RegExp(name,"i")})).toHaveAttribute("href",href);
    }
    const image=hero.locator(".nx-ed-hero-photo img").first();
    await expect(image).toHaveAttribute("src",/premium-cosmic-bg-v2/);
    const loaded=await image.evaluate(node => {
      const img=node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    });
    expect(loaded,"Premium background must load, not just have an image tag").toBe(true);
    const panel=hero.locator(".nx-ed-heritage-card");
    const legible=await panel.evaluate(node => {
      const style=getComputedStyle(node);
      return {visible:node.getBoundingClientRect().width > 250,background:style.backgroundColor};
    });
    expect(legible.visible).toBe(true);
  });

  test("slideshow stays on the reference hero until the visitor takes action",async({page})=>{
    test.setTimeout(35_000);
    await page.emulateMedia({reducedMotion:"no-preference"});
    await page.goto("/",{waitUntil:"domcontentloaded"});
    const h=page.getByRole("heading",{level:1,name:/Decode your destiny/i});
    await expect(h).toBeVisible();
    await expect(page.getByRole("button",{name:"Play featured slideshow"})).toBeEnabled();
    await page.waitForTimeout(8200);
    await expect(h,"Autoplay must not replace the approved first-screen design unexpectedly").toBeVisible();
    await page.getByRole("button",{name:"Next featured destination"}).click();
    await expect(page.getByRole("heading",{level:1,name:/Celebrate/i})).toBeVisible();
    await expect(page.locator(".nx-ed-hero-photo img")).toHaveAttribute("src",/premium-cosmic-bg-v2/);
  });

  test("mobile and desktop maintain readable split hero without horizontal overflow", async({page})=>{
    for (const width of [320,375,390,768,1024,1440]) {
      await page.setViewportSize({width,height:850});
      await page.goto("/",{waitUntil:"domcontentloaded"});
      const observed=await page.evaluate(()=>{
        const hero=document.querySelector(".nx-ed-hero--reference");
        const card=document.querySelector(".nx-ed-heritage-card");
        return {
          viewport:document.documentElement.clientWidth,
          document:document.documentElement.scrollWidth,
          heroHeight:hero?.getBoundingClientRect().height??0,
          cardWidth:card?.getBoundingClientRect().width??0
        };
      });
      expect(observed.document,JSON.stringify({width,observed})).toBeLessThanOrEqual(observed.viewport+2);
      expect(observed.cardWidth).toBeGreaterThan(240);
      expect(observed.heroHeight).toBeGreaterThan(450);
    }
  });
});
