/**
 * Best-effort in-memory rate limiter (per server instance), used to slow down
 * abuse of sensitive endpoints like sign-up and sign-in. Fixed window. In a
 * multi-instance deployment each instance keeps its own counters, which is still
 * a meaningful brake; a shared store can replace this later without changing
 * callers.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

export interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum allowed hits within the window. */
  max: number;
}

/**
 * Record a hit for `key` and report whether it is now over the limit. Returns
 * true when the caller should be throttled.
 */
export function rateLimit(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > opts.max;
}

/** Test-only: clear all counters. */
export function __resetRateLimits(): void {
  buckets.clear();
}
