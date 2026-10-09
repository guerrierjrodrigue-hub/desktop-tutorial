/**
 * Day-by-day passage schedules for the reading plans (one passage per day).
 * Pure data + lookup so the reading-plan card can deep-link into the Bible
 * reader at the right chapter. Book ids match the Bible API (USFM 3-letter
 * codes, e.g. MAT, PSA, PRO, 1CO).
 */

export interface Passage {
  book: string;
  chapter: number;
}

/** Sequential chapters across one or more books. */
function sequential(spans: [book: string, chapters: number][]): Passage[] {
  const out: Passage[] = [];
  for (const [book, chapters] of spans) {
    for (let c = 1; c <= chapters; c++) out.push({ book, chapter: c });
  }
  return out;
}

const GOSPELS_30: Passage[] = sequential([["MAT", 28]]).concat([
  { book: "MRK", chapter: 1 },
  { book: "MRK", chapter: 2 },
]); // 30 days: Matthew 1–28, then Mark 1–2

const PSALMS_OF_STRENGTH: Passage[] = [
  1, 3, 4, 5, 8, 9, 16, 18, 19, 20, 23, 27, 28, 29, 30, 31, 34, 37, 40, 42, 46,
  55, 56, 59, 61, 62, 63, 71, 91, 118, 121,
].map((chapter) => ({ book: "PSA", chapter })); // 31 days

const PROVERBS_31: Passage[] = sequential([["PRO", 31]]); // 31 days

const FITNESS_AND_FAITH: Passage[] = [
  { book: "1CO", chapter: 6 },
  { book: "1CO", chapter: 9 },
  { book: "ROM", chapter: 12 },
  { book: "1TI", chapter: 4 },
  { book: "ISA", chapter: 40 },
  { book: "PHP", chapter: 4 },
  { book: "HEB", chapter: 12 },
  { book: "JAS", chapter: 1 },
  { book: "PRO", chapter: 3 },
  { book: "PSA", chapter: 23 },
  { book: "GAL", chapter: 6 },
  { book: "COL", chapter: 3 },
  { book: "1CO", chapter: 10 },
  { book: "2TI", chapter: 1 },
]; // 14 days

/** Schedules keyed by the reading plan's English title (stable across locales). */
const SCHEDULES: Record<string, Passage[]> = {
  "The Gospels in 30 Days": GOSPELS_30,
  "Psalms of Strength": PSALMS_OF_STRENGTH,
  "Proverbs for Discipline": PROVERBS_31,
  "Fitness & Faith": FITNESS_AND_FAITH,
};

/**
 * The passage for a given 1-based day of a plan (identified by its English
 * title). Days past the end clamp to the last passage; unknown plans → null.
 */
export function passageForDay(planTitleEn: string, day: number): Passage | null {
  const schedule = SCHEDULES[planTitleEn];
  if (!schedule || schedule.length === 0) return null;
  const idx = Math.min(Math.max(1, Math.floor(day)), schedule.length) - 1;
  return schedule[idx];
}

export function hasSchedule(planTitleEn: string): boolean {
  return planTitleEn in SCHEDULES;
}
