import { test, expect } from "@playwright/test";

test.describe("Auth (demo mode)", () => {
  test("signup screen offers OAuth and email", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Email address")).toBeVisible();
  });

  test("email sign-in routes into the app in demo mode", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill("demo@example.com");
    await page.getByPlaceholder("Password").fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });
});
