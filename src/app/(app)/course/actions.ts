"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { getUserToday, startOfLocalDayUTC } from "@/lib/date";
import { getUserTimezone } from "@/lib/timezone";
import { XP_REWARDS } from "@/lib/gamification";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";
import {
  validateRun, validateRunDate, runEarnsXp, paceSecPerKm, MAX_RUNS_PER_DAY, goalKindDistanceM,
} from "@/lib/running";
import { parseGpx, MAX_GPX_BYTES } from "@/lib/gpx";

const runSchema = z.object({
  ranOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "course.error.generic"),
  distanceM: z.number().int().positive("course.error.distance").max(100000, "course.error.tooFar"),
  durationS: z.number().int().positive("course.error.duration"),
  kind: z.enum(["easy", "tempo", "intervals", "long", "race"]),
  effort: z.number().int().min(1).max(10).optional(),
  note: z.string().trim().max(500, "errors.tooLong").optional(),
  source: z.enum(["manual", "chrono"]).default("manual"),
  planSessionId: z.string().uuid().optional(),
  shoeId: z.string().uuid().optional(),
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
  shoeId?: string;
}): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(runSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  // Pace / distance plausibility (seconds-per-km band, max distance).
  const limit = validateRun(data.distanceM, data.durationS);
  if (!limit.ok) return { ok: false, error: limit.error };

  // The run's date: not in the future, not more than 30 days old.
  const tz = await getUserTimezone();
  const today = getUserToday(tz);
  const dateCheck = validateRunDate(data.ranOn, today);
  if (!dateCheck.ok) return { ok: false, error: dateCheck.error };

  // At most five runs CREATED per local calendar day (back-dating can't bypass).
  const { count } = await ctx.supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .gte("created_at", startOfLocalDayUTC(tz));
  if ((count ?? 0) >= MAX_RUNS_PER_DAY) return { ok: false, error: "course.error.tooMany" };

  // Only link a shoe the user actually owns (ignore a stale/foreign id).
  let shoeId: string | null = null;
  if (data.shoeId) {
    const { data: shoe } = await ctx.supabase
      .from("run_shoes")
      .select("id")
      .eq("id", data.shoeId)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    shoeId = shoe ? data.shoeId : null;
  }

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
      shoe_id: shoeId,
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

  revalidatePath("/course");
  revalidatePath("/dashboard");
  // XP is awarded server-side by the ka_xp_run trigger only for a genuine run
  // (>= 10 min and >= 1 km) dated today or yesterday, at most once per day;
  // mirror that gate here so the "+XP" toast matches what the trigger granted.
  const earnsXp = runEarnsXp(data.distanceM, data.durationS, data.ranOn, today);
  return { ok: true, id: (inserted as { id: string }).id, xp: earnsXp ? XP_REWARDS.workout : undefined };
}

const updateRunSchema = z.object({
  id: z.string().uuid("errors.invalidId"),
  ranOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "course.error.generic").optional(),
  distanceM: z.number().int().positive("course.error.distance").max(100000, "course.error.tooFar"),
  durationS: z.number().int().positive("course.error.duration"),
  kind: z.enum(["easy", "tempo", "intervals", "long", "race"]),
  effort: z.number().int().min(1).max(10).optional(),
  note: z.string().trim().max(500, "errors.tooLong").optional(),
});

/**
 * Edit one of the signed-in user's runs, with the same plausibility and date
 * limits as a new entry. Editing never grants XP (the ka_xp_run trigger fires on
 * insert only), so moving a run's date into the past cannot create a reward.
 */
export async function updateRun(input: {
  id: string;
  ranOn?: string;
  distanceM: number;
  durationS: number;
  kind: "easy" | "tempo" | "intervals" | "long" | "race";
  effort?: number;
  note?: string;
}): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(updateRunSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  const limit = validateRun(data.distanceM, data.durationS);
  if (!limit.ok) return { ok: false, error: limit.error };

  // If the date is being changed, apply the same future / 30-day rules.
  if (data.ranOn) {
    const today = getUserToday(await getUserTimezone());
    const dateCheck = validateRunDate(data.ranOn, today);
    if (!dateCheck.ok) return { ok: false, error: dateCheck.error };
  }

  const patch: Record<string, unknown> = {
    distance_m: data.distanceM,
    duration_s: data.durationS,
    kind: data.kind,
    effort: data.effort ?? null,
    note: data.note ?? null,
  };
  if (data.ranOn) patch.ran_on = data.ranOn;

  const { data: rows, error } = await ctx.supabase
    .from("runs")
    .update(patch)
    .eq("id", data.id)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return logAndFail(error);
  if (!rows || rows.length === 0) return { ok: false, error: "errors.writeNoRows" };

  revalidatePath("/course");
  return { ok: true };
}

/**
 * Delete one of the signed-in user's runs. A DB trigger (ka_unaward_run_xp)
 * takes back the day's run XP when the removed run was its only qualifying one.
 */
export async function deleteRun(id: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(z.string().uuid("errors.invalidId"), id);
  if (!check.ok) return check.result;

  const { data: rows, error } = await ctx.supabase
    .from("runs")
    .delete()
    .eq("id", check.data)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return logAndFail(error);
  if (!rows || rows.length === 0) return { ok: false, error: "errors.writeNoRows" };

  revalidatePath("/course");
  revalidatePath("/dashboard");
  return { ok: true };
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

const runnerProfileSchema = z.object({
  level: z.enum(["new", "5k", "10k"]),
  goalKind: z.enum(["5k", "10k", "half", "free"]),
});

/**
 * Save the runner onboarding answers (profiles.run_level + run_goal_kind) and,
 * for a concrete distance goal, upsert the matching run goal. "Free" keeps no
 * goal. Used by the first-visit questions and the "change later" control.
 */
export async function setRunnerProfile(input: {
  level: "new" | "5k" | "10k";
  goalKind: "5k" | "10k" | "half" | "free";
}): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(runnerProfileSchema, input);
  if (!check.ok) return check.result;
  const { level, goalKind } = check.data;

  const { error: pErr } = await ctx.supabase
    .from("profiles")
    .update({ run_level: level, run_goal_kind: goalKind })
    .eq("id", ctx.userId);
  if (pErr) return logAndFail(pErr);

  const targetM = goalKindDistanceM(goalKind);
  if (targetM) {
    const { data: existing } = await ctx.supabase
      .from("run_goals")
      .select("id")
      .eq("user_id", ctx.userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const payload = { target_distance_m: targetM, updated_at: new Date().toISOString() };
    if (existing) {
      await ctx.supabase
        .from("run_goals")
        .update(payload)
        .eq("id", (existing as { id: string }).id)
        .eq("user_id", ctx.userId);
    } else {
      await ctx.supabase.from("run_goals").insert({ user_id: ctx.userId, ...payload });
    }
  }

  revalidatePath("/course");
  revalidatePath("/dashboard");
  return { ok: true };
}

const shoeSchema = z.object({
  name: z.string().trim().min(1, "course.error.generic").max(60, "errors.tooLong"),
  initialKm: z.number().min(0).max(5000).optional(),
});

/** Add a shoe pair, with optional kilometres already on it (a wear baseline). */
export async function createShoe(input: { name: string; initialKm?: number }): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(shoeSchema, input);
  if (!check.ok) return check.result;
  const { name, initialKm } = check.data;

  const { data: inserted, error } = await ctx.supabase
    .from("run_shoes")
    .insert({
      user_id: ctx.userId,
      name,
      distance_m: Math.round((initialKm ?? 0) * 1000),
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

  revalidatePath("/course/outils");
  return { ok: true, id: (inserted as { id: string }).id };
}

/** Retire or un-retire a shoe pair the user owns. */
export async function setShoeRetired(id: string, retired: boolean): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(z.string().uuid("errors.invalidId"), id);
  if (!check.ok) return check.result;

  const { data: rows, error } = await ctx.supabase
    .from("run_shoes")
    .update({ retired })
    .eq("id", check.data)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return logAndFail(error);
  if (!rows || rows.length === 0) return { ok: false, error: "errors.writeNoRows" };

  revalidatePath("/course/outils");
  return { ok: true };
}

/** Delete a shoe pair the user owns (linked runs keep their history; shoe_id nulls). */
export async function deleteShoe(id: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(z.string().uuid("errors.invalidId"), id);
  if (!check.ok) return check.result;

  const { data: rows, error } = await ctx.supabase
    .from("run_shoes")
    .delete()
    .eq("id", check.data)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return logAndFail(error);
  if (!rows || rows.length === 0) return { ok: false, error: "errors.writeNoRows" };

  revalidatePath("/course/outils");
  return { ok: true };
}

const gpxContentSchema = z.string().min(1, "course.gpx.unreadable").max(MAX_GPX_BYTES, "course.gpx.tooBig");

interface GpxRun {
  distanceM: number;
  durationS: number;
  ranOn: string;
  paceSPerKm: number;
}

/**
 * Parse a GPX document and apply the same plausibility and date limits as a
 * manual entry. Returns the fields we would store, or a localized error code.
 * No track, route or elevation is ever kept. Shared by preview and import so
 * what the user confirms is exactly what gets saved.
 */
function readGpxRun(content: string, today: string): { ok: true; run: GpxRun } | { ok: false; error: string } {
  // Byte length, not character count, is what the 5 MB cap means.
  if (Buffer.byteLength(content, "utf8") > MAX_GPX_BYTES) return { ok: false, error: "course.gpx.tooBig" };

  const summary = parseGpx(content);
  if (summary.points === 0) return { ok: false, error: "course.gpx.noPoints" };
  const distanceM = Math.round(summary.distanceM);
  const durationS = Math.round(summary.durationS);
  if (distanceM <= 0 || durationS <= 0) return { ok: false, error: "course.gpx.noPoints" };

  const limit = validateRun(distanceM, durationS);
  if (!limit.ok) return { ok: false, error: limit.error ?? "course.gpx.unreadable" };

  // Use the file's date when present (within the 30-day window), else today.
  let ranOn = today;
  if (summary.date) {
    const dateCheck = validateRunDate(summary.date, today);
    if (!dateCheck.ok) return { ok: false, error: dateCheck.error ?? "course.error.tooOld" };
    ranOn = summary.date;
  }

  return { ok: true, run: { distanceM, durationS, ranOn, paceSPerKm: paceSecPerKm(distanceM, durationS) } };
}

export type GpxPreviewResult =
  | { ok: true; preview: GpxRun }
  | { ok: false; error: string };

/** Read a GPX file and return a preview (nothing is saved). */
export async function previewGpxRun(input: { content: string }): Promise<GpxPreviewResult> {
  const today = getUserToday(await getUserTimezone());
  // Demo mode still previews (parse only); it just never writes on save.
  const content = (await getAuthedContext()) ? input.content : (input.content ?? "");
  if (typeof content !== "string" || content.length === 0 || content.length > MAX_GPX_BYTES) {
    return { ok: false, error: content && content.length > MAX_GPX_BYTES ? "course.gpx.tooBig" : "course.gpx.unreadable" };
  }
  const read = readGpxRun(content, today);
  return read.ok ? { ok: true, preview: read.run } : read;
}

const gpxImportSchema = z.object({
  content: gpxContentSchema,
  kind: z.enum(["easy", "tempo", "intervals", "long", "race"]).default("easy"),
});

/**
 * Save one run from a GPX file after the user has confirmed the preview. The
 * distance, duration and date are re-read server-side (authoritative); only
 * those three are stored, and the source is marked "import". Same date window,
 * plausibility limits and per-creation-day cap as a manual entry.
 */
export async function importGpxRun(input: { content: string; kind?: string }): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const check = validate(gpxImportSchema, input);
  if (!check.ok) return check.result;
  const data = check.data;

  const tz = await getUserTimezone();
  const today = getUserToday(tz);
  const read = readGpxRun(data.content, today);
  if (!read.ok) return { ok: false, error: read.error };
  const { distanceM, durationS, ranOn } = read.run;

  // At most five runs CREATED per local calendar day.
  const { count } = await ctx.supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .gte("created_at", startOfLocalDayUTC(tz));
  if ((count ?? 0) >= MAX_RUNS_PER_DAY) return { ok: false, error: "course.error.tooMany" };

  const { data: inserted, error } = await ctx.supabase
    .from("runs")
    .insert({
      user_id: ctx.userId,
      ran_on: ranOn,
      distance_m: distanceM,
      duration_s: durationS,
      kind: data.kind,
      source: "import",
    })
    .select("id")
    .single();
  if (error) return logAndFail(error);

  revalidatePath("/course");
  revalidatePath("/dashboard");
  const earnsXp = runEarnsXp(distanceM, durationS, ranOn, today);
  return { ok: true, id: (inserted as { id: string }).id, xp: earnsXp ? XP_REWARDS.workout : undefined };
}
