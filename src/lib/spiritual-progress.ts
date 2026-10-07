import type { LocaleCode } from "@/i18n/locales";
import type { MemoryVerse, ReadingPlan } from "@/types";
import type { MemoryVerseSeed } from "@/data/spiritual";

/** A reading_plans row joined with (optional) per-user reading_progress. */
export interface ReadingPlanRow {
  id: string;
  title: string;
  description: string;
  total_days: number;
}
export interface ReadingProgressRow {
  reading_plan_id: string;
  completed_days: number;
}

/**
 * Merge the shared reading-plan catalog with a user's own progress rows.
 * A plan with no progress row is 0 days done — so a brand-new user sees 0/N.
 * Pure (no Supabase), so it can be unit-tested.
 */
export function mergeReadingProgress(
  plans: ReadingPlanRow[],
  progress: ReadingProgressRow[],
): ReadingPlan[] {
  const done = new Map(progress.map((p) => [p.reading_plan_id, p.completed_days]));
  return plans.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    totalDays: p.total_days,
    completedDays: Math.min(done.get(p.id) ?? 0, p.total_days),
  }));
}

/** Pick a memory verse's reference + text for the active locale. */
export function localizeVerse(
  seed: MemoryVerseSeed,
  locale: LocaleCode,
): Omit<MemoryVerse, "mastery"> {
  const t = locale === "fr" ? seed.fr : seed.en;
  return { key: seed.key, reference: t.reference, text: t.text };
}

/**
 * Resolve the curated memory verses for display: localized text + each user's
 * own mastery (0 when they have no progress row for that verse yet).
 * Pure, so it can be unit-tested.
 */
export function resolveMemoryVerses(
  seeds: MemoryVerseSeed[],
  progress: { verse_key: string; mastery: number }[],
  locale: LocaleCode,
): MemoryVerse[] {
  const mastery = new Map(progress.map((p) => [p.verse_key, Number(p.mastery)]));
  return seeds.map((seed) => ({
    ...localizeVerse(seed, locale),
    mastery: mastery.get(seed.key) ?? 0,
  }));
}
