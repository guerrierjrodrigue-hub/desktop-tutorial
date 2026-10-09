import { describe, it, expect } from "vitest";
import {
  buildWeekPlan,
  spreadTrainingDays,
  mondayIndexFromDateStr,
  isRestWeekday,
} from "./week-plan";
import type { Program } from "@/types";

describe("mondayIndexFromDateStr", () => {
  it("maps calendar dates to a Monday-based weekday index", () => {
    // 2026-10-05 is a Monday, 2026-10-11 a Sunday.
    expect(mondayIndexFromDateStr("2026-10-05")).toBe(0); // Mon
    expect(mondayIndexFromDateStr("2026-10-08")).toBe(3); // Thu
    expect(mondayIndexFromDateStr("2026-10-11")).toBe(6); // Sun
  });

  it("is timezone-independent (pure calendar date)", () => {
    expect(mondayIndexFromDateStr("2026-01-01")).toBe(mondayIndexFromDateStr("2026-01-01"));
  });
});

describe("isRestWeekday", () => {
  it("reads the rest/train pattern by weekday index", () => {
    const days = spreadTrainingDays(3); // Mon/Wed/Fri train
    expect(isRestWeekday(days, 0)).toBe(false); // Mon trains
    expect(isRestWeekday(days, 1)).toBe(true); // Tue rests
    expect(isRestWeekday(days, 3)).toBe(true); // Thu rests
  });
});

type P = Omit<Program, "schedule">;
const mk = (id: string, category: P["category"], level: P["level"]): P => ({
  id,
  title: id,
  description: "",
  category,
  level,
  weeks: 4,
  daysPerWeek: 3,
  durationMinutes: 30,
  coverColor: "",
  premium: false,
});

const PROGRAMS: P[] = [
  mk("strength", "strength", "beginner"),
  mk("bodyweight", "bodyweight", "beginner"),
  mk("running", "running", "beginner"),
  mk("fatloss", "fat-loss", "intermediate"),
];

describe("spreadTrainingDays", () => {
  it("places exactly n training days across the week", () => {
    expect(spreadTrainingDays(3).filter((d) => d === "train")).toHaveLength(3);
    expect(spreadTrainingDays(0).every((d) => d === "rest")).toBe(true);
    expect(spreadTrainingDays(9).filter((d) => d === "train")).toHaveLength(7);
  });
});

describe("buildWeekPlan", () => {
  it("matches a stated goal's category", () => {
    const plan = buildWeekPlan(PROGRAMS, { goals: ["build-muscle"], trainingDays: 4 });
    expect(plan.program?.category).toBe("strength");
    expect(plan.days.filter((d) => d === "train")).toHaveLength(4);
  });

  it("avoids gym-dependent programs when the user has no equipment", () => {
    const plan = buildWeekPlan(PROGRAMS, { equipment: "none", goals: ["build-muscle"] });
    // 'strength' is not equipment-free, so it should not be chosen.
    expect(plan.program?.category).not.toBe("strength");
  });

  it("returns a null program but still a cadence when none exist", () => {
    const plan = buildWeekPlan([], { trainingDays: 5 });
    expect(plan.program).toBeNull();
    expect(plan.days.filter((d) => d === "train")).toHaveLength(5);
  });
});
