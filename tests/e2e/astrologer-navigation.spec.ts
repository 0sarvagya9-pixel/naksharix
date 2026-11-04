import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
type TestRole = "ASTROLOGER" | "CONSULTANT" | "USER";

async function mockAccount(page: Page, role: TestRole) {
  await page.route("**/api/auth/me", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { user: {
          id: "role-navigation-test",
          name: role === "USER" ? "Visitor" : "Mahesh",
          email: "role-navigation@example.test",
          role, effectiveRole: role, isAdminLogin: false
        } }
      })
    });
  });
}

test.describe("role-aware navigation and readable profile menu", () => {
  for (const role of ["ASTROLOGER", "CONSULTANT"] as const) {
    test(`${role} account can navigate from public header to its professional dashboard`, async ({ page }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await mockAccount(page, role);
      await page.goto(new URL("/", baseURL).toString(), { waitUntil: "domcontentloaded" });
      const trigger = page.getByRole("button", { name: "Account menu for Mahesh" });
      await expect(trigger).toBeVisible();
      await trigger.click();
      const dashboard = page.getByRole("menuitem", { name: "Astrologer Dashboard" });
      await expect(dashboard).toBeVisible();
      await expect(dashboard).toHaveAttribute("href", "/astrologer/dashboard");
      await expect(page.getByRole("menuitem", { name: "Professional Profile" })).toHaveAttribute("href", "/astrologer/profile");
      await expect(page.getByRole("menuitem", { name: /Admin Panel/i })).toHaveCount(0);

      // User menu is a light accessible popover with dark text, never pale gold on ivory.
      const foreground = await dashboard.evaluate(node => getComputedStyle(node).color);
      expect(foreground).not.toBe("rgb(255, 255, 255)");
      await page.keyboard.press("Escape");
      await expect(dashboard).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }

  test("regular member never gets the protected astrologer dashboard entry", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockAccount(page, "USER");
    await page.goto(new URL("/", baseURL).toString(), { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Account menu for Visitor" }).click();
    await expect(page.getByRole("menuitem", { name: "Astrologer Dashboard" })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: /My Profile/i })).toBeVisible();
  });

  test("small-screen astrologer sees workspace links instead of misleading sign in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockAccount(page, "ASTROLOGER");
    await page.goto(new URL("/", baseURL).toString(), { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(dialog).toBeVisible();
    const dashboard = dialog.getByRole("link", { name: "Astrologer Dashboard" });
    await expect(dashboard).toBeVisible();
    await expect(dashboard).toHaveAttribute("href", "/astrologer/dashboard");
    await expect(dialog.getByRole("link", { name: "Sign in" })).toHaveCount(0);
    await expect(dialog.getByRole("link", { name: "Professional Profile" })).toHaveAttribute("href", "/astrologer/profile");
    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
  });
});
