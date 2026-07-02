"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { communityPosts } from "@/data/community";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/types";

const kindMeta: Record<CommunityPost["kind"], { label: string; variant: "gold" | "green" | "premium" }> = {
  testimony: { label: "Testimony", variant: "gold" },
  progress: { label: "Progress", variant: "green" },
  prayer: { label: "Prayer request", variant: "premium" },
};

export function PostFeed() {
  const [posts, setPosts] = useState(communityPosts);

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }

  return (
    <div className="space-y-4">
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
                onClick={() => toggleLike(post.id)}
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
