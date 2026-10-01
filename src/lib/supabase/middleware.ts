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

function redirectToLogin(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", path);
  return NextResponse.redirect(url);
}

/**
 * Refresh the Supabase session cookie on each request and guard protected
 * routes.
 *
 * SECURITY — two failure modes are handled differently on purpose:
 *
 * 1. Supabase NOT configured (hasValidConfig() === false): fail OPEN. This is
 *    the intentional zero-config demo mode running on mock data; there is no
 *    real user data to protect.
 *
 * 2. Supabase configured but auth.getUser() throws (network failure, Supabase
 *    down, …): fail CLOSED on PROTECTED routes (redirect to /login). Public
 *    routes still pass through so the marketing site stays up during an outage.
 *
 * Do not merge these into a single "let it through" catch: an outage would
 * otherwise expose every protected page to anonymous visitors.
 * Covered by src/lib/supabase/middleware.test.ts.
 */
export async function updateSession(request: NextRequest) {
  if (!hasValidConfig()) return NextResponse.next();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some(
    (p) => path === p || path.startsWith(p + "/"),
  );

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

    if (needsAuth && !user) return redirectToLogin(request, path);

    return response;
  } catch {
    // Supabase IS configured but unreachable. Fail closed on protected routes
    // (see the SECURITY note above); public routes continue normally.
    if (needsAuth) return redirectToLogin(request, path);
    return response;
  }
}
