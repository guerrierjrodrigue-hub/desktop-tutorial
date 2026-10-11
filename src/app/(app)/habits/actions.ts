"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthedContext } from "@/lib/supabase/auth";
import { type ActionResult, demoOk } from "@/lib/actions/result";
import { validate, logAndFail } from "@/lib/actions/errors";

const createHabitSchema = z.object({
  label: z.string().trim().min(1, "errors.habitNameRequired").max(80, "errors.tooLong"),
  icon: z.string().trim().max(40),
});

/** Create a custom habit for the signed-in user. */
export async function createHabit(label: string, icon: string): Promise<ActionResult> {
  const check = validate(createHabitSchema, { label, icon });
  if (!check.ok) return check.result;

  const ctx = await getAuthedContext();
  if (!ctx) return demoOk;

  const { error } = await ctx.supabase.from("habits").insert({
    user_id: ctx.userId,
    label: check.data.label,
    icon: check.data.icon,
  });
  if (error) return logAndFail(error);

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true };
}
