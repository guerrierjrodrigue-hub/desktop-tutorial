"use client";

import { useMemo, useState, useTransition } from "react";
import { Bookmark, Highlighter, Brain, Share2, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleBibleMark, memorizeVerse, markReadingDay } from "@/app/(app)/spiritual/bible/actions";
import type { BibleContentBlock } from "@/lib/bible";
import type { Dictionary } from "@/i18n/dictionaries/en";

interface PlanContext {
  planId: string;
  day: number;
}

export function BibleReader({
  translation,
  book,
  chapter,
  bookName,
  content,
  initialBookmarks,
  initialHighlights,
  plan,
  dict,
}: {
  translation: string;
  book: string;
  chapter: number;
  bookName: string;
  content: BibleContentBlock[];
  initialBookmarks: number[];
  initialHighlights: number[];
  plan: PlanContext | null;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState(() => new Set(initialBookmarks));
  const [highlights, setHighlights] = useState(() => new Set(initialHighlights));
  const [memorized, setMemorized] = useState<Set<number>>(() => new Set());
  const [read, setRead] = useState(false);
  const [, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const verses = useMemo(
    () => content.filter((b): b is Extract<BibleContentBlock, { type: "verse" }> => b.type === "verse"),
    [content],
  );
  const matchCount = q ? verses.filter((v) => v.text.toLowerCase().includes(q)).length : 0;

  function ref(verse: number) {
    return { translation, book, chapter, verse };
  }

  function onToggle(verse: number, kind: "bookmark" | "highlight") {
    const set = kind === "bookmark" ? bookmarks : highlights;
    const setter = kind === "bookmark" ? setBookmarks : setHighlights;
    const next = new Set(set);
    if (next.has(verse)) next.delete(verse);
    else next.add(verse);
    setter(next);
    startTransition(async () => {
      await toggleBibleMark(ref(verse), kind);
    });
  }

  function onMemorize(verse: number, text: string) {
    setMemorized((prev) => new Set(prev).add(verse));
    startTransition(async () => {
      await memorizeVerse({ reference: `${bookName} ${chapter}:${verse}`, text });
    });
  }

  async function onShare(verse: number, text: string) {
    const reference = `${bookName} ${chapter}:${verse}`;
    const url = `/api/verse-image?ref=${encodeURIComponent(reference)}&text=${encodeURIComponent(text)}`;
    const absolute = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: reference, text: `${text} — ${reference}`, url: absolute });
        return;
      }
    } catch {
      // fall through to opening the image
    }
    if (typeof window !== "undefined") window.open(absolute, "_blank", "noopener");
  }

  function onMarkRead() {
    if (!plan) return;
    setRead(true);
    startTransition(async () => {
      await markReadingDay(plan.planId, plan.day);
    });
  }

  return (
    <>
      <h2 className="font-serif text-2xl font-semibold">
        {bookName} {chapter}
      </h2>

      <label className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <Search className="size-4 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict["bible.searchPlaceholder"]}
          className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
        />
      </label>
      {q && (
        <p className="mt-2 text-xs text-muted">
          {matchCount} {dict["bible.searchResults"]}
        </p>
      )}

      <div className="mt-5 space-y-3 leading-relaxed">
        {content.map((block, i) => {
          if (block.type === "heading") {
            if (q) return null; // hide section headings while searching
            return (
              <h3 key={i} className="!mt-6 font-serif text-lg font-semibold text-gold-bright first:!mt-0">
                {block.text}
              </h3>
            );
          }
          const matches = block.text.toLowerCase().includes(q);
          if (q && !matches) return null;
          const isHl = highlights.has(block.number);
          const isBm = bookmarks.has(block.number);
          return (
            <div
              key={i}
              className={cn(
                "group rounded-lg px-2 py-1 transition",
                isHl ? "bg-gold/15" : "hover:bg-surface-2",
              )}
            >
              <p>
                <sup className="mr-1 text-xs font-semibold text-faint">{block.number}</sup>
                {q ? highlightMatch(block.text, q) : block.text}
              </p>
              <div className="mt-1 flex items-center gap-1 opacity-70">
                <VerseAction
                  label={dict["bible.bookmark"]}
                  active={isBm}
                  onClick={() => onToggle(block.number, "bookmark")}
                >
                  <Bookmark className={cn("size-3.5", isBm && "fill-gold-bright text-gold-bright")} />
                </VerseAction>
                <VerseAction
                  label={dict["bible.highlight"]}
                  active={isHl}
                  onClick={() => onToggle(block.number, "highlight")}
                >
                  <Highlighter className={cn("size-3.5", isHl && "text-gold-bright")} />
                </VerseAction>
                <VerseAction
                  label={dict["bible.memorize"]}
                  active={memorized.has(block.number)}
                  onClick={() => onMemorize(block.number, block.text)}
                >
                  {memorized.has(block.number) ? (
                    <Check className="size-3.5 text-green-bright" />
                  ) : (
                    <Brain className="size-3.5" />
                  )}
                </VerseAction>
                <VerseAction label={dict["bible.share"]} onClick={() => onShare(block.number, block.text)}>
                  <Share2 className="size-3.5" />
                </VerseAction>
              </div>
            </div>
          );
        })}
      </div>

      {plan && (
        <div className="mt-6 border-t border-border pt-4">
          <Button onClick={onMarkRead} disabled={read} className="w-full">
            {read ? (
              <>
                <Check className="size-4" /> {dict["bible.markedRead"]}
              </>
            ) : (
              dict["bible.markRead"]
            )}
          </Button>
        </div>
      )}
    </>
  );
}

function VerseAction({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-foreground"
    >
      {children}
    </button>
  );
}

/** Wrap occurrences of `q` (already lowercased) in <mark>. */
function highlightMatch(text: string, q: string) {
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const found = lower.indexOf(q, i);
    if (found === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (found > i) parts.push(text.slice(i, found));
    parts.push(
      <mark key={key++} className="rounded bg-gold/30 text-foreground">
        {text.slice(found, found + q.length)}
      </mark>,
    );
    i = found + q.length;
  }
  return parts;
}
