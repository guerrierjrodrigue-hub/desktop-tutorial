/**
 * Demo running data used when Supabase is not configured (and in E2E). Mirrors
 * the seeded plans (migration 0032) closely enough for every /course screen to
 * render, and is localized the same way the database content is.
 */
import type { LocaleCode } from "@/i18n/locales";
import type { Run, RunPlan, RunPlanSession, RunSegment, RunWeek } from "@/types";

const wu = (s: number): RunSegment => ({ kind: "warmup", seconds: s });
const cd = (s: number): RunSegment => ({ kind: "cooldown", seconds: s });
const run = (s: number): RunSegment => ({ kind: "run", seconds: s });
const walk = (s: number): RunSegment => ({ kind: "walk", seconds: s });
const rep = (n: number, arr: RunSegment[]): RunSegment[] =>
  Array.from({ length: n }, () => arr).flat();

type Bi = { fr: string; en: string };
const pick = (b: Bi, locale: LocaleCode) => (locale === "fr" ? b.fr : b.en);

const VERSES: { ref: Bi; text: Bi }[] = [
  { ref: { fr: "1 Corinthiens 9.24", en: "1 Corinthians 9:24" }, text: { fr: "Courez de maniere a remporter le prix.", en: "Run like that, that you may win." } },
  { ref: { fr: "Hebreux 12.1", en: "Hebrews 12:1" }, text: { fr: "Courons avec perseverance dans la carriere qui nous est ouverte.", en: "Let us run with perseverance the race set before us." } },
  { ref: { fr: "Esaie 40.31", en: "Isaiah 40:31" }, text: { fr: "Ils courent, et ne se lassent point; ils marchent, et ne se fatiguent point.", en: "They will run and not be weary; they will walk and not faint." } },
  { ref: { fr: "2 Timothee 4.7", en: "2 Timothy 4:7" }, text: { fr: "J'ai acheve la course, j'ai garde la foi.", en: "I have finished the course, I have kept the faith." } },
  { ref: { fr: "Philippiens 3.13-14", en: "Philippians 3:13-14" }, text: { fr: "Je cours vers le but, pour remporter le prix de la vocation celeste.", en: "I press on toward the goal for the prize of the high calling." } },
];
const PRAYERS: Bi[] = [
  { fr: "Seigneur, merci pour ce corps. Donne-moi de commencer avec humilite et de finir avec joie.", en: "Lord, thank you for this body. Help me begin in humility and finish with joy." },
  { fr: "Pere, quand mon souffle devient court, ta force se montre dans ma faiblesse.", en: "Father, when my breath runs short, your strength shows in my weakness." },
  { fr: "Jesus, apprends-moi la perseverance, un pas apres l'autre, pour ta gloire.", en: "Jesus, teach me perseverance, one step at a time, for your glory." },
  { fr: "Seigneur, je depose ma hate. Donne-moi un coeur paisible sur la distance.", en: "Lord, I lay down my hurry. Give me a peaceful heart over the distance." },
  { fr: "Pere, garde mes yeux fixes sur le but et mon coeur reconnaissant.", en: "Father, keep my eyes on the goal and my heart thankful." },
];

function buildPlan(
  slug: string,
  title: Bi,
  description: Bi,
  goalDistanceM: number,
  weekSessions: { title: Bi; segments: RunSegment[] }[][],
  locale: LocaleCode,
): RunPlan {
  const weekMeta: RunWeek[] = weekSessions.map((sessions, wi) => {
    const v = VERSES[wi % VERSES.length];
    return {
      week: wi + 1,
      verseRef: pick(v.ref, locale),
      verseText: pick(v.text, locale),
      prayer: pick(PRAYERS[wi % PRAYERS.length], locale),
      sessions: sessions.map((s, di): RunPlanSession => ({
        id: `${slug}-w${wi + 1}-d${di + 1}`,
        planId: slug,
        week: wi + 1,
        dayInWeek: di + 1,
        title: pick(s.title, locale),
        segments: s.segments,
      })),
    };
  });
  return { id: slug, slug, title: pick(title, locale), description: pick(description, locale), weeks: weekSessions.length, goalDistanceM, weekMeta };
}

const c5kWeekSegs: RunSegment[][] = [
  [wu(300), ...rep(8, [run(60), walk(90)]), cd(300)],
  [wu(300), ...rep(6, [run(90), walk(90)]), cd(300)],
  [wu(300), ...rep(5, [run(180), walk(90)]), cd(300)],
  [wu(300), ...rep(4, [run(300), walk(120)]), cd(300)],
  [wu(300), ...rep(3, [run(480), walk(150)]), cd(300)],
  [wu(300), ...rep(2, [run(900), walk(180)]), cd(300)],
  [wu(300), run(1500), walk(120), run(600), cd(300)],
  [wu(300), run(1800), cd(300)],
];
const c5kTitles: Bi[] = [
  { fr: "Marche-course, premiers pas", en: "Walk-run, first steps" },
  { fr: "Marche-course, on allonge", en: "Walk-run, longer reps" },
  { fr: "Blocs de 3 minutes", en: "3-minute blocks" },
  { fr: "Blocs de 5 minutes", en: "5-minute blocks" },
  { fr: "Blocs de 8 minutes", en: "8-minute blocks" },
  { fr: "Deux longs blocs", en: "Two long blocks" },
  { fr: "Presque en continu", en: "Almost continuous" },
  { fr: "5 km en continu", en: "Continuous 5k" },
];

const easy = (s: number): RunSegment[] => [wu(300), run(s), cd(300)];
const tempo = (n: number, r: number, w: number): RunSegment[] => [wu(300), ...rep(n, [run(r), walk(w)]), cd(300)];
const c10kWeeks: RunSegment[][][] = [
  [easy(1500), tempo(6, 120, 60), easy(2400)],
  [easy(1800), tempo(6, 150, 60), easy(3000)],
  [easy(1800), tempo(5, 240, 60), easy(3600)],
  [easy(2100), tempo(4, 360, 90), easy(2400)],
  [easy(2100), tempo(3, 480, 120), easy(4200)],
  [easy(2400), tempo(2, 720, 120), easy(4800)],
  [easy(2400), [wu(300), run(1200), cd(300)], easy(5400)],
  [easy(2700), tempo(4, 360, 90), easy(3000)],
  [easy(2700), tempo(2, 900, 120), easy(6000)],
  [easy(1800), tempo(2, 300, 120), easy(3600)],
];
const c10kDayTitles: Bi[] = [
  { fr: "Footing facile", en: "Easy run" },
  { fr: "Fractionne", en: "Intervals" },
  { fr: "Sortie longue", en: "Long run" },
];

const PLAN_5K = {
  slug: "c5k-8",
  title: { fr: "5 km en 8 semaines", en: "5k in 8 weeks" },
  description: { fr: "De la marche-course au 5 km en continu, trois seances par semaine.", en: "From walk-run intervals to a continuous 5k, three sessions a week." },
  goal: 5000,
};
const PLAN_10K = {
  slug: "c10k-10",
  title: { fr: "10 km en 10 semaines", en: "10k in 10 weeks" },
  description: { fr: "D'une base de 5 km au 10 km avec footings, fractionnes et une sortie longue.", en: "From a 5k base to 10k with easy runs, intervals and a weekly long run." },
  goal: 10000,
};

/** The two demo plans, localized. */
export function demoRunPlans(locale: LocaleCode): RunPlan[] {
  return [
    buildPlan(
      PLAN_5K.slug, PLAN_5K.title, PLAN_5K.description, PLAN_5K.goal,
      c5kWeekSegs.map((segs, wi) => [1, 2, 3].map(() => ({ title: c5kTitles[wi], segments: segs }))),
      locale,
    ),
    buildPlan(
      PLAN_10K.slug, PLAN_10K.title, PLAN_10K.description, PLAN_10K.goal,
      c10kWeeks.map((week) => week.map((segs, di) => ({ title: c10kDayTitles[di], segments: segs }))),
      locale,
    ),
  ];
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
