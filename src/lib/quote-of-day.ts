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

export interface DailyQuote {
  /** The quote text, without any trailing attribution. */
  text: string;
  /** The source/reference, if the quote carries one (e.g. "1 Cor. 9:24"). */
  reference?: string;
}

/**
 * Split a quote string into its text and optional reference. Some quotes carry
 * an attribution after an em dash ("… — 1 Cor. 9:24"); the UI quotes only the
 * text and shows the reference beneath it.
 */
export function splitQuote(raw: string): DailyQuote {
  const sep = raw.lastIndexOf(" — ");
  if (sep === -1) return { text: raw.trim() };
  return { text: raw.slice(0, sep).trim(), reference: raw.slice(sep + 3).trim() };
}

/** The quote of the day, split into text + optional reference. */
export function getQuoteOfDayParts(locale: LocaleCode, date: Date = new Date()): DailyQuote {
  return splitQuote(getQuoteOfDay(locale, date));
}
