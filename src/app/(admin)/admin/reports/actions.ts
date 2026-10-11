"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

type Target = { targetType: "post" | "comment"; targetId: string };

const targetSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().uuid(),
});

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
  const check = validate(targetSchema.extend({ hidden: z.boolean() }), input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from(tableFor(check.data.targetType))
    .update({ hidden: check.data.hidden })
    .eq("id", check.data.targetId);
  if (error) return logAndFail(error);

  revalidatePath("/admin/reports");
  revalidatePath("/community");
  return { ok: true };
}

/** Permanently remove a reported post/comment. Reports cascade away with it. */
export async function deleteReportedContent(input: Target): Promise<ActionResult> {
  const check = validate(targetSchema, input);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from(tableFor(check.data.targetType))
    .delete()
    .eq("id", check.data.targetId);
  if (error) return logAndFail(error);

  revalidatePath("/admin/reports");
  revalidatePath("/community");
  return { ok: true };
}

/** Mark a report resolved without touching the content (dismiss). */
export async function resolveReport(reportId: string): Promise<ActionResult> {
  const check = validate(z.string().uuid(), reportId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  const admin = await adminContext();
  if (!admin) return { ok: false, error: "community.error.notAllowed" };

  const { error } = await admin.supabase
    .from("content_reports")
    .update({ status: "resolved" })
    .eq("id", check.data);
  if (error) return logAndFail(error);

  revalidatePath("/admin/reports");
  return { ok: true };
}
