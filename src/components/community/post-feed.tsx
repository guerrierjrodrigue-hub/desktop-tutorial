"use client";

import { useState, useTransition } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PostComposer } from "@/components/community/post-composer";
import { communityPosts } from "@/data/community";
import { toggleLike } from "@/app/(app)/community/actions";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/types";

const kindMeta: Record<CommunityPost["kind"], { label: string; variant: "gold" | "green" | "premium" }> = {
  testimony: { label: "Testimony", variant: "gold" },
  progress: { label: "Progress", variant: "green" },
  prayer: { label: "Prayer request", variant: "premium" },
};

export function PostFeed() {
  const [posts, setPosts] = useState(communityPosts);
  const [, startTransition] = useTransition();

  function prependPost(post: CommunityPost) {
    setPosts((prev) => [post, ...prev]);
  }

  function like(id: string) {
    let nextLiked = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        nextLiked = !p.liked;
        return { ...p, liked: nextLiked, likes: nextLiked ? p.likes + 1 : p.likes - 1 };
      }),
    );
    startTransition(async () => {
      await toggleLike(id, nextLiked);
    });
  }

  return (
    <div className="space-y-4">
      <PostComposer onPost={prependPost} />

      {posts.map((post) => {
        const meta = kindMeta[post.kind];
        return (
          <Card key={post.id}>
            <div className="flex items-center gap-3">
              <Avatar name={post.author} color={post.avatarColor} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{post.author}</p>
                <p className="text-xs text-faint">{post.timeAgo}</p>
              </div>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {post.content}
            </p>

            <div className="mt-4 flex items-center gap-5 text-sm text-muted">
              <button
                onClick={() => like(post.id)}
                className={cn(
                  "flex items-center gap-1.5 transition hover:text-danger",
                  post.liked && "text-danger",
                )}
                aria-pressed={post.liked}
              >
                <Heart className={cn("size-4", post.liked && "fill-current")} />
                {post.likes}
              </button>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-4" />
                {post.comments}
              </span>
              <button className="ml-auto flex items-center gap-1.5 transition hover:text-foreground">
                <Share2 className="size-4" />
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
