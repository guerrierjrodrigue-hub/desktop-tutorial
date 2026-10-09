import { describe, it, expect } from "vitest";
import { getPurposeNavItems, getSpiritualNavItem, suggestedCoachId } from "./personalization";

describe("getPurposeNavItems", () => {
  it("always shows Spiritual and the Bible — for Christian users", () => {
    const hrefs = getPurposeNavItems(["christian"]).map((i) => i.href);
    expect(hrefs).toContain("/spiritual");
    expect(hrefs).toContain("/spiritual/bible");
  });

  it("always shows Spiritual and the Bible — even without the Christian identity", () => {
    for (const identities of [["athlete"], [] as string[]]) {
      const hrefs = getPurposeNavItems(identities).map((i) => i.href);
      expect(hrefs).toContain("/spiritual");
      expect(hrefs).toContain("/spiritual/bible");
    }
  });

  it("keeps the Purpose Journal for non-Christian users, and drops it for Christians", () => {
    expect(getPurposeNavItems([]).map((i) => i.href)).toContain("/journal");
    expect(getPurposeNavItems(["athlete"]).map((i) => i.href)).toContain("/journal");
    expect(getPurposeNavItems(["christian"]).map((i) => i.href)).not.toContain("/journal");
  });

  it("exposes Spiritual as the mobile bottom-bar purpose shortcut", () => {
    expect(getSpiritualNavItem().href).toBe("/spiritual");
  });
});

describe("suggestedCoachId", () => {
  it("suggests Barnabas for Christian identity", () => {
    expect(suggestedCoachId(["christian", "athlete"])).toBe("barnabas");
  });

  it("suggests Titan for athletes without a faith identity", () => {
    expect(suggestedCoachId(["athlete"])).toBe("titan");
  });

  it("suggests Forge for entrepreneurs/disciplined identities", () => {
    expect(suggestedCoachId(["entrepreneur"])).toBe("forge");
    expect(suggestedCoachId(["disciplined"])).toBe("forge");
  });

  it("falls back to Haven for everything else", () => {
    expect(suggestedCoachId(["wellness"])).toBe("haven");
    expect(suggestedCoachId([])).toBe("haven");
  });
});
