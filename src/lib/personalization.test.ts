import { describe, it, expect } from "vitest";
import { getPurposeNavItem, suggestedCoachId } from "./personalization";

describe("getPurposeNavItem", () => {
  it("points Christian users to Spiritual", () => {
    expect(getPurposeNavItem(["christian"]).href).toBe("/spiritual");
  });

  it("points everyone else to the generic Purpose Journal", () => {
    expect(getPurposeNavItem(["athlete"]).href).toBe("/journal");
    expect(getPurposeNavItem([]).href).toBe("/journal");
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
