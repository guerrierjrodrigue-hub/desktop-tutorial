import { test, expect } from "./fixtures";

/**
 * Z3 C5: on a 390px phone viewport, no standalone button or footer link may be
 * shorter than 36px — small tap targets are hard to hit. Inline links inside
 * paragraphs are exempt (they flow with text); we check every visible <button>
 * plus the links inside <footer> and <nav>.
 */
const PAGES = ["/", "/pricing", "/login", "/signup"];
const MIN = 36;

test.describe("Touch targets at 390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const p of PAGES) {
    test(`no button or standalone link under ${MIN}px on ${p}`, async ({ page }) => {
      await page.goto(p);
      await page.waitForLoadState("load");

      const targets = page.locator(
        "button:visible, footer a:visible, nav a:visible",
      );
      const count = await targets.count();
      const tooSmall: string[] = [];
      for (let i = 0; i < count; i++) {
        const el = targets.nth(i);
        const box = await el.boundingBox();
        if (!box) continue; // off-screen / not rendered
        if (box.height < MIN) {
          const text = (await el.textContent())?.trim().slice(0, 30) ?? "";
          const label = (await el.getAttribute("aria-label")) ?? "";
          tooSmall.push(`"${text || label}" ${Math.round(box.height)}px`);
        }
      }
      expect(tooSmall, `targets under ${MIN}px on ${p}: ${tooSmall.join(", ")}`).toEqual([]);
    });
  }
});
