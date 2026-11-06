import { test, expect } from "./fixtures";

/**
 * Z3 Bloc G2: a one-time, non-blocking medical disclaimer. It shows once per
 * device on the nutrition page, can be dismissed, and stays dismissed across
 * reloads. The page content works whether or not the banner is visible.
 */
test.describe("Medical disclaimer", () => {
  test("shows once on nutrition, is dismissible, and stays dismissed", async ({ page }) => {
    await page.goto("/nutrition");
    await page.waitForLoadState("load");

    const banner = page.getByTestId("medical-disclaimer");
    await expect(banner).toBeVisible();
    // Non-blocking: the page's own heading is present alongside the banner.
    await expect(page.getByRole("heading", { name: "Nutrition" }).first()).toBeVisible();

    await banner.getByRole("button", { name: "Dismiss" }).click();
    await expect(banner).toHaveCount(0);

    // Reload: it must not come back (dismissal persisted in localStorage).
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.getByTestId("medical-disclaimer")).toHaveCount(0);
  });
});
