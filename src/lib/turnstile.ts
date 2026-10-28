/**
 * Cloudflare Turnstile verification. Entirely optional: the widget and the
 * server check are active only when BOTH NEXT_PUBLIC_TURNSTILE_SITE_KEY and
 * TURNSTILE_SECRET_KEY are configured. When they are not, verification is a
 * no-op so local and demo environments are unaffected.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Whether server-side Turnstile verification is configured. */
export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/**
 * Verify a Turnstile token with Cloudflare. Returns true when verification is
 * disabled (no keys) or the token is valid; false otherwise.
 */
export async function verifyTurnstile(token: string | null, ip?: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams();
    body.set("secret", process.env.TURNSTILE_SECRET_KEY as string);
    body.set("response", token);
    if (ip) body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
