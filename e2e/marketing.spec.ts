import { test, expect } from "./fixtures";

test.describe("Marketing", () => {
  test("landing hero and primary CTA render", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /grow your faith/i }),
    ).toBeVisible();
    // The single primary CTA across the site.
    await expect(
      page.getByRole("link", { name: /try for free/i }).first(),
    ).toBeVisible();
  });

  test("pricing shows the free-beta banner", async ({ page }) => {
    // During the free beta (APP_FREE_MODE) the paid plans are replaced by a
    // single "everything is free" banner. The badge text also appears in the
    // footer, so scope the banner assertions to <main>.
    await page.goto("/pricing");
    const main = page.getByRole("main");
    await expect(main.getByText(/free beta version/i)).toBeVisible();
    await expect(main.getByText(/free unlimited access/i)).toBeVisible();
    await expect(
      main.getByRole("link", { name: /try for free/i }),
    ).toBeVisible();
  });

  // B1 (D-16): in free mode the home page must not offer paid CTAs or a
  // monthly/annual choice — only "Try for free".
  test("home page hides paid CTAs in free mode", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    for (const label of ["Get started", "Start free trial", "Go annual"]) {
      await expect(main.getByRole("button", { name: label })).toHaveCount(0);
      await expect(main.getByRole("link", { name: label })).toHaveCount(0);
    }
    // No monthly/annual price suffixes anywhere in the page.
    await expect(main.getByText("/mo")).toHaveCount(0);
    await expect(main.getByText("/yr")).toHaveCount(0);
    // The single primary CTA is present (hero + pricing + final CTA).
    await expect(main.getByRole("link", { name: /try for free/i }).first()).toBeVisible();
  });

  test("home page pricing subtitle has no payment wording in free mode", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    await expect(main.getByText(/upgrade when you're ready/i)).toHaveCount(0);
  });

  test("sign in link leads to the login screen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });
});
