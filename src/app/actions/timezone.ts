"use server";

import { cookies } from "next/headers";
import { TZ_COOKIE, isValidTimeZone } from "@/lib/date";
import { getAuthedContext } from "@/lib/supabase/auth";

/**
 * Persist the visitor's detected timezone: a cookie for fast server reads, plus
 * profiles.timezone (when signed in) so the cron reminders use it too. Safe in
 * demo mode — it just sets the cookie.
 */
export async function setTimezone(tz: string): Promise<void> {
  if (!isValidTimeZone(tz)) return;

  const store = await cookies();
  store.set(TZ_COOKIE, tz, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const ctx = await getAuthedContext();
  if (ctx) {
    await ctx.supabase.from("profiles").update({ timezone: tz }).eq("id", ctx.userId);
  }
}
