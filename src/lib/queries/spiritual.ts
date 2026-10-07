import { getAuthedContext } from "@/lib/supabase/auth";
import {
  prayerRequests as mockPrayers,
  readingPlans as mockReadingPlans,
  memoryVerseSeeds,
} from "@/data/spiritual";
import {
  mergeReadingProgress,
  resolveMemoryVerses,
  localizeVerse,
  type ReadingPlanRow,
  type ReadingProgressRow,
} from "@/lib/spiritual-progress";
import type { MemoryVerse, PrayerRequest, ReadingPlan } from "@/types";
import type { PrayerRequestRow } from "@/types/database";
import type { LocaleCode } from "@/i18n/locales";

function mapPrayer(row: PrayerRequestRow): PrayerRequest {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    answered: row.answered,
    createdAt: row.created_at,
  };
}

/** The signed-in user's prayer requests (demo data when unconfigured). */
export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockPrayers;

  const { data } = await ctx.supabase
    .from("prayer_requests")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  return data ? data.map(mapPrayer) : mockPrayers;
}

/**
 * Reading plans with the signed-in user's REAL progress (0 days for a new user).
 * Demo data (with its illustrative progress) is used only when Supabase isn't
 * configured.
 */
export async function getReadingPlans(): Promise<ReadingPlan[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockReadingPlans;

  const [plansRes, progressRes] = await Promise.all([
    ctx.supabase
      .from("reading_plans")
      .select("id, title, description, total_days")
      .order("total_days", { ascending: true }),
    ctx.supabase
      .from("reading_progress")
      .select("reading_plan_id, completed_days")
      .eq("user_id", ctx.userId),
  ]);

  const plans = (plansRes.data ?? []) as ReadingPlanRow[];
  if (plans.length === 0) return mockReadingPlans;
  return mergeReadingProgress(plans, (progressRes.data ?? []) as ReadingProgressRow[]);
}

/**
 * Curated memory verses, localized (LSG in French), with the signed-in user's
 * own mastery (0% for a new user). Demo mastery only when Supabase isn't
 * configured.
 */
export async function getMemoryVerses(locale: LocaleCode): Promise<MemoryVerse[]> {
  const ctx = await getAuthedContext();
  if (!ctx) {
    return memoryVerseSeeds.map((seed) => ({
      ...localizeVerse(seed, locale),
      mastery: seed.demoMastery,
    }));
  }

  const { data } = await ctx.supabase
    .from("memory_verse_progress")
    .select("verse_key, mastery")
    .eq("user_id", ctx.userId);

  return resolveMemoryVerses(
    memoryVerseSeeds,
    (data ?? []) as { verse_key: string; mastery: number }[],
    locale,
  );
}
