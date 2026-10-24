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
  trainingPaces,
  daysUntil,
  buildIntervalSegments,
  weeklyLoadWarning,
  shoeWearAlert,
  recommendPlanSlug,
  goalKindDistanceM,
  MIN_PACE_S_PER_KM,
  MAX_PACE_S_PER_KM,
  SHOE_WEAR_ALERT_M,
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

describe("training paces (estimation)", () => {
  it("derives ordered zones from a recent race", () => {
    // 5 km in 25:00 -> 5k pace 300 s/km; zones are multiples of that.
    const tp = trainingPaces(5000, 1500);
    expect(tp).not.toBeNull();
    expect(tp!.fiveKPaceSPerKm).toBe(300);
    // Easy is slower than tempo, which is slower than interval/repetition.
    expect(tp!.zones.easy.slowSPerKm).toBeGreaterThan(tp!.zones.tempo.slowSPerKm);
    expect(tp!.zones.tempo.slowSPerKm).toBeGreaterThan(tp!.zones.interval.slowSPerKm);
    expect(tp!.zones.interval.fastSPerKm).toBeGreaterThan(tp!.zones.repetition.fastSPerKm);
    // Each range is slow >= fast (slower number is the larger sec/km).
    expect(tp!.zones.easy.slowSPerKm).toBeGreaterThanOrEqual(tp!.zones.easy.fastSPerKm);
  });
  it("returns null for invalid inputs", () => {
    expect(trainingPaces(0, 1500)).toBeNull();
    expect(trainingPaces(5000, 0)).toBeNull();
    expect(trainingPaces(NaN, 1500)).toBeNull();
  });
});

describe("race countdown", () => {
  it("counts whole days between dates", () => {
    expect(daysUntil("2026-10-24", "2026-10-31")).toBe(7);
    expect(daysUntil("2026-10-24", "2026-10-24")).toBe(0);
  });
  it("is negative once the race has passed", () => {
    expect(daysUntil("2026-10-31", "2026-10-24")).toBe(-7);
  });
  it("is null for an unparseable date", () => {
    expect(daysUntil("nope", "2026-10-24")).toBeNull();
  });
});

describe("interval builder", () => {
  it("builds warmup, reps with recovery between, cooldown (duration mode)", () => {
    const segs = buildIntervalSegments({
      reps: 3, mode: "duration", runSeconds: 60, recoverySeconds: 90,
      warmupSeconds: 300, cooldownSeconds: 300,
    });
    // warmup, run, walk, run, walk, run, cooldown = 7 segments (no trailing walk).
    expect(segs.map((s) => s.kind)).toEqual([
      "warmup", "run", "walk", "run", "walk", "run", "cooldown",
    ]);
    expect(segs.filter((s) => s.kind === "run")).toHaveLength(3);
  });
  it("converts a distance rep to seconds with pace", () => {
    // 400 m at 300 s/km = 120 s per rep.
    const segs = buildIntervalSegments({
      reps: 2, mode: "distance", runDistanceM: 400, paceSPerKm: 300, recoverySeconds: 60,
    });
    expect(segs.filter((s) => s.kind === "run").every((s) => s.seconds === 120)).toBe(true);
  });
  it("rejects distance mode without a pace, and out-of-range reps", () => {
    expect(buildIntervalSegments({ reps: 2, mode: "distance", runDistanceM: 400, recoverySeconds: 60 })).toEqual([]);
    expect(buildIntervalSegments({ reps: 0, mode: "duration", runSeconds: 60, recoverySeconds: 60 })).toEqual([]);
    expect(buildIntervalSegments({ reps: 99, mode: "duration", runSeconds: 60, recoverySeconds: 60 })).toEqual([]);
  });
});

describe("weekly load warning (10% rule)", () => {
  it("flags growth over 10%", () => {
    expect(weeklyLoadWarning(22000, 20000)).toEqual({ ratio: 1.1, over: false });
    expect(weeklyLoadWarning(23000, 20000)!.over).toBe(true);
    expect(weeklyLoadWarning(18000, 20000)!.over).toBe(false);
  });
  it("has no baseline when last week is zero", () => {
    expect(weeklyLoadWarning(10000, 0)).toBeNull();
  });
});

describe("shoe wear alert (700 km)", () => {
  it("alerts at or beyond the threshold", () => {
    expect(shoeWearAlert(SHOE_WEAR_ALERT_M)).toBe(true);
    expect(shoeWearAlert(SHOE_WEAR_ALERT_M + 1)).toBe(true);
    expect(shoeWearAlert(SHOE_WEAR_ALERT_M - 1)).toBe(false);
    expect(shoeWearAlert(0)).toBe(false);
  });
});

describe("plan recommendation", () => {
  it("sends a complete beginner aiming at 5k to the 8-week plan", () => {
    expect(recommendPlanSlug("new", "5k")).toBe("c5k-8");
  });
  it("sends an experienced runner aiming at 5k to the faster plan", () => {
    expect(recommendPlanSlug("5k", "5k")).toBe("c5k-faster-6");
    expect(recommendPlanSlug("10k", "5k")).toBe("c5k-faster-6");
  });
  it("maps 10k and half to their plans", () => {
    expect(recommendPlanSlug("5k", "10k")).toBe("c10k-10");
    expect(recommendPlanSlug("10k", "half")).toBe("half-12");
  });
  it("recommends no plan for free running", () => {
    expect(recommendPlanSlug("new", "free")).toBeNull();
  });
  it("maps goal kinds to distances", () => {
    expect(goalKindDistanceM("5k")).toBe(5000);
    expect(goalKindDistanceM("10k")).toBe(10000);
    expect(goalKindDistanceM("half")).toBe(21097);
    expect(goalKindDistanceM("free")).toBeNull();
  });
});
