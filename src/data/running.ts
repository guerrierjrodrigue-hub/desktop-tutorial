/**
 * Demo running data used when Supabase is not configured (and in E2E). Loaded
 * from run-plans.json (the same bilingual content that seeds the database) and
 * localized at request time, so demo and production render identically.
 */
import plansJson from "@/data/run-plans.json";
import type { LocaleCode } from "@/i18n/locales";
import type { Run, RunPlan, RunPlanSession, RunSegment, RunWeek } from "@/types";

interface Bi { fr: string; en: string }
interface RawSession { dayInWeek: number; type: string; title: Bi; instructions: Bi; segments: RunSegment[] }
interface RawWeek { week: number; verseRef: Bi; verseText: Bi; prayer: Bi; sessions: RawSession[] }
interface RawPlan { slug: string; title: Bi; description: Bi; goalDistanceM: number; weeks: RawWeek[] }

const raw = plansJson as { plans: RawPlan[] };
const pick = (b: Bi, locale: LocaleCode) => (locale === "fr" ? b.fr : b.en);

/** The two demo plans, localized. */
export function demoRunPlans(locale: LocaleCode): RunPlan[] {
  return raw.plans.map((p): RunPlan => ({
    id: p.slug,
    slug: p.slug,
    title: pick(p.title, locale),
    description: pick(p.description, locale),
    weeks: p.weeks.length,
    goalDistanceM: p.goalDistanceM,
    weekMeta: p.weeks.map((w): RunWeek => ({
      week: w.week,
      verseRef: pick(w.verseRef, locale),
      verseText: pick(w.verseText, locale),
      prayer: pick(w.prayer, locale),
      sessions: w.sessions.map((s): RunPlanSession => ({
        id: `${p.slug}-w${w.week}-d${s.dayInWeek}`,
        planId: p.slug,
        week: w.week,
        dayInWeek: s.dayInWeek,
        title: pick(s.title, locale),
        instructions: pick(s.instructions, locale),
        segments: s.segments,
      })),
    })),
  }));
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** A few demo runs over the last few weeks (for the /course list and stats). */
export const demoRuns: Run[] = [
  { id: "demo-run-1", ranOn: daysAgo(1), distanceM: 5200, durationS: 1830, paceSPerKm: Math.round((1830 * 1000) / 5200), kind: "easy", effort: 6, source: "manual" },
  { id: "demo-run-2", ranOn: daysAgo(3), distanceM: 3000, durationS: 1020, paceSPerKm: 340, kind: "tempo", effort: 7, source: "manual" },
  { id: "demo-run-3", ranOn: daysAgo(6), distanceM: 8000, durationS: 2880, paceSPerKm: 360, kind: "long", effort: 7, source: "manual" },
  { id: "demo-run-4", ranOn: daysAgo(9), distanceM: 5000, durationS: 1740, paceSPerKm: 348, kind: "easy", effort: 5, source: "manual" },
  { id: "demo-run-5", ranOn: daysAgo(12), distanceM: 10200, durationS: 3600, paceSPerKm: Math.round((3600 * 1000) / 10200), kind: "race", effort: 9, source: "manual" },
];
