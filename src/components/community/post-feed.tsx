"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Flag, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PostComposer } from "@/components/community/post-composer";
import { toggleLike, deletePost, reportContent, blockUser } from "@/app/(app)/community/actions";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { CommunityPost } from "@/types";

const kindMeta: Record<CommunityPost["kind"], { label: string; variant: "accent" | "green" | "premium" }> = {
  testimony: { label: "Testimony", variant: "accent" },
  progress: { label: "Progress", variant: "green" },
  prayer: { label: "Prayer request", variant: "premium" },
};

export function PostFeed({ initial, dict }: { initial: CommunityPost[]; dict: Dictionary }) {
  const [posts, setPosts] = useState(initial);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuId) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuId]);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 2600);
  }

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

  function remove(id: string) {
    setMenuId(null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      await deletePost(id);
    });
  }

  function report(id: string) {
    setMenuId(null);
    flash(dict["community.reported"]);
    startTransition(async () => {
      await reportContent({ postId: id });
    });
  }

  function block(post: CommunityPost) {
    setMenuId(null);
    if (!post.authorId) return;
    flash(dict["community.blocked"]);
    // Drop every post by this author from the viewer's feed immediately.
    setPosts((prev) => prev.filter((p) => p.authorId !== post.authorId));
    startTransition(async () => {
      await blockUser(post.authorId!);
    });
  }

  return (
    <div className="space-y-4">
      <PostComposer onPost={prependPost} dict={dict} />

      {notice && (
        <p role="status" className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-center text-sm text-muted">
          {notice}
        </p>
      )}

      {posts.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
          {dict["community.noPostsYet"]}
        </p>
      )}

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
              <div className="relative" ref={menuId === post.id ? menuRef : undefined}>
                <button
                  onClick={() => setMenuId((cur) => (cur === post.id ? null : post.id))}
                  aria-haspopup="menu"
                  aria-expanded={menuId === post.id}
                  aria-label={dict["community.postMenu"]}
                  className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </button>
                {menuId === post.id && (
                  <div
                    role="menu"
                    className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
                  >
                    {post.isOwn ? (
                      <button
                        role="menuitem"
                        onClick={() => remove(post.id)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition hover:bg-surface-2"
                      >
                        <Trash2 className="size-4" /> {dict["community.delete"]}
                      </button>
                    ) : (
                      <>
                        <button
                          role="menuitem"
                          onClick={() => report(post.id)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-surface-2"
                        >
                          <Flag className="size-4" /> {dict["community.report"]}
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => block(post)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition hover:bg-surface-2"
                        >
                          <Ban className="size-4" /> {dict["community.block"]}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
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
