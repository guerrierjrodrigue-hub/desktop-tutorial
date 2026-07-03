import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Guard for admin routes. In demo mode (no Supabase) access is allowed so the
 * dashboard is explorable. With a real backend, requires profiles.is_admin.
 */
export async function requireAdmin(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login?redirect=/admin");

  const { data } = await ctx.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", ctx.userId)
    .single();

  if (!data?.is_admin) redirect("/dashboard");
}
