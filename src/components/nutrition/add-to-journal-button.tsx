"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFoodLog } from "@/app/(app)/nutrition/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Logs a recipe as a meal in today's food journal, with its macros. */
export function AddToJournalButton({
  name,
  calories,
  proteinG,
  carbsG,
  fatG,
  dict,
}: {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  dict: Dictionary;
}) {
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  function add() {
    if (added) return;
    setAdded(true);
    startTransition(async () => {
      await createFoodLog({ name, calories, proteinG, carbsG, fatG });
    });
  }

  return (
    <Button onClick={add} disabled={pending || added} className="w-full sm:w-auto">
      {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      {added ? dict["nutrition.addedToJournal"] : dict["nutrition.addToJournal"]}
    </Button>
  );
}
