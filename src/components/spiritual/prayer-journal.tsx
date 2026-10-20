"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPrayerRequest, setPrayerAnswered } from "@/app/(app)/spiritual/actions";
import { showXp } from "@/components/gamification/xp-toast";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { PrayerRequest } from "@/types";

export function PrayerJournal({ initial, dict }: { initial: PrayerRequest[]; dict: Dictionary }) {
  const [prayers, setPrayers] = useState(initial);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Prayers whose real DB id isn't known yet (optimistic insert in flight).
  // Toggling one would update a phantom row, so it stays disabled until the
  // create resolves with the real id.
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const clearPending = (id: string) =>
    setPending((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
  const failMessage = (code?: string) =>
    (code && (dict[code as keyof Dictionary] as string)) || dict["errors.writeNoRows"];

  function addPrayer(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    // Optimistic insert.
    const tempId = crypto.randomUUID();
    const optimistic: PrayerRequest = {
      id: tempId,
      title: trimmed,
      body: body.trim(),
      answered: false,
      createdAt: new Date().toISOString(),
    };
    setPrayers((prev) => [optimistic, ...prev]);
    setPending((p) => new Set(p).add(tempId));
    setTitle("");
    setBody("");
    setComposing(false);
    setError(null);

    startTransition(async () => {
      const result = await createPrayerRequest({ title: optimistic.title, body: optimistic.body });
      if (result.ok) {
        // Swap the temp id for the real one so a toggle targets the real row.
        if (result.id) {
          const realId = result.id;
          setPrayers((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: realId } : p)));
        }
        clearPending(tempId);
        showXp(result.xp);
      } else {
        setPrayers((prev) => prev.filter((p) => p.id !== tempId));
        clearPending(tempId);
        setError(failMessage(result.error));
      }
    });
  }

  function toggleAnswered(id: string) {
    const snapshot = prayers;
    const next = !prayers.find((p) => p.id === id)?.answered;
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, answered: !p.answered } : p)),
    );
    setError(null);
    startTransition(async () => {
      const result = await setPrayerAnswered(id, next);
      if (!result.ok) {
        setPrayers(snapshot); // roll back the toggle that didn't persist
        setError(failMessage(result.error));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["spiritual.prayerJournalTitle"]}</CardTitle>
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
        <form onSubmit={addPrayer} className="mb-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict["spiritual.prayerTitlePlaceholder"]}
            aria-label={dict["spiritual.prayerTitleAria"]}
            autoFocus
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict["spiritual.prayerNotePlaceholder"]}
            aria-label={dict["spiritual.prayerNoteAria"]}
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
          <Button type="submit" size="sm" className="w-full" disabled={!title.trim()}>
            {dict["journal.add"]}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="mb-3 text-center text-sm text-ember">
          {error}
        </p>
      )}

      {prayers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-muted">
          {dict["spiritual.noPrayers"]}
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
                  disabled={pending.has(p.id)}
                  aria-label={p.answered ? dict["spiritual.markUnanswered"] : dict["spiritual.markAnswered"]}
                  className="mt-0.5 shrink-0 transition hover:scale-110 disabled:opacity-40"
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
                      {dict["spiritual.answeredPraise"]}
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
