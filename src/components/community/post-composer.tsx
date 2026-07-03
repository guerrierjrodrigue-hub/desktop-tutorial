"use client";

import { useState, useTransition } from "react";
import { PenSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPost } from "@/app/(app)/community/actions";
import type { CommunityPost } from "@/types";

const kinds: { value: CommunityPost["kind"]; label: string }[] = [
  { value: "progress", label: "Progress" },
  { value: "testimony", label: "Testimony" },
  { value: "prayer", label: "Prayer request" },
];

export function PostComposer({
  onPost,
}: {
  onPost: (post: CommunityPost) => void;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<CommunityPost["kind"]>("progress");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    onPost({
      id: crypto.randomUUID(),
      author: "You",
      avatarColor: "var(--color-green)",
      timeAgo: "just now",
      content: text,
      kind,
      likes: 0,
      comments: 0,
      liked: false,
    });
    setContent("");
    setOpen(false);
    startTransition(async () => {
      await createPost({ content: text, kind });
    });
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <PenSquare className="size-4" /> Share
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a testimony, progress, or prayer request…"
          aria-label="Post content"
          rows={3}
          autoFocus
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
        />
        <div className="flex flex-wrap items-center gap-2">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
            >
              <Badge variant={kind === k.value ? "gold" : "neutral"} className="cursor-pointer px-3 py-1.5">
                {k.label}
              </Badge>
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!content.trim() || pending}>
              Post
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
