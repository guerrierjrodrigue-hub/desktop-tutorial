"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";
import {
  isValidPostContent,
  isValidReportReason,
  exceedsPostRate,
  RATE_WINDOW_MS,
  POST_MAX_LENGTH,
  REPORT_REASON_MAX_LENGTH,
} from "@/lib/community";
import type { CommunityPost } from "@/types";

const createPostSchema = z.object({
  content: z.string().trim().min(1, "community.error.empty").max(POST_MAX_LENGTH, "community.error.postTooLong"),
  kind: z.enum(["testimony", "progress", "prayer"]),
});

const reportSchema = z.object({
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.string().trim().max(REPORT_REASON_MAX_LENGTH, "community.error.reasonTooLong").optional(),
});

const targetIdSchema = z.string().uuid("community.error.missingTarget");

/** Create a community post for the signed-in user. */
export async function createPost(input: {
  content: string;
  kind: CommunityPost["kind"];
}): Promise<ActionResult> {
  const check = validate(createPostSchema, input);
  if (!check.ok) return check.result;
  const content = check.data.content;
  if (!isValidPostContent(content)) return { ok: false, error: "community.error.postTooLong" };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // Rate limit: at most POSTS_PER_HOUR posts per rolling hour.
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { data: recent } = await ctx.supabase
    .from("community_posts")
    .select("created_at")
    .eq("user_id", ctx.userId)
    .gte("created_at", since);
  const times = ((recent ?? []) as { created_at: string }[]).map((r) => r.created_at);
  if (exceedsPostRate(times)) return { ok: false, error: "community.error.rateLimited" };

  const { error } = await ctx.supabase.from("community_posts").insert({
    user_id: ctx.userId,
    content,
    kind: check.data.kind,
  });
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}

/** Delete a post the signed-in user owns. Comments and likes cascade in the DB. */
export async function deletePost(postId: string): Promise<ActionResult> {
  const check = validate(targetIdSchema, postId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // RLS restricts deletes to the owner (or an admin); scope by user_id too so a
  // non-owner request is a clear no-op rather than relying on RLS alone.
  const { error } = await ctx.supabase
    .from("community_posts")
    .delete()
    .eq("id", check.data)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}

/** Delete a comment the signed-in user owns. */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  const check = validate(targetIdSchema, commentId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("post_comments")
    .delete()
    .eq("id", check.data)
    .eq("user_id", ctx.userId);
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}

/** File a report against a post or a comment. Idempotent per reporter+target. */
export async function reportContent(input: {
  postId?: string;
  commentId?: string;
  reason?: string;
}): Promise<ActionResult> {
  const check = validate(reportSchema, input);
  if (!check.ok) return check.result;
  const { postId, commentId } = check.data;
  const reason = (check.data.reason ?? "").trim();
  if (!postId && !commentId) {
    return { ok: false, error: "community.error.missingTarget" };
  }
  if (!isValidReportReason(reason)) {
    return { ok: false, error: "community.error.reasonTooLong" };
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("content_reports").insert({
    reporter_id: ctx.userId,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    reason,
  });
  if (error) {
    // 23505 = already reported by this user → treat as a successful no-op.
    if (error.code === "23505") return { ok: true };
    return logAndFail(error);
  }
  return { ok: true };
}

/** Block another member so their content drops out of the viewer's feed. */
export async function blockUser(userId: string): Promise<ActionResult> {
  const check = validate(targetIdSchema, userId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  if (check.data === ctx.userId) return { ok: false, error: "community.error.cannotBlockSelf" };

  const { error } = await ctx.supabase
    .from("user_blocks")
    .upsert(
      { blocker_id: ctx.userId, blocked_id: check.data },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}

/** Unblock a previously blocked member. */
export async function unblockUser(userId: string): Promise<ActionResult> {
  const check = validate(targetIdSchema, userId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", ctx.userId)
    .eq("blocked_id", check.data);
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}

/** Like or unlike a post. */
export async function toggleLike(
  postId: string,
  liked: boolean,
): Promise<ActionResult> {
  const check = validate(z.object({ postId: z.string().uuid(), liked: z.boolean() }), {
    postId,
    liked,
  });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = check.data.liked
    ? await ctx.supabase
        .from("post_likes")
        .insert({ post_id: check.data.postId, user_id: ctx.userId })
    : await ctx.supabase
        .from("post_likes")
        .delete()
        .eq("post_id", check.data.postId)
        .eq("user_id", ctx.userId);

  if (error) return logAndFail(error);
  return { ok: true };
}

/** Join a community group. Idempotent — re-joining is a no-op. */
export async function joinGroup(groupId: string): Promise<ActionResult> {
  const check = validate(z.string().uuid(), groupId);
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("group_members")
    .upsert(
      { group_id: check.data, user_id: ctx.userId },
      { onConflict: "group_id,user_id", ignoreDuplicates: true },
    );
  if (error) return logAndFail(error);

  revalidatePath("/community");
  return { ok: true };
}
