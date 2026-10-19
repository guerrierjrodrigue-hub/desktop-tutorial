"use client";

import { useState, useTransition } from "react";
import { NotebookPen, Plus, X, Pencil, Trash2, Heart, BookOpen, HandHeart } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/(app)/journal/actions";
import { showXp } from "@/components/gamification/xp-toast";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LocaleCode } from "@/i18n/locales";
import type { JournalEntry } from "@/types";

function formatDate(iso: string, locale: LocaleCode) {
  const tag = locale === "fr" ? "fr-CA" : "en-US";
  return new Date(iso).toLocaleDateString(tag, { year: "numeric", month: "long", day: "numeric" });
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";
const areaClass =
  "w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

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
  const [bodyHint, setBodyHint] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  const prompts = [
    { icon: Heart, label: dict["journal.promptGratitude"], hint: dict["journal.promptGratitudeHint"] },
    { icon: BookOpen, label: dict["journal.promptVerse"], hint: dict["journal.promptVerseHint"] },
    { icon: HandHeart, label: dict["journal.promptPrayer"], hint: dict["journal.promptPrayerHint"] },
  ];

  const openEntry = entries.find((e) => e.id === openId) ?? null;

  function startCompose(presetTitle = "", hint = "") {
    setTitle(presetTitle);
    setBody("");
    setBodyHint(hint || dict["journal.bodyPlaceholder"]);
    setComposing(true);
  }

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
      const result = await createJournalEntry({ title: optimistic.title, body: optimistic.body });
      if (result.ok) showXp(result.xp);
    });
  }

  function openFull(entry: JournalEntry) {
    setOpenId(entry.id);
    setEditing(false);
    setConfirmDelete(false);
    setEditTitle(entry.title);
    setEditBody(entry.body);
  }

  function closeModal() {
    setOpenId(null);
    setEditing(false);
    setConfirmDelete(false);
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!openEntry || !editTitle.trim()) return;
    const updated = { ...openEntry, title: editTitle.trim(), body: editBody.trim() };
    setEntries((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setEditing(false);
    startTransition(async () => {
      await updateJournalEntry({ id: updated.id, title: updated.title, body: updated.body });
    });
  }

  function remove() {
    if (!openEntry) return;
    const id = openEntry.id;
    setEntries((prev) => prev.filter((x) => x.id !== id));
    closeModal();
    startTransition(async () => {
      await deleteJournalEntry(id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["journal.title"]}</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (composing ? setComposing(false) : startCompose())}
          aria-expanded={composing}
        >
          {composing ? <X className="size-4" /> : <Plus className="size-4" />}
          {composing ? dict["common.cancel"] : dict["journal.new"]}
        </Button>
      </CardHeader>

      {/* Writing prompts */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {dict["journal.prompts"]}
        </p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => startCompose(p.label, p.hint)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium transition hover:border-accent/40 hover:text-foreground"
            >
              <p.icon className="size-3.5 text-accent/80" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {composing && (
        <form onSubmit={addEntry} className="mb-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict["journal.titlePlaceholder"]}
            aria-label={dict["journal.titleAria"]}
            autoFocus
            className={inputClass}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={bodyHint || dict["journal.bodyPlaceholder"]}
            aria-label={dict["journal.bodyAria"]}
            rows={4}
            className={areaClass}
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
            <div
              key={entry.id}
              className="group flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-4 transition hover:border-accent/30"
            >
              <NotebookPen className="mt-0.5 size-4 shrink-0 text-faint" />
              <button
                type="button"
                onClick={() => openFull(entry)}
                aria-label={dict["journal.openAria"].replace("{title}", entry.title)}
                className="min-w-0 flex-1 text-left outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold leading-tight">{entry.title}</h3>
                  <span className="shrink-0 text-xs text-faint">{formatDate(entry.createdAt, locale)}</span>
                </div>
                {entry.body && <p className="mt-1 line-clamp-2 text-xs text-muted">{entry.body}</p>}
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    openFull(entry);
                    setEditing(true);
                  }}
                  aria-label={dict["journal.editAria"].replace("{title}", entry.title)}
                  className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-entry modal */}
      {openEntry && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={openEntry.title}
          onClick={closeModal}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {editing ? (
              <form onSubmit={saveEdit} className="space-y-3">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label={dict["journal.titleAria"]}
                  autoFocus
                  className={inputClass}
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  aria-label={dict["journal.bodyAria"]}
                  rows={8}
                  className={areaClass}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1" disabled={!editTitle.trim()}>
                    {dict["journal.save"]}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>
                    {dict["common.cancel"]}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-xl font-semibold">{openEntry.title}</h2>
                    <p className="mt-0.5 text-xs text-faint">{formatDate(openEntry.createdAt, locale)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label={dict["journal.closeAria"]}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                {openEntry.body ? (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {openEntry.body}
                  </p>
                ) : null}
                <div className="mt-6 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(true)}
                    aria-label={dict["journal.editAria"].replace("{title}", openEntry.title)}
                  >
                    <Pencil className="size-4" /> {dict["common.edit"]}
                  </Button>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{dict["journal.confirmDelete"]}</span>
                      <Button size="sm" variant="danger" onClick={remove}>
                        {dict["common.delete"]}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                        {dict["common.cancel"]}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(true)}
                      aria-label={dict["journal.deleteAria"].replace("{title}", openEntry.title)}
                    >
                      <Trash2 className="size-4" /> {dict["common.delete"]}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
