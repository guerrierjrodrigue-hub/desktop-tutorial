import { test, expect } from "./fixtures";

test.describe("Language toggle", () => {
  test("switches the marketing UI between English and French", async ({ page }) => {
    await page.goto("/");

    // The group's aria-label is itself localized ("Language" / "Langue"), so
    // match on the common stem to keep the locator stable across toggles.
    const toggle = page.getByRole("group", { name: /lang/i });

    // Fixture starts us in English.
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();

    // Switch to French.
    await toggle.getByRole("button", { name: "fr" }).click();
    await expect(page.getByRole("link", { name: "Tarifs" }).first()).toBeVisible();

    // And back to English.
    await toggle.getByRole("button", { name: "en" }).click();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();
  });
});
