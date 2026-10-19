"use client";

import { useState, useTransition } from "react";
import { Plus, Flame, X, UtensilsCrossed, Pencil, Trash2, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createFoodLog, updateFoodLog, deleteFoodLog } from "@/app/(app)/nutrition/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { FoodLogEntry } from "@/types";

interface Draft {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

const emptyDraft: Draft = { name: "", calories: "", protein: "", carbs: "", fat: "" };

function toEntry(draft: Draft, id: string): FoodLogEntry {
  return {
    id,
    name: draft.name.trim(),
    calories: Number(draft.calories) || 0,
    proteinG: Number(draft.protein) || 0,
    carbsG: Number(draft.carbs) || 0,
    fatG: Number(draft.fat) || 0,
  };
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

function MealFields({
  draft,
  setDraft,
  dict,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  dict: Dictionary;
}) {
  return (
    <div className="space-y-2">
      <input
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder={dict["nutrition.foodNamePlaceholder"]}
        aria-label={dict["nutrition.foodNameAria"]}
        autoFocus
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          value={draft.calories}
          onChange={(e) => setDraft({ ...draft, calories: e.target.value })}
          placeholder={dict["nutrition.kcalPlaceholder"]}
          type="number"
          min={0}
          aria-label={dict["nutrition.caloriesAria"]}
          className={inputClass}
        />
        <input
          value={draft.protein}
          onChange={(e) => setDraft({ ...draft, protein: e.target.value })}
          placeholder={dict["nutrition.proteinPlaceholder"]}
          type="number"
          min={0}
          aria-label={dict["nutrition.proteinAria"]}
          className={inputClass}
        />
        <input
          value={draft.carbs}
          onChange={(e) => setDraft({ ...draft, carbs: e.target.value })}
          placeholder={dict["nutrition.carbsPlaceholder"]}
          type="number"
          min={0}
          aria-label={dict["nutrition.carbsAria"]}
          className={inputClass}
        />
        <input
          value={draft.fat}
          onChange={(e) => setDraft({ ...draft, fat: e.target.value })}
          placeholder={dict["nutrition.fatPlaceholder"]}
          type="number"
          min={0}
          aria-label={dict["nutrition.fatAria"]}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function FoodLogger({ initial, dict }: { initial: FoodLogEntry[]; dict: Dictionary }) {
  const [entries, setEntries] = useState<FoodLogEntry[]>(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [, startTransition] = useTransition();

  const total = entries.reduce((s, e) => s + e.calories, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const entry = toEntry(draft, crypto.randomUUID());
    setEntries((prev) => [...prev, entry]);
    setDraft(emptyDraft);
    setOpen(false);
    startTransition(async () => {
      await createFoodLog({
        name: entry.name,
        calories: entry.calories,
        proteinG: entry.proteinG,
        carbsG: entry.carbsG,
        fatG: entry.fatG,
      });
    });
  }

  function startEdit(entry: FoodLogEntry) {
    setEditingId(entry.id);
    setEditDraft({
      name: entry.name,
      calories: String(entry.calories),
      protein: String(entry.proteinG),
      carbs: String(entry.carbsG),
      fat: String(entry.fatG),
    });
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editDraft.name.trim()) return;
    const updated = toEntry(editDraft, editingId);
    setEntries((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
    setEditingId(null);
    startTransition(async () => {
      await updateFoodLog({
        id: updated.id,
        name: updated.name,
        calories: updated.calories,
        proteinG: updated.proteinG,
        carbsG: updated.carbsG,
        fatG: updated.fatG,
      });
    });
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
    startTransition(async () => {
      await deleteFoodLog(id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["nutrition.foodLogTitle"]}</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? dict["common.cancel"] : dict["common.add"]}
        </Button>
      </CardHeader>

      {open && (
        <form onSubmit={submit} className="mb-4 space-y-2">
          <MealFields draft={draft} setDraft={setDraft} dict={dict} />
          <Button type="submit" size="sm" className="w-full" disabled={!draft.name.trim()}>
            {dict["nutrition.logIt"]}
          </Button>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center">
          <UtensilsCrossed className="size-5 text-faint" />
          <p className="text-sm text-muted">{dict["nutrition.noMeals"]}</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {entries.map((e) =>
              editingId === e.id ? (
                <li key={e.id} className="rounded-lg border border-accent/30 bg-surface-2 p-3">
                  <form onSubmit={saveEdit} className="space-y-2">
                    <MealFields draft={editDraft} setDraft={setEditDraft} dict={dict} />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1" disabled={!editDraft.name.trim()}>
                        <Check className="size-4" /> {dict["nutrition.saveMeal"]}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        {dict["common.cancel"]}
                      </Button>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{e.name}</span>
                  <span className="flex shrink-0 items-center gap-2.5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Flame className="size-3.5 text-ember/70" />
                      {e.calories}
                    </span>
                    <span>P {e.proteinG}</span>
                    <span>C {e.carbsG}</span>
                    <span>L {e.fatG}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(e)}
                      aria-label={dict["nutrition.editMealAria"].replace("{name}", e.name)}
                      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      aria-label={dict["nutrition.deleteMealAria"].replace("{name}", e.name)}
                      className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-elevated hover:text-ember"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </li>
              ),
            )}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted">{dict["nutrition.total"]}</span>
            <span className="font-semibold">{total} kcal</span>
          </div>
        </>
      )}
    </Card>
  );
}
