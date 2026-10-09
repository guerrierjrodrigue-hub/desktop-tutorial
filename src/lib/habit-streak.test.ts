import { describe, it, expect } from "vitest";
import { computeStreak } from "./habit-streak";
import { spreadTrainingDays, mondayIndexFromDateStr } from "./week-plan";

// Mon/Wed/Fri training → Tue/Thu/Sat/Sun are rest days.
const weekPattern = spreadTrainingDays(3);
const isWorkoutRestDay = (d: string) => weekPattern[mondayIndexFromDateStr(d)] === "rest";

describe("computeStreak (no exemptions)", () => {
  it("counts consecutive done days ending today", () => {
    const done = new Set(["2026-10-05", "2026-10-06", "2026-10-07"]);
    expect(computeStreak(done, "2026-10-07")).toBe(3);
  });

  it("still stands on yesterday when today isn't done yet", () => {
    const done = new Set(["2026-10-05", "2026-10-06"]);
    expect(computeStreak(done, "2026-10-07")).toBe(2);
  });

  it("breaks on a real missed day", () => {
    const done = new Set(["2026-10-05", "2026-10-07"]); // gap on the 6th
    expect(computeStreak(done, "2026-10-07")).toBe(1);
  });
});

describe("computeStreak with a planned rest day (Q1)", () => {
  // Training day (Wed 2026-10-07): a done workout counts normally.
  it("counts a workout done on a training day", () => {
    const done = new Set(["2026-10-05", "2026-10-07"]); // Mon + Wed done
    // Tue (the 6th) is a rest day, so the gap is exempt and does not break.
    expect(computeStreak(done, "2026-10-07", isWorkoutRestDay)).toBe(2);
  });

  // Rest day (Thu 2026-10-08): not training does NOT break the streak.
  it("does not break the streak on a planned rest day with no workout", () => {
    const done = new Set(["2026-10-05", "2026-10-07"]); // Mon + Wed done, Thu is rest
    // Walking back from Thu: Thu exempt(skip) → Wed done → Tue exempt(skip) → Mon done.
    expect(computeStreak(done, "2026-10-08", isWorkoutRestDay)).toBe(2);
  });

  // Session done anyway on a rest day: it counts as a bonus toward the streak.
  it("counts a session done anyway on a rest day", () => {
    const done = new Set(["2026-10-05", "2026-10-07", "2026-10-08"]); // incl. Thu (rest)
    expect(computeStreak(done, "2026-10-08", isWorkoutRestDay)).toBe(3);
  });

  it("still breaks on a missed TRAINING day", () => {
    // Fri 2026-10-09 is a training day; nothing done on it and today is Fri.
    const done = new Set(["2026-10-05"]); // only Mon
    // Back from Fri: Fri not done & not exempt → break immediately → 0.
    expect(computeStreak(done, "2026-10-09", isWorkoutRestDay)).toBe(0);
  });
});
