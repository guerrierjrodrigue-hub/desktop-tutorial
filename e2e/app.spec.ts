import { test, expect } from "@playwright/test";

test.describe("App (demo mode)", () => {
  test("dashboard greets the user and shows the daily verse", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })).toBeVisible();
    await expect(page.getByText(/verse of the day/i)).toBeVisible();
  });

  test("toggling a habit updates the completed count", async ({ page }) => {
    await page.goto("/dashboard");
    const counter = page.getByText(/^\d\/5$/).first();
    const before = await counter.innerText();
    await page.getByRole("button", { name: /complete workout/i }).click();
    await expect(counter).not.toHaveText(before);
  });

  test("sidebar navigates between sections", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Nutrition", exact: true }).click();
    await expect(page).toHaveURL(/\/nutrition$/);
    await expect(page.getByRole("heading", { name: "Nutrition" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Spiritual", exact: true }).click();
    await expect(page).toHaveURL(/\/spiritual$/);
  });

  test("notifications panel opens and can be cleared", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /notifications/i }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByText("26-day streak!")).toBeVisible();
    await page.getByRole("button", { name: /mark all read/i }).click();
    await expect(page.getByRole("button", { name: /mark all read/i })).toHaveCount(0);
  });
});
