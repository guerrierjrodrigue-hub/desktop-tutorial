/**
 * Pure community/moderation limits — safe to import anywhere (no server-only
 * deps). The DB enforces these authoritatively (migration 0026); the server
 * actions mirror them so the user gets a friendly message before the round-trip.
 */

export const POST_MAX_LENGTH = 1000;
export const COMMENT_MAX_LENGTH = 500;
export const REPORT_REASON_MAX_LENGTH = 500;

/** Max posts a single user may create per rolling hour. */
export const POSTS_PER_HOUR = 10;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

export function isValidPostContent(content: string): boolean {
  const t = content.trim();
  return t.length > 0 && t.length <= POST_MAX_LENGTH;
}

export function isValidCommentBody(body: string): boolean {
  const t = body.trim();
  return t.length > 0 && t.length <= COMMENT_MAX_LENGTH;
}

export function isValidReportReason(reason: string): boolean {
  // A reason is optional, but when given it must be within the limit.
  return reason.trim().length <= REPORT_REASON_MAX_LENGTH;
}

/**
 * Whether a new post would exceed the hourly rate limit, given the timestamps
 * (ISO strings or ms) of the user's recent posts and the current time. Pure, so
 * it's unit-testable; the action supplies rows from the DB.
 */
export function exceedsPostRate(
  recentPostTimes: (string | number)[],
  now: number = Date.now(),
): boolean {
  const cutoff = now - RATE_WINDOW_MS;
  const inWindow = recentPostTimes.filter((t) => {
    const ms = typeof t === "number" ? t : Date.parse(t);
    return Number.isFinite(ms) && ms >= cutoff;
  });
  return inWindow.length >= POSTS_PER_HOUR;
}
