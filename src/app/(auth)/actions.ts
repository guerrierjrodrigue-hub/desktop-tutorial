"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AuthState {
  error?: string;
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

  // Demo mode: no backend configured → straight to the app.
  if (!isSupabaseConfigured()) redirect(mode === "signup" ? "/onboarding" : "/dashboard");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || email.split("@")[0] },
        emailRedirectTo: `${await siteOrigin()}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
  }

  redirect(mode === "signup" ? "/onboarding" : "/dashboard");
}

/** Begin an OAuth flow (Google / Apple). Redirects to the provider. */
export async function oauthAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "google") as
    | "google"
    | "apple";

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
