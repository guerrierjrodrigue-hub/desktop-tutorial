"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";

type Target = { targetType: "post" | "comment"; targetId: string };

const tableFor = (t: "post" | "comment") =>
  t === "post" ? "community_posts" : "post_comments";

/** Confirm the caller is an admin; returns the authed context or null. */
async function adminContext() {
  const ctx = await getAuthedContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", ctx.userId)
    .single();
  return (data as { is_admin?: boolean } | null)?.is_admin ? ctx : null;
}

/** Hide or un-hide a reported post/comment (soft moderation). */
export async function setContentHidden(
  input: Target & { hidden: boolean },
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from(tableFor(input.targetType))
    .update({ hidden: input.hidden })
    .eq("id", input.targetId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reports");
  revalidatePath("/community");
  return { ok: true };
}

/** Permanently remove a reported post/comment. Reports cascade away with it. */
export async function deleteReportedContent(input: Target): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from(tableFor(input.targetType))
    .delete()
    .eq("id", input.targetId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reports");
  revalidatePath("/community");
  return { ok: true };
}

/** Mark a report resolved without touching the content (dismiss). */
export async function resolveReport(reportId: string): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from("content_reports")
    .update({ status: "resolved" })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reports");
  return { ok: true };
}
