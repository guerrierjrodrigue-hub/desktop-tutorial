import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { contrastRatio } from "./contrast";

// Parse the design tokens straight from globals.css so this test fails if the
// palette drifts below WCAG AA.
const cssPath = join(dirname(fileURLToPath(import.meta.url)), "../app/globals.css");
const css = readFileSync(cssPath, "utf-8");

function token(name: string): string {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8});`));
  if (!m) throw new Error(`token --color-${name} not found in globals.css`);
  return m[1];
}

const AA = 4.5; // WCAG AA for normal text

describe("palette contrast (WCAG AA)", () => {
  // Text colors must be readable on every surface they appear on.
  const surfaces = ["background", "surface", "surface-2"] as const;
  const textTokens = ["foreground", "muted", "faint"] as const;

  for (const bg of surfaces) {
    for (const fg of textTokens) {
      it(`${fg} on ${bg} meets AA`, () => {
        expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA);
      });
    }
  }

  // Accent / ember / success used as text or icons on the base background.
  for (const c of ["accent", "accent-bright", "ember", "green", "green-bright", "danger"]) {
    it(`${c} on background meets AA`, () => {
      expect(contrastRatio(token(c), token("background"))).toBeGreaterThanOrEqual(AA);
    });
  }

  // Dark text on the filled amber accent (buttons).
  it("accent-fg on accent (filled button) meets AA", () => {
    expect(contrastRatio(token("accent-fg"), token("accent"))).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(token("accent-fg"), token("accent-bright"))).toBeGreaterThanOrEqual(AA);
  });
});
