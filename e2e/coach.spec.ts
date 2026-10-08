import { test, expect } from "./fixtures";

test.describe("Coach picker", () => {
  test("lists every persona and links into their chat", async ({ page }) => {
    await page.goto("/coach");
    await expect(page.getByRole("heading", { name: "Barnabas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coach Titan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coach Forge" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coach Haven" })).toBeVisible();

    await page.getByRole("heading", { name: "Coach Titan" }).click();
    await expect(page).toHaveURL(/\/coach\/titan$/);
    await expect(page.getByText(/coach titan/i).first()).toBeVisible();
  });
});

test.describe("Barnabas AI coach", () => {
  test("greets, then replies to a suggested prompt", async ({ page }) => {
    await page.goto("/coach/barnabas");
    await expect(page.getByText(/i'm barnabas/i)).toBeVisible();

    await page.getByRole("button", { name: /i'm feeling unmotivated today/i }).click();

    // The user's message appears...
    await expect(
      page.getByText("I'm feeling unmotivated today.").last(),
    ).toBeVisible();

    // ...and Barnabas responds (offline fallback in demo mode).
    await expect(page.getByText(/thank you for showing up/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("can send a typed message", async ({ page }) => {
    await page.goto("/coach/barnabas");
    await page.getByRole("textbox", { name: /message barnabas/i }).fill("What should I eat after training?");
    await page.getByRole("button", { name: /^send$/i }).click();
    await expect(page.getByText(/protein/i)).toBeVisible({ timeout: 15_000 });
  });
});
