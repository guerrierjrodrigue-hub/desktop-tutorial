/**
 * Server-side timing helper for connected pages.
 *
 * Wraps a page's data-fetch and logs how long it took, so the duration of each
 * route shows up in the Vercel function logs (searchable by the `[perf]` tag).
 * This is how we keep an eye on the connected-page performance over time.
 *
 * Usage:
 *   const [a, b] = await timed("dashboard", () => Promise.all([...]));
 */
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - start);
    console.log(`[perf] page=${label} data=${ms}ms`);
  }
}
