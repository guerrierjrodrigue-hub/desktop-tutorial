import { describe, it, expect } from "vitest";
import { passageForDay, hasSchedule } from "./reading-plan-passages";

describe("passageForDay", () => {
  it("maps Gospels-in-30 days to sequential chapters (Matthew then Mark)", () => {
    expect(passageForDay("The Gospels in 30 Days", 1)).toEqual({ book: "MAT", chapter: 1 });
    expect(passageForDay("The Gospels in 30 Days", 28)).toEqual({ book: "MAT", chapter: 28 });
    expect(passageForDay("The Gospels in 30 Days", 29)).toEqual({ book: "MRK", chapter: 1 });
    expect(passageForDay("The Gospels in 30 Days", 30)).toEqual({ book: "MRK", chapter: 2 });
  });

  it("maps Proverbs to one chapter per day", () => {
    expect(passageForDay("Proverbs for Discipline", 1)).toEqual({ book: "PRO", chapter: 1 });
    expect(passageForDay("Proverbs for Discipline", 31)).toEqual({ book: "PRO", chapter: 31 });
  });

  it("clamps days past the end to the last passage", () => {
    expect(passageForDay("Fitness & Faith", 999)).toEqual({ book: "2TI", chapter: 1 });
  });

  it("clamps days below 1 to the first passage", () => {
    expect(passageForDay("Psalms of Strength", 0)).toEqual({ book: "PSA", chapter: 1 });
  });

  it("returns null for an unknown plan", () => {
    expect(passageForDay("Unknown Plan", 1)).toBeNull();
    expect(hasSchedule("Unknown Plan")).toBe(false);
    expect(hasSchedule("Proverbs for Discipline")).toBe(true);
  });
});
