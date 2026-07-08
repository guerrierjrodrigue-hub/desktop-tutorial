import { inspirationalQuotes } from "@/data/devotional";

/** A deterministic, date-based pick from the quote catalog — the same quote all day, a new one tomorrow. */
export function getQuoteOfDay(date: Date = new Date()): string {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  return inspirationalQuotes[dayOfYear % inspirationalQuotes.length];
}
