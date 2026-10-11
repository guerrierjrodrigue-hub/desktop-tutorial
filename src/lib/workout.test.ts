import { describe, it, expect } from "vitest";
import {
  programProgress,
  isValidWorkoutDuration,
  MIN_WORKOUT_MINUTES,
  MAX_WORKOUT_MINUTES,
} from "@/lib/workout";
import type { Program } from "@/types";

describe("isValidWorkoutDuration", () => {
  it("accepts whole minutes within 1–300", () => {
    expect(isValidWorkoutDuration(MIN_WORKOUT_MINUTES)).toBe(true);
    expect(isValidWorkoutDuration(45)).toBe(true);
    expect(isValidWorkoutDuration(MAX_WORKOUT_MINUTES)).toBe(true);
  });

  it("rejects out-of-range values", () => {
    expect(isValidWorkoutDuration(0)).toBe(false);
    expect(isValidWorkoutDuration(-10)).toBe(false);
    expect(isValidWorkoutDuration(301)).toBe(false);
    expect(isValidWorkoutDuration(100_000)).toBe(false);
  });

  it("rejects non-integers and non-finite values", () => {
    expect(isValidWorkoutDuration(45.5)).toBe(false);
    expect(isValidWorkoutDuration(Number.NaN)).toBe(false);
    expect(isValidWorkoutDuration(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

/** A two-week schedule with two days each; day ids d1..d4. */
const schedule: Pick<Program, "schedule"> = {
  schedule: [
    {
      week: 1,
      days: [
        { id: "d1", title: "A", focus: "", durationMinutes: 30, exercises: [] },
        { id: "d2", title: "B", focus: "", durationMinutes: 30, exercises: [] },
      ],
    },
    {
      week: 2,
      days: [
        { id: "d3", title: "C", focus: "", durationMinutes: 30, exercises: [] },
        { id: "d4", title: "D", focus: "", durationMinutes: 30, exercises: [] },
      ],
    },
  ],
};

describe("programProgress", () => {
  it("counts completed days across the whole schedule", () => {
    const p = programProgress(schedule, new Set(["d1", "d3"]));
    expect(p).toEqual({ done: 2, total: 4, fraction: 0.5 });
  });

  it("is 0 when nothing is completed", () => {
    expect(programProgress(schedule, new Set())).toEqual({
      done: 0,
      total: 4,
      fraction: 0,
    });
  });

  it("reaches 100% when every day is done", () => {
    const p = programProgress(schedule, new Set(["d1", "d2", "d3", "d4"]));
    expect(p).toEqual({ done: 4, total: 4, fraction: 1 });
  });

  it("ignores completed ids that aren't part of this program", () => {
    // Idempotence/foreign ids: a day logged for another program never inflates
    // this program's progress, and a day counts at most once.
    const p = programProgress(schedule, new Set(["d1", "d1", "other-program-day"]));
    expect(p.done).toBe(1);
    expect(p.total).toBe(4);
  });

  it("handles an empty schedule without dividing by zero", () => {
    expect(programProgress({ schedule: [] }, new Set(["x"]))).toEqual({
      done: 0,
      total: 0,
      fraction: 0,
    });
  });
});
