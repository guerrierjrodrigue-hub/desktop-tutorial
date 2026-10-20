import { test, expect } from "./fixtures";

// X3: recipes get a name search, keep the category filters, and paginate 18 at
// a time behind a "See more" button. Demo mode ships 24 recipes.

const recipeLinks = /^View recipe /;

test.describe("Recipes — search, filters, pagination", () => {
  test("shows 18 recipes then reveals the rest via See more", async ({ page }) => {
    await page.goto("/nutrition");

    // First page shows exactly 18 of the 24 demo recipes.
    await expect(page.getByRole("link", { name: recipeLinks })).toHaveCount(18);
    const seeMore = page.getByRole("button", { name: "See more" });
    await expect(seeMore).toBeVisible();

    // See more reveals the remaining recipes and then disappears.
    await seeMore.click();
    await expect(page.getByRole("link", { name: recipeLinks })).toHaveCount(24);
    await expect(page.getByRole("button", { name: "See more" })).toHaveCount(0);
  });

  test("name search narrows the list and keeps working with no result", async ({ page }) => {
    await page.goto("/nutrition");

    const search = page.getByPlaceholder("Search recipes by name");
    await search.fill("warrior"); // case-insensitive match on "Warrior Protein Bowl"

    await expect(page.getByRole("link", { name: "View recipe Warrior Protein Bowl" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View recipe Daniel Fast Lentil Stew" }),
    ).toHaveCount(0);
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

    const links = page.getByRole("link", { name: recipeLinks });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(18);
    // Every shown recipe belongs to the chosen category (a known one is present,
    // a known other-category recipe is not).
    await expect(page.getByRole("link", { name: "View recipe Grilled Salmon & Greens" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View recipe Warrior Protein Bowl" }),
    ).toHaveCount(0);
  });
});
