import { describe, it, expect } from "vitest";
import {
  paceSecPerKm,
  formatPace,
  formatDuration,
  formatKm,
  durationToSeconds,
  riegelPredict,
  validateRun,
  segmentsTotalSeconds,
  cleanSegments,
  MIN_PACE_S_PER_KM,
  MAX_PACE_S_PER_KM,
} from "@/lib/running";

describe("pace", () => {
  it("computes seconds per km", () => {
    // 5 km in 30 min = 360 s/km (6:00/km).
    expect(paceSecPerKm(5000, 1800)).toBe(360);
    // 10 km in 50 min = 300 s/km (5:00/km).
    expect(paceSecPerKm(10000, 3000)).toBe(300);
  });
  it("is zero for degenerate inputs", () => {
    expect(paceSecPerKm(0, 1800)).toBe(0);
    expect(paceSecPerKm(5000, 0)).toBe(0);
  });
  it("formats pace as m:ss", () => {
    expect(formatPace(360)).toBe("6:00");
    expect(formatPace(305)).toBe("5:05");
    expect(formatPace(0)).toBe("0:00");
  });
});

describe("duration formatting", () => {
  it("shows m:ss under an hour", () => {
    expect(formatDuration(1800)).toBe("30:00");
    expect(formatDuration(65)).toBe("1:05");
  });
  it("shows h:mm:ss at or over an hour", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });
  it("parses h/m/s fields into seconds", () => {
    expect(durationToSeconds(0, 30, 0)).toBe(1800);
    expect(durationToSeconds(1, 1, 1)).toBe(3661);
    expect(durationToSeconds(NaN, 25, 30)).toBe(1530);
  });
});

describe("distance formatting", () => {
  it("renders metres as trimmed km", () => {
    expect(formatKm(5000)).toBe("5");
    expect(formatKm(5250)).toBe("5.25");
    expect(formatKm(10000)).toBe("10");
  });
});

describe("Riegel prediction (exponent 1.06)", () => {
  it("predicts a slower pace over a longer distance", () => {
    // 5 km in 25:00 -> 10 km predicted ~ 1500 * 2^1.06 = 3127 s.
    const t = riegelPredict(5000, 1500, 10000);
    expect(t).toBe(Math.round(1500 * Math.pow(2, 1.06)));
    expect(t).toBe(3127);
  });
  it("returns the same time for the same distance", () => {
    expect(riegelPredict(5000, 1500, 5000)).toBe(1500);
  });
  it("returns 0 for invalid inputs", () => {
    expect(riegelPredict(0, 1500, 10000)).toBe(0);
    expect(riegelPredict(5000, 0, 10000)).toBe(0);
    expect(riegelPredict(5000, 1500, 0)).toBe(0);
  });
});

describe("validateRun limits", () => {
  it("accepts a realistic run", () => {
    expect(validateRun(5000, 1800)).toEqual({ ok: true });
  });
  it("rejects zero or missing distance/duration", () => {
    expect(validateRun(0, 1800).error).toBe("course.error.distance");
    expect(validateRun(5000, 0).error).toBe("course.error.duration");
  });
  it("rejects more than 100 km in one entry", () => {
    expect(validateRun(100_001, 36000).error).toBe("course.error.tooFar");
  });
  it("rejects an impossible fast pace (< 2:30/km)", () => {
    // 10 km in 20 min = 120 s/km, below MIN_PACE_S_PER_KM.
    const v = validateRun(10000, 1200);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("course.error.pace");
    expect(paceSecPerKm(10000, 1200)).toBeLessThan(MIN_PACE_S_PER_KM);
  });
  it("rejects an impossibly slow pace (> 15:00/km)", () => {
    // 1 km in 20 min = 1200 s/km, above MAX_PACE_S_PER_KM.
    const v = validateRun(1000, 1200);
    expect(v.ok).toBe(false);
    expect(v.error).toBe("course.error.pace");
    expect(paceSecPerKm(1000, 1200)).toBeGreaterThan(MAX_PACE_S_PER_KM);
  });
  it("accepts the exact pace boundaries", () => {
    // 10 km at 2:30/km = 1500 s; 1 km at 15:00/km = 900 s.
    expect(validateRun(10000, MIN_PACE_S_PER_KM * 10)).toEqual({ ok: true });
    expect(validateRun(1000, MAX_PACE_S_PER_KM)).toEqual({ ok: true });
  });
});

describe("segments", () => {
  const segs = [
    { kind: "warmup" as const, seconds: 300 },
    { kind: "run" as const, seconds: 120 },
    { kind: "walk" as const, seconds: 0 },
    { kind: "cooldown" as const, seconds: 300 },
  ];
  it("totals ignoring zero-length segments", () => {
    expect(segmentsTotalSeconds(segs)).toBe(720);
  });
  it("drops zero-length segments", () => {
    expect(cleanSegments(segs)).toHaveLength(3);
  });
});
