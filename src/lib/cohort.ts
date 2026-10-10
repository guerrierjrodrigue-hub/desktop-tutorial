import type { LocaleCode } from "@/i18n/locales";

/**
 * Localized weekday name for a cohort's start date (e.g. "Monday" / "lundi").
 * Uses the plain calendar date so it's timezone-independent.
 */
export function cohortStartWeekday(dateStr: string, locale: LocaleCode): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Full human label for a cohort's start date: weekday + day + month, e.g.
 * "lundi 12 octobre" / "Monday, October 12". Shown before a cohort begins so
 * invitees see when it starts instead of a countdown. Timezone-independent.
 */
export function cohortStartLabel(dateStr: string, locale: LocaleCode): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}
