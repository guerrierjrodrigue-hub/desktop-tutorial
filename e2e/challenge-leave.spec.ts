import { test, expect } from "./fixtures";

// Demo mode behaves like a signed-in user on mock data, so the join -> leave
// flow exercises the full UI path (the server actions are no-ops in demo, but
// the optimistic state + confirmation step are what we verify here).
test.describe("Join then leave a challenge", () => {
  test("joining shows a Leave button; leaving (with confirmation) reverts to Join", async ({
    page,
  }) => {
    await page.goto("/challenges");

    // "Church vs. Church…" (c2) starts un-joined in demo data.
    const card = page.getByTestId("challenge-c2");
    await expect(card).toBeVisible();

    // Join it.
    await card.getByRole("button", { name: "Join", exact: true }).click();

    // Now a "Leave this challenge" button is shown instead of Join.
    const leaveBtn = card.getByRole("button", { name: /leave this challenge/i });
    await expect(leaveBtn).toBeVisible();
    await expect(card.getByRole("button", { name: "Join", exact: true })).toHaveCount(0);

    // Leaving asks for confirmation first.
    await leaveBtn.click();
    const confirmBtn = card.getByRole("button", { name: /yes, leave/i });
    await expect(confirmBtn).toBeVisible();

    // Cancel keeps us joined.
    await card.getByRole("button", { name: /cancel/i }).click();
    await expect(card.getByRole("button", { name: /leave this challenge/i })).toBeVisible();

    // Confirm leaving reverts the card to the Join state.
    await card.getByRole("button", { name: /leave this challenge/i }).click();
    await card.getByRole("button", { name: /yes, leave/i }).click();
    await expect(card.getByRole("button", { name: "Join", exact: true })).toBeVisible();
  });
});
