/** New hydration total (ml) after applying a delta, clamped at zero. Pure. */
export function nextWaterMl(currentMl: number, deltaMl: number): number {
  return Math.max(0, currentMl + Math.round(deltaMl));
}

/** Whether a hydration delta is a usable, non-zero amount. */
export function isValidWaterDelta(amountMl: number): boolean {
  const amount = Math.round(amountMl);
  return Number.isFinite(amount) && amount !== 0;
}
