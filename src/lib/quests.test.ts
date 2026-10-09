import { describe, it, expect } from "vitest";
import { getDailyQuests, getTransformationScore } from "./quests";
import type { Habit } from "@/types";

const habits: Habit[] = [
  { id: "h1", label: "Morning prayer", icon: "Sunrise", done: true, streak: 26 },
  { id: "h2", label: "Read Scripture", icon: "BookOpen", done: true, streak: 26 },
  { id: "h3", label: "Complete workout", icon: "Dumbbell", done: false, streak: 12 },
  { id: "h4", label: "Drink water", icon: "Droplets", done: false, streak: 8 },
  { id: "h5", label: "Gratitude journal", icon: "Heart", done: true, streak: 19 },
];

describe("getDailyQuests", () => {
  it("returns exactly 3 quests", () => {
    expect(getDailyQuests(habits, false, false)).toHaveLength(3);
  });

  it("marks the habits quest done once the (capped at 3) target is met", () => {
    // 3 of 5 habits done here, target is min(3, 5) = 3.
    const [habitsQuest] = getDailyQuests(habits, false, false);
    expect(habitsQuest.done).toBe(true);
  });

  it("does not mark the habits quest done below the target", () => {
    const under: Habit[] = habits.map((h, i) => ({ ...h, done: i === 0 }));
    const [habitsQuest] = getDailyQuests(under, false, false);
    expect(habitsQuest.done).toBe(false);
  });

  it("uses the workout quest on a training day", () => {
    const quests = getDailyQuests(habits, true, false, { isRestDay: false });
    const training = quests[1];
    expect(training.id).toBe("workout");
    expect(training.done).toBe(true);
  });

  it("swaps in a recovery quest on a rest day", () => {
    const quests = getDailyQuests(habits, false, false, {
      isRestDay: true,
      recoveryDoneToday: false,
    });
    const training = quests[1];
    expect(training.id).toBe("recovery");
    expect(training.done).toBe(false);
    // no "workout" quest on a rest day
    expect(quests.some((q) => q.id === "workout")).toBe(false);
  });

  it("marks the recovery quest done when recovery happened", () => {
    const quests = getDailyQuests(habits, false, false, {
      isRestDay: true,
      recoveryDoneToday: true,
    });
    expect(quests[1].id).toBe("recovery");
    expect(quests[1].done).toBe(true);
  });

  it("marks the workout and devotional quests from the flags passed in", () => {
    const quests = getDailyQuests(habits, true, false);
    expect(quests.find((q) => q.id === "workout")!.done).toBe(true);
    expect(quests.find((q) => q.id === "devotional")!.done).toBe(false);
  });
});

describe("getTransformationScore", () => {
  it("returns a 0-100 score with a tier label", () => {
    const { score, tier } = getTransformationScore({ xp: 0, streak: 0 }, []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(tier).toBe("Building Momentum");
  });

  it("scores highly for a long streak, high xp, and all habits done", () => {
    const { score, tier } = getTransformationScore({ xp: 100000, streak: 60 }, [
      { id: "h1", label: "x", icon: "Check", done: true, streak: 60 },
    ]);
    // Streak (capped) + habit ratio alone guarantee at least 0.7 of the score;
    // the exact tier boundary depends on where xp falls within its level curve.
    expect(score).toBeGreaterThanOrEqual(70);
    expect(["Disciplined", "Transformed"]).toContain(tier);
  });
});
