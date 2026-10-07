import { describe, it, expect } from "vitest";
import {
  mergeReadingProgress,
  resolveMemoryVerses,
  localizeVerse,
} from "./spiritual-progress";
import { memoryVerseSeeds } from "@/data/spiritual";

const plans = [
  { id: "a", title: "Gospels", description: "", total_days: 30 },
  { id: "b", title: "Psalms", description: "", total_days: 31 },
];

describe("mergeReadingProgress", () => {
  it("shows 0 completed days for a brand-new user (no progress rows)", () => {
    const result = mergeReadingProgress(plans, []);
    expect(result.map((p) => p.completedDays)).toEqual([0, 0]);
    expect(result[0].totalDays).toBe(30);
  });

  it("uses the stored completed_days when a progress row exists", () => {
    const result = mergeReadingProgress(plans, [
      { reading_plan_id: "a", completed_days: 12 },
    ]);
    expect(result.find((p) => p.id === "a")?.completedDays).toBe(12);
    expect(result.find((p) => p.id === "b")?.completedDays).toBe(0);
  });

  it("never reports more completed days than the plan has", () => {
    const result = mergeReadingProgress(plans, [
      { reading_plan_id: "a", completed_days: 999 },
    ]);
    expect(result.find((p) => p.id === "a")?.completedDays).toBe(30);
  });
});

describe("resolveMemoryVerses", () => {
  it("gives a new user 0% mastery on every curated verse", () => {
    const result = resolveMemoryVerses(memoryVerseSeeds, [], "en");
    expect(result).toHaveLength(memoryVerseSeeds.length);
    expect(result.every((v) => v.mastery === 0)).toBe(true);
  });

  it("applies the user's stored mastery per verse key", () => {
    const result = resolveMemoryVerses(
      memoryVerseSeeds,
      [{ verse_key: "php-4-13", mastery: 0.5 }],
      "en",
    );
    expect(result.find((v) => v.key === "php-4-13")?.mastery).toBe(0.5);
    expect(result.find((v) => v.key === "isa-40-31")?.mastery).toBe(0);
  });

  it("renders French (LSG) text and references when locale is fr", () => {
    const fr = resolveMemoryVerses(memoryVerseSeeds, [], "fr");
    const php = fr.find((v) => v.key === "php-4-13");
    expect(php?.reference).toBe("Philippiens 4:13");
    expect(php?.text).toBe("Je puis tout par celui qui me fortifie.");
  });
});

describe("localizeVerse", () => {
  it("falls back to English for the en locale", () => {
    const seed = memoryVerseSeeds[0];
    expect(localizeVerse(seed, "en").reference).toBe(seed.en.reference);
  });
});
