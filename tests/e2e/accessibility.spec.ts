import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

function absolute(pathname: string) {
  return new URL(pathname, baseURL).toString();
}

test.describe("Naksharix WCAG release audit", () => {
  for (const pathname of ["/", "/pricing", "/consultation", "/login", "/signup", "/ai-astrologer", "/shop"]) {
    test(`${pathname} has no serious or critical WCAG violations`, async ({ page }) => {
      await page.goto(absolute(pathname), { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = results.violations
        .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
        .map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => node.target.join(" "))
        }));
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }
});
