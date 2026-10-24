"use client";

import { useState, useTransition } from "react";
import { Footprints, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createShoe, setShoeRetired, deleteShoe } from "@/app/(app)/course/actions";
import { formatKm, shoeWearAlert } from "@/lib/running";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Shoe } from "@/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20";

/** Owner-only shoe wear tracker: add a pair, see cumulative km, retire or delete. */
export function ShoeManager({ dict, initial }: { dict: Dictionary; initial: Shoe[] }) {
  const [shoes, setShoes] = useState<Shoe[]>(initial);
  const [name, setName] = useState("");
  const [initialKm, setInitialKm] = useState("");
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const km = Number(initialKm) || 0;
    startTransition(async () => {
      const res = await createShoe({ name: trimmed, initialKm: km > 0 ? km : undefined });
      if (res.ok && res.id) {
        setShoes((prev) => [
          { id: res.id!, name: trimmed, distanceM: Math.round(km * 1000), retired: false, createdAt: new Date().toISOString() },
          ...prev,
        ]);
        setName("");
        setInitialKm("");
      }
    });
  }

  function toggleRetire(shoe: Shoe) {
    startTransition(async () => {
      const res = await setShoeRetired(shoe.id, !shoe.retired);
      if (res.ok) {
        setShoes((prev) => prev.map((s) => (s.id === shoe.id ? { ...s, retired: !s.retired } : s)));
      }
    });
  }

  function remove(id: string) {
    if (typeof window !== "undefined" && !window.confirm(dict["course.shoes.deleteConfirm"])) return;
    startTransition(async () => {
      const res = await deleteShoe(id);
      if (res.ok) setShoes((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict["course.shoes.title"]}</CardTitle>
        <Footprints className="size-4 text-accent/80" />
      </CardHeader>
      <p className="text-sm text-muted">{dict["course.shoes.subtitle"]}</p>

      <form onSubmit={add} className="mt-4 space-y-3">
        <div>
          <label htmlFor="shoe-name" className="mb-1 block text-sm font-medium">{dict["course.shoes.name"]}</label>
          <input
            id="shoe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict["course.shoes.namePlaceholder"]}
            className={inputClass}
            maxLength={60}
          />
        </div>
        <div>
          <label htmlFor="shoe-km" className="mb-1 block text-sm font-medium">{dict["course.shoes.initialKm"]}</label>
          <input id="shoe-km" type="number" inputMode="decimal" min={0} step="1" value={initialKm} onChange={(e) => setInitialKm(e.target.value)} className={inputClass} />
        </div>
        <Button type="submit" size="sm" disabled={pending || !name.trim()}>
          <Plus className="size-4" /> {dict["course.shoes.add"]}
        </Button>
      </form>

      {shoes.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{dict["course.shoes.none"]}</p>
      ) : (
        <ul className="mt-4 space-y-2" aria-label={dict["course.shoes.title"]}>
          {shoes.map((shoe) => {
            const alert = shoeWearAlert(shoe.distanceM);
            return (
              <li
                key={shoe.id}
                data-testid="shoe-row"
                className="rounded-xl border border-border bg-surface-2 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {shoe.name}
                      {shoe.retired && (
                        <span className="ml-2 text-xs font-normal text-faint">{dict["course.shoes.retired"]}</span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-semibold text-foreground">{formatKm(shoe.distanceM)}</span> km
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => toggleRetire(shoe)} disabled={pending}>
                      {shoe.retired ? dict["course.shoes.reactivate"] : dict["course.shoes.retire"]}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" aria-label={dict["course.shoes.delete"]} onClick={() => remove(shoe.id)} disabled={pending}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {alert && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-ember">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {dict["course.shoes.alert"]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
