import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/auth";
import { paceSecPerKm } from "@/lib/running";
import { demoRunPlans, demoRuns } from "@/data/running";
import type { LocaleCode } from "@/i18n/locales";
import type {
  Run, RunGoal, RunPlan, RunPlanSession, RunWeek,
} from "@/types";
import type {
  RunRow, RunPlanRow, RunPlanSessionRow, RunGoalRow,
} from "@/types/database";

const isFr = (locale: LocaleCode) => locale === "fr";

function mapRun(row: RunRow): Run {
  return {
    id: row.id,
    ranOn: row.ran_on,
    distanceM: row.distance_m,
    durationS: row.duration_s,
    paceSPerKm: row.pace_s_per_km,
    kind: row.kind,
    effort: row.effort ?? undefined,
    note: row.note ?? undefined,
    source: row.source,
    planSessionId: row.plan_session_id ?? undefined,
  };
}

function mapPlan(plan: RunPlanRow, sessions: RunPlanSessionRow[], locale: LocaleCode): RunPlan {
  const fr = isFr(locale);
  const byWeek = new Map<number, RunPlanSession[]>();
  for (const s of sessions) {
    const list = byWeek.get(s.week) ?? [];
    list.push({
      id: s.id,
      planId: plan.id,
      week: s.week,
      dayInWeek: s.day_in_week,
      title: (fr ? s.title_fr : s.title) ?? s.title,
      segments: Array.isArray(s.segments) ? s.segments : [],
    });
    byWeek.set(s.week, list);
  }
  const weekMeta: RunWeek[] = (plan.weeks_meta ?? []).map((m): RunWeek => ({
    week: m.week,
    verseRef: fr ? m.verse_ref : m.verse_ref_en,
    verseText: fr ? m.verse_text : m.verse_text_en,
    prayer: fr ? m.prayer : m.prayer_en,
    sessions: (byWeek.get(m.week) ?? []).sort((a, b) => a.dayInWeek - b.dayInWeek),
  }));
  return {
    id: plan.id,
    slug: plan.slug,
    title: (fr ? plan.title_fr : plan.title) ?? plan.title,
    description: (fr ? plan.description_fr : plan.description) ?? plan.description ?? "",
    weeks: plan.weeks,
    goalDistanceM: plan.goal_distance_m ?? undefined,
    weekMeta,
  };
}

/** All run plans (summary + weeks + sessions), localized. */
export const getRunPlans = cache(async function getRunPlans(locale: LocaleCode): Promise<RunPlan[]> {
  const user = await getSessionUser();
  if (!user) return demoRunPlans(locale);
  const supabase = await createSupabaseServerClient();
  const [{ data: plans }, { data: sessions }] = await Promise.all([
    supabase.from("run_plans").select("*").order("sort_order"),
    supabase.from("run_plan_sessions").select("*").order("sort_order"),
  ]);
  if (!plans) return [];
  const sessionRows = (sessions ?? []) as RunPlanSessionRow[];
  return (plans as RunPlanRow[]).map((p) =>
    mapPlan(p, sessionRows.filter((s) => s.plan_id === p.id), locale),
  );
});

/** One plan by slug. */
export async function getRunPlan(slug: string, locale: LocaleCode): Promise<RunPlan | null> {
  const plans = await getRunPlans(locale);
  return plans.find((p) => p.slug === slug) ?? null;
}

/** One session by id, with its plan's localized title (for the timer page). */
export async function getRunSession(
  id: string,
  locale: LocaleCode,
): Promise<{ session: RunPlanSession; planTitle: string; planSlug: string } | null> {
  const plans = await getRunPlans(locale);
  for (const plan of plans) {
    for (const week of plan.weekMeta) {
      const session = week.sessions.find((s) => s.id === id);
      if (session) return { session, planTitle: plan.title, planSlug: plan.slug };
    }
  }
  return null;
}

/** The signed-in user's recent runs (most recent first). Demo data otherwise. */
export const getRuns = cache(async function getRuns(limit = 60): Promise<Run[]> {
  const user = await getSessionUser();
  if (!user) return demoRuns;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("ran_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as RunRow[]).map(mapRun);
});

/** How many runs the user already logged for a given local date (anti-cheat). */
export async function countRunsOnDate(ranOn: string): Promise<number> {
  const user = await getSessionUser();
  if (!user) return 0;
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("ran_on", ranOn);
  return count ?? 0;
}

/** The user's current run goal, if any. */
export async function getRunGoal(): Promise<RunGoal | null> {
  const user = await getSessionUser();
  if (!user) return { id: "demo", targetDistanceM: 5000 };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("run_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const g = data as RunGoalRow;
  return {
    id: g.id,
    targetDistanceM: g.target_distance_m,
    raceDate: g.race_date ?? undefined,
    targetTimeS: g.target_time_s ?? undefined,
  };
}

export { paceSecPerKm };
export { isoWeekStart, weekStats, weeklyDistances, records } from "@/lib/run-stats";
