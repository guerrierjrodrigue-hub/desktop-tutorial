"use server";

import { redirect } from "next/navigation";
import { getAuthedContext } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { isStripeConfigured } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { DELETE_CONFIRMATION } from "@/lib/privacy";

export interface DeleteAccountResult {
  ok: boolean;
  error?: string;
}

/**
 * Permanently delete the signed-in user's account and all their data (Loi 25
 * right to erasure). Requires typing the confirmation word. Deleting the Auth
 * user cascades through profiles to every user-owned table (all FKs are
 * ON DELETE CASCADE). Any Stripe customer is removed first, best-effort.
 * On success the user is signed out and redirected home.
 */
export async function deleteAccount(confirmation: string): Promise<DeleteAccountResult> {
  if (confirmation.trim() !== DELETE_CONFIRMATION) {
    return { ok: false, error: "confirmation" };
  }

  // Demo mode: no backend to delete from — just send them home.
  if (!isSupabaseConfigured()) redirect("/?deleted=1");

  const ctx = await getAuthedContext();
  if (!ctx) redirect("/login");

  if (!isAdminClientConfigured()) {
    return { ok: false, error: "unavailable" };
  }

  // Best-effort Stripe cleanup — never block deletion on it.
  try {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", ctx.userId)
      .maybeSingle();
    const customerId = profile?.stripe_customer_id as string | null | undefined;
    if (customerId && isStripeConfigured()) {
      await getStripe().customers.del(customerId);
    }
  } catch {
    // Ignore: the customer may already be gone, or Stripe may be unconfigured.
  }

  // Delete the Auth user. ON DELETE CASCADE wipes profiles and every
  // user-owned row across the schema.
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(ctx.userId);
  if (error) return { ok: false, error: error.message };

  // Clear the now-orphaned session cookie, then go home.
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // The session is already invalid now that the user is gone.
  }

  redirect("/?deleted=1");
}
