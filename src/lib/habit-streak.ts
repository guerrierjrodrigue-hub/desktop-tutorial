import { addDaysToDateStr } from "@/lib/date";

/**
 * Consecutive done-days ending on `todayStr` (or ending yesterday if today
 * isn't done yet). Works on YYYY-MM-DD strings so it's timezone-correct.
 *
 * `isExempt(date)` marks days that should neither count toward nor break the
 * streak — e.g. a planned rest day for the workout habit. An exempt, not-done
 * day is skipped over, so a scheduled rest day never resets the streak.
 */
export function computeStreak(
  doneDates: Set<string>,
  todayStr: string,
  isExempt: (dateStr: string) => boolean = () => false,
): number {
  let cursor = todayStr;
  // Today not done (and not an exempt day) → the streak can still stand on the
  // days before today, so start the walk from yesterday.
  if (!doneDates.has(cursor) && !isExempt(cursor)) {
    cursor = addDaysToDateStr(cursor, -1);
  }
  let streak = 0;
  // Bounded walk backwards (habit_logs are loaded for the last ~90 days).
  for (let i = 0; i < 400; i++) {
    if (doneDates.has(cursor)) {
      streak++;
    } else if (!isExempt(cursor)) {
      break; // a real missed day ends the streak
    }
    // exempt + not done → skip without counting or breaking
    cursor = addDaysToDateStr(cursor, -1);
  }
  return streak;
}
