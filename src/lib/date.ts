/**
 * Timezone-aware "today" helpers. Pure (no next/headers), so they're safe to
 * import anywhere and easy to unit-test. The server reads the user's timezone
 * via getUserTimezone() in lib/timezone.ts and passes it here.
 */

export const TZ_COOKIE = "ka_tz";
/** Default when the user's timezone is unknown (most users are in Eastern). */
export const DEFAULT_TZ = "America/Toronto";

/** Whether a string is a timezone the runtime's Intl accepts. */
export function isValidTimeZone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date (YYYY-MM-DD) in the given timezone for the instant `now`. */
export function getUserToday(tz: string, now: Date = new Date()): string {
  const zone = isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  // en-CA renders as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The local hour (0–23) in the given timezone for the instant `now`. */
export function localHour(tz: string, now: Date = new Date()): number {
  const zone = isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "2-digit",
    hour12: false,
  }).format(now);
  return parseInt(h, 10) % 24;
}

/** Shift a YYYY-MM-DD date string by `delta` calendar days (date-only math). */
export function addDaysToDateStr(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** UTC offset (ms) of a timezone at a given instant. */
function tzOffsetMs(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUTC - date.getTime();
}

/**
 * The ISO instant (UTC) of the start of the user's local day. Used to bound
 * `timestamptz` columns (e.g. workout completed_at) to the user's calendar day,
 * accounting for their timezone and DST.
 */
export function startOfLocalDayUTC(tz: string, now: Date = new Date()): string {
  const zone = isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  const [y, m, d] = getUserToday(zone, now).split("-").map(Number);
  const guessUTC = Date.UTC(y, m - 1, d, 0, 0, 0);
  const offset = tzOffsetMs(new Date(guessUTC), zone);
  return new Date(guessUTC - offset).toISOString();
}

export type Greeting = "morning" | "afternoon" | "evening";

/** Which greeting to show for a given local hour. */
export function greetingFor(hour: number): Greeting {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
