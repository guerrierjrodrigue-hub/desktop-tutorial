import { describe, it, expect } from "vitest";
import { computeNutritionTargets, DEFAULT_TARGETS } from "./nutrition-targets";

const NOW = new Date("2026-01-01T12:00:00Z");

describe("computeNutritionTargets", () => {
  it("returns marked defaults when inputs are missing", () => {
    expect(computeNutritionTargets({}, NOW)).toEqual(DEFAULT_TARGETS);
    expect(computeNutritionTargets({ weightKg: 80 }, NOW).isDefault).toBe(true);
  });

  it("computes a real estimate from full inputs", () => {
    const t = computeNutritionTargets(
      { weightKg: 80, heightCm: 180, birthDate: "1996-01-01", gender: "male", trainingDays: 4 },
      NOW,
    );
    expect(t.isDefault).toBe(false);
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780; TDEE = 1780*1.55 ≈ 2759 → 2760
    expect(t.calories).toBe(2760);
    expect(t.proteinG).toBe(128); // 1.6 * 80
    expect(t.waterMl).toBe(2800); // 80 * 35
    expect(t.carbsG).toBeGreaterThan(0);
  });

  it("applies a mild (never aggressive) deficit for weight loss", () => {
    const base = computeNutritionTargets(
      { weightKg: 80, heightCm: 180, birthDate: "1996-01-01", gender: "male", trainingDays: 4 },
      NOW,
    );
    const cut = computeNutritionTargets(
      {
        weightKg: 80,
        heightCm: 180,
        birthDate: "1996-01-01",
        gender: "male",
        trainingDays: 4,
        goals: ["lose-weight"],
      },
      NOW,
    );
    expect(cut.calories).toBeLessThan(base.calories);
    // Deficit capped at 15%.
    expect(cut.calories).toBeGreaterThanOrEqual(Math.round(base.calories * 0.85) - 10);
  });

  it("raises protein and calories for muscle gain", () => {
    const t = computeNutritionTargets(
      {
        weightKg: 80,
        heightCm: 180,
        birthDate: "1996-01-01",
        gender: "male",
        trainingDays: 4,
        goals: ["build-muscle"],
      },
      NOW,
    );
    expect(t.proteinG).toBe(160); // 2.0 * 80
  });
});
