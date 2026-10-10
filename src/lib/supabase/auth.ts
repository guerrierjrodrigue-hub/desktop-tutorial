import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./server";
import { isSupabaseConfigured } from "./config";

export interface AuthedContext {
  /**
   * Permissively typed for writes: our hand-written `Database` type does not
   * fully satisfy PostgREST's payload inference, and write actions map fields
   * explicitly anyway. Fully-typed reads use `createSupabaseServerClient`.
   */
  supabase: SupabaseClient;
  userId: string;
}

/**
 * The signed-in Supabase auth user, or `null` when unconfigured / signed out.
 *
 * Wrapped in React `cache()` so `auth.getUser()` — a network round-trip to the
 * Supabase Auth server — runs at most once per request, no matter how many
 * callers need it. This is THE hot path: every query helper and `getCurrentUser`
 * share this one result instead of each making its own auth round-trip.
 */
export const getSessionUser = cache(async function getSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

/**
 * Resolve an authenticated Supabase context, or `null` when Supabase is not
 * configured or no user is signed in. Server actions use this to decide between
 * a real persisted write and a demo no-op — keeping the app functional in any
 * environment.
 *
 * Built on the cached `getSessionUser`, so the whole page shares a single
 * `auth.getUser()` round-trip — the main source of the connected-page slowness.
 */
export const getAuthedContext = cache(
  async function getAuthedContext(): Promise<AuthedContext | null> {
    const user = await getSessionUser();
    if (!user) return null;

    const supabase = await createSupabaseServerClient();
    return { supabase: supabase as SupabaseClient, userId: user.id };
  },
);
