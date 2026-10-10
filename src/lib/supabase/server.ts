import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session from Next.js cookies.
 *
 * Wrapped in React `cache()` so a single render pass reuses one client (and one
 * `cookies()` read) instead of constructing a fresh one for every query — the
 * connected pages fan out into a dozen+ queries per request.
 */
export const createSupabaseServerClient = cache(async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; the middleware
          // refreshes the session cookie on the response instead.
        }
      },
    },
  });
});
