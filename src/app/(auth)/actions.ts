"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export interface AuthState {
  error?: string;
  confirmationSent?: boolean;
}

/** Minimum password length for new passwords (sign-up and reset). */
const MIN_PASSWORD_LENGTH = 10;

/** Best-effort client IP from the proxy headers. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Map a Supabase auth error to a localized dictionary key, logging the raw
 * provider detail to Sentry. The UI renders `dict[code]`, so the provider's
 * raw message never reaches the user.
 */
function mapAuthError(error: { message?: string; code?: string; status?: number }): string {
  Sentry.captureException(error);
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  if (code === "user_already_exists" || msg.includes("already registered") || msg.includes("already been registered")) {
    return "auth.error.emailInUse";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials") || code === "invalid_credentials") {
    return "auth.error.invalidCredentials";
  }
  if (msg.includes("password") && (msg.includes("length") || msg.includes("at least") || msg.includes("weak") || msg.includes("6 char"))) {
    return "auth.error.weakPassword";
  }
  return "auth.error.generic";
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Email/password sign-in or sign-up. Returns an error state; redirects on success. */
export async function emailAuthAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "login");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const consent = String(formData.get("consent") ?? "");
  // Honeypot: a hidden field real users never see. Bots fill it; stop silently.
  const honeypot = String(formData.get("company") ?? "").trim();

  // Signup requires explicit consent (age 16+, Terms, Privacy — Loi 25).
  if (mode === "signup" && consent !== "on") {
    return { error: "consent" };
  }

  // Rate limit by IP + mode (brake on credential stuffing and signup abuse).
  const ip = await clientIp();
  if (rateLimit(`auth:${mode}:${ip}`, { windowMs: 15 * 60_000, max: 10 })) {
    return { error: "auth.error.tooMany" };
  }

  // A filled honeypot is a bot: answer as if nothing happened, create nothing.
  if (honeypot) {
    return mode === "signup" ? { confirmationSent: true } : { error: "auth.error.invalidCredentials" };
  }

  // Demo mode: no backend configured → straight to the app.
  if (!isSupabaseConfigured()) redirect(mode === "signup" ? "/onboarding" : "/dashboard");

  if (!email || !password) {
    return { error: "auth.error.missingFields" };
  }

  // A new password must meet the minimum length (clear message to the user).
  if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
    return { error: "auth.error.passwordTooShort" };
  }

  // Cloudflare Turnstile, only when configured.
  const turnstileOk = await verifyTurnstile(
    (formData.get("cf-turnstile-response") as string | null) ?? null,
    ip,
  );
  if (!turnstileOk) return { error: "auth.error.captcha" };

  const supabase = await createSupabaseServerClient();

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || email.split("@")[0] },
        emailRedirectTo: `${await siteOrigin()}/auth/callback?redirect=/onboarding`,
      },
    });
    if (error) return { error: mapAuthError(error) };
    void sendWelcomeEmail(email, name || email.split("@")[0]);
    // No session yet means Supabase requires email confirmation before sign-in.
    if (!data.session) return { confirmationSent: true };
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: mapAuthError(error) };
  }

  redirect(mode === "signup" ? "/onboarding" : "/dashboard");
}

export interface ForgotPasswordState {
  error?: string;
  sent?: boolean;
}

/** Email a password-reset link. Always reports success (never reveals whether the email exists). */
export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "auth.error.emailRequired" };

  if (!isSupabaseConfigured()) return { sent: true };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?redirect=/reset-password`,
  });

  return { sent: true };
}

export interface ResetPasswordState {
  error?: string;
}

/** Set a new password from an active password-recovery session. */
export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "auth.error.passwordTooShort" };
  }
  if (password !== confirmPassword) {
    return { error: "auth.error.passwordMismatch" };
  }

  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error) };

  redirect("/dashboard");
}

/** Begin an OAuth flow (Google / Apple). Redirects to the provider. */
export async function oauthAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "google") as
    | "google"
    | "apple";
  const mode = String(formData.get("mode") ?? "login");
  const consent = String(formData.get("consent") ?? "");

  // Signup via OAuth needs the same consent as email signup (Loi 25 backstop;
  // the UI already gates the button).
  if (mode === "signup" && consent !== "on") redirect("/signup?error=consent");

  // Rate limit by IP + mode, same brake as the email path.
  if (rateLimit(`oauth:${mode}:${await clientIp()}`, { windowMs: 15 * 60_000, max: 20 })) {
    redirect(`/${mode === "signup" ? "signup" : "login"}?error=too_many`);
  }

  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await siteOrigin()}/auth/callback` },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

/** Sign the current user out and return to the landing page. */
export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
