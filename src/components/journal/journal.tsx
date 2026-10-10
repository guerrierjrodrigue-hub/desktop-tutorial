"use client";

import { useState, useTransition } from "react";
import { NotebookPen, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createJournalEntry } from "@/app/(app)/journal/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { JournalEntry } from "@/types";

function formatDate(iso: string, locale: LocaleCode) {
  const tag = locale === "fr" ? "fr-CA" : "en-US";
  return new Date(iso).toLocaleDateString(tag, { month: "short", day: "numeric" });
}

export function Journal({
  initial,
  dict,
  locale,
}: {
  initial: JournalEntry[];
  dict: Dictionary;
  locale: LocaleCode;
}) {
  const [entries, setEntries] = useState(initial);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [, startTransition] = useTransition();

  function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const optimistic: JournalEntry = {
      id: crypto.randomUUID(),
      title: trimmed,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [optimistic, ...prev]);
    setTitle("");
    setBody("");
    setComposing(false);

    startTransition(async () => {
      await createJournalEntry({ title: optimistic.title, body: optimistic.body });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["journal.title"]}</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setComposing((v) => !v)}
          aria-expanded={composing}
        >
          {composing ? <X className="size-4" /> : <Plus className="size-4" />}
          {composing ? dict["common.cancel"] : dict["journal.new"]}
        </Button>
      </CardHeader>

      {composing && (
        <form onSubmit={addEntry} className="mb-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict["journal.titlePlaceholder"]}
            aria-label={dict["journal.titleAria"]}
            autoFocus
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict["journal.bodyPlaceholder"]}
            aria-label={dict["journal.bodyAria"]}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
          <Button type="submit" size="sm" className="w-full" disabled={!title.trim()}>
            {dict["journal.add"]}
          </Button>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
          {dict["journal.empty"]}
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-start gap-2">
                <NotebookPen className="mt-0.5 size-4 shrink-0 text-faint" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-tight">{entry.title}</h3>
                    <span className="shrink-0 text-xs text-faint">
                      {formatDate(entry.createdAt, locale)}
                    </span>
                  </div>
                  {entry.body && <p className="mt-1 text-xs text-muted">{entry.body}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
