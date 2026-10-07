import { cookies } from "next/headers";
import { TZ_COOKIE, DEFAULT_TZ, isValidTimeZone } from "@/lib/date";

/**
 * The signed-in visitor's timezone, read from the `ka_tz` cookie that
 * TimezoneSync sets client-side. Falls back to America/Toronto when unknown.
 * Cookie-based so server queries stay fast (no DB round-trip); the value is
 * also persisted to profiles.timezone for the cron reminders.
 */
export async function getUserTimezone(): Promise<string> {
  const store = await cookies();
  const tz = store.get(TZ_COOKIE)?.value;
  return tz && isValidTimeZone(tz) ? tz : DEFAULT_TZ;
}
