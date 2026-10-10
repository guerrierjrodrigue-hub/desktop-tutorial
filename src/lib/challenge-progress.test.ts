import { describe, it, expect } from "vitest";
import {
  daysBetween,
  pickDashboardChallenge,
  cohortStatus,
  daysLeftFor,
  workoutProgress,
  WORKOUT_CHALLENGE_TARGET,
} from "./challenge-progress";

describe("daysBetween", () => {
  it("counts whole days forward and backward", () => {
    expect(daysBetween("2026-10-01", "2026-10-08")).toBe(7);
    expect(daysBetween("2026-10-08", "2026-10-01")).toBe(-7);
    expect(daysBetween("2026-10-07", "2026-10-07")).toBe(0);
  });

  it("spans month and year boundaries", () => {
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });
});

describe("daysLeftFor", () => {
  it("returns the full duration on the day you join", () => {
    expect(daysLeftFor("2026-10-07", 30, "2026-10-07")).toBe(30);
  });

  it("counts down as days elapse", () => {
    expect(daysLeftFor("2026-10-07", 30, "2026-10-17")).toBe(20);
    expect(daysLeftFor("2026-10-07", 14, "2026-10-13")).toBe(8);
  });

  it("never goes negative past the window", () => {
    expect(daysLeftFor("2026-10-07", 14, "2026-11-30")).toBe(0);
  });
});

describe("workoutProgress", () => {
  it("is a 0..1 fraction of the target", () => {
    expect(workoutProgress(0)).toBe(0);
    expect(workoutProgress(15)).toBeCloseTo(0.5);
    expect(workoutProgress(WORKOUT_CHALLENGE_TARGET)).toBe(1);
  });

  it("clamps at 1 and ignores negatives", () => {
    expect(workoutProgress(45)).toBe(1);
    expect(workoutProgress(-3)).toBe(0);
  });

  it("honors a custom target and guards against zero", () => {
    expect(workoutProgress(5, 10)).toBe(0.5);
    expect(workoutProgress(5, 0)).toBe(0);
  });
});

describe("pickDashboardChallenge", () => {
  it("prefers a joined challenge over an unjoined one", () => {
    const picked = pickDashboardChallenge([
      { id: "a", joined: false },
      { id: "b", joined: true },
    ]);
    expect(picked?.id).toBe("b");
  });

  it("falls back to the first challenge when none are joined", () => {
    const picked = pickDashboardChallenge([
      { id: "a", joined: false },
      { id: "b", joined: false },
    ]);
    expect(picked?.id).toBe("a");
  });

  it("returns undefined when there are no challenges", () => {
    expect(pickDashboardChallenge([])).toBeUndefined();
  });
});

describe("cohortStatus", () => {
  it("before the start date: not started, no countdown, full duration", () => {
    expect(cohortStatus("2026-10-12", 21, "2026-10-09")).toEqual({
      started: false,
      daysLeft: 21,
    });
  });

  it("on the start date: started, full duration left", () => {
    expect(cohortStatus("2026-10-12", 21, "2026-10-12")).toEqual({
      started: true,
      daysLeft: 21,
    });
  });

  it("mid-cohort: shared countdown from the start date", () => {
    // 5 days elapsed since start -> 16 of 21 left, regardless of join date.
    expect(cohortStatus("2026-10-12", 21, "2026-10-17")).toEqual({
      started: true,
      daysLeft: 16,
    });
  });

  it("past the end: clamps at zero, never negative", () => {
    expect(cohortStatus("2026-10-12", 21, "2026-12-01")).toEqual({
      started: true,
      daysLeft: 0,
    });
  });
});
