import { test, expect } from "./fixtures";

// The AI coach feature was removed (Z2 / D-15): its pages and API routes no
// longer exist, the @anthropic-ai/sdk dependency is gone, and no entry point
// links to it. These tests guard against an accidental reintroduction.
test.describe("AI coach removed", () => {
  test("/coach no longer exists (404)", async ({ page }) => {
    const res = await page.goto("/coach");
    expect(res?.status()).toBe(404);
  });

  test("/coach/[coachId] no longer exists (404)", async ({ page }) => {
    const res = await page.goto("/coach/barnabas");
    expect(res?.status()).toBe(404);
  });

  test("the coach API routes 404", async ({ request }) => {
    const chat = await request.post("/api/coach", {
      data: { coachId: "barnabas", messages: [{ role: "user", content: "hi" }] },
    });
    expect(chat.status()).toBe(404);

    const health = await request.get("/api/coach/health");
    expect(health.status()).toBe(404);
  });

  test("the sidebar shows no Coach link", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /^coach$/i })).toHaveCount(0);
  });
});
