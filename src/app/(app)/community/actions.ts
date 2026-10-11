"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import {
  isValidPostContent,
  isValidReportReason,
  exceedsPostRate,
  RATE_WINDOW_MS,
  POST_MAX_LENGTH,
  REPORT_REASON_MAX_LENGTH,
} from "@/lib/community";
import type { CommunityPost } from "@/types";

/** Create a community post for the signed-in user. */
export async function createPost(input: {
  content: string;
  kind: CommunityPost["kind"];
}): Promise<ActionResult> {
  const content = input.content.trim();
  if (!content) return { ok: false, error: "community.error.empty" };
  if (content.length > POST_MAX_LENGTH) return { ok: false, error: "community.error.postTooLong" };
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
    kind: input.kind,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

/** Delete a post the signed-in user owns. Comments and likes cascade in the DB. */
export async function deletePost(postId: string): Promise<ActionResult> {
  if (!postId) return { ok: false, error: "community.error.missingTarget" };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  // RLS restricts deletes to the owner (or an admin); scope by user_id too so a
  // non-owner request is a clear no-op rather than relying on RLS alone.
  const { error } = await ctx.supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

/** Delete a comment the signed-in user owns. */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  if (!commentId) return { ok: false, error: "community.error.missingTarget" };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

/** File a report against a post or a comment. Idempotent per reporter+target. */
export async function reportContent(input: {
  postId?: string;
  commentId?: string;
  reason?: string;
}): Promise<ActionResult> {
  const reason = (input.reason ?? "").trim();
  if (!input.postId && !input.commentId) {
    return { ok: false, error: "community.error.missingTarget" };
  }
  if (reason.length > REPORT_REASON_MAX_LENGTH || !isValidReportReason(reason)) {
    return { ok: false, error: "community.error.reasonTooLong" };
  }

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("content_reports").insert({
    reporter_id: ctx.userId,
    post_id: input.postId ?? null,
    comment_id: input.commentId ?? null,
    reason,
  });
  if (error) {
    // 23505 = already reported by this user → treat as a successful no-op.
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Block another member so their content drops out of the viewer's feed. */
export async function blockUser(userId: string): Promise<ActionResult> {
  if (!userId) return { ok: false, error: "community.error.missingTarget" };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;
  if (userId === ctx.userId) return { ok: false, error: "community.error.cannotBlockSelf" };

  const { error } = await ctx.supabase
    .from("user_blocks")
    .upsert(
      { blocker_id: ctx.userId, blocked_id: userId },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

/** Unblock a previously blocked member. */
export async function unblockUser(userId: string): Promise<ActionResult> {
  if (!userId) return { ok: false, error: "community.error.missingTarget" };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", ctx.userId)
    .eq("blocked_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

/** Like or unlike a post. */
export async function toggleLike(
  postId: string,
  liked: boolean,
): Promise<ActionResult> {
  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = liked
    ? await ctx.supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: ctx.userId })
    : await ctx.supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", ctx.userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Join a community group. Idempotent — re-joining is a no-op. */
export async function joinGroup(groupId: string): Promise<ActionResult> {
  if (!groupId) return { ok: false, error: "A group is required." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase
    .from("group_members")
    .upsert(
      { group_id: groupId, user_id: ctx.userId },
      { onConflict: "group_id,user_id", ignoreDuplicates: true },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}
