"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";
import { validateRun, MAX_RUNS_PER_DAY } from "@/lib/running";

const runSchema = z.object({
  ranOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "course.error.generic"),
  distanceM: z.number().int().positive("course.error.distance").max(100000, "course.error.tooFar"),
  durationS: z.number().int().positive("course.error.duration"),
  kind: z.enum(["easy", "tempo", "intervals", "long", "race"]),
  effort: z.number().int().min(1).max(10).optional(),
  note: z.string().trim().max(500, "errors.tooLong").optional(),
  source: z.enum(["manual", "chrono"]).default("manual"),
  planSessionId: z.string().uuid().optional(),
});

/** Log a run for the signed-in user, enforcing the anti-cheat limits. */
export async function createRun(input: {
  ranOn: string;
  distanceM: number;
  durationS: number;
  kind: "easy" | "tempo" | "intervals" | "long" | "race";
  effort?: number;
  note?: string;
  source?: "manual" | "chrono";
  planSessionId?: string;
}): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(runSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  // Pace / distance plausibility (seconds-per-km band, max distance).
  const limit = validateRun(data.distanceM, data.durationS);
  if (!limit.ok) return { ok: false, error: limit.error };

  // The run's day must not be in the future (user's local calendar).
  const today = getUserToday(await getUserTimezone());
  if (data.ranOn > today) return { ok: false, error: "course.error.generic" };

  // At most five runs per day.
  const { count } = await ctx.supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("ran_on", data.ranOn);
  if ((count ?? 0) >= MAX_RUNS_PER_DAY) return { ok: false, error: "course.error.tooMany" };

  const { data: inserted, error } = await ctx.supabase
    .from("runs")
    .insert({
      user_id: ctx.userId,
      ran_on: data.ranOn,
      distance_m: data.distanceM,
      duration_s: data.durationS,
      kind: data.kind,
      effort: data.effort ?? null,
      note: data.note ?? null,
      source: data.source ?? "manual",
      plan_session_id: data.planSessionId ?? null,
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

  revalidatePath("/course");
  revalidatePath("/dashboard");
  // XP is awarded server-side by the ka_xp_run trigger only for a genuine run
  // (>= 10 min and >= 1 km) and at most once per day; mirror the gate here so
  // the "+XP" toast matches what the trigger actually granted.
  const earnsXp = data.durationS >= 600 && data.distanceM >= 1000;
  return { ok: true, id: (inserted as { id: string }).id, xp: earnsXp ? XP_REWARDS.workout : undefined };
}

const goalSchema = z.object({
  targetDistanceM: z.number().int().positive("course.error.distance").max(100000, "course.error.tooFar"),
  raceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  targetTimeS: z.number().int().positive().max(86400).optional(),
});

/** Create or update the user's single run goal. */
export async function setRunGoal(input: {
  targetDistanceM: number;
  raceDate?: string;
  targetTimeS?: number;
}): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(goalSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  const { data: existing } = await ctx.supabase
    .from("run_goals")
    .select("id")
    .eq("user_id", ctx.userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    target_distance_m: data.targetDistanceM,
    race_date: data.raceDate ?? null,
    target_time_s: data.targetTimeS ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await ctx.supabase
      .from("run_goals")
      .update(payload)
      .eq("id", (existing as { id: string }).id)
      .eq("user_id", ctx.userId);
    if (error) return logAndFail(error);
  } else {
    const { error } = await ctx.supabase
      .from("run_goals")
      .insert({ user_id: ctx.userId, ...payload });
    if (error) return logAndFail(error);
  }

  revalidatePath("/course");
  return { ok: true };
}
