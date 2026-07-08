import { describe, it, expect } from "vitest";
import { getRecommendations } from "./recommendations";
import type { Habit, Program } from "@/types";

function program(overrides: Partial<Program>): Program {
  return {
    id: "p",
    title: "Program",
    description: "",
    category: "bodyweight",
    level: "beginner",
    weeks: 4,
    daysPerWeek: 3,
    durationMinutes: 30,
    coverColor: "from-green-deep to-green",
    premium: false,
    schedule: [],
    ...overrides,
  };
}

const programs: Program[] = [
  program({ id: "strength", category: "strength", title: "Strength Program" }),
  program({ id: "running", category: "running", title: "Running Program" }),
];

const habitsMostlyDone: Habit[] = [
  { id: "h1", label: "a", icon: "Check", done: true, streak: 1 },
  { id: "h2", label: "b", icon: "Check", done: true, streak: 1 },
];

const habitsMostlyUndone: Habit[] = [
  { id: "h1", label: "a", icon: "Check", done: false, streak: 1 },
  { id: "h2", label: "b", icon: "Check", done: false, streak: 1 },
];

describe("getRecommendations", () => {
  it("recommends a program matching the user's primary goal", () => {
    const recs = getRecommendations(
      { primaryGoal: "Build Muscle", identities: [] },
      programs,
      habitsMostlyDone,
    );
    expect(recs.find((r) => r.id === "program")?.label).toBe("Strength Program");
  });

  it("falls back to the first program when the goal has no direct match", () => {
    const recs = getRecommendations(
      { primaryGoal: "Improve Mental Wellness", identities: [] },
      programs,
      habitsMostlyDone,
    );
    expect(recs.find((r) => r.id === "program")?.label).toBe("Strength Program");
  });

  it("nudges toward Focus when today's habit completion is low", () => {
    const recs = getRecommendations({ identities: [] }, programs, habitsMostlyUndone);
    expect(recs.some((r) => r.id === "focus")).toBe(true);
  });

  it("does not nudge toward Focus when habits are mostly done", () => {
    const recs = getRecommendations({ identities: [] }, programs, habitsMostlyDone);
    expect(recs.some((r) => r.id === "focus")).toBe(false);
  });

  it("always includes a community suggestion, capped at 3 total", () => {
    const recs = getRecommendations({ identities: [] }, programs, habitsMostlyUndone);
    expect(recs.some((r) => r.id === "community")).toBe(true);
    expect(recs.length).toBeLessThanOrEqual(3);
  });
});
