"use client";

import { useState, useTransition } from "react";
import { Plus, Flame, X, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createFoodLog } from "@/app/(app)/nutrition/actions";

interface Entry {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
}

const STARTER: Entry[] = [
  { id: "s1", name: "Sunrise Egg & Oats", calories: 420, proteinG: 28 },
  { id: "s2", name: "Warrior Protein Bowl", calories: 540, proteinG: 45 },
];

export function FoodLogger() {
  const [entries, setEntries] = useState<Entry[]>(STARTER);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [, startTransition] = useTransition();

  const total = entries.reduce((s, e) => s + e.calories, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const entry: Entry = {
      id: crypto.randomUUID(),
      name: trimmed,
      calories: Number(calories) || 0,
      proteinG: Number(protein) || 0,
    };
    setEntries((prev) => [...prev, entry]);
    setName("");
    setCalories("");
    setProtein("");
    setOpen(false);
    startTransition(async () => {
      await createFoodLog({
        name: entry.name,
        calories: entry.calories,
        proteinG: entry.proteinG,
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s food log</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? "Cancel" : "Add"}
        </Button>
      </CardHeader>

      {open && (
        <form onSubmit={submit} className="mb-4 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What did you eat?"
            aria-label="Food name"
            autoFocus
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
          />
          <div className="flex gap-2">
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal"
              type="number"
              min={0}
              aria-label="Calories"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
            />
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="protein (g)"
              type="number"
              min={0}
              aria-label="Protein grams"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={!name.trim()}>
            Log it
          </Button>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center">
          <UtensilsCrossed className="size-5 text-faint" />
          <p className="text-sm text-muted">No meals logged yet today.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <span className="font-medium">{e.name}</span>
                <span className="flex items-center gap-3 text-muted">
                  <span className="flex items-center gap-1">
                    <Flame className="size-3.5 text-gold/70" />
                    {e.calories}
                  </span>
                  <span>P {e.proteinG}g</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted">Total</span>
            <span className="font-semibold">{total} kcal</span>
          </div>
        </>
      )}
    </Card>
  );
}
