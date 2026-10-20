import { test, expect } from "./fixtures";

// X1 regression coverage: adding a row then immediately editing or deleting it
// (before any reload) must act on that same row, not a phantom temporary id.
//
// Demo mode behaves like a signed-in user on mock data: the server actions are
// no-ops that return success without a real database id, so these specs verify
// the client path that the fix depends on — the optimistic row stays editable
// and deletable right after it is added, the edit updates the visible row, and
// the delete removes it. (End-to-end database persistence across a real reload
// is checked against the live Supabase project as part of the release, which
// demo mode cannot exercise.)

test.describe("Food log: add then edit/delete immediately", () => {
  test("add a meal, then edit it in place", async ({ page }) => {
    await page.goto("/nutrition");

    // The food-log card header holds the Add toggle.
    const header = page.getByText("Today's food log").locator("..");
    await expect(header).toBeVisible();

    // Add a meal.
    await header.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByPlaceholder("What did you eat?").fill("E2E Oatmeal");
    await page.getByRole("button", { name: "Log it" }).click();

    await expect(page.getByText("E2E Oatmeal", { exact: true })).toBeVisible();

    // Edit it right away — the edit control must be usable (real id known).
    const editBtn = page.getByRole("button", { name: "Edit E2E Oatmeal" });
    await expect(editBtn).toBeEnabled();
    await editBtn.click();
    await page.getByPlaceholder("What did you eat?").fill("E2E Oatmeal Deluxe");
    await page.getByRole("button", { name: "Save changes" }).click();

    // The edited name is shown and the old one is gone.
    await expect(page.getByText("E2E Oatmeal Deluxe", { exact: true })).toBeVisible();
    await expect(page.getByText("E2E Oatmeal", { exact: true })).toHaveCount(0);
  });

  test("add a meal, then delete it immediately", async ({ page }) => {
    await page.goto("/nutrition");

    const header = page.getByText("Today's food log").locator("..");
    await header.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByPlaceholder("What did you eat?").fill("E2E Snack");
    await page.getByRole("button", { name: "Log it" }).click();

    await expect(page.getByText("E2E Snack", { exact: true })).toBeVisible();

    const deleteBtn = page.getByRole("button", { name: "Delete E2E Snack" });
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();

    await expect(page.getByText("E2E Snack", { exact: true })).toHaveCount(0);
  });
});

test.describe("Journal: add then edit/delete immediately", () => {
  test("add an entry, then edit it in place", async ({ page }) => {
    await page.goto("/journal");

    // Open the composer and add an entry.
    await page.getByRole("button", { name: "New" }).click();
    await page.getByPlaceholder("What's on your mind?").fill("E2E Reflection");
    await page.getByRole("button", { name: "Add to journal" }).click();

    await expect(page.getByRole("heading", { name: "E2E Reflection" })).toBeVisible();

    // Edit it right away — the inline edit control must be usable.
    const editBtn = page.getByRole("button", { name: "Edit entry E2E Reflection" });
    await expect(editBtn).toBeEnabled();
    await editBtn.click();

    // The entry modal opens in editing mode; change the title and save.
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").first().fill("E2E Reflection Revised");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    // The revised title shows in the list row (and the still-open modal); the
    // old exact title is gone everywhere.
    await expect(
      page.getByRole("heading", { name: "E2E Reflection Revised" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "E2E Reflection", exact: true }),
    ).toHaveCount(0);
  });

  test("add an entry, then delete it immediately", async ({ page }) => {
    await page.goto("/journal");

    await page.getByRole("button", { name: "New" }).click();
    await page.getByPlaceholder("What's on your mind?").fill("E2E Throwaway");
    await page.getByRole("button", { name: "Add to journal" }).click();

    await expect(page.getByRole("heading", { name: "E2E Throwaway" })).toBeVisible();

    // Open the entry, then delete it (with the confirmation step).
    await page.getByRole("button", { name: "Open entry E2E Throwaway" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Delete entry E2E Throwaway" }).click();
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByRole("heading", { name: "E2E Throwaway" })).toHaveCount(0);
  });
});
