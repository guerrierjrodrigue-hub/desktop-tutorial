import type { LocaleCode } from "@/i18n/locales";

/**
 * Plural category for the two locales we ship.
 *
 * - English: only exactly 1 is singular ("1 day", "0 days", "2 days").
 * - French: 0 and 1 are singular ("0 jour", "1 jour"), 2+ plural ("2 jours").
 *
 * (CLDR agrees for both; this is the small subset we need.)
 */
export function pluralCategory(n: number, locale: LocaleCode): "one" | "other" {
  const abs = Math.abs(n);
  if (locale === "fr") return abs < 2 ? "one" : "other";
  return abs === 1 ? "one" : "other";
}

/**
 * Pick the right singular/plural template for `n` and substitute `{n}`.
 *
 * Pass the two already-localized templates (usually two dictionary entries,
 * e.g. `dict["plural.participants.one"]` / `.other`). Keeps every count label —
 * challenges, members, days left, referrals — grammatically correct in both
 * languages from one place.
 */
export function plural(
  n: number,
  forms: { one: string; other: string },
  locale: LocaleCode,
): string {
  const template = pluralCategory(n, locale) === "one" ? forms.one : forms.other;
  return template.replace("{n}", n.toLocaleString(locale === "fr" ? "fr-CA" : "en-US"));
}
