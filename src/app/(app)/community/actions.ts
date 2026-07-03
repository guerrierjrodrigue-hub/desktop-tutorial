"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import type { CommunityPost } from "@/types";

/** Create a community post for the signed-in user. */
export async function createPost(input: {
  content: string;
  kind: CommunityPost["kind"];
}): Promise<ActionResult> {
  const content = input.content.trim();
  if (!content) return { ok: false, error: "Say something first." };

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("community_posts").insert({
    user_id: ctx.userId,
    content,
    kind: input.kind,
  });
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
