"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPrayerRequest, setPrayerAnswered } from "@/app/(app)/spiritual/actions";
import type { PrayerRequest } from "@/types";

export function PrayerJournal({ initial }: { initial: PrayerRequest[] }) {
  const [prayers, setPrayers] = useState(initial);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [, startTransition] = useTransition();

  function addPrayer(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    // Optimistic insert.
    const optimistic: PrayerRequest = {
      id: crypto.randomUUID(),
      title: trimmed,
      body: body.trim(),
      answered: false,
      createdAt: new Date().toISOString(),
    };
    setPrayers((prev) => [optimistic, ...prev]);
    setTitle("");
    setBody("");
    setComposing(false);

    startTransition(async () => {
      await createPrayerRequest({ title: optimistic.title, body: optimistic.body });
    });
  }

  function toggleAnswered(id: string) {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, answered: !p.answered } : p)),
    );
    const next = !prayers.find((p) => p.id === id)?.answered;
    startTransition(async () => {
      await setPrayerAnswered(id, next);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prayer journal</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setComposing((v) => !v)}
          aria-expanded={composing}
        >
          {composing ? <X className="size-4" /> : <Plus className="size-4" />}
          {composing ? "Cancel" : "New"}
        </Button>
      </CardHeader>

      {composing && (
        <form onSubmit={addPrayer} className="mb-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you praying for?"
            aria-label="Prayer title"
            autoFocus
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a note (optional)"
            aria-label="Prayer note"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
          />
          <Button type="submit" size="sm" className="w-full" disabled={!title.trim()}>
            Add to journal
          </Button>
        </form>
      )}

      {prayers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
          No prayers yet. Add your first request above.
        </p>
      ) : (
        <div className="space-y-3">
          {prayers.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-surface-2 p-4"
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleAnswered(p.id)}
                  aria-pressed={p.answered}
                  aria-label={p.answered ? "Mark unanswered" : "Mark answered"}
                  className="mt-0.5 shrink-0 transition hover:scale-110"
                >
                  {p.answered ? (
                    <CheckCircle2 className="size-4 text-green-bright" />
                  ) : (
                    <Circle className="size-4 text-faint" />
                  )}
                </button>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{p.title}</h3>
                  {p.body && <p className="mt-1 text-xs text-muted">{p.body}</p>}
                  {p.answered && (
                    <span className="mt-2 inline-block text-xs font-semibold text-green-bright">
                      Answered · Praise God
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
