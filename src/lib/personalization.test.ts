import { describe, it, expect } from "vitest";
import { getPurposeNavItems, getSpiritualNavItem } from "./personalization";

describe("getPurposeNavItems", () => {
  it("always shows Spiritual and the Bible — for every user", () => {
    const hrefs = getPurposeNavItems().map((i) => i.href);
    expect(hrefs).toContain("/spiritual");
    expect(hrefs).toContain("/spiritual/bible");
  });

  it("does not duplicate /journal (that lives in the Mind pillar)", () => {
    expect(getPurposeNavItems().map((i) => i.href)).not.toContain("/journal");
  });

  it("exposes Spiritual as the mobile bottom-bar purpose shortcut", () => {
    expect(getSpiritualNavItem().href).toBe("/spiritual");
  });
});
