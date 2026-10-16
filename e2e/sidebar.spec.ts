import { test, expect } from "./fixtures";

// The desktop sidebar (lg:flex, ≥1024px) must fit its 256px rail without
// pushing a horizontal scrollbar — the inline wordmark used to overflow it.
test.describe("Desktop sidebar", () => {
  for (const width of [1280, 1366]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/dashboard");

      const aside = page.locator("aside").first();
      await expect(aside).toBeVisible();

      // The sidebar's own content does not overflow its box.
      const asideOverflow = await aside.evaluate(
        (el) => el.scrollWidth - el.clientWidth,
      );
      expect(asideOverflow).toBeLessThanOrEqual(1);

      // The page as a whole has no horizontal scrollbar.
      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(pageOverflow).toBeLessThanOrEqual(1);
    });
  }
});
