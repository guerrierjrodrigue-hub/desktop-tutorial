import type { SupabaseClient } from "@supabase/supabase-js";
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
 * Resolve an authenticated Supabase context, or `null` when Supabase is not
 * configured or no user is signed in. Server actions use this to decide between
 * a real persisted write and a demo no-op — keeping the app functional in any
 * environment.
 */
export async function getAuthedContext(): Promise<AuthedContext | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return { supabase: supabase as SupabaseClient, userId: user.id };
}
