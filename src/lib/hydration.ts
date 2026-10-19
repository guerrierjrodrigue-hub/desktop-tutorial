/** New hydration total (ml) after applying a delta, clamped at zero. Pure. */
export function nextWaterMl(currentMl: number, deltaMl: number): number {
  return Math.max(0, currentMl + Math.round(deltaMl));
}

/** Whether a hydration delta is a usable, non-zero amount. */
export function isValidWaterDelta(amountMl: number): boolean {
  const amount = Math.round(amountMl);
  return Number.isFinite(amount) && amount !== 0;
}

/**
 * Format millilitres as litres with real precision, localized: 250 ml -> "0,25 L"
 * in French, "0.25 L" in English. Avoids the old toFixed(1) that rounded a glass
 * of 250 ml to a misleading "0.3 L". Trailing zeros are dropped (2000 -> "2 L").
 */
export function formatLiters(ml: number, locale: string = "en"): string {
  const liters = Math.max(0, ml) / 1000;
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(liters);
  return `${n} L`;
}
