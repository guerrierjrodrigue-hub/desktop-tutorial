import { getInspirationalQuotes } from "@/data/devotional";
import type { LocaleCode } from "@/i18n/locales";

/** A deterministic, date-based pick from the quote catalog — the same quote all day, a new one tomorrow. */
export function getQuoteOfDay(locale: LocaleCode, date: Date = new Date()): string {
  const quotes = getInspirationalQuotes(locale);
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  return quotes[dayOfYear % quotes.length];
}
