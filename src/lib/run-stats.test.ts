import { describe, it, expect } from "vitest";
import { isoWeekStart, weekStats, weeklyDistances, records } from "@/lib/run-stats";
import type { Run } from "@/types";

const mk = (ranOn: string, distanceM: number, paceSPerKm: number): Run => ({
  id: ranOn + distanceM,
  ranOn,
  distanceM,
  durationS: Math.round((paceSPerKm * distanceM) / 1000),
  paceSPerKm,
  kind: "easy",
  source: "manual",
});

describe("isoWeekStart", () => {
  it("returns the Monday of the week", () => {
    // 2026-10-21 is a Wednesday -> Monday 2026-10-19.
    expect(isoWeekStart("2026-10-21")).toBe("2026-10-19");
    // A Monday maps to itself.
    expect(isoWeekStart("2026-10-19")).toBe("2026-10-19");
    // A Sunday maps back to that week's Monday.
    expect(isoWeekStart("2026-10-25")).toBe("2026-10-19");
  });
});

describe("weekStats", () => {
  const today = "2026-10-21"; // week of Mon 2026-10-19
  const runs: Run[] = [
    mk("2026-10-20", 5000, 360), // this week
    mk("2026-10-21", 8000, 360), // this week (longest)
    mk("2026-10-13", 10000, 360), // last week -> excluded
  ];
  it("sums only the current ISO week", () => {
    const s = weekStats(runs, today);
    expect(s.runs).toBe(2);
    expect(s.distanceM).toBe(13000);
    expect(s.longestM).toBe(8000);
  });
  it("is empty when there are no runs this week", () => {
    expect(weekStats([mk("2026-10-13", 5000, 360)], today)).toEqual({
      distanceM: 0, runs: 0, longestM: 0,
    });
  });
});

describe("weeklyDistances", () => {
  it("returns 8 weeks oldest-first, summed per week", () => {
    const today = "2026-10-21";
    const series = weeklyDistances([mk("2026-10-20", 5000, 360), mk("2026-10-21", 3000, 360)], today, 8);
    expect(series).toHaveLength(8);
    // The last bucket is the current week with both runs.
    expect(series[7].weekStart).toBe("2026-10-19");
    expect(series[7].distanceM).toBe(8000);
    // Earlier buckets are empty.
    expect(series[0].distanceM).toBe(0);
  });
});

describe("records", () => {
  it("reports best-pace-scaled PRs at 1/5/10 km", () => {
    const runs: Run[] = [
      mk("2026-10-20", 5000, 360), // 6:00/km
      mk("2026-10-18", 10000, 330), // 5:30/km (best pace, eligible for 1/5/10k)
      mk("2026-10-10", 2000, 300), // 5:00/km but only 2 km (eligible for 1k only)
    ];
    const r = records(runs);
    // 1 km best pace = 300 -> 300 s.
    expect(r.oneK).toBe(300);
    // 5 km: eligible are the 5k and 10k runs; best pace 330 -> 330*5 = 1650 s.
    expect(r.fiveK).toBe(1650);
    // 10 km: only the 10k run; 330*10 = 3300 s.
    expect(r.tenK).toBe(3300);
  });
  it("is undefined where no run covers the distance", () => {
    expect(records([mk("2026-10-20", 800, 360)])).toEqual({
      oneK: undefined, fiveK: undefined, tenK: undefined,
    });
  });
});
