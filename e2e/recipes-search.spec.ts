import { test, expect } from "./fixtures";

// X3: recipes get a name search, keep the category filters, and paginate 18 at
// a time behind a "See more" button. Demo mode ships 24 recipes.
//
// Z3 G1: dishes without a written recipe are shown as non-clickable cards (only
// dishes with real steps are links). In demo mode none have steps, so these
// tests target the card container (data-testid="recipe-card") rather than links,
// which keeps pagination / search / filter coverage independent of clickability.

test.describe("Recipes — search, filters, pagination", () => {
  const cards = (page: import("@playwright/test").Page) => page.getByTestId("recipe-card");

  test("shows 18 recipes then reveals the rest via See more", async ({ page }) => {
    await page.goto("/nutrition");

    // First page shows exactly 18 of the 24 demo recipes.
    await expect(cards(page)).toHaveCount(18);
    const seeMore = page.getByRole("button", { name: "See more" });
    await expect(seeMore).toBeVisible();

    // See more reveals the remaining recipes and then disappears.
    await seeMore.click();
    await expect(cards(page)).toHaveCount(24);
    await expect(page.getByRole("button", { name: "See more" })).toHaveCount(0);
  });

  test("name search narrows the list and keeps working with no result", async ({ page }) => {
    await page.goto("/nutrition");

    const search = page.getByPlaceholder("Search recipes by name");
    await search.fill("warrior"); // case-insensitive match on "Warrior Protein Bowl"

    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).filter({ hasText: "Warrior Protein Bowl" })).toBeVisible();
    // A narrow result set needs no "See more".
    await expect(page.getByRole("button", { name: "See more" })).toHaveCount(0);

    // A query with no match shows the empty message.
    await search.fill("zzzznotarecipe");
    await expect(page.getByText("No recipes match your search.")).toBeVisible();
  });

  test("category filter still works and resets pagination", async ({ page }) => {
    await page.goto("/nutrition");

    // Filtering to a category keeps the filters working alongside search.
    await page.getByText("Weight loss", { exact: true }).click();

    const count = await cards(page).count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(18);
    // A known weight-loss recipe is present; a known other-category one is not.
    await expect(cards(page).filter({ hasText: "Grilled Salmon & Greens" })).toBeVisible();
    await expect(cards(page).filter({ hasText: "Warrior Protein Bowl" })).toHaveCount(0);
  });
});
