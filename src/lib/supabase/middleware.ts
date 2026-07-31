import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/** Protected route prefixes that require an authenticated session. */
const PROTECTED = [
  "/dashboard",
  "/fitness",
  "/nutrition",
  "/spiritual",
  "/coach",
  "/community",
  "/challenges",
  "/profile",
  "/habits",
  "/journal",
  "/focus",
  "/onboarding",
  "/admin",
];

/** A well-formed `https://…` Supabase URL is required; anything else is ignored. */
function hasValidConfig(): boolean {
  if (!isSupabaseConfigured()) return false;
  try {
    const u = new URL(SUPABASE_URL);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Refresh the Supabase session cookie on each request and guard protected
 * routes. Fully defensive: if Supabase is unconfigured, misconfigured, or
 * temporarily unreachable, the request is allowed through instead of failing —
 * a bad env var must never take the whole site down.
 */
export async function updateSession(request: NextRequest) {
  if (!hasValidConfig()) return NextResponse.next();

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const needsAuth = PROTECTED.some(
      (p) => path === p || path.startsWith(p + "/"),
    );

    if (needsAuth && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // Auth backend hiccup or misconfiguration — let the request continue rather
    // than returning a 500 for every page.
    return response;
  }
}
