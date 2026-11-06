/**
 * Z3 Bloc F — honest beta reminders.
 *
 * During the beta the cron (Vercel Hobby) runs roughly once a day, so it cannot
 * honour a precise user-chosen time. Instead every opted-in user gets ONE
 * reminder per LOCAL day, fired during a morning window in their own timezone.
 * The exact minute isn't promised; the UI says "one reminder per day, in the
 * morning (about 7-8 AM, Montreal time), during the beta."
 *
 * These helpers are pure so they can be unit-tested across timezones without a
 * database or the push stack.
 */

/** Morning window (inclusive) in minutes since local midnight: 05:00..11:00. */
export const MORNING_START_MIN = 5 * 60;
export const MORNING_END_MIN = 11 * 60;

export function minutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** True when a local HH:MM falls inside the morning delivery window. */
export function isMorningWindow(nowHHMM: string): boolean {
  const n = minutesSinceMidnight(nowHHMM);
  return n >= MORNING_START_MIN && n <= MORNING_END_MIN;
}

/**
 * Decide whether to send the single daily reminder now.
 * @param nowHHMM      current local time "HH:MM" in the user's timezone
 * @param todayLocal   current local date "YYYY-MM-DD" in the user's timezone
 * @param lastSentLocal the local date a reminder was last sent ("YYYY-MM-DD"), or null
 * @param enabled      whether the user has reminders turned on
 */
export function shouldSendDailyReminder(
  nowHHMM: string,
  todayLocal: string,
  lastSentLocal: string | null,
  enabled: boolean,
): boolean {
  if (!enabled) return false;
  if (lastSentLocal === todayLocal) return false; // already sent today (local)
  return isMorningWindow(nowHHMM);
}
