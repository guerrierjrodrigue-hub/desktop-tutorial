import { test, expect } from "./fixtures";

// X2: deleting a meal offers a 5-second Undo. The delete is deferred, so the
// row can be brought back without a round-trip. Demo mode exercises the full
// client path (the server delete is a no-op).

test.describe("Food log: delete offers Undo", () => {
  test("delete a meal, then undo to restore it", async ({ page }) => {
    await page.goto("/nutrition");

    const header = page.getByText("Today's food log").locator("..");
    await header.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByPlaceholder("What did you eat?").fill("E2E Undo Me");
    await page.getByRole("button", { name: "Log it" }).click();

    await expect(page.getByText("E2E Undo Me", { exact: true })).toBeVisible();

    // Delete it — the row goes away and an Undo control appears.
    await page.getByRole("button", { name: "Delete E2E Undo Me" }).click();
    await expect(page.getByText("E2E Undo Me", { exact: true })).toHaveCount(0);
    const undoBtn = page.getByRole("button", { name: "Undo", exact: true });
    await expect(undoBtn).toBeVisible();

    // Undo brings the meal back.
    await undoBtn.click();
    await expect(page.getByText("E2E Undo Me", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toHaveCount(0);
  });

  test("the Undo window clears itself after the timeout", async ({ page }) => {
    await page.goto("/nutrition");

    const header = page.getByText("Today's food log").locator("..");
    await header.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByPlaceholder("What did you eat?").fill("E2E Gone Soon");
    await page.getByRole("button", { name: "Log it" }).click();
    await expect(page.getByText("E2E Gone Soon", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Delete E2E Gone Soon" }).click();
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeVisible();

    // After the 5s window the Undo control disappears and the meal stays gone.
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toHaveCount(0, { timeout: 7000 });
    await expect(page.getByText("E2E Gone Soon", { exact: true })).toHaveCount(0);
  });
});
