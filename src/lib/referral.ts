const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate a referral `?ref=` value: credit the referrer only when it's a
 * well-formed user id that isn't the joining user themselves. Returns the
 * referrer id to store, or null when it should be ignored.
 */
export function resolveReferrer(
  ref: string | null | undefined,
  selfId: string,
): string | null {
  return ref && UUID_RE.test(ref) && ref !== selfId ? ref : null;
}
