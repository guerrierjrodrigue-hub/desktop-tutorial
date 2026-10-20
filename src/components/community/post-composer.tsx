"use client";

import { useState, useTransition } from "react";
import { PenSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPost } from "@/app/(app)/community/actions";
import { POST_MAX_LENGTH } from "@/lib/community";
import { cn } from "@/lib/utils";
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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const overLimit = content.length > POST_MAX_LENGTH;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || overLimit) return;

    setError(null);
    startTransition(async () => {
      const result = await createPost({ content: text, kind });
      if (result.ok) {
        // Only surface the post once the server accepted it (so a rate-limited
        // or rejected post never appears in the feed). Use the real DB id when
        // the server returns one so a like/delete right after targets the real
        // row; demo mode has no id, where a session-only id is fine.
        onPost({
          id: result.id ?? crypto.randomUUID(),
          author: dict["community.you"],
          avatarColor: "var(--color-green)",
          timeAgo: dict["community.justNow"],
          content: text,
          kind,
          likes: 0,
          comments: 0,
          liked: false,
          isOwn: true,
        });
        setContent("");
        setOpen(false);
      } else {
        setError(result.error ? dict[result.error as DictionaryKey] ?? null : null);
      }
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
        <div className="flex items-center justify-between text-xs">
          {error ? (
            <span role="alert" className="text-danger">{error}</span>
          ) : (
            <span />
          )}
          <span className={cn("tabular-nums text-faint", overLimit && "font-semibold text-danger")}>
            {content.length}/{POST_MAX_LENGTH}
          </span>
        </div>
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
            <Button type="submit" size="sm" disabled={!content.trim() || overLimit || pending}>
              {dict["community.post"]}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
