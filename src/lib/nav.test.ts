import { describe, it, expect } from "vitest";
import { getNavGroups, getMobileNavItems } from "@/lib/nav";
import { getPurposeNavItems, getSpiritualNavItem } from "@/lib/personalization";
import type { ActivityMode } from "@/lib/activity";

function bodyHrefs(mode: ActivityMode | null): string[] {
  const groups = getNavGroups(getPurposeNavItems(), mode);
  const body = groups.find((g) => g.id === "body");
  return (body?.items ?? []).map((i) => i.href);
}

describe("nav visibility by activity mode", () => {
  it("strength sees Fitness, not Course", () => {
    const hrefs = bodyHrefs("strength");
    expect(hrefs).toContain("/fitness");
    expect(hrefs).not.toContain("/course");
    expect(hrefs).toContain("/nutrition");
  });

  it("running sees Course, not Fitness", () => {
    const hrefs = bodyHrefs("running");
    expect(hrefs).toContain("/course");
    expect(hrefs).not.toContain("/fitness");
    expect(hrefs).toContain("/nutrition");
  });

  it("both sees Fitness and Course", () => {
    const hrefs = bodyHrefs("both");
    expect(hrefs).toContain("/fitness");
    expect(hrefs).toContain("/course");
  });

  it("an unset mode shows both so the choice stays discoverable", () => {
    const hrefs = bodyHrefs(null);
    expect(hrefs).toContain("/fitness");
    expect(hrefs).toContain("/course");
  });

  it("every mode keeps the shared pillars (mind, habits, purpose, community)", () => {
    for (const mode of ["strength", "running", "both", null] as const) {
      const ids = getNavGroups(getPurposeNavItems(), mode).map((g) => g.id);
      expect(ids).toEqual(expect.arrayContaining(["mind", "habits", "purpose", "community"]));
    }
  });

  it("the mobile Body shortcut points at the mode's home", () => {
    const run = getMobileNavItems(getSpiritualNavItem(), "running").map((i) => i.href);
    expect(run).toContain("/course");
    expect(run).not.toContain("/fitness");
    const strength = getMobileNavItems(getSpiritualNavItem(), "strength").map((i) => i.href);
    expect(strength).toContain("/fitness");
  });
});
