import { describe, it, expect } from "vitest";
import {
  cn,
  formatDuration,
  clamp,
  xpForLevel,
  levelFromXp,
  safeRedirectPath,
} from "./utils";

describe("cn", () => {
  it("merges and dedupes conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});

describe("formatDuration", () => {
  it("formats sub-hour durations in minutes", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(5)).toBe("5m");
  });
  it("formats whole hours without minutes", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(120)).toBe("2h");
  });
  it("formats mixed hours and minutes", () => {
    expect(formatDuration(95)).toBe("1h 35m");
  });
});

describe("clamp", () => {
  it("clamps below, within, and above the range", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(2, 0, 1)).toBe(1);
  });
});

describe("xp progression", () => {
  it("is monotonically increasing per level", () => {
    for (let l = 1; l < 20; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });

  it("derives the correct level and bounded progress from total xp", () => {
    const { level, progress } = levelFromXp(0);
    expect(level).toBe(1);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it("keeps progress within [0,1] across a wide xp range", () => {
    for (const xp of [0, 100, 500, 4820, 25000, 100000]) {
      const { progress, level } = levelFromXp(xp);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
      expect(level).toBeGreaterThanOrEqual(1);
    }
  });

  it("advances a level once the next threshold is crossed", () => {
    const threshold = xpForLevel(3);
    expect(levelFromXp(threshold).level).toBe(3);
    expect(levelFromXp(threshold - 1).level).toBe(2);
  });
});

describe("safeRedirectPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/reset-password")).toBe("/reset-password");
  });

  it("rejects absolute, protocol-relative and malformed targets", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("@evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("relative-no-slash")).toBe("/dashboard");
  });

  it("falls back on empty input", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
    expect(safeRedirectPath(null, "/login")).toBe("/login");
  });
});
