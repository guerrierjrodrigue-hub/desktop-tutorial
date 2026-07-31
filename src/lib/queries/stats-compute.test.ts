import { describe, it, expect } from "vitest";
import { composeTodayStats, BLANK_STATS } from "./stats-compute";

describe("composeTodayStats", () => {
  it("derives everything from logs when there is no daily_stats row", () => {
    const stats = composeTodayStats(null, 50, 45);
    expect(stats).toEqual({
      caloriesBurned: 45 * 8, // estimated from active minutes
      caloriesGoal: BLANK_STATS.caloriesGoal,
      activeMinutes: 45,
      activeMinutesGoal: BLANK_STATS.activeMinutesGoal,
      proteinG: 50,
      waterMl: 0,
      waterGoalMl: BLANK_STATS.waterGoalMl,
    });
  });

  it("takes goals, water, and stored calories from the row when present", () => {
    const stats = composeTodayStats(
      {
        calories_burned: 500,
        calories_goal: 700,
        active_minutes_goal: 60,
        protein_g: 10,
        water_ml: 1500,
        water_goal_ml: 2500,
      },
      0, // no food logged today
      20,
    );
    expect(stats.caloriesBurned).toBe(500); // row value wins over the estimate
    expect(stats.caloriesGoal).toBe(700);
    expect(stats.activeMinutes).toBe(20);
    expect(stats.activeMinutesGoal).toBe(60);
    expect(stats.proteinG).toBe(10); // falls back to the row when sum is 0
    expect(stats.waterMl).toBe(1500);
    expect(stats.waterGoalMl).toBe(2500);
  });

  it("prefers the live food-log protein sum over the stored row value", () => {
    const stats = composeTodayStats({ protein_g: 10, water_ml: 1000 }, 80, 0);
    expect(stats.proteinG).toBe(80);
    expect(stats.caloriesBurned).toBe(0); // 0 active minutes, no stored value
    expect(stats.waterMl).toBe(1000);
    expect(stats.waterGoalMl).toBe(BLANK_STATS.waterGoalMl);
  });

  it("estimates calories when the row has none", () => {
    const stats = composeTodayStats({ calories_burned: 0 }, 0, 30);
    expect(stats.caloriesBurned).toBe(240);
  });
});
