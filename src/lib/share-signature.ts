import crypto from "node:crypto";

/**
 * Share-image URLs render brand-stamped content from caller-supplied query
 * params. To stop anyone forging a Kingdom Athlete image with arbitrary text,
 * the app signs the params server-side (HMAC-SHA256) and the image routes
 * verify the signature before rendering.
 *
 * The key comes from SHARE_SIGNING_SECRET, falling back to other server-only
 * secrets so production is protected without a new env var. When NO secret is
 * configured (local/demo with no backend), verification is skipped so the
 * feature still works — there is nothing secret to protect there.
 */
function secret(): string | null {
  return (
    process.env.SHARE_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.CRON_SECRET ||
    null
  );
}

/** Whether signatures are enforced (a signing secret is configured). */
export function shareSigningEnabled(): boolean {
  return secret() !== null;
}

/** Stable canonical string for a param map (sorted keys), independent of order. */
export function canonicalParams(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k] ?? ""}`)
    .join("&");
}

/** HMAC signature (hex, 32 chars) for a param map, or null when unconfigured. */
export function signShareParams(params: Record<string, string>): string | null {
  const s = secret();
  if (!s) return null;
  return crypto.createHmac("sha256", s).update(canonicalParams(params)).digest("hex").slice(0, 32);
}

/**
 * Verify a signature against the params. Returns true when no secret is
 * configured (nothing to enforce); otherwise requires an exact, constant-time
 * match.
 */
export function verifyShareParams(
  params: Record<string, string>,
  sig: string | null | undefined,
): boolean {
  const s = secret();
  if (!s) return true;
  if (!sig) return false;
  const expected = signShareParams(params);
  if (!expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
