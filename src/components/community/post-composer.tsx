"use client";

import { useState, useTransition } from "react";
import { PenSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPost } from "@/app/(app)/community/actions";
import type { Dictionary, DictionaryKey } from "@/i18n/dictionaries/en";
import type { CommunityPost } from "@/types";

const kinds: { value: CommunityPost["kind"]; labelKey: DictionaryKey }[] = [
  { value: "progress", labelKey: "community.shareProgress" },
  { value: "testimony", labelKey: "community.shareTestimony" },
  { value: "prayer", labelKey: "community.sharePrayer" },
];

export function PostComposer({
  onPost,
  dict,
}: {
  onPost: (post: CommunityPost) => void;
  dict: Dictionary;
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
      author: dict["community.you"],
      avatarColor: "var(--color-green)",
      timeAgo: dict["community.justNow"],
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
        <PenSquare className="size-4" /> {dict["community.share"]}
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={dict["community.postPlaceholder"]}
          aria-label={dict["community.postAria"]}
          rows={3}
          autoFocus
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex flex-wrap items-center gap-2">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
            >
              <Badge variant={kind === k.value ? "accent" : "neutral"} className="cursor-pointer px-3 py-1.5">
                {dict[k.labelKey]}
              </Badge>
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              {dict["common.cancel"]}
            </Button>
            <Button type="submit" size="sm" disabled={!content.trim() || pending}>
              {dict["community.post"]}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
