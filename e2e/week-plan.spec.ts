import { test, expect } from "./fixtures";

// Runs against the demo server (open dashboard, mock data, English cookie).
test.describe("7-day plan", () => {
  test("the dashboard shows the week plan with a program and a cadence", async ({ page }) => {
    await page.goto("/dashboard");

    const heading = page.getByText("Your 7-day plan", { exact: true });
    await expect(heading).toBeVisible();

    // The card is built from buildWeekPlan: a "based on … days/week" caption,
    // plus seven day cells mixing training ("Go") and rest ("Rest").
    await expect(page.getByText(/days\/week/i)).toBeVisible();
    await expect(page.getByText("Go").first()).toBeVisible();
    await expect(page.getByText("Rest").first()).toBeVisible();
  });

  test("the week plan links through to the recommended program", async ({ page }) => {
    await page.goto("/dashboard");

    // The week-plan card's program row is a link to /fitness/<programId>; its
    // "Based on … days/week" caption lives inside that same link.
    const planLink = page
      .locator('a[href^="/fitness/"]')
      .filter({ hasText: /days\/week/i })
      .first();
    await expect(planLink).toBeVisible();
    await planLink.click();
    await expect(page).toHaveURL(/\/fitness\/[^/]+$/);
  });
});
