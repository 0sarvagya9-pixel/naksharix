import { expect, test } from "@playwright/test";

test("global success popup is centered, accessible and closes after five seconds", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-site-notifications-ready="true"]')).toBeAttached();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("naksharix:site-notification", {
      detail: { id: "test-success", kind: "success",
        title: "Saved successfully", message: "Your change was recorded.", timestamp: Date.now() }
    }));
  });
  const notice = page.locator('[data-notification-region="center"] [data-notification-kind="success"]');
  await expect(notice).toBeVisible();
  await expect(notice).toHaveAttribute("role", "status");
  await expect(notice).toHaveAttribute("data-notification-duration", "5000");
  await expect(notice.getByText("Your change was recorded.")).toBeVisible();

  const position = await notice.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      viewportX: window.innerWidth / 2,
      viewportY: window.innerHeight / 2,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    };
  });
  expect(Math.abs(position.centerX - position.viewportX)).toBeLessThan(4);
  expect(Math.abs(position.centerY - position.viewportY)).toBeLessThan(4);
  expect(position.pageWidth).toBeLessThanOrEqual(position.viewportWidth + 2);
  await expect(notice).toHaveCount(0, { timeout: 6500 });

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("naksharix:site-notification", {
      detail: { id: "test-error", kind: "error", title: "Action not completed",
        message: "Review the form.", timestamp: Date.now() }
    }));
  });
  const error = page.locator('[data-notification-kind="error"]');
  await expect(error).toHaveAttribute("role", "alert");
  await error.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(error).toHaveCount(0);
});

test("mobile notifications never overflow viewport and Escape dismisses", async ({ page }) => {
  await page.setViewportSize({width: 375, height: 700});
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-site-notifications-ready="true"]')).toBeAttached();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("naksharix:site-notification", {
      detail: { id: "mobile", kind: "warning",
        title: "Please review", message: "This is a mobile-friendly notification.", timestamp: Date.now() }
    }));
  });
  const popup = page.locator('[data-notification-kind="warning"]');
  await expect(popup).toBeVisible();
  const dimensions = await popup.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, screen: window.innerWidth };
  });
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.screen);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);

  await page.goto("/shop/5-mukhi-rudraksha", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-site-notifications-ready="true"]')).toBeAttached();
  const add = page.getByRole("button", { name: "Add to cart", exact: true });
  const success = page.locator('[data-notification-kind="success"]');
  for (const dismissFrom of ["cart", "notice"]) {
    await add.focus();
    await page.keyboard.press("Enter");
    await expect(success).toBeVisible();
    await expect(add).toBeFocused();
    await expect.poll(() => add.evaluate(button => {
      const r = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    })).toBe(true);
    if (dismissFrom === "notice") {
      await success.getByRole("button", { name: "Dismiss notification" }).focus();
      await page.keyboard.press("Enter");
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(success).toHaveCount(0);
    await expect(add).toBeFocused();
  }
});
