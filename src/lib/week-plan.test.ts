import { describe, it, expect } from "vitest";
import { buildWeekPlan, spreadTrainingDays } from "./week-plan";
import type { Program } from "@/types";

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
